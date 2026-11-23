/**
 * PACKAGE_LIMITS — Single Source of Truth untuk model paket RuangHadir v2
 *
 * Model bisnis baru:
 * - `free`       : Full Gratis (Rp 0) — seluruh fitur inti terbuka, bisa langsung publish.
 * - `enterprise` : Enterprise — organisasi/WO/korporat, akses lewat email perusahaan
 *                  dan kode akses khusus yang diterbitkan via admin@ruanghadir.net.
 *
 * Legacy IDs (`demo`, `reguler`, `premium`, `luxury`) tetap dipetakan secara aman
 * ke konfigurasi `free` agar akun lama di database tetap berjalan tanpa kendala.
 */

export type PackageId = 'free' | 'enterprise' | 'demo' | 'reguler' | 'premium' | 'luxury';

export type WatermarkType = 'large' | 'small' | 'none';
export type MusicLevel = 'default' | 'itunes' | 'upload' | 'full';

export const ENTERPRISE_CONTACT_EMAIL = 'admin@ruanghadir.net';

export interface PackageLimitConfig {
  // Project & Time
  maxProjects: number;
  activeDays: number;

  // Content
  maxGallery: number;
  maxLoveStories: number;
  maxGifts: number;
  maxUploads: number;

  // Guests
  maxGuests: number;
  maxCustomNames: number;

  // Design
  themes: string[] | 'all';
  canCustomBg: boolean;
  musicLevel: MusicLevel;

  // Branding
  watermark: WatermarkType;
  canPublish: boolean;
  slugChanges: number;

  // Features
  canQR: boolean;
  canExportCSV: boolean;
  canExportPDF: boolean;

  // Analytics
  canViewDailyTraffic: boolean;
  canViewVisitorLogs: boolean;

  // Enterprise flags
  canCustomDomain: boolean;
  canMultiSeat: boolean;
  dedicatedSupport: boolean;
}

const FREE_LIMITS: PackageLimitConfig = {
  maxProjects: 3,
  activeDays: 365,
  maxGallery: 50,
  maxLoveStories: 10,
  maxGifts: 5,
  maxUploads: 50,
  maxGuests: Infinity,
  maxCustomNames: Infinity,
  themes: 'all',
  canCustomBg: true,
  musicLevel: 'full',
  watermark: 'none',
  canPublish: true,
  slugChanges: 5,
  canQR: true,
  canExportCSV: true,
  canExportPDF: true,
  canViewDailyTraffic: true,
  canViewVisitorLogs: true,
  canCustomDomain: false,
  canMultiSeat: false,
  dedicatedSupport: false,
};

const ENTERPRISE_LIMITS: PackageLimitConfig = {
  maxProjects: Infinity,
  activeDays: 3650,
  maxGallery: Infinity,
  maxLoveStories: Infinity,
  maxGifts: Infinity,
  maxUploads: Infinity,
  maxGuests: Infinity,
  maxCustomNames: Infinity,
  themes: 'all',
  canCustomBg: true,
  musicLevel: 'full',
  watermark: 'none',
  canPublish: true,
  slugChanges: Infinity,
  canQR: true,
  canExportCSV: true,
  canExportPDF: true,
  canViewDailyTraffic: true,
  canViewVisitorLogs: true,
  canCustomDomain: true,
  canMultiSeat: true,
  dedicatedSupport: true,
};

export const PACKAGE_LIMITS: Record<PackageId, PackageLimitConfig> = {
  free: FREE_LIMITS,
  enterprise: ENTERPRISE_LIMITS,
  // Legacy aliases → semua akun non-enterprise otomatis menikmati akses Full Gratis
  demo: FREE_LIMITS,
  reguler: FREE_LIMITS,
  premium: FREE_LIMITS,
  luxury: FREE_LIMITS,
} as const;

/** Harga per tier (IDR) — Full Gratis = Rp 0, Enterprise = Custom */
export const PACKAGE_PRICES: Record<PackageId, { mandiri: number; rfx: number }> = {
  free:       { mandiri: 0, rfx: 0 },
  enterprise: { mandiri: 0, rfx: 0 },
  demo:       { mandiri: 0, rfx: 0 },
  reguler:    { mandiri: 0, rfx: 0 },
  premium:    { mandiri: 0, rfx: 0 },
  luxury:     { mandiri: 0, rfx: 0 },
};

