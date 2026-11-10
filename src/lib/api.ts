'use server';

/**
 * Server actions yang boleh dipanggil dari browser.
 *
 * Setiap fungsi yang diekspor dari file ini adalah endpoint publik, jadi
 * SEMUANYA wajib memeriksa session dan kepemilikan sebelum menyentuh data.
 * Akses database mentah ada di src/server/repo.ts dan tidak boleh diekspor
 * ulang dari sini tanpa pengecekan.
 *
 * Identitas pemanggil selalu diambil dari cookie session, tidak pernah dari
 * argumen. Beberapa fungsi masih menerima `userId` demi kompatibilitas
 * pemanggil lama; nilainya diabaikan kecuali pemanggil adalah admin.
 */

import { revalidatePath } from 'next/cache';
import * as repo from '../server/repo';
import { AuthError, getRequestIp, requireAdmin, requireUser } from '../server/session';
import { rateLimit } from '../server/rateLimit';
import { settleTransaction } from '../server/payments';
import {
  clampInt,
  clampText,
  isHttpsUrl,
  isOwnCloudinaryUrl,
  isRsvpStatus,
  normalizeSlug,
  RESERVED_SLUGS,
} from '../server/validate';
import { getLimits, isThemeAvailable } from './packageLimits';
import type {
  Guest,
  PhotoMoment,
  RSVP,
  SaaSUser,
  TransactionReport,
  VisitorLog,
  VoiceWish,
  WeddingData,
} from '../types';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'client' | 'admin';
  message: string;
  createdAt: string;
  isRead: boolean;
}

/** Batas ukuran wedding_data (JSON) yang boleh disimpan. */
const MAX_WEDDING_DATA_BYTES = 1_000_000;

// ============================================
// Helper otorisasi (tidak diekspor)
// ============================================

function forbidden(): never {
  throw new AuthError('FORBIDDEN', 'Anda tidak punya akses ke data ini.');
}

/** Pastikan undangan ada dan milik user yang login (atau pemanggil admin). */
async function requireInvitationOwner(invitationId: string) {
  const user = await requireUser();
  if (typeof invitationId !== 'string' || !invitationId) forbidden();
  const meta = await repo.getInvitationMeta(invitationId);
  if (!meta) forbidden();
  if (meta.userId !== user.id && user.role !== 'admin') forbidden();
  return { user, meta };
}

async function requireChildOwner(kind: 'guest' | 'rsvp' | 'photo' | 'voice', id: string) {
  if (typeof id !== 'string' || !id) forbidden();
  const invitationId = await repo.getParentInvitationId(kind, id);
  if (!invitationId) forbidden();
  return requireInvitationOwner(invitationId);
}

/** userId efektif: milik session, kecuali admin yang boleh menunjuk user lain. */
function effectiveUserId(user: SaaSUser, requested?: string): string {
  if (requested && requested !== user.id && user.role === 'admin') return requested;
  return user.id;
}

/** Undangan publik yang masih aktif, untuk aksi tamu tanpa login. */
async function requireOpenInvitation(invitationId: string) {
  if (typeof invitationId !== 'string' || !invitationId) throw new Error('Undangan tidak ditemukan.');
  const meta = await repo.getInvitationMeta(invitationId);
  if (!meta) throw new Error('Undangan tidak ditemukan.');
  if (meta.isExpired) throw new Error('Masa aktif undangan sudah berakhir.');
  return meta;
}

/**
 * Batas laju aksi tamu, per IP per undangan. Angkanya longgar karena tamu di
 * satu gedung sering berbagi satu WiFi/IP; tujuannya menahan banjir otomatis,
 * bukan membatasi tamu sungguhan.
 */
async function guestRateLimit(bucket: string, scope: string, max: number, windowSecs: number) {
  const ip = await getRequestIp();
  const result = await rateLimit({ identifier: `${bucket}:${scope}:${ip}`, max, windowSecs });
  if (!result.success) {
    throw new Error(`Terlalu banyak permintaan. Coba lagi dalam ${result.resetIn} detik.`);
  }
}

/** Data tamu yang aman dikirim ke pengunjung publik (tanpa nomor telepon). */
function publicGuest(guest: Guest): Guest {
  return { ...guest, phoneNumber: '' };
}

