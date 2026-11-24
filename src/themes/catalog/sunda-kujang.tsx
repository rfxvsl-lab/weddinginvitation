import React from 'react';
import { defineTheme, type ThemePalette } from '../types';
import { ArtLayer, ArtSvg } from '../kit/chapters';
import { Px, mix, ridgePath, ridgeY, seeded } from '../kit/scene';

/**
 * Pasundan — undangan adat Sunda.
 * Hijau leuweung (hutan) yang dalam + emas pudar. Sampul tirai bilik bambu dengan
 * jambul sepasang kujang mengapit goong, dan deretan bonang degung di bawahnya.
 * Pembuka: fajar di Priangan — Tangkuban Parahu, kabut, sawah terasering berkilau,
 * saung julang ngapak, pohon kawung, lalu rumpun bambu di depan yang membelah.
 * Sepanjang halaman, batang bambu di tepi layar bergeser mengikuti gulir.
 */

const W = 400;

// ------------------------------------------------------------------ bambu

/** Semprotan daun bambu (daun ramping) yang berayun pelan. */
function leaves(x: number, y: number, dir: 1 | -1, s: number, fill: string, seed: number, sway = true) {
  const r = seeded(seed);
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      <g className={sway ? 'psd-sway' : undefined} style={{ animationDelay: `${-r() * 6}s` }}>
        <path d="M0 0 C 6 -6, 14 -10, 22 -12" stroke={fill} strokeWidth={1.2} fill="none" />
        {[-34, -12, 10, 30].map((a, i) => (
          <path key={i} transform={`translate(${6 + i * 5} ${-3 - i * 2.6}) rotate(${a + (r() - 0.5) * 14})`} d="M0 0 C 9 -4, 26 -4, 40 1 C 26 4, 10 4, 0 0 Z" fill={fill} />
        ))}
      </g>
    </g>
  );
}

/** Satu batang bambu tegak (miring `lean` derajat) dengan ruas & buku. */
function stalk(x: number, w: number, top: number, bottom: number, seg: number, lean: number, c: { body: string; rim: string; node: string }, key: React.Key) {
  const nodes = [];
  for (let y = bottom - seg; y > top + 8; y -= seg) nodes.push(y);
  return (
    <g key={key} transform={`rotate(${lean} ${x + w / 2} ${bottom})`}>
      <rect x={x} y={top} width={w} height={bottom - top} rx={w / 2} fill={c.body} />
      <rect x={x + w * 0.62} y={top + 6} width={w * 0.16} height={bottom - top - 12} rx={w * 0.08} fill={c.rim} opacity={0.55} />
      {nodes.map((y) => (
        <g key={y}>
          <rect x={x - 0.8} y={y - 1.6} width={w + 1.6} height={3.2} rx={1.6} fill={c.node} />
          <path d={`M${x + 1} ${y + 3.5} H${x + w - 1}`} stroke={c.rim} strokeWidth={0.8} opacity={0.5} />
        </g>
      ))}
    </g>
  );
}

const SWAY_CSS =
  '@keyframes psd-sway { 0%,100% { transform: rotate(-5deg) } 50% { transform: rotate(6deg) } } .psd-sway { transform-box: fill-box; transform-origin: 0% 50%; animation: psd-sway 5.5s ease-in-out infinite } @media (prefers-reduced-motion: reduce) { .psd-sway { animation: none } }';

