'use server';

/**
 * Server actions untuk autentikasi. Semua keputusan (siapa user-nya, apa
 * perannya, status bayarnya) dibuat di server; browser hanya menerima hasil.
 */

import * as repo from '../server/repo';
import { endSession, getRequestIp, getSessionUser, startSession } from '../server/session';
import { rateLimit } from '../server/rateLimit';
import { verifyGoogleIdToken } from '../server/google';
import {
  clampText,
  isPackageId,
  isValidEmail,
  normalizeSlug,
  RESERVED_SLUGS,
} from '../server/validate';
import type { SaaSUser } from '../types';

export type AuthResult =
  | { ok: true; user: SaaSUser }
  | { ok: false; error: string };

export type GoogleAuthResult =
  | { ok: true; user: SaaSUser }
  | { ok: true; needsSignup: { email: string; name: string; avatarUrl: string } }
  | { ok: false; error: string };

export interface RegisterInput {
  fullName: string;
  coupleGroom: string;
  coupleBride: string;
  activeSlug: string;
  email?: string;
  password?: string;
  noWa: string;
  sosmed?: string;
  packageId: string;
  isCustomByRfx?: boolean;
  /** Google ID token; jika ada, email diambil dari token dan password tidak dipakai. */
  googleCredential?: string;
}

const GENERIC_LOGIN_ERROR = 'Email atau password salah. Silakan coba lagi.';
const BANNED_ERROR = 'Akses ditolak. Alamat IP Anda telah diblokir karena melanggar ketentuan layanan.';

function googleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
}

async function isBanned(ip: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false;
  try {
    return await repo.checkBannedIp(ip);
  } catch {
    return false;
  }
}

async function recordIp(user: SaaSUser, ip: string) {
  if (!ip || ip === 'unknown') return;
  try {
    await repo.updateUserIp(user.id, ip);
    user.ipAddress = ip;
  } catch {
    /* pencatatan IP tidak boleh menggagalkan login */
  }
}