// ============================================
// INVITATIONS (pemilik)
// ============================================

export async function createInvitation(
  _userId: string,
  title: string,
  themeId: string,
  weddingData: WeddingData
): Promise<string> {
  const user = await requireUser();
  const limits = getLimits(user.packageId);
  const count = await repo.countInvitationsByUser(user.id);
  if (count >= limits.maxProjects) {
    throw new Error(`Paket ${user.packageId} hanya bisa memiliki ${limits.maxProjects} proyek.`);
  }
  assertWeddingDataSize(weddingData);
  const safeTheme = isThemeAvailable(user.packageId, themeId) ? themeId : 'rfx-dark';
  return repo.createInvitation(user.id, clampText(title, 120) || 'Undangan', safeTheme, weddingData);
}

export async function getInvitationByUserId(userId?: string) {
  const user = await requireUser();
  return repo.getInvitationByUserId(effectiveUserId(user, userId));
}

export async function getInvitationsByUserId(userId?: string) {
  const user = await requireUser();
  return repo.getInvitationsByUserId(effectiveUserId(user, userId));
}

function assertWeddingDataSize(weddingData: WeddingData) {
  if (!weddingData || typeof weddingData !== 'object') throw new Error('Data undangan tidak valid.');
  if (Buffer.byteLength(JSON.stringify(weddingData), 'utf8') > MAX_WEDDING_DATA_BYTES) {
    throw new Error('Data undangan terlalu besar.');
  }
}

export async function updateInvitationData(
  invitationId: string,
  weddingData: WeddingData,
  themeId?: string
): Promise<void> {
  const { user } = await requireInvitationOwner(invitationId);
  assertWeddingDataSize(weddingData);
  // Tema di luar paket diabaikan (bukan ditolak) supaya autosave isi undangan
  // tidak ikut gagal ketika pengguna sedang melihat-lihat tema terkunci.
  const allowedTheme =
    themeId && (user.role === 'admin' || isThemeAvailable(user.packageId, themeId)) ? themeId : undefined;
  await repo.updateInvitationData(invitationId, weddingData, allowedTheme);
}

/**
 * Aktifkan undangan (mulai masa aktif). Paket diambil dari akun, bukan dari
 * argumen, dan undangan yang sudah aktif tidak bisa diaktifkan ulang supaya
 * masa aktif tidak bisa direset gratis.
 */
export async function activateInvitation(invitationId: string, _packageId?: string): Promise<void> {
  const { user } = await requireInvitationOwner(invitationId);
  const eligible = user.packageId === 'demo' || user.paymentStatus === 'success';
  if (!eligible) throw new Error('Pembayaran belum dikonfirmasi.');
  const inv = await repo.getInvitationById(invitationId);
  if (!inv || inv.activatedAt) return;
  await repo.activateInvitation(invitationId, user.packageId);
}

async function revalidateInvitation(invitationId: string, userId: string) {
  try {
    const [inv, owner] = await Promise.all([repo.getInvitationById(invitationId), repo.getUserById(userId)]);
    if (inv?.slug) revalidatePath(`/${inv.slug}`);
    if (owner?.activeSlug) revalidatePath(`/${owner.activeSlug}`);
  } catch {
    /* revalidasi bersifat best-effort */
  }
}

export async function publishInvitation(invitationId: string): Promise<void> {
  const { user, meta } = await requireInvitationOwner(invitationId);
  if (user.role !== 'admin') {
    if (!getLimits(user.packageId).canPublish) {
      throw new Error(`Paket ${user.packageId} tidak bisa mempublikasikan undangan.`);
    }
    if (user.paymentStatus !== 'success') throw new Error('Pembayaran belum dikonfirmasi.');
  }
  await repo.publishInvitation(invitationId);
  await revalidateInvitation(invitationId, meta.userId);
}

export async function unpublishInvitation(invitationId: string): Promise<void> {
  const { meta } = await requireInvitationOwner(invitationId);
  await repo.unpublishInvitation(invitationId);
  await revalidateInvitation(invitationId, meta.userId);
}

