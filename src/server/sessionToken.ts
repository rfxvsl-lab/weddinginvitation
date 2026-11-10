/**
 * Token session bertanda tangan (HMAC-SHA256).
 *
 * Modul ini sengaja tidak mengimpor apa pun dari Next.js supaya bisa dipakai
 * di middleware, server action, route handler, dan unit test.
 *
 * Format: v1.<payload base64url>.<signature base64url>
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'rh_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export type SessionRole = 'user' | 'admin';

export interface SessionPayload {
  /** User id */
  uid: string;
  /** Peran saat token dibuat. Hanya petunjuk untuk routing; data selalu dicek ulang ke DB. */
  role: SessionRole;
  /** Kedaluwarsa, detik sejak epoch */
  exp: number;
}

const MIN_SECRET_LENGTH = 32;

/** Ambil secret dari env. Melempar error jika belum dikonfigurasi dengan benar. */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || '';
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET belum dikonfigurasi (minimal ${MIN_SECRET_LENGTH} karakter). ` +
        'Buat dengan: openssl rand -base64 48'
    );
  }
  return secret;
}

function sign(data: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(data).digest();
}

export function createSessionToken(
  input: { uid: string; role: SessionRole },
  secret: string,
  nowMs: number = Date.now(),
  ttlSeconds: number = SESSION_TTL_SECONDS
): string {
  const payload: SessionPayload = {
    uid: input.uid,
    role: input.role,
    exp: Math.floor(nowMs / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const data = `v1.${body}`;
  return `${data}.${sign(data, secret).toString('base64url')}`;
}

/** Mengembalikan payload jika token sah dan belum kedaluwarsa; selain itu null. */
export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  nowMs: number = Date.now()
): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;

  const data = `${parts[0]}.${parts[1]}`;
  let given: Buffer;
  try {
    given = Buffer.from(parts[2], 'base64url');
  } catch {
    return null;
  }
  const expected = sign(data, secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as SessionPayload;
    if (typeof payload.uid !== 'string' || !payload.uid) return null;
    if (payload.role !== 'user' && payload.role !== 'admin') return null;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= nowMs) return null;
    return payload;
  } catch {
    return null;
  }
}
