import 'server-only';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  LEGACY_SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  isAdminEmail,
  type SessionPayload,
} from './session';
import { getInvitationOwnerId } from '../db';
import type { SaaSUser } from '../../types';

export class AuthError extends Error {
  constructor(message = 'Sesi Anda berakhir. Silakan masuk kembali.', public status = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Sesi aktif dari cookie httpOnly bertanda tangan, atau null. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // Peran admin selalu dihitung ulang dari ENV (bukan dipercaya dari token lama).
  return { ...session, role: isAdminEmail(session.email) ? 'admin' : 'user' };
}

export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) throw new AuthError();
  return s;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await requireSession();
  if (s.role !== 'admin') throw new AuthError('Akses khusus admin.', 403);
  return s;
}

/** Pastikan undangan milik user yang login (admin boleh semua). */
export async function requireInvitationOwner(invitationId: string): Promise<SessionPayload> {
  const s = await requireSession();
  if (!invitationId) throw new AuthError('Undangan tidak ditemukan.', 404);
  if (s.role === 'admin') return s;
  const owner = await getInvitationOwnerId(invitationId);
  if (!owner || owner !== s.uid) throw new AuthError('Anda tidak memiliki akses ke undangan ini.', 403);
  return s;
}

export async function isInvitationOwner(invitationId: string): Promise<boolean> {
  try {
    await requireInvitationOwner(invitationId);
    return true;
  } catch {
    return false;
  }
}

/** Set cookie sesi pada response route handler. */
export async function attachSession(res: NextResponse, user: Pick<SaaSUser, 'id' | 'email'>) {
  const token = await createSessionToken({
    uid: user.id,
    email: user.email,
    role: isAdminEmail(user.email) ? 'admin' : 'user',
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  res.cookies.set(LEGACY_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

export function clearSession(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(0) });
  res.cookies.set(LEGACY_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

/** Data user yang aman dikirim ke browser (tanpa hash/IP). */
export function toClientUser(user: SaaSUser): SaaSUser & { isAdmin: boolean } {
  const { password: _pw, ipAddress: _ip, ...rest } = user as SaaSUser;
  return { ...rest, isAdmin: isAdminEmail(user.email) };
}
