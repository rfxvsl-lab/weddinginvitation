import { defineTheme } from '../types';
import ArabianStage from './royal-arabian.stage';

/**
 * Royal Arabian Night (id `royal-arabian`, dimigrasi ke Theme Kit).
 * Gerbang mihrab berlapis emas berpola bintang, lentera berayun, langit malam cat air.
 */
export default defineTheme({
  id: 'royal-arabian',
  name: 'Royal Arabian Night',
  category: 'classic',
  description: 'Gerbang mihrab emas berpola bintang, lentera berayun, dan langit malam.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#102D29',
    surface: '#163A35',
    primary: '#D7B86D',
    secondary: '#8E7A47',
    text: '#F5F1E5',
    muted: '#C9C2AE',
    onPrimary: '#102D29',
    cover: '#0B201D',
    onCover: '#F5F1E5',
  },
  fonts: {
    display: "'Amiri', Georgia, serif",
    body: "'Philosopher', system-ui, sans-serif",
    script: "'Aref Ruqaa', 'Amiri', serif",
    label: "'Philosopher', system-ui, sans-serif",
    google: 'Amiri:ital,wght@0,400;0,700;1,400&family=Philosopher:wght@400;700&family=Aref+Ruqaa:wght@400;700',
  },
  pattern:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><g fill='none' stroke='%23D7B86D' stroke-width='.7' opacity='.5'><path d='M24 4 L29 19 L44 24 L29 29 L24 44 L19 29 L4 24 L19 19 Z'/><rect x='13' y='13' width='22' height='22' transform='rotate(45 24 24)'/></g></svg>\")",
  patternOpacity: 0.18,
  floraArt: 'gold',
  Stage: ArabianStage,
  variants: [
    { id: 'zamrud', name: 'Zamrud', palette: {} },
    { id: 'malam', name: 'Biru Malam', palette: { bg: '#0F1E3A', surface: '#16284A', onPrimary: '#0F1E3A', cover: '#0A1428' } },
    { id: 'marun', name: 'Marun', palette: { bg: '#2A0F16', surface: '#3A161F', onPrimary: '#2A0F16', cover: '#1C0A0F' } },
  ],
  divider: 'diamond',
  frame: 'arch',
  radius: 14,
  cover: 'gate',
  hero: 'frame',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'grid',
  ambient: 'sparkles',
  reveal: 'blur',
  copy: {
    coverTitle: 'Walimatul Ursy',
    openButton: 'Buka Undangan',
    heroTitle: 'Bismillahirrahmanirrahim',
    coupleTitle: 'Mempelai',
    coupleIntro: 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.',
    eventsTitle: 'Waktu & Tempat',
    galleryTitle: 'Galeri',
    storyTitle: 'Kisah Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Konfirmasi Kehadiran',
    wishesTitle: 'Doa & Ucapan',
    closingTitle: 'Jazakumullah Khairan',
  },
});
