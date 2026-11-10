/**
 * Session berbasis cookie httpOnly. Hanya dipakai di server
 * (server action, route handler, server component).
 */

import { cookies, headers } from 'next/headers';
import type { SaaSUser } from '../types';
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  getSessionSecret,
  verifySessionToken,
  type SessionPayload,
} from './sessionToken';
import { getUserById } from './repo';

/** Error yang aman ditampilkan ke pengguna. */
export class AuthError extends Error {
  code: 'UNAUTHENTICATED' | 'FORBIDDEN';
  constructor(code: 'UNAUTHENTICATED' | 'FORBIDDEN', message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export async function startSession(user: Pick<SaaSUser, 'id' | 'role'>): Promise<void> {
  const token = createSessionToken(
    { uid: user.id, role: user.role === 'admin' ? 'admin' : 'user' },
    getSessionSecret()
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  // Cookie lama (JSON base64 tanpa tanda tangan) tidak dipakai lagi.
  jar.delete('saas_user_session');
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete('saas_user_session');
}

export async function readSessionPayload(): Promise<SessionPayload | null> {
  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value, secret);
}

/** User yang sedang login, dibaca ulang dari DB. Null jika tidak ada session yang sah. */
export async function getSessionUser(): Promise<SaaSUser | null> {
  const payload = await readSessionPayload();
  if (!payload) return null;
  return getUserById(payload.uid);
}

export async function requireUser(): Promise<SaaSUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError('UNAUTHENTICATED', 'Sesi berakhir. Silakan masuk lagi.');
  return user;
}

export async function requireAdmin(): Promise<SaaSUser> {
  const user = await requireUser();
  if (user.role !== 'admin') throw new AuthError('FORBIDDEN', 'Akses ditolak.');
  return user;
}

/** IP klien dari header proxy (Vercel mengisi x-forwarded-for). */
export async function getRequestIp(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  );
}