export async function updateInvitationSlug(
  invitationId: string,
  newSlug: string
): Promise<{ success: boolean; error?: string }> {
  const { user, meta } = await requireInvitationOwner(invitationId);
  if (user.role !== 'admin' && getLimits(user.packageId).slugChanges <= 0) {
    return { success: false, error: `Paket ${user.packageId} tidak mengizinkan slug kustom.` };
  }
  const candidate = clampText(newSlug, 60).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (RESERVED_SLUGS.has(candidate)) return { success: false, error: 'Slug ini tidak bisa dipakai.' };
  const result = await repo.updateInvitationSlug(invitationId, candidate);
  if (result.success) await revalidateInvitation(invitationId, meta.userId);
  return result;
}

// ============================================
// GUESTS (pemilik)
// ============================================

export async function addGuest(
  invitationId: string,
  guestData: Omit<Guest, 'id' | 'invitationCode'>
): Promise<Guest> {
  const { user } = await requireInvitationOwner(invitationId);
  const limits = getLimits(user.packageId);
  if (user.role !== 'admin' && (await repo.countGuestsByInvitation(invitationId)) >= limits.maxGuests) {
    throw new Error(`Batas ${limits.maxGuests} tamu untuk paket ${user.packageId} sudah tercapai.`);
  }
  const name = clampText(guestData?.name, 120);
  if (!name) throw new Error('Nama tamu wajib diisi.');
  const status = guestData?.status;
  return repo.addGuest(invitationId, {
    name,
    group: clampText(guestData?.group, 60),
    phoneNumber: clampText(guestData?.phoneNumber, 30),
    paxLimit: clampInt(guestData?.paxLimit, 1, 50, 2),
    status: status === 'Sent' || status === 'Opened' ? status : 'Draft',
    seatImageUrl: isHttpsUrl(guestData?.seatImageUrl) ? guestData.seatImageUrl : '',
  });
}

export async function getGuestsByInvitation(invitationId: string): Promise<Guest[]> {
  await requireInvitationOwner(invitationId);
  return repo.getGuestsByInvitation(invitationId);
}

export async function updateGuestStatus(guestId: string, status: Guest['status']): Promise<void> {
  await requireChildOwner('guest', guestId);
  if (status !== 'Draft' && status !== 'Sent' && status !== 'Opened') throw new Error('Status tidak valid.');
  await repo.updateGuestStatus(guestId, status);
}

export async function removeGuest(guestId: string): Promise<void> {
  await requireChildOwner('guest', guestId);
  await repo.removeGuest(guestId);
}

export async function setGuestSeatImage(guestId: string, url: string): Promise<void> {
  await requireChildOwner('guest', guestId);
  if (url && !isHttpsUrl(url)) throw new Error('URL gambar harus diawali https://.');
  await repo.setGuestSeatImage(guestId, url || '');
}

export async function checkInGuest(guestId: string, pax: number, tableNo?: string): Promise<void> {
  await requireChildOwner('guest', guestId);
  await repo.checkInGuest(guestId, clampInt(pax, 1, 50, 1), tableNo ? clampText(tableNo, 20) : undefined);
}

export async function updateGuestLogistics(
  guestId: string,
  data: { tableNo?: string; souvenirGiven?: boolean }
): Promise<void> {
  await requireChildOwner('guest', guestId);
  await repo.updateGuestLogistics(guestId, {
    tableNo: data?.tableNo === undefined ? undefined : clampText(data.tableNo, 20),
    souvenirGiven: data?.souvenirGiven === undefined ? undefined : Boolean(data.souvenirGiven),
  });
}

// ============================================
// AKSI TAMU (publik, tanpa login) — divalidasi dan dibatasi lajunya
// ============================================

/** Validasi kode undangan personal. Dibatasi ketat karena ruang kodenya kecil. */
export async function validateGuestCode(invitationId: string, code: string): Promise<Guest | null> {
  await requireOpenInvitation(invitationId);
  await guestRateLimit('guest-code', String(invitationId), 30, 60);
  const cleanCode = clampText(code, 20);
  if (!cleanCode) return null;
  const guest = await repo.validateGuestCode(invitationId, cleanCode);
  return guest ? publicGuest(guest) : null;
}

/**
 * Konfirmasi kehadiran tamu. Pemanggil harus menyertakan kode undangan tamu
 * tersebut; id tamu saja tidak cukup.
 */
