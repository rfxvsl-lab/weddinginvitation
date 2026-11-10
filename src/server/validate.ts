/**
 * Validasi dan pembersihan input yang datang dari browser.
 * Tanpa dependensi supaya bisa diuji langsung.
 */

/** Potong string ke panjang maksimum; nilai non-string menjadi string kosong. */
export function clampText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Slug: huruf kecil, angka, tanda hubung; 3–50 karakter. */
export function normalizeSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  if (slug.length < 3 || slug.length > 50) return null;
  return slug;
}

/** Slug yang bentrok dengan route aplikasi. */
export const RESERVED_SLUGS = new Set([
  'admin', 'api', 'auth', 'dashboard', 'demo', 'preview', 'kharis-lia',
  'cookie-policy', 'privacy-policy', 'refund-policy', 'terms-of-service',
  'robots.txt', 'sitemap.xml', '_next', 'assets', 'favicon.ico',
]);

export function cloudinaryCloudName(): string {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxklmdbjv';
}

/**
 * Hanya terima URL https ke akun Cloudinary milik sendiri.
 * Mencegah penyimpanan URL sembarangan (tracking pixel, konten pihak ketiga).
 */
export function isOwnCloudinaryUrl(value: unknown, cloudName: string = cloudinaryCloudName()): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return false;
  if (url.username || url.password || url.port) return false;
  return url.pathname.startsWith(`/${cloudName}/`);
}

/** URL https biasa (untuk konten milik pemilik undangan, mis. gambar denah meja). */
export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export const PACKAGE_IDS = ['demo', 'reguler', 'premium', 'luxury'] as const;
export type ValidPackageId = (typeof PACKAGE_IDS)[number];

export function isPackageId(value: unknown): value is ValidPackageId {
  return typeof value === 'string' && (PACKAGE_IDS as readonly string[]).includes(value);
}

export const RSVP_STATUSES = ['Hadir', 'Tidak Hadir', 'Ragu-ragu'] as const;
export function isRsvpStatus(value: unknown): value is (typeof RSVP_STATUSES)[number] {
  return typeof value === 'string' && (RSVP_STATUSES as readonly string[]).includes(value);
}
