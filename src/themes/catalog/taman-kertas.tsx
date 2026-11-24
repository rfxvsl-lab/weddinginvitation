import React from 'react';
import { defineTheme } from '../types';
import TamanChapter, { TAMAN_INK } from './taman-kertas.chapters';

/**
 * Taman Kertas — tema Spesial 2D paralaks bergaya buku pop-up.
 * Lapisan kertas potong (bukit, pohon, gapura bunga, bunga, daun) dengan bayangan
 * di antaranya. Saat sampul dibuka, lapisan berdiri satu per satu seperti halaman
 * pop-up; saat digulir, tiap lapisan bergeser sesuai kedalamannya.
 */

/** Sampul: tepi halaman pop-up yang masih terlipat di bagian bawah. */
function FoldedPages() {
  const cols = ['#F5ECDF', '#EFD3C4', '#E8BCAE', '#B5C4A6', '#8BA685', '#5F8266'];
  return (
    <div aria-hidden style={{ position: 'absolute', left: '8%', right: '8%', bottom: '9%', zIndex: 1 }}>
      {cols.map((c, i) => (
        <div
          key={i}
          style={{
            height: 7,
            marginTop: -2,
            marginLeft: `${(cols.length - i) * 1.2}%`,
            marginRight: `${(cols.length - i) * 1.2}%`,
            background: c,
            borderRadius: 3,
            boxShadow: '0 -2px 4px rgba(90,52,66,.16)',
          }}
        />
      ))}
      <div style={{ height: 1, marginTop: 14, background: 'linear-gradient(90deg, transparent, rgba(90,52,66,.25), transparent)' }} />
    </div>
  );
}

export default defineTheme({
  id: 'taman-kertas',
  name: 'Taman Kertas',
  tier: 'special',
  category: 'storybook',
  description: 'Diorama kertas potong: renda, pakis, bangau origami, dan lentera yang berdiri halaman demi halaman.',
  addedAt: '2026-11-23',
  palette: {
    bg: '#FDF6EE',
    surface: '#FFFDF9',
    primary: '#B9614E',
    secondary: '#8BA685',
    text: '#4A3340',
    muted: '#7D6670',
    onPrimary: '#FFFDF9',
    cover: '#FBEDE3',
    onCover: '#4E3742',
  },
  fonts: {
    display: "'Young Serif', Georgia, serif",
    body: "'Figtree', system-ui, sans-serif",
    label: "'Figtree', system-ui, sans-serif",
    google: 'Young+Serif&family=Figtree:wght@400;500;600;700',
  },
  divider: 'none',
  dividerSvg:
    '<svg viewBox="0 0 200 24" fill="none"><path d="M24 12 C 44 4, 64 20, 84 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M116 12 C 136 4, 156 20, 176 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="100" cy="12" r="5" fill="currentColor"/><circle cx="100" cy="12" r="2" fill="#F7D774"/></svg>',
  frame: 'circle',
  radius: 28,
  cover: 'scene',
  hero: 'scene',
  couple: 'split',
  countdown: 'boxes',
  events: 'cards',
  gallery: 'grid',
  ambient: 'none',
  reveal: 'zoom',
  copy: {
    coverTitle: 'Sebuah undangan dari',
    openButton: 'Buka Halamannya',
    heroTitle: 'Halaman baru kami dimulai',
    coupleTitle: 'Tokoh Utama',
    countdownTitle: 'Halaman berikutnya dalam',
    eventsTitle: 'Bab Hari Bahagia',
    storyTitle: 'Cerita Kami',
    galleryTitle: 'Album Kecil',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Tulis di Buku Tamu',
    closingTitle: 'Tamat — dan baru dimulai',
  },
  CoverArt: FoldedPages,
  scene: {
    Chapter: TamanChapter,
    ink: TAMAN_INK,
    intro: 'popup',
    introMs: 2000,
    heroText: '#4E3742',
    closingText: '#4E3742',
    closingShadow: '0 1px 0 rgba(255,255,255,.6)',
    panel: { background: 'rgba(255, 253, 249, 0.9)', blur: 8, border: '1px solid rgba(255,255,255,.8)' },
  },
});