export async function confirmGuestAttendance(
  guestId: string,
  attendance: string,
  pax: number,
  invitationCode: string
): Promise<void> {
  await guestRateLimit('guest-confirm', 'all', 120, 60);
  const guest = typeof guestId === 'string' && guestId ? await repo.getGuestById(guestId) : null;
  const code = clampText(invitationCode, 20).toUpperCase();
  if (!guest || !code || guest.invitationCode.toUpperCase() !== code) {
    throw new Error('Kode undangan tidak cocok.');
  }
  await requireOpenInvitation(guest.invitationId);
  if (!isRsvpStatus(attendance)) throw new Error('Status kehadiran tidak valid.');
  await repo.confirmGuestAttendance(guestId, attendance, clampInt(pax, 1, Math.max(1, guest.paxLimit || 1), 1));
}

export async function addRSVP(invitationId: string, rsvpData: Omit<RSVP, 'id'>): Promise<RSVP> {
  await requireOpenInvitation(invitationId);
  await guestRateLimit('rsvp', String(invitationId), 60, 10 * 60);
  if (!isRsvpStatus(rsvpData?.status)) throw new Error('Status kehadiran tidak valid.');
  const guestName = clampText(rsvpData?.guestName, 100);
  if (!guestName) throw new Error('Nama wajib diisi.');

  // guestId hanya diterima jika memang tamu undangan ini.
  let guestId: string | undefined;
  if (typeof rsvpData?.guestId === 'string' && rsvpData.guestId) {
    const parent = await repo.getParentInvitationId('guest', rsvpData.guestId);
    if (parent === invitationId) guestId = rsvpData.guestId;
  }

  return repo.addRSVP(invitationId, {
    guestId,
    guestName,
    status: rsvpData.status,
    paxCount: rsvpData.status === 'Hadir' ? clampInt(rsvpData?.paxCount, 1, 50, 1) : 0,
    wishes: clampText(rsvpData?.wishes, 1000),
    timestamp: new Date().toISOString(),
  });
}

export async function addVisitorLog(invitationId: string, log: Omit<VisitorLog, 'id'>): Promise<void> {
  await requireOpenInvitation(invitationId);
  await guestRateLimit('visit', String(invitationId), 300, 10 * 60);
  await repo.addVisitorLog(invitationId, {
    guestName: clampText(log?.guestName, 100) || 'Anonim',
    device: clampText(log?.device, 40),
    browser: clampText(log?.browser, 60),
    timestamp: new Date().toISOString(),
  });
}

export async function getPhotoMoments(invitationId: string): Promise<PhotoMoment[]> {
  await requireOpenInvitation(invitationId);
  return repo.getPhotoMoments(invitationId);
}

export async function addPhotoMoment(
  invitationId: string,
  moment: { guestName: string; imageUrl: string; caption?: string }
): Promise<PhotoMoment> {
  await requireOpenInvitation(invitationId);
  await guestRateLimit('photo', String(invitationId), 60, 10 * 60);
  if (!isOwnCloudinaryUrl(moment?.imageUrl)) throw new Error('URL foto tidak valid.');
  return repo.addPhotoMoment(invitationId, {
    guestName: clampText(moment?.guestName, 60) || 'Tamu',
    imageUrl: moment.imageUrl,
    caption: clampText(moment?.caption, 200),
  });
}

export async function getVoiceWishes(invitationId: string): Promise<VoiceWish[]> {
  await requireOpenInvitation(invitationId);
  return repo.getVoiceWishes(invitationId);
}

export async function addVoiceWish(
  invitationId: string,
  wish: { guestName: string; audioUrl: string; durationSec: number }
): Promise<VoiceWish> {
  await requireOpenInvitation(invitationId);
  await guestRateLimit('voice', String(invitationId), 30, 10 * 60);
  if (!isOwnCloudinaryUrl(wish?.audioUrl)) throw new Error('URL audio tidak valid.');
  return repo.addVoiceWish(invitationId, {
    guestName: clampText(wish?.guestName, 60) || 'Tamu',
    audioUrl: wish.audioUrl,
    durationSec: clampInt(wish?.durationSec, 0, 120, 0),
  });
}

// ============================================
// MODERASI & ANALITIK (pemilik)
// ============================================

export async function deletePhotoMoment(photoId: string): Promise<void> {
  await requireChildOwner('photo', photoId);
  await repo.deletePhotoMoment(photoId);
}