/** Signature: batang bambu di kedua tepi layar, bergeser dengan kecepatan berbeda saat digulir. */
function BambooEdges({ palette: p }: { palette: ThemePalette }) {
  const c = { body: mix(p.bg, '#6F8A4C', 0.42), rim: mix(p.primary, '#E8DCA8', 0.3), node: p.secondary };
  const leaf = mix(p.bg, '#5F7D45', 0.55);
  const edge = (side: 'left' | 'right', travel: number, seed: number) => (
    <Px
      aria-hidden
      source="page"
      y={[0, -travel]}
      style={{ position: 'fixed', top: 0, [side]: -14, width: 70, height: '100vh', overflow: 'hidden', zIndex: 1, pointerEvents: 'none', opacity: 0.62 }}
    >
      <svg viewBox="0 0 60 1700" width={70} style={{ display: 'block', transform: side === 'right' ? 'scaleX(-1)' : undefined }}>
        {stalk(10, 11, 0, 1700, 128 + seed * 6, 0, c, 'a')}
        {stalk(28, 7, 120, 1700, 104, 0, c, 'b')}
        {[260, 610, 940, 1330].map((y, i) => (
          <React.Fragment key={y}>{leaves(i % 2 ? 34 : 20, y + seed * 30, 1, 0.9 + (i % 3) * 0.12, leaf, seed * 10 + i)}</React.Fragment>
        ))}
      </svg>
    </Px>
  );
  return (
    <>
      <style>{SWAY_CSS}</style>
      {edge('left', 860, 1)}
      {edge('right', 640, 2)}
    </>
  );
}

// ------------------------------------------------------------------ panggung pembuka: fajar di Priangan

/** Saung beratap julang ngapak (atap bersayap) di atas tiang. */
function saung(x: number, y: number, s: number, fill: string, glow: string) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-11 0 V-10 M11 0 V-10 M0 0 V-10" stroke={fill} strokeWidth={1.6} />
      <rect x={-12} y={-19} width={24} height={10} fill={fill} />
      <rect x={-4} y={-17} width={8} height={6} fill={glow} opacity={0.85} />
      <path d="M-27 -17 L-16 -20 L0 -36 L16 -20 L27 -17 L14 -19 L-14 -19 Z" fill={fill} />
      <path d="M0 -36 V-41" stroke={fill} strokeWidth={1.4} />
    </g>
  );
}

