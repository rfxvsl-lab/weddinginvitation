'use server';

/**
 * Server Actions — SATU-SATUNYA pintu dari komponen client ke database.
 *
 * Setiap fungsi yang diekspor di file `'use server'` adalah endpoint publik,
 * jadi semuanya wajib memeriksa otorisasi di sini:
 *   • owner   → hanya pemilik undangan (atau admin)
 *   • self    → hanya untuk akun yang sedang login
 *   • admin   → hanya admin (ditentukan dari ENV di server)
 *   • public  → untuk tamu undangan; hanya undangan yang sudah dipublikasikan,
 *               input divalidasi & dibatasi.
 * Route handler dan server component memakai `./db` secara langsung.
 */

import { headers } from 'next/headers';
import * as db from './db';
import {
  requireSession,
  requireAdmin,
  requireInvitationOwner,
  getSession,
  AuthError,
  toClientUser,
} from './server/auth';
import { signData, verifyData } from './server/session';
import { checkRateLimit } from './rateLimit';
import { getLimits } from './packageLimits';
import type { WeddingData, Guest, RSVP, VisitorLog, SaaSUser, TransactionReport } from '../types';

export type { ChatMessage } from './db';

// --------------------------------------------
// helpers
// --------------------------------------------

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

async function rateLimit(bucket: string, max: number, windowSecs: number, key = '') {
  const ip = await clientIp();
  const r = checkRateLimit({ identifier: `${bucket}:${ip}:${key}`, max, windowSecs });
  if (!r.success) throw new Error(`Terlalu banyak permintaan. Coba lagi dalam ${r.resetIn} detik.`);
}

const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

function assertSelf(sessionUid: string, role: string, userId: string) {
  if (role !== 'admin' && sessionUid !== userId) throw new AuthError('Akses ditolak.', 403);
}

/** Undangan yang boleh diakses tamu: sudah publish & belum kedaluwarsa (pemilik selalu boleh). */
async function requirePublicInvitation(invitationId: string) {
  const state = await db.getInvitationPublicState(String(invitationId || ''));
  if (!state) throw new Error('Undangan tidak ditemukan.');
  if (state.isPublished && !state.isExpired) return state;
  const session = await getSession();
  if (session && (session.uid === state.ownerId || session.role === 'admin')) return state;
  throw new Error('Undangan belum dipublikasikan.');
}

async function requireGuestOwner(guestId: string) {
  const invId = await db.getGuestInvitationId(guestId);
  if (!invId) throw new Error('Tamu tidak ditemukan.');
  await requireInvitationOwner(invId);
  return invId;
}

/** Data tamu yang aman ditampilkan ke publik (tanpa nomor HP). */
function publicGuest(g: Guest): Guest {
  return { ...g, phoneNumber: '' };
}

function isCloudinaryUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

// ============================================
// AKUN (self)
// ============================================

export async function checkSlugExists(slug: string, _excludeUserId?: string): Promise<boolean> {
  await rateLimit('slug-check', 120, 60);
  const session = await getSession();
  return db.checkSlugExists(text(slug, 60).toLowerCase(), session?.uid);
}

export async function checkEmailExists(email: string): Promise<boolean> {
  await rateLimit('email-check', 30, 60);
  return db.checkEmailExists(text(email, 160));
}

export async function getMe(): Promise<SaaSUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await db.getUserById(session.uid);
  return user ? toClientUser(user) : null;
}

export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string; activeSlug?: string; avatarUrl?: string; slugChangeCount?: number }
) {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  const clean: { fullName?: string; activeSlug?: string; avatarUrl?: string } = {};
  if (updates.fullName !== undefined) clean.fullName = text(updates.fullName, 100);
  if (updates.avatarUrl !== undefined) {
    const url = text(updates.avatarUrl, 500);
    if (url && !/^https:\/\//.test(url)) throw new Error('URL foto profil tidak valid.');
    clean.avatarUrl = url;
  }
  if (updates.activeSlug !== undefined) {
    const slug = text(updates.activeSlug, 50).toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slug.length < 3) throw new Error('Slug minimal 3 karakter.');
    if (await db.checkSlugExists(slug, userId)) throw new Error('Slug sudah digunakan pengguna lain.');
    clean.activeSlug = slug;
  }
  await db.updateUserProfile(userId, clean);
}

