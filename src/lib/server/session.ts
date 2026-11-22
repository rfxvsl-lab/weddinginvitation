/**
 * Signed session tokens (HMAC-SHA256) — runtime-agnostic (Web Crypto),
 * so the same code works in Route Handlers, Server Actions and the proxy/middleware.
 *
 * Token format: base64url(JSON payload) + "." + base64url(HMAC signature)
 * The cookie is httpOnly, so it can never be read or forged from the browser.
 */

export const SESSION_COOKIE = 'rh_session';
export const LEGACY_SESSION_COOKIE = 'saas_user_session';
export const SESSION_MAX_AGE_SECS = 60 * 60 * 24 * 14; // 14 hari

export type SessionRole = 'user' | 'admin';

export interface SessionPayload {
  uid: string;
  email: string;
  role: SessionRole;
  /** expiry, unix seconds */
  exp: number;
  /** token version — bump to invalidate all sessions */
  v: 1;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret(): string {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // Fallback: turunkan dari secret server yang sudah ada (tidak pernah dikirim ke browser).
  const derivedFrom =
    process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN || process.env.PAKASIR_API_KEY;
  if (derivedFrom) return `rh-session::${derivedFrom}`;
  if (process.env.NODE_ENV !== 'production') return 'rh-dev-only-insecure-session-secret';
  throw new Error('SESSION_SECRET belum diset di environment production.');
}

function toB64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(str: string): Uint8Array {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

let keyPromise: Promise<CryptoKey> | null = null;
let keyFor = '';
function getKey(): Promise<CryptoKey> {
  const secret = getSecret();
  if (!keyPromise || keyFor !== secret) {
    keyFor = secret;
    keyPromise = crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }
  return keyPromise;
}

/** Sign arbitrary JSON data (used for sessions and short-lived tokens). */
export async function signData(data: Record<string, unknown>): Promise<string> {
  const body = toB64Url(encoder.encode(JSON.stringify(data)));
  const sig = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(body));
  return `${body}.${toB64Url(new Uint8Array(sig))}`;
}

/** Verify a token created by signData. Returns null when invalid or expired. */
export async function verifyData<T extends { exp?: number }>(token: string | undefined | null): Promise<T | null> {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const ok = await crypto.subtle.verify('HMAC', await getKey(), fromB64Url(sig), encoder.encode(body));
    if (!ok) return null;
    const data = JSON.parse(decoder.decode(fromB64Url(body))) as T;
    if (typeof data.exp === 'number' && data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createSessionToken(input: { uid: string; email: string; role: SessionRole }): Promise<string> {
  const payload: SessionPayload = {
    uid: input.uid,
    email: input.email.toLowerCase().trim(),
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECS,
    v: 1,
  };
  return signData(payload as unknown as Record<string, unknown>);
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  const data = await verifyData<SessionPayload>(token);
  if (!data || data.v !== 1 || !data.uid || !data.email) return null;
  return data;
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Admin ditentukan di server dari ENV — bukan dari data yang dikirim browser.
 * ADMIN_EMAILS boleh berisi beberapa email dipisah koma.
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const configured = [process.env.ADMIN_EMAILS, process.env.ADMIN_EMAIL, process.env.NEXT_PUBLIC_ADMIN_EMAIL]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);
  // Fallback pemilik platform bila ENV belum diset (agar admin tidak terkunci).
  const list = configured.length ? configured : ['mhmmadridho64@gmail.com'];
  return list.includes(email.toLowerCase().trim());
}
