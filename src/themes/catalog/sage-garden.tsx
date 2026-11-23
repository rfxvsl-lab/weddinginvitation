import React from 'react';
import { defineTheme, type ThemePalette } from '../types';

/**
 * Sage Garden — taman botani yang tenang.
 * Hijau sage + krem linen, garis tumbuhan tipis seperti sketsa herbarium,
 * pintu taman terbuka sebagai sampul, bingkai lengkung.
 */

const BRANCH =
  'M10 190 C 40 150, 60 120, 70 80 C 78 50, 95 30, 120 12 M70 80 C 50 72, 38 60, 34 44 C 52 48, 64 60, 70 80 M84 52 C 100 50, 112 40, 118 26 C 102 26, 90 36, 84 52 M52 132 C 32 128, 18 116, 14 100 C 32 102, 46 114, 52 132 M62 104 C 80 104, 94 94, 100 80 C 84 80, 70 90, 62 104';

function Branches({ palette }: { palette: ThemePalette }) {
  const svg = (flip: boolean) => (
    <svg
      viewBox="0 0 130 200"
      width={150}
      height={230}
      aria-hidden
      style={{ position: 'fixed', top: -10, [flip ? 'right' : 'left']: -14, transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.55, pointerEvents: 'none', zIndex: 1 }}
    >
      <path d={BRANCH} fill="none" stroke={palette.secondary} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
  return (
    <>
      {svg(false)}
      {svg(true)}
    </>
  );
}

function GateArt({ palette }: { palette: ThemePalette }) {
  return (
    <svg viewBox="0 0 200 120" width={300} aria-hidden style={{ position: 'absolute', top: 'calc(50% - 300px)', left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0.85 }}>
      <path d="M20 96 V60 A80 80 0 0 1 180 60 V96" fill="none" stroke={palette.secondary} strokeWidth={1.2} />
      <path d="M36 96 V64 A64 64 0 0 1 164 64 V96" fill="none" stroke={palette.secondary} strokeWidth={0.8} strokeDasharray="2 4" />
      <path d={'M100 4 C 92 14, 92 24, 100 34 C 108 24, 108 14, 100 4 Z'} fill={palette.secondary} />
    </svg>
  );
}

export default defineTheme({
  id: 'sage-garden',
  name: 'Sage Garden',
  category: 'minimalist',
  description: 'Taman botani yang tenang: hijau sage, linen krem, dan sketsa daun tipis.',
  addedAt: '2026-11-23',
  palette: {
    bg: '#F4F1E8',
    surface: '#FBFAF5',
    primary: '#5E6E52',
    secondary: '#A9B79A',
    text: '#2F3A2A',
    muted: '#6B7462',
    onPrimary: '#FBFAF5',
    cover: '#E9EEDF',
    onCover: '#2F3A2A',
  },
  fonts: {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Jost', system-ui, sans-serif",
    script: "'Cormorant Garamond', Georgia, serif",
    label: "'Jost', system-ui, sans-serif",
    google: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600',
  },
  pattern:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><circle cx='30' cy='30' r='1' fill='%23A9B79A' opacity='0.5'/></svg>\")",
  patternOpacity: 0.7,
  divider: 'none',
  dividerSvg:
    '<svg viewBox="0 0 200 24" fill="none"><path d="M10 12H80M120 12H190" stroke="currentColor" stroke-width="1"/><path d="M100 2 C 94 8, 94 14, 100 22 C 106 14, 106 8, 100 2 Z" fill="currentColor"/><path d="M86 12 C 90 8, 94 8, 96 12 M114 12 C 110 8, 106 8, 104 12" stroke="currentColor" stroke-width="1"/></svg>',
  frame: 'arch',
  radius: 18,
  cover: 'gate',
  hero: 'frame',
  couple: 'cards',
  countdown: 'boxes',
  events: 'timeline',
  gallery: 'masonry',
  ambient: 'leaves',
  reveal: 'blur',
  copy: {
    coverTitle: 'Undangan Pernikahan',
    openButton: 'Masuki Taman',
    heroTitle: 'Kami Akan Menikah',
    coupleTitle: 'Dua Hati, Satu Taman',
    eventsTitle: 'Waktu & Tempat',
    galleryTitle: 'Potret Kami',
    giftTitle: 'Tanda Kasih',
    rsvpTitle: 'Kabarkan Kehadiran',
    closingTitle: 'Sampai bertemu di taman',
  },
  Signature: Branches,
  CoverArt: GateArt,
});