export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  const url = text(avatarUrl, 500);
  if (url && !/^https:\/\//.test(url)) throw new Error('URL foto profil tidak valid.');
  await db.updateUserAvatar(userId, url);
}

// ============================================
// ADMIN
// ============================================

export async function getAllUsers(): Promise<SaaSUser[]> {
  await requireAdmin();
  return db.getAllUsers();
}

export async function getAllTransactions(): Promise<TransactionReport[]> {
  await requireAdmin();
  return db.getAllTransactions();
}

export async function deleteUser(userId: string): Promise<void> {
  const s = await requireAdmin();
  if (s.uid === userId) throw new Error('Admin tidak dapat menghapus akunnya sendiri.');
  await db.deleteUser(userId);
}

export async function updateUserPaymentStatus(userId: string, status: 'pending' | 'success' | 'failed') {
  await requireAdmin();
  await db.updateUserPaymentStatus(userId, status);
}

export async function updateTransactionStatus(txId: string, status: 'success' | 'failed' | 'pending') {
  await requireAdmin();
  await db.updateTransactionStatus(txId, status);
}

export async function updateUserPackage(userId: string, newPackageId: string): Promise<void> {
  await requireAdmin();
  await db.updateUserPackage(userId, newPackageId);
  await db.updateUserPaymentStatus(userId, 'success');
}

// ============================================
// UNDANGAN (owner)
// ============================================

export async function getInvitationByUserId(userId: string) {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  return db.getInvitationByUserId(userId);
}

export async function getInvitationsByUserId(userId: string) {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  return db.getInvitationsByUserId(userId);
}

export async function createInvitation(userId: string, title: string, themeId: string, weddingData: WeddingData) {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  const user = await db.getUserById(userId);
  if (!user) throw new AuthError('Akun tidak ditemukan.', 404);
  const existing = await db.getInvitationsByUserId(userId);
  const max = getLimits(user.packageId).maxProjects;
  if (existing.length >= max) throw new Error(`Batas ${max} proyek undangan sudah tercapai.`);
  return db.createInvitation(userId, text(title, 120) || 'Undangan Baru', text(themeId, 60), weddingData);
}

export async function updateInvitationData(invitationId: string, weddingData: WeddingData, themeId?: string) {
  await requireInvitationOwner(invitationId);
  if (JSON.stringify(weddingData ?? {}).length > 900_000) {
    throw new Error('Data undangan terlalu besar. Kurangi jumlah/ukuran konten.');
  }
  await db.updateInvitationData(invitationId, weddingData, themeId ? text(themeId, 60) : undefined);
}

/** Masa aktif dihitung dari paket ASLI user di database — argumen paket dari client diabaikan. */
export async function activateInvitation(invitationId: string, _packageId?: string) {
  const s = await requireInvitationOwner(invitationId);
  const inv = await db.getInvitationById(invitationId);
  if (!inv || inv.activatedAt) return;
  const owner = await db.getUserById(inv.userId || s.uid);
  await db.activateInvitation(invitationId, owner?.packageId || 'free');
}

export async function publishInvitation(invitationId: string) {
  await requireInvitationOwner(invitationId);
  await db.publishInvitation(invitationId);
}

export async function unpublishInvitation(invitationId: string) {
  await requireInvitationOwner(invitationId);
  await db.unpublishInvitation(invitationId);
}

export async function updateInvitationSlug(invitationId: string, newSlug: string) {
  await requireInvitationOwner(invitationId);
  return db.updateInvitationSlug(invitationId, text(newSlug, 50));
}