/** Label nama tier untuk UI */
export const PACKAGE_NAMES: Record<PackageId, string> = {
  free: 'Gratis',
  enterprise: 'Enterprise',
  demo: 'Gratis',
  reguler: 'Gratis',
  premium: 'Gratis',
  luxury: 'Gratis',
};

// ── Helper Functions ──────────────────────────────────────

/** Normalisasi ID paket lama ke model 2-tier (free | enterprise) */
export function normalizePackageId(packageId?: string | null): 'free' | 'enterprise' {
  if (packageId === 'enterprise') return 'enterprise';
  return 'free';
}

export function isEnterpriseTier(packageId?: string | null): boolean {
  return normalizePackageId(packageId) === 'enterprise';
}

/** Get limits for a specific package */
export function getLimits(packageId: string): PackageLimitConfig {
  return isEnterpriseTier(packageId) ? ENTERPRISE_LIMITS : FREE_LIMITS;
}

/** Check if a numeric limit has been reached */
export function isLimitReached(
  packageId: string,
  limitKey: 'maxGallery' | 'maxLoveStories' | 'maxGifts' | 'maxGuests' | 'maxUploads' | 'maxCustomNames' | 'maxProjects',
  currentCount: number
): boolean {
  const limits = getLimits(packageId);
  const max = limits[limitKey];
  return currentCount >= max;
}

/** Check if a boolean feature is enabled */
export function canAccess(
  packageId: string,
  feature:
    | 'canPublish'
    | 'canQR'
    | 'canExportCSV'
    | 'canExportPDF'
    | 'canCustomBg'
    | 'canViewDailyTraffic'
    | 'canViewVisitorLogs'
    | 'canCustomDomain'
    | 'canMultiSeat'
    | 'dedicatedSupport'
): boolean {
  const limits = getLimits(packageId);
  return limits[feature];
}

/** Check if a theme is available for the user's package */
export function isThemeAvailable(packageId: string, themeId: string): boolean {
  const limits = getLimits(packageId);
  if (limits.themes === 'all') return true;
  return limits.themes.includes(themeId);
}

/** Get all available theme IDs for a package */
export function getAvailableThemeIds(packageId: string): string[] | 'all' {
  return getLimits(packageId).themes;
}

/** Get the remaining count before hitting a limit */
export function getRemaining(
  packageId: string,
  limitKey: 'maxGallery' | 'maxLoveStories' | 'maxGifts' | 'maxGuests' | 'maxUploads' | 'maxCustomNames' | 'maxProjects',
  currentCount: number
): number {
  const max = getLimits(packageId)[limitKey];
  if (max === Infinity) return Infinity;
  return Math.max(0, max - currentCount);
}

/** Format limit for display (handles Infinity) */
export function formatLimit(value: number): string {
  if (value === Infinity) return '∞';
  return value.toLocaleString('id-ID');
}

/** Get the next upgrade tier (Gratis → Enterprise, Enterprise → null) */
export function getUpgradeTier(currentPackageId: string): PackageId | null {
  return isEnterpriseTier(currentPackageId) ? null : 'enterprise';
}

/** Get watermark type for a package */
export function getWatermarkType(packageId: string): WatermarkType {
  return getLimits(packageId).watermark;
}

/** Format masa aktif for display */
export function formatActiveDays(days: number): string {
  if (days >= 3650) return 'Tanpa batas (Enterprise)';
  if (days >= 365) return 'Aktif penuh (Gratis)';
  if (days < 30) return `${days} hari`;
  const months = Math.round(days / 30);
  return `${months} bulan`;
}

/**
 * Tema Spesial (adegan 2D/2.5D paralaks) — saat ini GRATIS untuk semua paket.
 * Untuk menjadikannya fitur Enterprise nanti, ubah menjadi ['enterprise'].
 */
export const SPECIAL_THEME_PACKAGES: PackageId[] | 'all' = 'all';

export function canUseSpecialTheme(packageId: PackageId | string | undefined): boolean {
  return SPECIAL_THEME_PACKAGES === 'all' || SPECIAL_THEME_PACKAGES.includes((packageId || 'free') as PackageId);
}
