/**
 * Simple in-memory rate limiter untuk Next.js API routes
 * Tidak memerlukan dependency external â€” cocok untuk Vercel serverless.
 * 
 * Catatan: Di serverless environment, memory tidak persisten antar-invocation.
 * Untuk production scale besar, gunakan Redis (Upstash) via @upstash/ratelimit.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Map<identifier, {count, resetAt}>
const store = new Map<string, RateLimitEntry>();

// Bersihkan expired entries setiap 5 menit untuk mencegah memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Jumlah maksimum request yang diizinkan */
  max: number;
  /** Window waktu dalam detik */
  windowSecs: number;
  /** Identifier (biasanya IP address) */
  identifier: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

/**
 * Cek rate limit untuk sebuah identifier.
 * Mengembalikan { success: false } jika limit terlampaui.
 */
export function checkRateLimit({ max, windowSecs, identifier }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSecs * 1000;

  let entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Buat entry baru atau reset yang sudah expired
    entry = { count: 1, resetAt: now + windowMs };
    store.set(identifier, entry);
    return { success: true, remaining: max - 1, resetIn: windowSecs };
  }

  if (entry.count >= max) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: max - entry.count,
    resetIn: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Ambil IP address dari Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}