/** Pohon kawung (aren): batang lurus, pelepah melengkung. */
function kawung(x: number, y: number, h: number, c: string) {
  const tx = x + 4;
  const ty = y - h;
  return (
    <g>
      <path d={`M${x} ${y} C ${x + 2} ${y - h * 0.4}, ${x + 5} ${y - h * 0.7}, ${tx} ${ty}`} stroke={c} strokeWidth={3} fill="none" />
      {[-62, -40, -18, 6, 28, 50, 70].map((dx, i) => (
        <path key={i} d={`M${tx} ${ty} q ${dx * 0.45} ${-16 + Math.abs(dx) * 0.12} ${dx} ${6 + Math.abs(dx) * 0.25}`} stroke={c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Garis terbuka mengikuti punggung bukit (untuk petak sawah terasering). */
function contour(rg: { base: number; amp: number; rough: number; seed: number }, dy: number, bend: number) {
  let d = '';
  for (let x = -20; x <= W + 20; x += 12) {
    const y = ridgeY({ w: W, ...rg }, x) + dy + Math.sin((x / W) * Math.PI) * bend;
    d += `${d ? ' L' : 'M'}${x} ${y.toFixed(1)}`;
  }
  return d;
}

function PriangganStage({ palette: p }: { palette: ThemePalette }) {
  const sky = { top: mix(p.bg, '#000000', 0.25), mid: mix(p.bg, '#3E5A4A', 0.6), low: mix('#E7C47A', p.bg, 0.12), glow: '#F3D58C' };
  const haze = (t: number) => mix(mix(p.bg, '#7E9C8E', 0.55), '#E8D3A0', t);
  const terr = { base: 532, amp: 16, rough: 1.1, seed: 7 };
  const near = { base: 636, amp: 22, rough: 1.4, seed: 13 };
  const dark = mix(p.bg, '#000000', 0.35);
  const bamboo = { body: mix(p.bg, '#000000', 0.45), rim: mix(p.primary, '#F6E2A8', 0.35), node: mix(p.secondary, '#000000', 0.25) };
  const bLeaf = mix(p.bg, '#000000', 0.3);
  return (
    <>
      <style>{SWAY_CSS}</style>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 34%, ${sky.low} 52%, ${p.bg} 100%)` }} />
      <ArtLayer depth={0.03} hero order={0}>
        <ArtSvg>
          <defs>
            <radialGradient id="psd-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={sky.glow} stopOpacity={0.9} />
              <stop offset="1" stopColor={sky.glow} stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={262} cy={404} r={160} fill="url(#psd-sun)" opacity={0.6} />
          <circle cx={262} cy={404} r={28} fill="#FBE7B0" />
          {/* bintang terakhir sebelum fajar */}
          {(() => {
            const r = seeded(41);
            return Array.from({ length: 18 }, (_, i) => <circle key={i} cx={60 + r() * 285} cy={95 + r() * 150} r={0.6 + r() * 0.9} fill="#FFF6DA" opacity={0.3 + r() * 0.4} />);
          })()}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.08} hero order={1}>
        <ArtSvg>
          <defs>
            <linearGradient id="psd-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={haze(0.1)} />
              <stop offset="0.25" stopColor={haze(0.45)} />
            </linearGradient>
          </defs>
          {/* Burangrang (kiri) & Tangkuban Parahu — perahu terbalik di cakrawala */}
          <g transform="translate(0 38)">
          <path d="M-20 420 L-20 404 Q 30 398 58 386 Q 78 374 96 388 Q 122 402 150 394 Q 186 382 212 370 L 232 364 Q 262 359 292 361 Q 314 363 332 374 Q 362 392 420 402 L 420 800 L -20 800 Z" fill="url(#psd-far)" />
          <path d="M232 364 Q 262 359 292 361" stroke="#F6E2A8" strokeWidth={1} opacity={0.5} fill="none" />
          </g>
          {/* kuntul terbang */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${112 + i * 14} ${396 - i * 6} q 3 -3 6 0 q 3 -3 6 0`} stroke="#FFF6DA" strokeWidth={1.1} fill="none" opacity={0.8} />
          ))}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.16} hero order={2}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '48%', height: '15%', background: `linear-gradient(180deg, transparent, ${haze(0.75)}B3 50%, transparent)`, filter: 'blur(6px)' }} />
      </ArtLayer>
      <ArtLayer depth={0.28} hero order={3}>
        <ArtSvg>
          <path d={ridgePath({ w: W, ...terr })} fill={mix(p.bg, '#56704A', 0.5)} />
          {Array.from({ length: 11 }, (_, k) => (
            <React.Fragment key={k}>
              {/* air di petak sawah memantulkan fajar */}
              <path d={contour(terr, 8 + k * 17, 4 + k * 1.4)} stroke={sky.low} strokeWidth={6} opacity={0.12 + (k % 3) * 0.05} fill="none" />
              <path d={contour(terr, 11 + k * 17, 4 + k * 1.4)} stroke={mix(p.primary, '#000000', 0.15)} strokeWidth={1} opacity={0.45} fill="none" />
            </React.Fragment>
          ))}
          {saung(246, ridgeY({ w: W, ...terr }, 246) + 4, 1.15, dark, sky.glow)}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.44} hero order={4}>
        <ArtSvg>
          <defs>
            <linearGradient id="psd-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix(p.bg, '#2E4430', 0.4)} />
              <stop offset="0.45" stopColor={p.bg} />
            </linearGradient>
          </defs>
          {kawung(116, ridgeY({ w: W, ...near }, 116) + 6, 92, dark)}
          {kawung(150, ridgeY({ w: W, ...near }, 150) + 6, 70, dark)}
          <path d={ridgePath({ w: W, ...near })} fill="url(#psd-near)" />
          <path d={contour(near, 1, 0)} stroke={p.primary} strokeWidth={1} opacity={0.35} fill="none" />
        </ArtSvg>
      </ArtLayer>
      {/* rumpun bambu di depan — membelah ke samping saat digulir */}
      <ArtLayer depth={0.72} hero order={5} exitX={-0.32} origin="0% 100%">
        <ArtSvg>
          {stalk(52, 14, 40, 840, 104, -1.5, bamboo, 1)}
          {stalk(72, 11, 150, 840, 92, -0.5, bamboo, 2)}
          {stalk(90, 9, 380, 840, 84, 1, bamboo, 3)}
          {[[56, 210, 1.1, -1], [74, 300, 1, -1], [78, 430, 1.3, 1], [94, 530, 1.5, 1], [74, 640, 1.4, 1]].map(([x, y, s, d], i) => (
            <React.Fragment key={i}>{leaves(x, y, d as 1 | -1, s, bLeaf, 70 + i)}</React.Fragment>
          ))}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.82} hero order={6} exitX={0.32} origin="100% 100%">
        <ArtSvg>
          {stalk(334, 14, 70, 840, 110, 1.5, bamboo, 1)}
          {stalk(317, 11, 190, 840, 96, 0.5, bamboo, 2)}
          {stalk(301, 9, 410, 840, 88, -1, bamboo, 3)}
          {[[344, 240, 1.1, 1], [326, 330, 1, 1], [322, 460, 1.3, -1], [306, 560, 1.5, -1], [326, 660, 1.4, -1]].map(([x, y, s, d], i) => (
            <React.Fragment key={i}>{leaves(x, y, d as 1 | -1, s, bLeaf, 80 + i)}</React.Fragment>
          ))}
        </ArtSvg>
      </ArtLayer>
    </>
  );
}