export async function deleteVoiceWish(voiceId: string): Promise<void> {
  await requireChildOwner('voice', voiceId);
  await repo.deleteVoiceWish(voiceId);
}

export async function getRSVPsByInvitation(invitationId: string): Promise<RSVP[]> {
  await requireInvitationOwner(invitationId);
  return repo.getRSVPsByInvitation(invitationId);
}

export async function deleteRSVP(rsvpId: string): Promise<void> {
  await requireChildOwner('rsvp', rsvpId);
  await repo.deleteRSVP(rsvpId);
}

export async function getVisitorLogs(invitationId: string): Promise<VisitorLog[]> {
  await requireInvitationOwner(invitationId);
  return repo.getVisitorLogs(invitationId);
}

// ============================================
// DESIGN SNAPSHOTS (pemilik)
// ============================================

export async function saveDesignSnapshot(
  _userId: string,
  invitationId: string,
  themeId: string,
  themeName: string,
  weddingData: WeddingData,
  note?: string
): Promise<string> {
  const { user } = await requireInvitationOwner(invitationId);
  assertWeddingDataSize(weddingData);
  return repo.saveDesignSnapshot(
    user.id,
    invitationId,
    clampText(themeId, 60),
    clampText(themeName, 80),
    weddingData,
    clampText(note, 200)
  );
}

export async function getDesignSnapshots(userId?: string) {
  const user = await requireUser();
  return repo.getDesignSnapshots(effectiveUserId(user, userId));
}

export async function deleteDesignSnapshot(snapshotId: string): Promise<void> {
  const user = await requireUser();
  const ownerId = typeof snapshotId === 'string' && snapshotId ? await repo.getSnapshotOwner(snapshotId) : null;
  if (!ownerId || (ownerId !== user.id && user.role !== 'admin')) forbidden();
  await repo.deleteDesignSnapshot(snapshotId);
}

// ============================================
// PROFIL
// ============================================

export type ProfileResult =
  | { ok: true; user: SaaSUser }
  | { ok: false; error: string };

/**
 * Perbarui profil akun yang sedang login. Kuota ganti slug dihitung di server.
 */
