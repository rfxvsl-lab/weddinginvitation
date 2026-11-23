import { defineTheme } from '../types';
import ParallaxChapter, { PARALLAX_INK } from './parallax-cinematic.chapters';

/**
 * Cinematic 2D Parallax (id `parallax-cinematic`, dimigrasi ke Theme Kit sebagai tema Spesial).
 * Perjalanan lukisan cat air: padang bunga pagi → pondok → desa → malam berbintang.
 */
export default defineTheme({
  id: 'parallax-cinematic',
  name: 'Cinematic 2D Parallax',
  tier: 'special',
  category: 'floral',
  description: 'Perjalanan lukisan cat air berlapis: padang bunga, pondok, desa, hingga malam berbintang.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#EEF6F4',
    surface: '#FFFFFF',
    primary: '#2F7F7A',
    secondary: '#9FD6D2',
    text: '#173238',
    muted: '#557075',
    onPrimary: '#FFFFFF',
    cover: '#10272D',
    onCover: '#173238',
  },
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    script: "'Great Vibes', cursive",
    label: "'Nunito Sans', system-ui, sans-serif",
    google: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito+Sans:wght@400;600;700&family=Great+Vibes',
  },
  floraArt: 'blush',
  divider: 'floral',
  frame: 'arch',
  radius: 22,
  cover: 'scene',
  hero: 'scene',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'masonry',
  ambient: 'none',
  reveal: 'rise',
  copy: {
    coverTitle: 'Undangan Pernikahan',
    openButton: 'Mulai Perjalanan',
    heroTitle: 'The Wedding of',
    coupleTitle: 'Mempelai',
    eventsTitle: 'Waktu & Tempat',
    galleryTitle: 'Galeri',
    storyTitle: 'Perjalanan Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Konfirmasi Kehadiran',
    closingTitle: 'Sampai Jumpa',
  },
  scene: {
    Chapter: ParallaxChapter,
    ink: PARALLAX_INK,
    intro: 'descend',
    introMs: 3200,
    heroText: '#173238',
    closingText: '#F2F7F4',
    panel: { background: 'rgba(255, 255, 255, 0.86)', blur: 10, border: '1px solid rgba(255,255,255,.9)' },
  },
});
