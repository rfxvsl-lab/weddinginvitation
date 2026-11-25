/**
 * RuangHadir — metadata film undangan (tema, durasi, fps).
 *
 * Komposisi film ada di src/components/motion/* dan diputar oleh EnterpriseMotionPlayer.
 * Ekspor video merender komposisi yang SAMA frame demi frame (src/lib/video/exportVideo.ts),
 * sehingga unduhan identik dengan pratinjau. Renderer canvas terpisah yang dulu ada di file ini
 * dihapus karena hasilnya berbeda dari pratinjau.

 */

export type VideoThemeId = 'javanese-classic' | 'grand-ballroom' | 'luxury-pink' | 'storybook-journey';
export type VideoAspectId = '9:16' | '1:1' | '16:9';

export interface VideoCoupleProps {
  groom: string;
  bride: string;
  groomFull: string;
  brideFull: string;
  dateRaw: string;
  timeRaw: string;
  venue: string;
  slug: string;
  initials: string;
}

export interface VideoThemeMeta {
  id: VideoThemeId;
  name: string;
  shortName: string;
  tagline: string;
  techniques: string[];
  swatch: [string, string, string];
  accent: string;
  isDark: boolean;
}

export const VIDEO_FPS = 30;
export const VIDEO_DURATION_SEC = 18;
export const VIDEO_TOTAL_FRAMES = VIDEO_FPS * VIDEO_DURATION_SEC; // 540 frames

export const VIDEO_THEMES: VideoThemeMeta[] = [
  {
    id: 'javanese-classic',
    name: 'Javanese Classic',
    shortName: 'Javanese Classic',
    tagline: 'Painterly Pendopo · Gunungan · Volumetric Sunbeams · #F8F0DF / #8A452C',
    techniques: ['2.5D Camera Push-In', 'Volumetric God Rays', 'Polaroid Keepsakes', 'Golden Fireflies'],
    swatch: ['#F8F0DF', '#C59C62', '#8A452C'],
    accent: '#8A452C',
    isDark: false,
  },
  {
    id: 'grand-ballroom',
    name: 'Grand Ballroom',
    shortName: 'Grand Ballroom',
    tagline: 'Neoclassical Palace · Parting Curtains · Chandelier Rays · #F3F6FA / #345579',
    techniques: ['2.5D Camera Push-In', 'Velvet Curtain Reveal', 'Diegetic Marble Note', 'Crystal Bokeh'],
    swatch: ['#F3F6FA', '#8FA8C2', '#345579'],
    accent: '#345579',
    isDark: false,
  },
  {
    id: 'luxury-pink',
    name: 'Luxury Love Pink',
    shortName: 'Luxury Pink',
    tagline: 'Parisian Rose Conservatory · 3D Wax Envelope · Sunset Halo · #FCF3F6 / #A83D68',
    techniques: ['2.5D Camera Push-In', '3D Wax-Seal Envelope', 'Sun-Flare Match Cut', 'Rose Petals 60fps'],
    swatch: ['#FCF3F6', '#D99AB3', '#A83D68'],
    accent: '#A83D68',
    isDark: false,
  },
  {
    id: 'storybook-journey',
    name: 'Perjalanan (Storybook)',
    shortName: 'Perjalanan',
    tagline: 'Dunia cat air berlapis · kamera crane, whip & portal · parallax 4 lapis',
    techniques: ['Crane & Tilt', 'Parallax Berlapis', 'Whip Pan', 'Portal Push'],
    swatch: ['#F6EEDC', '#C6A15B', '#8A5A2B'],
    accent: '#8A5A2B',
    isDark: false,
  },
];