/** Versi publik: hanya undangan yang sudah dipublikasikan. */
export async function getInvitationBySlug(slug: string) {
  const inv = await db.getInvitationBySlug(text(slug, 60));
  if (!inv) return null;
  if (!inv.isPublished || inv.isExpired) {
    const session = await getSession();
    if (!session || (session.uid !== inv.userId && session.role !== 'admin')) return null;
  }
  return inv;
}

// ============================================
// SNAPSHOT DESAIN (owner)
// ============================================

export async function getDesignSnapshots(userId: string) {
  const s = await requireSession();
  assertSelf(s.uid, s.role, userId);
  return db.getDesignSnapshots(userId);
}

export async function saveDesignSnapshot(
  userId: string,
  invitationId: string,
  themeId: string,
  themeName: string,
  weddingData: WeddingData,
  note?: string
) {
  const s = await requireInvitationOwner(invitationId);
  assertSelf(s.uid, s.role, userId);
  return db.saveDesignSnapshot(userId, invitationId, text(themeId, 60), text(themeName, 120), weddingData, text(note, 300));
}

export async function deleteDesignSnapshot(snapshotId: string) {
  const s = await requireSession();
  const owner = await db.getSnapshotOwnerId(snapshotId);
  if (!owner) return;
  assertSelf(s.uid, s.role, owner);
  await db.deleteDesignSnapshot(snapshotId);
}

// ============================================
// TAMU (owner) + alur kode undangan (public)
// ============================================

export async function getGuestsByInvitation(invitationId: string): Promise<Guest[]> {
  await requireInvitationOwner(invitationId);
  return db.getGuestsByInvitation(invitationId);
}

export async function addGuest(invitationId: string, guestData: Omit<Guest, 'id' | 'invitationCode'>) {
  await requireInvitationOwner(invitationId);
  const name = text(guestData?.name, 120);
  if (!name) throw new Error('Nama tamu wajib diisi.');
  return db.addGuest(invitationId, {
    ...guestData,
    name,
    group: text(guestData.group, 80),
    phoneNumber: text(guestData.phoneNumber, 20),
    paxLimit: Math.min(20, Math.max(1, Number(guestData.paxLimit) || 2)),
  });
}

export async function removeGuest(guestId: string) {
  await requireGuestOwner(guestId);
  await db.removeGuest(guestId);
}

export async function updateGuestStatus(guestId: string, status: Guest['status']) {
  await requireGuestOwner(guestId);
  await db.updateGuestStatus(guestId, status);
}

export async function checkInGuest(guestId: string, pax: number, tableNo?: string) {
  await requireGuestOwner(guestId);
  await db.checkInGuest(guestId, Math.min(50, Math.max(1, Number(pax) || 1)), tableNo ? text(tableNo, 20) : undefined);
}

export async function updateGuestLogistics(guestId: string, data: { tableNo?: string; souvenirGiven?: boolean }) {
  await requireGuestOwner(guestId);
  await db.updateGuestLogistics(guestId, {
    tableNo: data.tableNo !== undefined ? text(data.tableNo, 20) : undefined,
    souvenirGiven: data.souvenirGiven,
  });
}

export async function setGuestSeatImage(guestId: string, url: string) {
  await requireGuestOwner(guestId);
  if (url && !isCloudinaryUrl(url)) throw new Error('URL gambar tidak valid.');
  await db.setGuestSeatImage(guestId, url);
}

/** PUBLIC — tamu memasukkan kode undangan personal. */
export async function validateGuestCode(invitationId: string, code: string): Promise<Guest | null> {
  await rateLimit('guest-code', 30, 10 * 60, invitationId);
  await requirePublicInvitation(invitationId);
  const g = await db.validateGuestCode(invitationId, text(code, 32));
  return g ? publicGuest(g) : null;
}

/**
 * PUBLIC — konfirmasi kehadiran. Wajib menyertakan kode undangan tamu,
 * sehingga orang lain tidak bisa mengubah status tamu hanya dengan menebak ID.
 */
