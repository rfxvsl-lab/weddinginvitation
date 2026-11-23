import { defineTheme } from '../types';
import StorybookChapter, { STORYBOOK_INK } from './storybook.chapters';

/**
 * Heirloom Storybook (id `storybook-interactive`, dimigrasi ke Theme Kit sebagai tema Spesial).
 * Buku cerita bersampul kulit: tiap bab adalah halaman berilustrasi cat air yang dibalik masuk.
 */
export default defineTheme({
  id: 'storybook-interactive',
  name: 'Heirloom Storybook',
  tier: 'special',
  category: 'storybook',
  description: 'Buku cerita bersampul kulit: halaman berilustrasi cat air yang dibalik satu per satu.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#F6EEDC',
    surface: '#FBF5E8',
    primary: '#8E6A2E',
    secondary: '#C6A15B',
    text: '#3B2A1E',
    muted: '#6E5A48',
    onPrimary: '#FBF5E8',
    cover: '#241915',
    onCover: '#F6EBD3',
  },
  fonts: {
    display: "'Cinzel', Georgia, serif",
    body: "'EB Garamond', Georgia, serif",
    script: "'Italianno', cursive",
    label: "'Cinzel', Georgia, serif",
    google: 'Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Italianno',
  },
  floraArt: 'gold',
  divider: 'diamond',
  frame: 'arch',
  radius: 12,
  cover: 'card',
  hero: 'scene',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'grid',
  ambient: 'none',
  reveal: 'fade',
  copy: {
    coverTitle: 'Once upon a time',
    openButton: 'Buka Buku',
    heroTitle: 'Bab Pertama: Kami Menikah',
    coupleTitle: 'Para Tokoh',
    eventsTitle: 'Hari yang Dinanti',
    galleryTitle: 'Ilustrasi',
    storyTitle: 'Kisah Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Buku Tamu',
    closingTitle: 'Dan Mereka Hidup Bahagia',
  },
  scene: {
    Chapter: StorybookChapter,
    ink: STORYBOOK_INK,
    heroAlign: 'bottom',
    contentTop: '50vh',
    intro: 'rise',
    introMs: 2400,
    heroText: '#F6EBD3',
    closingText: '#F6EBD3',
    panel: { background: 'rgba(251, 245, 232, 0.96)', blur: 0, border: '1px solid rgba(198,161,91,.6)' },
  },
});
