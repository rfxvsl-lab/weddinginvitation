import { defineTheme } from '../types';
import JawaStage from './javanese-classic.stage';

/**
 * Javanese Classic (id `javanese-classic`, dimigrasi ke Theme Kit).
 * Kelir wayang diterangi blencong, bayangan gunungan, batik kawung sogan, bunga putih-emas.
 */
export default defineTheme({
  id: 'javanese-classic',
  name: 'Javanese Classic',
  category: 'classic',
  description: 'Kelir wayang dengan bayangan gunungan, batik kawung sogan, dan bunga putih-emas.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#F8F0DF',
    surface: '#FFF9EE',
    primary: '#8A452C',
    secondary: '#C59C62',
    text: '#493021',
    muted: '#7C6450',
    onPrimary: '#FFF9EE',
    cover: '#2B1A12',
    onCover: '#F8F0DF',
  },
  fonts: {
    display: "'Gelasio', Georgia, serif",
    body: "'Lato', system-ui, sans-serif",
    script: "'Great Vibes', cursive",
    label: "'Philosopher', system-ui, sans-serif",
    google: 'Gelasio:ital,wght@0,400;0,500;1,400&family=Lato:wght@400;700&family=Great+Vibes&family=Philosopher:wght@400;700',
  },
  floraArt: 'gold',
  Stage: JawaStage,
  variants: [
    { id: 'sogan', name: 'Sogan', palette: {} },
    { id: 'pupus', name: 'Hijau Pupus', palette: { primary: '#4E6B3A', secondary: '#B9A46A', text: '#2F3A24', muted: '#66705A', bg: '#F4F1E2' } },
    { id: 'indigo', name: 'Biru Indigo', palette: { primary: '#2F4A6B', secondary: '#B9A06A', text: '#22303F', muted: '#5C6A79', bg: '#F3F0E6' } },
  ],
  divider: 'floral',
  frame: 'arch',
  radius: 16,
  cover: 'gate',
  hero: 'type',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'masonry',
  ambient: 'petals',
  reveal: 'rise',
  copy: {
    coverTitle: 'Pahargyan Pawiwahan',
    openButton: 'Mlebet Undangan',
    heroTitle: 'Pawiwahan',
    coupleTitle: 'Sang Penganten',
    coupleIntro: 'Kanthi nyuwun berkah lan pangestunipun Gusti Ingkang Maha Kuwaos, kula aturi rawuh ing pawiwahanipun putra-putri kula.',
    eventsTitle: 'Pahargyan',
    galleryTitle: 'Galeri',
    storyTitle: 'Lelampahan',
    giftTitle: 'Tanda Katresnan',
    rsvpTitle: 'Konfirmasi Rawuh',
    wishesTitle: 'Pangandikan & Donga',
    closingTitle: 'Matur Nuwun',
  },
});