export async function confirmGuestAttendance(
  invitationId: string,
  code: string,
  attendance: string,
  pax: number
): Promise<void> {
  await rateLimit('guest-confirm', 20, 10 * 60, invitationId);
  await requirePublicInvitation(invitationId);
  const guest = await db.validateGuestCode(invitationId, text(code, 32));
  if (!guest) throw new Error('Kode undangan tidak valid.');
  const allowed = ['Hadir', 'Tidak Hadir', 'Ragu-ragu'];
  const status = allowed.includes(attendance) ? attendance : 'Hadir';
  const safePax = Math.min(guest.paxLimit || 1, Math.max(1, Number(pax) || 1));
  await db.confirmGuestAttendance(guest.id, status, safePax);
}

// ============================================
// RSVP & ANALITIK
// ============================================

export async function getRSVPsByInvitation(invitationId: string): Promise<RSVP[]> {
  await requireInvitationOwner(invitationId);
  return db.getRSVPsByInvitation(invitationId);
}

/** PUBLIC — ucapan & konfirmasi dari halaman undangan. */
export async function addRSVP(invitationId: string, rsvpData: Omit<RSVP, 'id'>): Promise<RSVP> {
  await rateLimit('rsvp', 6, 10 * 60, invitationId);
  await requirePublicInvitation(invitationId);
  const allowed: RSVP['status'][] = ['Hadir', 'Tidak Hadir', 'Ragu-ragu'];
  const name = text(rsvpData?.guestName, 80);
  if (!name) throw new Error('Nama wajib diisi.');
  return db.addRSVP(invitationId, {
    guestId: undefined,
    guestName: name,
    status: allowed.includes(rsvpData.status) ? rsvpData.status : 'Hadir',
    paxCount: Math.min(20, Math.max(0, Number(rsvpData.paxCount) || 0)),
    wishes: text(rsvpData.wishes, 1000),
    timestamp: new Date().toISOString(),
  });
}

export async function deleteRSVP(rsvpId: string) {
  const invId = await db.getRsvpInvitationId(rsvpId);
  if (!invId) return;
  await requireInvitationOwner(invId);
  await db.deleteRSVP(rsvpId);
}

/** PUBLIC — pencatatan kunjungan. */
export async function addVisitorLog(invitationId: string, log: Omit<VisitorLog, 'id'>): Promise<void> {
  try {
    await rateLimit('visit', 30, 60, invitationId);
    await requirePublicInvitation(invitationId);
  } catch {
    return; // diam-diam diabaikan, bukan error untuk tamu
  }
  await db.addVisitorLog(invitationId, {
    guestName: text(log?.guestName, 80) || 'Anonim',
    device: text(log?.device, 40),
    browser: text(log?.browser, 60),
    timestamp: new Date().toISOString(),
  });
}

export async function getVisitorLogs(invitationId: string): Promise<VisitorLog[]> {
  await requireInvitationOwner(invitationId);
  return db.getVisitorLogs(invitationId);
}

// ============================================
// LIVE MOMENTS (public dengan batasan)
// ============================================

export async function getPhotoMoments(invitationId: string) {
  await requirePublicInvitation(invitationId);
  return db.getPhotoMoments(invitationId);
}

export async function getVoiceWishes(invitationId: string) {
  await requirePublicInvitation(invitationId);
  return db.getVoiceWishes(invitationId);
}

async function deleteToken(kind: string, id: string) {
  return signData({ kind, id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365 });
}

export async function addPhotoMoment(
  invitationId: string,
  moment: { guestName: string; imageUrl: string; caption?: string }
) {
  await rateLimit('moment', 10, 10 * 60, invitationId);
  await requirePublicInvitation(invitationId);
  if (!isCloudinaryUrl(moment?.imageUrl)) throw new Error('URL foto tidak valid.');
  const saved = await db.addPhotoMoment(invitationId, {
    guestName: text(moment.guestName, 80) || 'Tamu',
    imageUrl: moment.imageUrl,
    caption: text(moment.caption, 280),
  });
  return { ...saved, deleteToken: await deleteToken('photo', saved.id) };
}

