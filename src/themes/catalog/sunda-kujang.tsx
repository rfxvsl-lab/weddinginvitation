import React from 'react';
import { defineTheme } from '../types';
import { MegaEdges, PasundanCover, PasundanStage } from './sunda-kujang.stage';

/**
 * Pasundan — undangan adat Sunda dengan bahasa visual batik Mega Mendung.
 * Hijau leuweung (hutan) yang dalam + emas pudar. Awan Mega Mendung berpita (gelap di tepi,
 * terang di tengah, ujung berkait) menjadi tanda tangan tema: menggantung di sampul,
 * melayang di kaki Tangkuban Parahu saat fajar, dan mengintip di tepi halaman.
 * Sepasang kujang emas di sampul, sawah terasering berukir garis emas, saung julang ngapak.
 */

// ------------------------------------------------------------------ tema

export default defineTheme({
  id: 'sunda-kujang',
  name: 'Pasundan',
  category: 'classic',
  description: 'Adat Sunda bernapas batik Mega Mendung: awan berpita, sepasang kujang emas, dan fajar di Tangkuban Parahu.',
  addedAt: '2026-11-24',
  palette: {
    bg: '#14281E',
    surface: '#1C3427',
    primary: '#C9A85C',
    secondary: '#A68D55',
    text: '#F1EAD6',
    muted: '#BFB596',
    onPrimary: '#13261C',
    cover: '#102119',
    onCover: '#F1EAD6',
  },
  heroInk: '#F6EBCB',
  fonts: {
    display: "'Gilda Display', Georgia, serif",
    body: "'Lora', Georgia, serif",
    label: "'Cinzel', Georgia, serif",
    google: 'Gilda+Display&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cinzel:wght@400;500;600;700',
  },
  // anyaman bilik bambu
  pattern:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><g fill='none' stroke='%23C9A85C' stroke-width='1' opacity='.1'><path d='M0 7 L7 0 M7 14 L14 7 M14 21 L21 14 M21 28 L28 21'/><path d='M14 7 L21 14 M0 21 L7 28 M21 0 L28 7 M7 14 L0 7'/></g></svg>\")",
  patternOpacity: 1,
  ornament: 'line',
  divider: 'none',
  // garis awan berpita mengapit gulungan Mega Mendung
  dividerSvg:
    '<svg viewBox="0 0 200 28" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M8 18c14-10 26-10 36-2s22 8 34-4" stroke-width="1.3"/><path d="M14 22c14-8 24-8 32-2s20 6 30-2" stroke-width=".8"/><path d="M192 18c-14-10-26-10-36-2s-22 8-34-4" stroke-width="1.3"/><path d="M186 22c-14-8-24-8-32-2s-20 6-30-2" stroke-width=".8"/><circle cx="100" cy="13" r="10" stroke-width="1.3"/><circle cx="100" cy="13" r="6" stroke-width=".9"/><path d="M100 13m-2.4 0a2.4 2.4 0 1 1 2.4 2.4" stroke-width="1.1"/></svg>',
  // sudut bagian: gulungan Mega Mendung berpita (garis)
  cornerSvg:
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor"><path d="M2 62V2h60" stroke-width="1"/><path d="M8 46c0-21 17-38 38-38" stroke-width="1.2"/><path d="M14 46c0-17 14-32 32-32" stroke-width=".8"/><path d="M20 46c0-14 12-26 26-26" stroke-width=".8"/><path d="M26 46c0-11 9-20 20-20" stroke-width=".8"/><circle cx="46" cy="46" r="9" stroke-width="1.1"/><path d="M46 46m-4 0a4 4 0 1 1 4 4" stroke-width="1"/></svg>',
  flora: { colors: ['#EAD9A8', '#C9A85C', '#F7F0DA'], leaf: '#5E7A4E' },
  floraArt: 'gold',
  variants: [
    { id: 'leuweung', name: 'Hijau Leuweung', palette: {} },
    { id: 'nila', name: 'Biru Nila', palette: { bg: '#13202E', surface: '#1B2B3B', cover: '#0E1824' } },
    { id: 'sogan', name: 'Cokelat Sogan', palette: { bg: '#2A1D14', surface: '#36261A', cover: '#20160F', onPrimary: '#241810' } },
    { id: 'marun', name: 'Marun', palette: { bg: '#2B1418', surface: '#381C21', cover: '#210F12', onPrimary: '#241013' } },
  ],
  frame: 'oval',
  radius: 8,
  cover: 'curtain',
  hero: 'type',
  couple: 'cards',
  countdown: 'inline',
  events: 'cards',
  gallery: 'grid',
  ambient: 'leaves',
  reveal: 'rise',
  sections: ['hero', 'quote', 'couple', 'story', 'countdown', 'events', 'interlude', 'gallery', 'gift', 'rsvp', 'wishes', 'closing'],
  copy: {
    coverTitle: 'Uleman Pernikahan',
    openButton: 'Buka Undangan',
    heroTitle: 'Dua Insan, Satu Asih',
    coupleTitle: 'Pangantén',
    coupleIntro: 'Dengan memohon rahmat dan ridha Tuhan Yang Maha Esa, kami bermaksud menyatukan dua keluarga dalam ikatan suci pernikahan.',
    countdownTitle: 'Menghitung hari menuju akad',
    eventsTitle: 'Waktos & Tempat',
    storyTitle: 'Lalakon Urang',
    galleryTitle: 'Potret Kebersamaan',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Konfirmasi Kehadiran',
    wishesTitle: 'Pangdu’a & Ucapan',
    closingTitle: 'Hatur Nuhun',
    closingText:
      'Merupakan kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Hatur nuhun kana sagala perhatosanana.',
  },
  Signature: MegaEdges,
  Stage: PasundanStage,
  CoverArt: PasundanCover,
});