/** User dari cookie session, atau null. Dipanggil saat aplikasi dimuat. */
export async function getCurrentUser(): Promise<SaaSUser | null> {
  return getSessionUser();
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  const ip = await getRequestIp();
  const cleanEmail = clampText(email, 254).toLowerCase();
  if (!isValidEmail(cleanEmail) || typeof password !== 'string' || !password || password.length > 200) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  // Penahan utama tebak-tebakan password adalah batas per email. Batas per IP
  // dibuat longgar karena banyak pengguna seluler berbagi satu IP (CGNAT).
  const [byIp, byEmail] = await Promise.all([
    rateLimit({ identifier: `login-ip:${ip}`, max: 100, windowSecs: 10 * 60 }),
    rateLimit({ identifier: `login-email:${cleanEmail}`, max: 10, windowSecs: 10 * 60 }),
  ]);
  if (!byIp.success || !byEmail.success) {
    const wait = Math.max(byIp.resetIn, byEmail.resetIn);
    return { ok: false, error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${Math.ceil(wait / 60)} menit.` };
  }
  if (await isBanned(ip)) return { ok: false, error: BANNED_ERROR };

  const user = await repo.verifyUserPassword(cleanEmail, password);
  if (!user) return { ok: false, error: GENERIC_LOGIN_ERROR };

  await recordIp(user, ip);
  await startSession(user);
  return { ok: true, user };
}

export async function googleLoginAction(credential: string): Promise<GoogleAuthResult> {
  const ip = await getRequestIp();
  const limited = await rateLimit({ identifier: `google-ip:${ip}`, max: 100, windowSecs: 10 * 60 });
  if (!limited.success) return { ok: false, error: 'Terlalu banyak percobaan masuk. Coba lagi nanti.' };

  const identity = await verifyGoogleIdToken(credential, googleClientId());
  if (!identity) return { ok: false, error: 'Login Google gagal diverifikasi. Silakan coba lagi.' };
  if (await isBanned(ip)) return { ok: false, error: BANNED_ERROR };

  const user = await repo.getUserByEmail(identity.email);
  if (!user) {
    return { ok: true, needsSignup: { email: identity.email, name: identity.name, avatarUrl: identity.picture } };
  }
  await recordIp(user, ip);
  await startSession(user);
  return { ok: true, user };
}

export async function registerAction(input: RegisterInput): Promise<AuthResult> {
  const ip = await getRequestIp();
  const limited = await rateLimit({ identifier: `register-ip:${ip}`, max: 20, windowSecs: 60 * 60 });
  if (!limited.success) return { ok: false, error: 'Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.' };
  if (await isBanned(ip)) return { ok: false, error: 'Pendaftaran ditolak. Alamat IP Anda telah diblokir.' };

  const fullName = clampText(input?.fullName, 120);
  const coupleGroom = clampText(input?.coupleGroom, 60);
  const coupleBride = clampText(input?.coupleBride, 60);
  const noWa = clampText(input?.noWa, 30);
  const sosmed = clampText(input?.sosmed, 80);
  if (!fullName || !coupleGroom || !coupleBride || !noWa) {
    return { ok: false, error: 'Harap lengkapi semua isian formulir.' };
  }
  if (!isPackageId(input?.packageId)) return { ok: false, error: 'Paket tidak valid.' };
  const packageId = input.packageId;

  const slug = normalizeSlug(input?.activeSlug);
  if (!slug || RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: 'Slug tidak valid. Gunakan 3–50 huruf kecil, angka, atau tanda hubung.' };
  }

  // Identitas: token Google yang diverifikasi ulang, atau email + password.
  let email: string;
  let password: string | undefined;
  let avatarUrl = '';
  let authProvider: 'local' | 'google' = 'local';
  if (input?.googleCredential) {
    const identity = await verifyGoogleIdToken(input.googleCredential, googleClientId());
    if (!identity) return { ok: false, error: 'Sesi Google kedaluwarsa. Silakan masuk dengan Google lagi.' };
    email = identity.email;
    avatarUrl = identity.picture;
    authProvider = 'google';
  } else {
    email = clampText(input?.email, 254).toLowerCase();
    if (!isValidEmail(email)) return { ok: false, error: 'Alamat email tidak valid.' };
    if (typeof input?.password !== 'string' || input.password.length < 6 || input.password.length > 200) {
      return { ok: false, error: 'Password minimal 6 karakter.' };
    }
    password = input.password;
  }

  if (await repo.checkSlugExists(slug)) {
    return { ok: false, error: 'Slug nama pasangan sudah digunakan. Silakan modifikasi sedikit.' };
  }
  if (await repo.checkEmailExists(email)) {
    return { ok: false, error: 'Email ini sudah pernah mendaftarkan akun. Silakan gunakan menu Sign In.' };
  }

  const user = await repo.createUser({
    fullName,
    coupleGroom,
    coupleBride,
    activeSlug: slug,
    email,
    password,
    noWa,
    sosmed,
    packageId,
    isCustomByRfx: packageId === 'demo' ? false : Boolean(input?.isCustomByRfx),
    // Status bayar ditentukan server: hanya paket demo yang langsung aktif.
    paymentStatus: packageId === 'demo' ? 'success' : 'pending',
    warningCount: 0,
    ipAddress: ip === 'unknown' ? '' : ip,
    authProvider,
    avatarUrl,
  });

  await startSession(user);
  return { ok: true, user };
}

export async function logoutAction(): Promise<void> {
  await endSession();
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const clean = normalizeSlug(slug);
  if (!clean || RESERVED_SLUGS.has(clean)) return false;
  const current = await getSessionUser();
  return !(await repo.checkSlugExists(clean, current?.id));
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  const ip = await getRequestIp();
  const limited = await rateLimit({ identifier: `email-check:${ip}`, max: 60, windowSecs: 10 * 60 });
  // Saat dibatasi, anggap tersedia; pengecekan final tetap dilakukan saat registrasi.
  if (!limited.success) return true;
  const clean = clampText(email, 254).toLowerCase();
  if (!isValidEmail(clean)) return false;
  return !(await repo.checkEmailExists(clean));
}
