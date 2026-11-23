import { defineTheme } from '../types';
import CinematicChapter, { CINEMATIC_INK } from './dark-luxury-cinematic.chapters';

/**
 * Dark Luxury Cinematic (id lama `rfx-dark` dipertahankan agar undangan yang sudah
 * memakai tema ini otomatis mendapat versi baru).
 *
 * Undangan sebagai film: kartu judul → hitung mundur pita film 3-2-1 → layar hitam
 * terbelah. Tiap bagian adalah "shot" layar penuh dari foto mempelai dengan Ken Burns,
 * cahaya proyektor, bokeh emas, kebocoran cahaya, pita film bergulir, dan butiran film.
 */
export default defineTheme({
  id: 'rfx-dark',
  name: 'Dark Luxury Cinematic',
  tier: 'special',
  category: 'modern',
  description: 'Undangan sebagai film: hitung mundur pita film, foto layar penuh, cahaya emas, dan butiran sinema.',
  addedAt: '2025-12-01',
  palette: {
    bg: '#14110F',
    surface: '#1B1714',
    primary: '#C9A96E',
    secondary: '#8C7A57',
    text: '#F4EDE0',
    muted: '#B9AE9C',
    onPrimary: '#14110D',
    cover: '#060507',
    onCover: '#F4EDE0',
  },
  fonts: {
    display: "'Marcellus', Georgia, serif",
    body: "'Albert Sans', system-ui, sans-serif",
    script: "'Italiana', Georgia, serif",
    label: "'Marcellus', Georgia, serif",
    google: 'Italiana&family=Marcellus&family=Albert+Sans:wght@400;500;600;700',
  },
  divider: 'none',
  dividerSvg:
    '<svg viewBox="0 0 200 24" fill="none"><path d="M14 12H86M114 12H186" stroke="currentColor" stroke-width=".8"/><rect x="94" y="6" width="12" height="12" transform="rotate(45 100 12)" stroke="currentColor" stroke-width=".8"/><circle cx="100" cy="12" r="1.6" fill="currentColor"/></svg>',
  variants: [
    { id: 'gold', name: 'Emas Sampanye', palette: {} },
    { id: 'rose-gold', name: 'Rose Gold', palette: { primary: '#D7A08F', secondary: '#8F6A61', muted: '#BFA8A1' } },
    { id: 'platinum', name: 'Platinum', palette: { primary: '#C9CED6', secondary: '#7D848E', muted: '#AEB3BA', onPrimary: '#121417' } },
    { id: 'emerald', name: 'Zamrud', palette: { primary: '#7FBF9E', secondary: '#4F7A64', muted: '#A9BFB2', onPrimary: '#0D1712' } },
  ],
  frame: 'rect',
  radius: 4,
  cover: 'film',
  hero: 'scene',
  couple: 'cards',
  countdown: 'boxes',
  events: 'ticket',
  gallery: 'film',
  ambient: 'none',
  reveal: 'blur',
  copy: {
    coverTitle: 'A Love Story',
    coverLabel: 'Tayangan khusus untuk',
    openButton: 'Putar Undangan',
    heroTitle: 'Sebuah kisah cinta',
    coupleTitle: 'Pemeran Utama',
    countdownTitle: 'Tayang perdana dalam',
    eventsTitle: 'Jadwal Penayangan',
    storyTitle: 'Babak demi Babak',
    galleryTitle: 'Cuplikan',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Daftar Tamu Premiere',
    closingTitle: 'Sampai jumpa di hari bahagia',
  },
  scene: {
    Chapter: CinematicChapter,
    ink: CINEMATIC_INK,
    heroAlign: 'bottom',
    intro: 'dolly',
    introMs: 2600,
    heroText: '#F4EDE0',
    closingText: '#F4EDE0',
    panel: { background: 'rgba(20, 17, 15, 0.62)', blur: 16, border: '1px solid rgba(201, 169, 110, 0.28)' },
  },
});