// ------------------------------------------------------------------ sampul: kujang, goong, bonang

const KUJANG_BLADE =
  'M20 112 C 14 92, 12 76, 17 60 L 11 56 L 17 52 C 17 40, 20 24, 27 4 C 33 16, 36 26, 34 36 C 43 44, 45 56, 38 66 C 34 72, 34 78, 38 84 C 42 92, 39 104, 31 112 Z';

function Kujang({ x, flip }: { x: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`}>
      <path d={KUJANG_BLADE} fill="url(#psd-gold)" />
      <path d="M20 108 C 12 108, 6 104, 5 97 C 10 100, 15 101, 19 99 Z" fill="url(#psd-gold)" />
      <path d="M25 104 C 22 82, 22 52, 27 12" stroke="#3A2E14" strokeWidth={0.8} opacity={0.45} fill="none" />
      {[40, 54, 68, 82].map((y, i) => (
        <circle key={y} cx={25.5 + i * 0.7} cy={y} r={1.9} fill="var(--psd-hole)" />
      ))}
      <rect x={16} y={112} width={18} height={5} rx={1.6} fill="#E6CF8E" />
      <path d="M19 117 C 18 128, 20 138, 25 147 C 30 139, 32 129, 31 117 Z" fill="url(#psd-gold)" />
      <path d="M19.5 126 H30.5 M20 134 H29.5" stroke="#3A2E14" strokeWidth={0.7} opacity={0.4} />
    </g>
  );
}

function bonang(x: number) {
  return (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d="M-12 31 C -12 41, 12 41, 12 31 Z" fill="url(#psd-gold)" />
      <ellipse cx={0} cy={31} rx={12} ry={4.4} fill="#E9D49A" />
      <circle cx={0} cy={27.5} r={4.4} fill="url(#psd-gold)" />
      <circle cx={-1.3} cy={26.2} r={1.3} fill="#FFF3CF" opacity={0.85} />
    </g>
  );
}

function SundaCover({ palette: p }: { palette: ThemePalette }) {
  const tumpal = (bottom: boolean) => (
    <svg aria-hidden width="100%" height={30} style={{ position: 'absolute', left: 0, right: 0, [bottom ? 'bottom' : 'top']: 0, transform: bottom ? 'scaleY(-1)' : undefined, opacity: 0.75 }}>
      <defs>
        <pattern id={`psd-tumpal-${bottom ? 'b' : 't'}`} width={22} height={30} patternUnits="userSpaceOnUse">
          <path d="M0 4 H22" stroke={p.primary} strokeWidth={1} />
          <path d="M1 7 L11 27 L21 7 Z" fill="none" stroke={p.primary} strokeWidth={1} />
          <path d="M6 9 L11 19 L16 9 Z" fill={p.primary} opacity={0.6} />
        </pattern>
      </defs>
      <rect width="100%" height={30} fill={`url(#psd-tumpal-${bottom ? 'b' : 't'})`} />
    </svg>
  );
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', ['--psd-hole' as string]: p.cover || p.bg }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="psd-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F1DE9E" />
            <stop offset="0.5" stopColor={p.primary} />
            <stop offset="1" stopColor={mix(p.primary, '#3A2E14', 0.45)} />
          </linearGradient>
        </defs>
      </svg>
      {tumpal(false)}
      {tumpal(true)}
      {/* jambul: sepasang kujang mengapit goong */}
      <svg viewBox="0 0 220 150" width={200} style={{ position: 'absolute', left: '50%', top: 'max(36px, calc(50% - 352px))', transform: 'translateX(-50%)', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))' }}>
        <Kujang x={34} />
        <Kujang x={186} flip />
        <path d="M84 30 Q 110 18 136 30" stroke={p.primary} strokeWidth={1.4} fill="none" />
        <path d="M110 22 V44" stroke={p.primary} strokeWidth={1} />
        <circle cx={110} cy={70} r={24} fill="url(#psd-gold)" />
        <circle cx={110} cy={70} r={17} fill="none" stroke="#3A2E14" strokeWidth={0.8} opacity={0.4} />
        <circle cx={110} cy={70} r={8} fill="#F4E3AE" />
        <circle cx={108} cy={68} r={2.6} fill="#FFF8E0" opacity={0.8} />
        {leaves(110, 104, 1, 0.9, p.primary, 3, false)}
        {leaves(110, 104, -1, 0.9, p.primary, 4, false)}
      </svg>
      {/* deretan bonang di rancak — rasa gamelan degung */}
      <svg viewBox="0 0 240 56" width={220} style={{ position: 'absolute', left: '50%', bottom: 'max(40px, calc(50% - 352px))', transform: 'translateX(-50%)', opacity: 0.9 }}>
        <path d="M8 40 H232 M14 48 H226" stroke={p.primary} strokeWidth={1.6} />
        <path d="M8 40 C 2 40, 2 30, 8 28 M232 40 C 238 40, 238 30, 232 28" stroke={p.primary} strokeWidth={1.6} fill="none" />
        {[28, 58, 89, 120, 151, 182, 212].map(bonang)}
      </svg>
    </div>
  );
}

