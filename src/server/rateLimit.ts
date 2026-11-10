/**
 * Rate limit yang dibagi antar-instance lewat tabel `rate_limits` (migrasi 007).
 * Jika tabel belum ada atau DB gagal, jatuh ke limiter in-memory supaya
 * permintaan sah tidak ikut terblokir.
 */

import { dbExecute } from '../lib/turso';
import { checkRateLimit as memoryRateLimit } from '../lib/rateLimit';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Detik sampai jendela direset */
  resetIn: number;
}

export async function rateLimit(opts: {
  identifier: string;
  max: number;
  windowSecs: number;
}): Promise<RateLimitResult> {
  const now = Date.now();
  const resetAt = now + opts.windowSecs * 1000;
  // Sesekali buang baris kedaluwarsa supaya tabel tidak tumbuh tanpa batas.
  if (Math.random() < 0.02) void pruneRateLimits();
  try {
    const result = await dbExecute(
      `INSERT INTO rate_limits (key, count, reset_at) VALUES (:key, 1, :resetAt)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN rate_limits.reset_at <= :now THEN 1 ELSE rate_limits.count + 1 END,
         reset_at = CASE WHEN rate_limits.reset_at <= :now THEN :resetAt ELSE rate_limits.reset_at END
       RETURNING count, reset_at`,
      { key: opts.identifier.slice(0, 200), resetAt, now }
    );
    const count = Number(result.rows[0]?.count ?? 1);
    const reset = Number(result.rows[0]?.reset_at ?? resetAt);
    return {
      success: count <= opts.max,
      remaining: Math.max(0, opts.max - count),
      resetIn: Math.max(1, Math.ceil((reset - now) / 1000)),
    };
  } catch {
    return memoryRateLimit(opts);
  }
}

/** Buang baris kedaluwarsa. Dipanggil sesekali; kegagalan diabaikan. */
export async function pruneRateLimits(): Promise<void> {
  try {
    await dbExecute('DELETE FROM rate_limits WHERE reset_at <= :now', { now: Date.now() });
  } catch {
    /* tabel belum ada */
  }
}
