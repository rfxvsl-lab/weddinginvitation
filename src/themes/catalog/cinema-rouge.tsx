import { defineTheme } from '../types';
import CinematicChapter, { CINEMATIC_INK } from './dark-luxury-cinematic.chapters';

/**
 * Cinema Rouge (id lama `netflix-luxury` dipertahankan, dimigrasi ke Theme Kit).
 * Malam premiere bioskop merah-hitam yang orisinal (tanpa nama/logo layanan streaming):
 * hitung mundur pita film, foto layar penuh, tipografi poster film.
 */
export default defineTheme({
  id: 'netflix-luxury',
  name: 'Cinema Rouge',
  tier: 'special',
  category: 'modern',
  description: 'Malam premiere bioskop merah-hitam: pita film, foto layar penuh, tipografi poster.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#120D0E',
    surface: '#1C1416',
    primary: '#D6303F',
    secondary: '#7A2A31',
    text: '#F6EFEF',
    muted: '#C4B3B5',
    onPrimary: '#FFFFFF',
    cover: '#0A0607',
    onCover: '#F6EFEF',
  },
  fonts: {
    display: "'Bebas Neue', Impact, sans-serif",
    body: "'Montserrat', system-ui, sans-serif",
    script: "'Bebas Neue', Impact, sans-serif",
    label: "'Montserrat', system-ui, sans-serif",
    google: 'Bebas+Neue&family=Montserrat:wght@400;500;600;700',
  },
  floraArt: 'burgundy',
  divider: 'line',
  frame: 'rect',
  radius: 6,
  cover: 'film',
  hero: 'scene',
  couple: 'cards',
  countdown: 'boxes',
  events: 'ticket',
  gallery: 'film',
  ambient: 'none',
  reveal: 'zoom',
  copy: {
    coverTitle: 'World Premiere',
    coverLabel: 'Undangan pemutaran perdana untuk',
    openButton: 'Putar Trailer',
    heroTitle: 'Coming Soon',
    coupleTitle: 'Starring',
    countdownTitle: 'Premiere dalam',
    eventsTitle: 'Jadwal Tayang',
    storyTitle: 'Episode Kami',
    galleryTitle: 'Behind The Scenes',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Pesan Kursi',
    closingTitle: 'See You At The Premiere',
  },
  scene: {
    Chapter: CinematicChapter,
    ink: CINEMATIC_INK,
    heroAlign: 'bottom',
    intro: 'dolly',
    introMs: 2600,
    heroText: '#F6EFEF',
    closingText: '#F6EFEF',
    panel: { background: 'rgba(28, 20, 22, 0.66)', blur: 16, border: '1px solid rgba(214, 48, 63, 0.32)' },
  },
});
