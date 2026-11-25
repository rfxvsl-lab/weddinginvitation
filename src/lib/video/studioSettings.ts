import type { VideoStudioSettings } from '@/types';
import { VIDEO_THEMES, type VideoAspectId, type VideoThemeId } from '@/lib/invitationVideoEngine';

export type VideoQuality = 'hd' | 'fast';
export type MusicSource = 'invitation' | 'custom' | 'none';

export interface ResolvedVideoSettings {
  themeId: VideoThemeId;
  aspect: VideoAspectId;
  quality: VideoQuality;
  guestId: string | null;
  music: { source: MusicSource; customUrl: string; customTitle: string; offsetSec: number; volume: number };
}

export const DEFAULT_VIDEO_SETTINGS: ResolvedVideoSettings = {
  themeId: 'storybook-journey',
  aspect: '9:16',
  quality: 'hd',
  guestId: null,
  music: { source: 'invitation', customUrl: '', customTitle: '', offsetSec: 0, volume: 0.85 },
};

const ASPECTS: VideoAspectId[] = ['9:16', '1:1', '16:9'];
const clamp = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};

/** Normalisasi pengaturan tersimpan (bisa kosong/rusak) menjadi nilai lengkap yang valid. */
export function resolveVideoSettings(raw?: VideoStudioSettings | null): ResolvedVideoSettings {
  const d = DEFAULT_VIDEO_SETTINGS;
  const m = raw?.music;
  const source: MusicSource = m?.source === 'custom' || m?.source === 'none' ? m.source : 'invitation';
  return {
    themeId: VIDEO_THEMES.some((t) => t.id === raw?.themeId) ? (raw!.themeId as VideoThemeId) : d.themeId,
    aspect: ASPECTS.includes(raw?.aspect as VideoAspectId) ? (raw!.aspect as VideoAspectId) : d.aspect,
    quality: raw?.quality === 'fast' ? 'fast' : 'hd',
    guestId: typeof raw?.guestId === 'string' && raw.guestId ? raw.guestId : null,
    music: {
      source,
      customUrl: typeof m?.customUrl === 'string' ? m.customUrl : '',
      customTitle: typeof m?.customTitle === 'string' ? m.customTitle : '',
      offsetSec: clamp(m?.offsetSec, 0, 600, 0),
      volume: clamp(m?.volume, 0, 1, d.music.volume),
    },
  };
}

/** Ukuran CSS host komposisi (sama rasio dengan keluaran) dan ukuran piksel keluaran. */
export function outputSize(aspect: VideoAspectId, quality: VideoQuality) {
  const long = quality === 'hd' ? 1920 : 1280;
  const short = quality === 'hd' ? 1080 : 720;
  if (aspect === '9:16') return { width: short, height: long, cssWidth: 360, cssHeight: 640 };
  if (aspect === '1:1') return { width: short, height: short, cssWidth: 540, cssHeight: 540 };
  return { width: long, height: short, cssWidth: 640, cssHeight: 360 };
}

const slugPart = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

export function videoFileName(p: { groom: string; bride: string; themeId: string; aspect: string; guestName?: string | null; ext: string }) {
  const parts = ['undangan', slugPart(p.groom), slugPart(p.bride), slugPart(p.themeId), p.aspect.replace(':', 'x')];
  if (p.guestName) parts.push(`untuk-${slugPart(p.guestName)}`);
  return `${parts.filter(Boolean).join('-')}.${p.ext}`;
}

export function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function formatDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? `${m} mnt ${s % 60} dtk` : `${s} dtk`;
}