export async function updateUserProfile(
  _userId: string,
  updates: { fullName?: string; activeSlug?: string; avatarUrl?: string }
): Promise<ProfileResult> {
  const user = await requireUser();
  const patch: { fullName?: string; activeSlug?: string; avatarUrl?: string; slugChangeCount?: number } = {};

  if (updates?.fullName !== undefined) {
    const fullName = clampText(updates.fullName, 120);
    if (fullName.split(/\s+/).filter(Boolean).length < 2) {
      return { ok: false, error: 'Nama Lengkap harus terdiri dari minimal 2 kata.' };
    }
    patch.fullName = fullName;
  }

  if (updates?.avatarUrl !== undefined) {
    const avatarUrl = clampText(updates.avatarUrl, 2048);
    if (avatarUrl && !isOwnCloudinaryUrl(avatarUrl)) {
      return { ok: false, error: 'URL foto profil tidak valid.' };
    }
    patch.avatarUrl = avatarUrl;
  }

  if (updates?.activeSlug !== undefined && updates.activeSlug !== user.activeSlug) {
    const slug = normalizeSlug(updates.activeSlug);
    if (!slug || slug !== updates.activeSlug) {
      return { ok: false, error: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (3–50 karakter).' };
    }
    if (RESERVED_SLUGS.has(slug)) return { ok: false, error: 'Slug ini tidak bisa dipakai.' };
    const limits = getLimits(user.packageId);
    const used = user.slugChangeCount || 0;
    if (user.role !== 'admin') {
      if (limits.slugChanges <= 0) {
        return { ok: false, error: `Paket ${user.packageId} tidak mengizinkan pergantian slug.` };
      }
      if (used >= limits.slugChanges) return { ok: false, error: 'Jatah ganti slug Anda sudah habis.' };
    }
    if (await repo.checkSlugExists(slug, user.id)) {
      return { ok: false, error: 'Slug tersebut sudah digunakan orang lain. Silakan pilih yang lain.' };
    }
    patch.activeSlug = slug;
    patch.slugChangeCount = used + 1;
    revalidatePath(`/${user.activeSlug}`);
    revalidatePath(`/${slug}`);
  }

  await repo.updateUserProfile(user.id, patch);
  const fresh = await repo.getUserById(user.id);
  return { ok: true, user: fresh || user };
}

export async function updateUserAvatar(_userId: string, avatarUrl: string): Promise<void> {
  const user = await requireUser();
  if (!isOwnCloudinaryUrl(avatarUrl)) throw new Error('URL foto profil tidak valid.');
  await repo.updateUserAvatar(user.id, avatarUrl);
}

// ============================================
// LIVE CHAT
// ============================================

function assertConversation(user: SaaSUser, conversationId: string) {
  if (user.role !== 'admin' && conversationId !== user.id) forbidden();
}

export async function sendChatMessage(
  conversationId: string,
  _senderId: string,
  _senderName: string,
  senderAvatar: string,
  _senderRole: 'client' | 'admin',
  message: string
): Promise<ChatMessage> {
  const user = await requireUser();
  assertConversation(user, conversationId);
  const text = clampText(message, 2000);
  if (!text) throw new Error('Pesan kosong.');
  const limited = await rateLimit({ identifier: `chat:${user.id}`, max: 30, windowSecs: 60 });
  if (!limited.success) throw new Error('Terlalu banyak pesan. Coba lagi sebentar.');
  return repo.sendChatMessage(
    conversationId,
    user.id,
    user.fullName,
    isOwnCloudinaryUrl(senderAvatar) ? senderAvatar : '',
    user.role === 'admin' ? 'admin' : 'client',
    text
  );
}

export async function getChatMessages(conversationId: string, limit: number = 100): Promise<ChatMessage[]> {
  const user = await requireUser();
  assertConversation(user, conversationId);
  return repo.getChatMessages(conversationId, clampInt(limit, 1, 200, 100));
}

export async function markMessagesAsRead(conversationId: string, _readerRole?: 'client' | 'admin'): Promise<void> {
  const user = await requireUser();
  assertConversation(user, conversationId);
  await repo.markMessagesAsRead(conversationId, user.role === 'admin' ? 'admin' : 'client');
}

export async function getUnreadCount(conversationId: string, _readerRole?: 'client' | 'admin'): Promise<number> {
  const user = await requireUser();
  assertConversation(user, conversationId);
  return repo.getUnreadCount(conversationId, user.role === 'admin' ? 'admin' : 'client');
}

export async function getAdminAvatarUrl(): Promise<string> {
  await requireUser();
  return repo.getAdminAvatarUrl();
}

// ============================================
// ADMIN
// ============================================

export async function adminListUsers(): Promise<SaaSUser[]> {
  await requireAdmin();
  return repo.getAllUsers();
}

export async function adminListTransactions(): Promise<TransactionReport[]> {
  await requireAdmin();
  return repo.getAllTransactions();
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const admin = await requireAdmin();
  if (userId === admin.id) throw new Error('Admin tidak bisa menghapus akunnya sendiri.');
  await repo.deleteUser(userId);
}

/**
 * Setujui atau tolak transaksi secara manual. User yang terdampak diambil dari
 * baris transaksi, bukan dari argumen.
 */
export async function adminSetTransactionStatus(
  txId: string,
  status: 'success' | 'failed'
): Promise<{ userId: string }> {
  await requireAdmin();
  if (status !== 'success' && status !== 'failed') throw new Error('Status tidak valid.');
  const tx = await repo.getTransactionById(txId);
  if (!tx) throw new Error('Transaksi tidak ditemukan.');

  if (status === 'success') {
    // Jalur yang sama dengan webhook: aktivasi/upgrade/perpanjangan diterapkan sekali.
    if (tx.status !== 'pending') await repo.updateTransactionStatus(tx.id, 'pending');
    await settleTransaction({ ...tx, status: 'pending' });
  } else {
    await repo.updateTransactionStatus(tx.id, 'failed');
    // Hanya pendaftaran baru yang membuat akun berstatus gagal bayar;
    // upgrade/perpanjangan yang ditolak tidak mengubah paket yang sudah lunas.
    if (tx.txType === 'signup') await repo.updateUserPaymentStatus(tx.userId, 'failed');
  }
  return { userId: tx.userId };
}
