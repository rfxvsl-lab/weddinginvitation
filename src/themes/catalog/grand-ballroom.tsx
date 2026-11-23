import { defineTheme } from '../types';
import BallroomStage from './grand-ballroom.stage';

/**
 * Grand Ballroom (id `grand-ballroom`, dimigrasi ke Theme Kit).
 * Tirai beludru berlipit, lampu kristal, jendela lengkung bercahaya, lantai marmer, mawar putih.
 */
export default defineTheme({
  id: 'grand-ballroom',
  name: 'Grand Ballroom',
  category: 'classic',
  description: 'Ballroom klasik: tirai beludru yang terbelah, lampu kristal, dan mawar putih.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#F3F6FA',
    surface: '#FFFFFF',
    primary: '#345579',
    secondary: '#B9A36B',
    text: '#23364D',
    muted: '#5E6F84',
    onPrimary: '#FFFFFF',
    cover: '#1A2A40',
    onCover: '#F3F6FA',
  },
  fonts: {
    display: "'Cinzel', Georgia, serif",
    body: "'Montserrat', system-ui, sans-serif",
    script: "'Great Vibes', cursive",
    label: "'Cinzel', Georgia, serif",
    google: 'Cinzel:wght@400;500;600&family=Montserrat:wght@400;500;600&family=Great+Vibes',
  },
  floraArt: 'ivory',
  Stage: BallroomStage,
  heroInk: '#F6E9C8',
  variants: [
    { id: 'navy', name: 'Navy', palette: {} },
    { id: 'burgundy', name: 'Burgundy', palette: { primary: '#6E2335', text: '#3A1620', muted: '#7B5A62', bg: '#FAF4F3', cover: '#2E0F18' } },
    { id: 'emerald', name: 'Emerald', palette: { primary: '#1F5145', text: '#163A31', muted: '#55716A', bg: '#F2F7F5', cover: '#0F2A24' } },
  ],
  divider: 'diamond',
  frame: 'oval',
  radius: 10,
  cover: 'curtain',
  hero: 'frame',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'grid',
  ambient: 'sparkles',
  reveal: 'fade',
  copy: {
    coverTitle: 'The Royal Wedding of',
    openButton: 'Masuki Ballroom',
    heroTitle: 'The Wedding Celebration of',
    coupleTitle: 'The Bride & Groom',
    eventsTitle: 'Order of Events',
    galleryTitle: 'Galeri',
    storyTitle: 'Kisah Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'RSVP',
    wishesTitle: 'Ucapan & Doa',
    closingTitle: 'Terima Kasih',
  },
});
