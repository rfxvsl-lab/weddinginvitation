import { defineTheme } from '../types';
import LembayungBackdrop from './lembayung.scene';

/**
 * Lembayung — tema Spesial 2.5D.
 * Lanskap berlapis (gunung api, punggung bukit, candi, pohon, nyiur) dengan
 * perspektif udara. Menggulir undangan = waktu berjalan dari senja keemasan,
 * lembayung, hingga malam berbintang dengan lampion yang naik. Giroskop/kursor
 * menggeser lapisan sesuai kedalaman; membuka sampul = kamera maju (dolly).
 */

export default defineTheme({
  id: 'lembayung',
  name: 'Lembayung',
  tier: 'special',
  category: 'classic',
  description: 'Lanskap 2.5D berlapis: senja keemasan berganti malam berlampion seiring undangan digulir.',
  addedAt: '2026-11-23',
  palette: {
    bg: '#FBF0E6',
    surface: '#FFF8F0',
    primary: '#8C3B5A',
    secondary: '#D9A066',
    text: '#3A1F33',
    muted: '#7A5A66',
    onPrimary: '#FFF8F0',
    cover: '#F4C08F',
    onCover: '#3A1F33',
  },
  fonts: {
    display: "'Bodoni Moda', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
    script: "'Pinyon Script', cursive",
    label: "'Manrope', system-ui, sans-serif",
    google: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600;700&family=Pinyon+Script',
  },
  divider: 'none',
  dividerSvg:
    '<svg viewBox="0 0 200 24" fill="none"><path d="M20 14H84M116 14H180" stroke="currentColor" stroke-width="1"/><path d="M100 3 L108 14 L100 21 L92 14 Z" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="14" r="2" fill="currentColor"/></svg>',
  frame: 'arch',
  radius: 26,
  cover: 'scene',
  hero: 'scene',
  couple: 'cards',
  countdown: 'boxes',
  events: 'ticket',
  gallery: 'film',
  ambient: 'none',
  reveal: 'rise',
  copy: {
    coverTitle: 'Undangan Pernikahan',
    openButton: 'Buka Undangan',
    heroTitle: 'Di ujung senja, kami berjanji',
    coupleTitle: 'Mempelai',
    countdownTitle: 'Menuju hari bahagia',
    eventsTitle: 'Waktu & Tempat',
    storyTitle: 'Perjalanan Kami',
    galleryTitle: 'Potret Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Konfirmasi Kehadiran',
    closingTitle: 'Sampai jumpa di bawah lampion',
  },
  scene: {
    Backdrop: LembayungBackdrop,
    intro: 'dolly',
    introMs: 2200,
    heroText: '#3A1F33',
    closingText: '#FDF3E7',
    panel: { background: 'rgba(255, 248, 240, 0.84)', blur: 16, border: '1px solid rgba(255,255,255,.55)' },
  },
});
