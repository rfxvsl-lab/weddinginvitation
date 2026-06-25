/**
 * PACKAGE_LIMITS — Single Source of Truth untuk batasan per tier
 * Semua komponen harus import dari sini, JANGAN hardcode limit.
 */

export type PackageId = 'demo' | 'reguler' | 'premium' | 'luxury';

export type WatermarkType = 'large' | 'small' | 'none';
export type MusicLevel = 'default' | 'itunes' | 'upload' | 'full';

export interface PackageLimitConfig {
  // Project & Time
  maxProjects: number;
  activeDays: number; // masa aktif dalam hari

  // Content
  maxGallery: number;
  maxLoveStories: number;
  maxGifts: number;
  maxUploads: number; // total upload foto ke Cloudinary

  // Guests
  maxGuests: number;
  maxCustomNames: number; // nama tamu kustom di link

  // Design
  themes: string[] | 'all'; // theme IDs yang diizinkan, atau 'all'
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
}

export const PACKAGE_LIMITS: Record<PackageId, PackageLimitConfig> = {
  demo: {
    maxProjects: 1,
    activeDays: 3, // 2 hari 3 malam ≈ 3 hari
    maxGallery: 3,
    maxLoveStories: 0,
    maxGifts: 0,
    maxUploads: 0,
    maxGuests: 20,
    maxCustomNames: 0,
    themes: ['grand-ballroom', 'cremy-rose'],
    canCustomBg: false,
    musicLevel: 'default',
    watermark: 'large',
    canPublish: false,
    slugChanges: 0,
    canQR: false,
    canExportCSV: false,
    canExportPDF: false,
    canViewDailyTraffic: false,
    canViewVisitorLogs: false,
  },

  reguler: {
    maxProjects: 1,
    activeDays: 20,
    maxGallery: 6,
    maxLoveStories: 2,
    maxGifts: 1,
    maxUploads: 5,
    maxGuests: 100,
    maxCustomNames: 100,
    themes: ['grand-ballroom', 'cremy-rose', 'rfx-dark'],
    canCustomBg: false,
    musicLevel: 'itunes',
    watermark: 'small',
    canPublish: true,
    slugChanges: 0,
    canQR: false,
    canExportCSV: true,
    canExportPDF: false,
    canViewDailyTraffic: true,
    canViewVisitorLogs: false,
  },

  premium: {
    maxProjects: 2,
    activeDays: 60,
    maxGallery: 20,
    maxLoveStories: 5,
    maxGifts: 3,
    maxUploads: 20,
    maxGuests: 500,
    maxCustomNames: 500,
    themes: 'all',
    canCustomBg: true,
    musicLevel: 'upload',
    watermark: 'none',
    canPublish: true,
    slugChanges: 1,
    canQR: true,
    canExportCSV: true,
    canExportPDF: true,
    canViewDailyTraffic: true,
    canViewVisitorLogs: true,
  },

  luxury: {
    maxProjects: 3,
    activeDays: 90,
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
  },
} as const;

/** Harga per tier (IDR) */
export const PACKAGE_PRICES: Record<PackageId, { mandiri: number; rfx: number }> = {
  demo:    { mandiri: 0,      rfx: 0 },
  reguler: { mandiri: 35000,  rfx: 60000 },
  premium: { mandiri: 90000,  rfx: 125000 },
  luxury:  { mandiri: 150000, rfx: 180000 },
};

/** Label nama tier untuk UI */
export const PACKAGE_NAMES: Record<PackageId, string> = {
  demo: 'Demo',
  reguler: 'Reguler',
  premium: 'Premium',
  luxury: 'Luxury',
};

// ── Helper Functions ──────────────────────────────────────

/** Get limits for a specific package */
export function getLimits(packageId: string): PackageLimitConfig {
  const id = packageId as PackageId;
  return PACKAGE_LIMITS[id] || PACKAGE_LIMITS.demo;
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
  feature: 'canPublish' | 'canQR' | 'canExportCSV' | 'canExportPDF' | 'canCustomBg' | 'canViewDailyTraffic' | 'canViewVisitorLogs'
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

/** Get the next upgrade tier (or null if already max) */
export function getUpgradeTier(currentPackageId: string): PackageId | null {
  const order: PackageId[] = ['demo', 'reguler', 'premium', 'luxury'];
  const idx = order.indexOf(currentPackageId as PackageId);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

/** Get watermark type for a package */
export function getWatermarkType(packageId: string): WatermarkType {
  return getLimits(packageId).watermark;
}

/** Format masa aktif for display */
export function formatActiveDays(days: number): string {
  if (days <= 3) return '2 hari 3 malam';
  if (days < 30) return `${days} hari`;
  const months = Math.round(days / 30);
  return `${months} bulan`;
}
