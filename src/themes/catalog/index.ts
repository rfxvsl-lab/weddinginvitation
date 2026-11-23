/**
 * Katalog Theme Kit.
 *
 * Menambah tema baru:
 *   1. Buat `src/themes/catalog/<id>.tsx` → `export default defineTheme({...})`
 *   2. Impor di bawah dan tambahkan ke `KIT_THEMES` (urutan = terbaru di atas)
 *   3. Jalankan `python3 scripts/theme_shots.py <id>` untuk screenshot katalog
 * Lihat docs/themes/PLAYBOOK.md.
 */

import type { ThemeSpec } from '../types';
import type { ThemeConfig } from '../../types';
import sageGarden from './sage-garden';
import lembayung from './lembayung';
import tamanKertas from './taman-kertas';
import darkLuxuryCinematic from './dark-luxury-cinematic';
import luxuryPink from './luxury-pink';
import grandBallroom from './grand-ballroom';
import royalArabian from './royal-arabian';
import javaneseClassic from './javanese-classic';
import playlist from './playlist';
import cinemaRouge from './cinema-rouge';
import parallaxCinematic from './parallax-cinematic';
import storybook from './storybook';

export const KIT_THEMES: ThemeSpec[] = [
  tamanKertas,
  lembayung,
  sageGarden,
  darkLuxuryCinematic,
  luxuryPink,
  grandBallroom,
  cinemaRouge,
  royalArabian,
  playlist,
  javaneseClassic,
  parallaxCinematic,
  storybook,
];

const byId = new Map(KIT_THEMES.map((t) => [t.id, t]));

export function getKitTheme(id: string): ThemeSpec | undefined {
  return byId.get(id);
}

/** Adaptor ke ThemeConfig lama agar tema Kit otomatis muncul di semua daftar tema. */
export function toThemeConfig(t: ThemeSpec): ThemeConfig {
  return {
    id: t.id,
    name: t.name,
    pattern: t.category,
    layout: 'kit',
    primary: t.palette.primary,
    primaryHex: t.palette.primary,
    secondaryHex: t.palette.secondary,
    bgHex: t.palette.bg,
    bgPatternHex: t.palette.surface,
    textHex: t.palette.text,
    accentHex: t.palette.primary,
    fontSerif: 'font-serif',
    fontSans: 'font-sans',
    addedAt: t.addedAt,
    description: t.description,
    tier: t.tier || 'regular',
  };
}

/** Tema dianggap "Baru" selama 14 hari sejak rilis. */
export function isNewTheme(addedAt?: string, now = Date.now()) {
  if (!addedAt) return false;
  const d = new Date(addedAt).getTime();
  return !isNaN(d) && now - d < 14 * 864e5;
}