export async function addVoiceWish(
  invitationId: string,
  wish: { guestName: string; audioUrl: string; durationSec: number }
) {
  await rateLimit('voice', 6, 10 * 60, invitationId);
  await requirePublicInvitation(invitationId);
  if (!isCloudinaryUrl(wish?.audioUrl)) throw new Error('URL audio tidak valid.');
  const saved = await db.addVoiceWish(invitationId, {
    guestName: text(wish.guestName, 80) || 'Tamu',
    audioUrl: wish.audioUrl,
    durationSec: Math.min(300, Math.max(0, Number(wish.durationSec) || 0)),
  });
  return { ...saved, deleteToken: await deleteToken('voice', saved.id) };
}

/** Boleh dihapus oleh pemilik undangan, atau oleh pengunggahnya (dengan token dari saat upload). */
async function canDeleteMoment(kind: 'photo' | 'voice', id: string, invId: string, token?: string) {
  if (token) {
    const t = await verifyData<{ kind: string; id: string; exp: number }>(token);
    if (t && t.kind === kind && t.id === id) return true;
  }
  try {
    await requireInvitationOwner(invId);
    return true;
  } catch {
    return false;
  }
}

export async function deletePhotoMoment(photoId: string, token?: string) {
  const invId = await db.getPhotoInvitationId(photoId);
  if (!invId) return;
  if (!(await canDeleteMoment('photo', photoId, invId, token))) throw new AuthError('Akses ditolak.', 403);
  await db.deletePhotoMoment(photoId);
}

export async function deleteVoiceWish(voiceId: string, token?: string) {
  const invId = await db.getVoiceInvitationId(voiceId);
  if (!invId) return;
  if (!(await canDeleteMoment('voice', voiceId, invId, token))) throw new AuthError('Akses ditolak.', 403);
  await db.deleteVoiceWish(voiceId);
}

// ============================================
// LIVE CHAT (self ↔ admin)
// ============================================

async function requireConversation(conversationId: string) {
  const s = await requireSession();
  if (s.role !== 'admin' && s.uid !== conversationId) throw new AuthError('Akses ditolak.', 403);
  return s;
}

export async function getChatMessages(conversationId: string, limit = 100) {
  await requireConversation(conversationId);
  return db.getChatMessages(conversationId, Math.min(200, Math.max(1, Number(limit) || 100)));
}

export async function getUnreadCount(conversationId: string, readerRole: 'client' | 'admin') {
  await requireConversation(conversationId);
  return db.getUnreadCount(conversationId, readerRole === 'admin' ? 'admin' : 'client');
}

export async function markMessagesAsRead(conversationId: string, readerRole: 'client' | 'admin') {
  await requireConversation(conversationId);
  return db.markMessagesAsRead(conversationId, readerRole === 'admin' ? 'admin' : 'client');
}

export async function sendChatMessage(
  conversationId: string,
  _senderId: string,
  _senderName: string,
  _senderAvatar: string,
  _senderRole: 'client' | 'admin',
  message: string
) {
  const s = await requireConversation(conversationId);
  await rateLimit('chat', 30, 60, s.uid);
  const body = text(message, 2000);
  if (!body) throw new Error('Pesan kosong.');
  const me = await db.getUserById(s.uid);
  const role = s.role === 'admin' && s.uid !== conversationId ? 'admin' : 'client';
  return db.sendChatMessage(conversationId, s.uid, me?.fullName || 'Pengguna', me?.avatarUrl || '', role, body);
}

/** Info publik admin untuk ditampilkan di widget chat (tanpa email/WA/IP). */
export async function getAdminUser(): Promise<Pick<SaaSUser, 'id' | 'fullName' | 'avatarUrl'> | null> {
  await requireSession();
  const admin = await db.getAdminUser();
  return admin ? { id: admin.id, fullName: admin.fullName, avatarUrl: admin.avatarUrl } : null;
}
