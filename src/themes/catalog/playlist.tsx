import { defineTheme } from '../types';
import PlaylistStage from './playlist.stage';

/**
 * Lagu Kita (id lama `spotilove` dipertahankan, dimigrasi ke Theme Kit).
 * Tema musik orisinal tanpa merek: piringan hitam berlabel foto mempelai, equalizer,
 * kanopi daun lukisan, dan buket mawar.
 */
export default defineTheme({
  id: 'spotilove',
  name: 'Lagu Kita',
  category: 'modern',
  description: 'Undangan bertema lagu: piringan hitam berlabel foto, equalizer, dan kanopi daun.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#111A15',
    surface: '#1A261F',
    primary: '#3FCF8E',
    secondary: '#2E5A43',
    text: '#F4F8F5',
    muted: '#B4C6BA',
    onPrimary: '#0B140F',
    cover: '#0B120E',
    onCover: '#F4F8F5',
  },
  fonts: {
    display: "'Montserrat', system-ui, sans-serif",
    body: "'Nunito Sans', system-ui, sans-serif",
    script: "'Great Vibes', cursive",
    label: "'Montserrat', system-ui, sans-serif",
    google: 'Montserrat:wght@500;600;700;800&family=Nunito+Sans:wght@400;600;700&family=Great+Vibes',
  },
  floraArt: 'rose',
  Stage: PlaylistStage,
  variants: [
    { id: 'mint', name: 'Mint', palette: {} },
    { id: 'sunset', name: 'Sunset', palette: { primary: '#FF8A5B', bg: '#1A1210', surface: '#261A16', secondary: '#5A3A2E', onPrimary: '#1A1210', cover: '#120C0A' }, floraArt: 'peach' },
    { id: 'lilac', name: 'Lilac', palette: { primary: '#B79CFF', bg: '#141221', surface: '#1E1A30', secondary: '#41385E', onPrimary: '#141221', cover: '#0E0C17' }, floraArt: 'lavender' },
  ],
  divider: 'wave',
  frame: 'circle',
  radius: 16,
  cover: 'card',
  hero: 'frame',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'grid',
  ambient: 'none',
  reveal: 'zoom',
  copy: {
    coverTitle: 'Sedang diputar: lagu kita',
    openButton: 'Putar Undangan',
    heroTitle: 'Now Playing',
    coupleTitle: 'Duet Kami',
    eventsTitle: 'Jadwal Konser Cinta',
    galleryTitle: 'Album Foto',
    storyTitle: 'Lirik Perjalanan',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Konfirmasi Kehadiran',
    wishesTitle: 'Pesan untuk Kami',
    closingTitle: 'Terima Kasih Sudah Mendengarkan',
  },
});
