import { defineTheme } from '../types';
import type { SectionId } from '../types';
import StorybookCouple from './storybook.couple';
import { SKY, STATIONS, TINT, worldLayers } from './storybook.world';

/**
 * Heirloom Storybook (id `storybook-interactive`) — tema Spesial bermode KAMERA.
 *
 * Satu dunia buku cerita utuh (gouache + garis tinta) yang dilewati kamera dari pagi sampai
 * malam: rumah pondok → pohon tua & ayunan → kolam & jembatan → menara jam → masjid & tarub
 * berjanur → jembatan batu → jemuran bingkai foto → kantor pos → gazebo lampion → sumur harapan
 * → rumah di bukit dengan kembang api. Lapisan jauh bergerak pelan, dekat bergerak cepat.
 * Sepasang mempelai 2.5D berjalan bersama kamera, menoleh ke penonton di setiap stasiun.
 */
const ORDER: SectionId[] = ['hero', 'quote', 'couple', 'countdown', 'events', 'story', 'gallery', 'gift', 'rsvp', 'wishes', 'closing'];

export default defineTheme({
  id: 'storybook-interactive',
  name: 'Heirloom Storybook',
  tier: 'special',
  category: 'storybook',
  description: 'Dunia buku cerita yang dilewati kamera dari pagi sampai malam, ditemani sepasang mempelai yang berjalan.',
  addedAt: '2025-11-01',
  palette: {
    bg: '#F6EEDC',
    surface: '#FFFAF0',
    primary: '#8A5A2B',
    secondary: '#C6A15B',
    text: '#3B2A1E',
    muted: '#6E5A48',
    onPrimary: '#FFFAF0',
    cover: '#2A1C16',
    onCover: '#F6EBD3',
  },
  heroInk: '#3B2A1E',
  fonts: {
    display: "'Cinzel', Georgia, serif",
    body: "'EB Garamond', Georgia, serif",
    script: "'Italianno', cursive",
    label: "'Cinzel', Georgia, serif",
    google: 'Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Italianno',
  },
  ornament: 'none',
  divider: 'diamond',
  frame: 'arch',
  radius: 14,
  cover: 'card',
  hero: 'type',
  couple: 'split',
  countdown: 'boxes',
  events: 'timeline',
  gallery: 'grid',
  ambient: 'none',
  reveal: 'fade',
  sections: ORDER,
  copy: {
    coverTitle: 'Once upon a time',
    openButton: 'Buka Buku',
    heroTitle: 'Bab pertama: kami menikah',
    coupleTitle: 'Para Tokoh',
    eventsTitle: 'Hari yang Dinanti',
    galleryTitle: 'Ilustrasi',
    storyTitle: 'Kisah Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Buku Tamu',
    closingTitle: 'Dan Mereka Hidup Bahagia',
  },
  camera: {
    stations: Object.fromEntries(ORDER.map((id, i) => [id, STATIONS[i]])),
    layers: worldLayers,
    sky: SKY,
    tint: TINT,
    Actors: StorybookCouple,
    actorDepth: 0.72,
    panel: { background: 'rgba(255, 250, 240, 0.93)', border: '1px solid rgba(198,161,91,.55)', blur: 6 },
    gap: '80vh',
  },
});