// ------------------------------------------------------------------ tema

export default defineTheme({
  id: 'sunda-kujang',
  name: 'Pasundan',
  category: 'classic',
  description: 'Adat Sunda: hijau leuweung & emas pudar, sepasang kujang, bilik bambu, dan fajar di Priangan.',
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
  // seruling bambu beruas mengapit goong berpencon
  dividerSvg:
    '<svg viewBox="0 0 200 28" fill="none"><path d="M6 14H82M118 14H194" stroke="currentColor" stroke-width="1.2"/><path d="M24 10v8M46 10v8M68 10v8M132 10v8M154 10v8M176 10v8" stroke="currentColor" stroke-width="1"/><circle cx="100" cy="14" r="11" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="14" r="6.5" stroke="currentColor" stroke-width=".8"/><circle cx="100" cy="14" r="3.2" fill="currentColor"/></svg>',
  // sudut kartu: bambu beruas + sehelai daun
  cornerSvg:
    '<svg viewBox="0 0 40 40" fill="none"><path d="M3 37V9a6 6 0 0 1 6-6h28" stroke="currentColor" stroke-width="1.4"/><path d="M1 20h4M1 30h4M20 1v4M30 1v4" stroke="currentColor" stroke-width="1.2"/><path d="M9 9c8 0 13 4 15 12-8 0-13-4-15-12z" fill="currentColor" opacity=".75"/></svg>',
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
  Signature: BambooEdges,
  Stage: PriangganStage,
  CoverArt: SundaCover,
});
