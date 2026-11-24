import { defineTheme } from '../types';

/**
 * Luxury Pink Elegant (id `cremy-rose`, dimigrasi ke Theme Kit).
 * Amplop bersegel, mawar blush lukisan, pondok bunga cat air di panggung pembuka.
 */
export default defineTheme({
  id: 'cremy-rose',
  name: 'Luxury Pink Elegant',
  category: 'floral',
  description: 'Amplop bersegel, mawar blush, dan pondok bunga cat air yang hangat.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#FCF3F6',
    surface: '#FFFFFF',
    primary: '#A83D68',
    secondary: '#D99AB3',
    text: '#54243B',
    muted: '#8A5A70',
    onPrimary: '#FFFFFF',
    cover: '#F7E3EA',
    onCover: '#54243B',
  },
  fonts: {
    display: "'Gelasio', Georgia, serif",
    body: "'Lato', system-ui, sans-serif",
    script: "'Great Vibes', cursive",
    label: "'Lato', system-ui, sans-serif",
    google: 'Gelasio:ital,wght@0,400;0,500;0,600;1,400&family=Lato:wght@400;700&family=Great+Vibes',
  },
  floraArt: 'blush',
  stageArt: 'house',
  variants: [
    { id: 'rose', name: 'Rose', palette: {} },
    { id: 'peach', name: 'Peach', palette: { primary: '#B85A45', secondary: '#E7B29F', text: '#4E2A20', muted: '#8A6255', bg: '#FDF5F0', cover: '#F8E6DC', onCover: '#4E2A20' }, floraArt: 'peach' },
    { id: 'lilac', name: 'Lilac', palette: { primary: '#7E5A9B', secondary: '#C6AED8', text: '#3D2A4C', muted: '#7A6889', bg: '#F8F4FB', cover: '#EDE3F4', onCover: '#3D2A4C' }, floraArt: 'lavender' },
    { id: 'marun', name: 'Marun', palette: { primary: '#7E1F35', secondary: '#C98C99', text: '#3E1420', muted: '#7C5560', bg: '#FBF3F4', cover: '#F1DDE1', onCover: '#3E1420' }, floraArt: 'burgundy' },
  ],
  ornament: 'flora',
  divider: 'floral',
  frame: 'arch',
  radius: 20,
  cover: 'envelope',
  hero: 'frame',
  couple: 'cards',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'masonry',
  ambient: 'petals',
  reveal: 'rise',
  copy: {
    coverTitle: 'The Wedding of',
    openButton: 'Buka Undangan',
    heroTitle: 'We Are Getting Married',
    coupleTitle: 'Mempelai',
    eventsTitle: 'Rangkaian Acara',
    galleryTitle: 'Our Moment',
    storyTitle: 'Love Story',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'RSVP',
    wishesTitle: 'Wishes',
    closingTitle: 'Thank You',
  },
});
