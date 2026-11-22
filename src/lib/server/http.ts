import 'server-only';
import { NextResponse } from 'next/server';
import { AuthError } from './auth';
import { checkRateLimit, getClientIp } from '../rateLimit';

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Ubah error apa pun menjadi respons JSON yang aman (tanpa membocorkan detail internal). */
export function handleRouteError(scope: string, err: unknown) {
  if (err instanceof AuthError) return jsonError(err.message, err.status);
  console.error(`[${scope}]`, err);
  return jsonError('Terjadi gangguan pada server. Silakan coba lagi.', 500);
}

/** Rate-limit sederhana per IP (+ kunci opsional). Mengembalikan respons 429 bila terlampaui. */
export function limitOr429(req: Request, bucket: string, max: number, windowSecs: number, key = '') {
  const ip = getClientIp(req);
  const r = checkRateLimit({ identifier: `${bucket}:${ip}:${key}`, max, windowSecs });
  if (!r.success) {
    return jsonError(`Terlalu banyak percobaan. Coba lagi dalam ${r.resetIn} detik.`, 429);
  }
  return null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeSlug(input: string): string {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

/** Slug yang tidak boleh dipakai karena bentrok dengan route aplikasi. */
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'auth', 'dashboard', 'demo', 'preview', 'login', 'register', 'daftar', 'masuk',
  'privacy-policy', 'terms-of-service', 'cookie-policy', 'refund-policy', 'robots.txt', 'sitemap.xml',
  'enterprise', 'pricing', 'harga', 'tema', 'help', 'bantuan', 'super-admin', '_next', 'assets', 'static',
]);
