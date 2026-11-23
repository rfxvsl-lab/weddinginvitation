'use client';

/**
 * Lembayung — bab-bab adegan 2.5D (gaya situs naratif paralaks).
 * Setiap bagian undangan adalah adegan layar penuh di waktu yang berbeda:
 * senja keemasan di kaki gunung → candi → telaga → sawah → laut → jalan pulang →
 * hutan kunang-kunang → telaga berlampion → desa malam → penutup di bawah bulan.
 * Teks berada di dalam adegan: ada lapisan di belakang dan di depannya.
 */

import React from 'react';
import type { SectionId } from '../types';
import { keyframeColors, mix, ridgePath, ridgeY, seeded } from '../kit/scene';
import { ArtLayer, ArtSvg, Sky } from '../kit/chapters';

const W = 400;
const H = 800;

/** Siluet candi bertingkat ala Prambanan, alas di (0,0), tumbuh ke atas. */
function candiPath(scale = 1) {
  const tiers: [number, number][] = [
    [46, 9],
    [40, 7],
    [34, 14],
    [28, 8],
    [24, 12],
    [18, 8],
    [14, 10],
    [9, 7],
    [5, 9],
    [2, 10],
  ];
  let y = 0;
  let d = '';
  for (const [w, h] of tiers) {
    const x = (-w / 2) * scale;
    d += `M${x} ${-y * scale}h${w * scale}v${-h * scale}h${-w * scale}Z`;
    // ratna kecil di sudut tiap tingkat
    if (w > 10 && h > 7) {
      const r = 2.4 * scale;
      d += `M${x - r} ${-(y + h) * scale}a${r} ${r} 0 0 1 ${2 * r} 0Z M${x + w * scale - r} ${-(y + h) * scale}a${r} ${r} 0 0 1 ${2 * r} 0Z`;
    }
    y += h;
  }
  return d;
}

/** Pohon cemara ramping. */
function cypress(x: number, y: number, h: number) {
  const w = h * 0.22;
  return `M${x} ${y - h} C ${x + w * 0.9} ${y - h * 0.55}, ${x + w} ${y - h * 0.15}, ${x + w * 0.35} ${y} L ${x - w * 0.35} ${y} C ${x - w} ${y - h * 0.15}, ${x - w * 0.9} ${y - h * 0.55}, ${x} ${y - h} Z`;
}

/**
 * Pohon kelapa: batang melengkung (isi) + pelepah (garis) dengan anak daun.
 * dir = 1 condong ke kanan, -1 ke kiri. Mengembalikan { trunk, fronds }.
 */
function palm(x: number, y: number, h: number, dir: 1 | -1, seed = 1) {
  const r = seeded(seed);
  const cx = x + dir * h * 0.38;
  const cy = y - h;
  const trunk = `M${x - 7} ${y} Q ${x + dir * h * 0.02} ${y - h * 0.62} ${cx - 2.5} ${cy + 4} L ${cx + 2.5} ${cy + 6} Q ${x + dir * h * 0.1} ${y - h * 0.58} ${x + 7} ${y} Z`;
  let fronds = '';
  const angles = [-172, -150, -128, -100, -70, -45, -18, 8, 150];
  for (const deg of angles) {
    const a = ((deg + (r() - 0.5) * 10) * Math.PI) / 180;
    const L = h * (0.42 + r() * 0.12);
    const droop = L * (0.35 + Math.abs(Math.cos(a)) * 0.35);
    const tip: [number, number] = [cx + Math.cos(a) * L, cy + Math.sin(a) * L * 0.6 + droop];
    const ctl: [number, number] = [cx + Math.cos(a) * L * 0.55, cy + Math.sin(a) * L * 0.55 - L * 0.12];
    fronds += ` M${cx} ${cy} Q ${ctl[0].toFixed(1)} ${ctl[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
    // anak daun di sepanjang pelepah (bezier kuadrat)
    const n = 15;
    for (let i = 2; i < n; i++) {
      const t = i / n;
      const bx = (1 - t) * (1 - t) * cx + 2 * (1 - t) * t * ctl[0] + t * t * tip[0];
      const by = (1 - t) * (1 - t) * cy + 2 * (1 - t) * t * ctl[1] + t * t * tip[1];
      const tx = 2 * (1 - t) * (ctl[0] - cx) + 2 * t * (tip[0] - ctl[0]);
      const ty = 2 * (1 - t) * (ctl[1] - cy) + 2 * t * (tip[1] - ctl[1]);
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      const leaf = L * 0.2 * Math.sin(Math.PI * Math.min(1, t * 1.15));
      for (const side of [1, -1]) {
        const ex = bx + (nx * side + (tx / len) * 0.5) * leaf;
        const ey = by + (ny * side + (ty / len) * 0.5) * leaf + leaf * 0.45;
        fronds += ` M${bx.toFixed(1)} ${by.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`;
      }
    }
  }
  return { trunk, fronds };
}


/** Satu pelepah nyiur menggantung dari (0,0) ke arah kanan-bawah. */
function frondPath(len: number, seed: number) {
  const r = seeded(seed);
  const tip: [number, number] = [len * 0.92, len * 0.55];
  const ctl: [number, number] = [len * 0.5, -len * 0.12];
  let d = `M0 0 Q ${ctl[0]} ${ctl[1]} ${tip[0]} ${tip[1]}`;
  const n = 22;
  for (let i = 2; i < n; i++) {
    const t = i / n;
    const bx = 2 * (1 - t) * t * ctl[0] + t * t * tip[0];
    const by = 2 * (1 - t) * t * ctl[1] + t * t * tip[1];
    const tx = 2 * (1 - t) * ctl[0] + 2 * t * (tip[0] - ctl[0]);
    const ty = 2 * (1 - t) * ctl[1] + 2 * t * (tip[1] - ctl[1]);
    const l = Math.hypot(tx, ty) || 1;
    const leaf = len * 0.24 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (0.85 + r() * 0.3);
    for (const side of [1, -1]) {
      const ex = bx + ((-ty / l) * side + (tx / l) * 0.55) * leaf;
      const ey = by + ((tx / l) * side + (ty / l) * 0.55) * leaf + leaf * 0.5;
      d += ` M${bx.toFixed(1)} ${by.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    }
  }
  return d;
}


// ------------------------------------------------------------------ palet waktu

// Setiap bab berada di waktu yang berbeda: senja keemasan → lembayung → malam berlampion.
const SKY: [number, Record<'top' | 'mid' | 'hz' | 'sun' | 'near', string>][] = [
  [0, { top: '#E9A178', mid: '#F4C08F', hz: '#FBE3BD', sun: '#FFF3DA', near: '#5B3241' }],
  [0.3, { top: '#D9826F', mid: '#EFA27F', hz: '#F9CFA0', sun: '#FFE2B4', near: '#4E2A3D' }],
  [0.55, { top: '#7D4E7E', mid: '#C66E80', hz: '#F09A7C', sun: '#FFBE8E', near: '#3A2038' }],
  [0.78, { top: '#30305E', mid: '#5A3F72', hz: '#A9607A', sun: '#F59B83', near: '#1F1630' }],
  [1, { top: '#0E1431', mid: '#1C2250', hz: '#3E3263', sun: '#F3E7C6', near: '#0B0C1C' }],
];

const TIME: Record<SectionId, number> = {
  hero: 0,
  quote: 0.14,
  couple: 0.28,
  countdown: 0.42,
  events: 0.52,
  story: 0.62,
  gallery: 0.72,
  gift: 0.82,
  rsvp: 0.9,
  wishes: 0.93,
  interlude: 0.35,
  closing: 1,
};

function palette(t: number) {
  const k = keyframeColors(SKY, t);
  return { ...k, haze: (h: number) => mix(k.near, k.hz, h), light: mix(k.hz, '#FFFFFF', 0.35) };
}
type Pal = ReturnType<typeof palette>;

// ------------------------------------------------------------------ unsur adegan

function Sun({ x = 200, y, r = 36, k, glow = 180 }: { x?: number; y: number; r?: number; k: Pal; glow?: number }) {
  const id = `lby-sun-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={k.sun} stopOpacity={0.85} />
          <stop offset="1" stopColor={k.sun} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={glow} fill={`url(#${id})`} opacity={0.6} />
      <circle r={r} fill={mix(k.sun, '#FFFFFF', 0.4)} />
    </g>
  );
}

function Moon({ x = 300, y = 120, r = 22 }: { x?: number; y?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 4} fill="#F3E7C6" opacity={0.06} />
      <circle r={r * 2} fill="#F3E7C6" opacity={0.1} />
      <circle r={r} fill="#F7EDD3" />
      <circle r={r * 0.95} cx={r * 0.42} cy={-r * 0.25} fill="#1A2048" opacity={0.92} />
    </g>
  );
}

function Stars({ n = 70, seed = 3, opacity = 1, maxY = 420 }: { n?: number; seed?: number; opacity?: number; maxY?: number }) {
  const r = seeded(seed);
  return (
    <g fill="#FFF6E0" opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const d = r() * 4;
        return <circle key={i} cx={r() * W} cy={r() * maxY} r={0.4 + r() * 1.3} style={{ animation: `lby-twinkle ${2.5 + d}s ease-in-out ${-d}s infinite` }} />;
      })}
    </g>
  );
}

function Clouds({ k, y = 300 }: { k: Pal; y?: number }) {
  return (
    <g fill={k.light} opacity={0.55} style={{ filter: 'blur(3px)' }}>
      <g style={{ animation: 'lby-drift 38s ease-in-out infinite alternate' }}>
        <ellipse cx={90} cy={y} rx={90} ry={9} />
        <ellipse cx={130} cy={y - 10} rx={50} ry={7} />
      </g>
      <g style={{ animation: 'lby-drift 46s ease-in-out -12s infinite alternate-reverse' }}>
        <ellipse cx={300} cy={y + 60} rx={110} ry={8} />
      </g>
    </g>
  );
}

function Birds({ x = 60, y = 250, color }: { x?: number; y?: number; color: string }) {
  return (
    <g stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" style={{ animation: 'lby-flock 26s linear infinite' }}>
      {[
        [0, 0],
        [18, -8],
        [30, 6],
        [46, -12],
        [12, 14],
      ].map(([dx, dy], i) => (
        <path key={i} d={`M${x + dx - 6} ${y + dy} q 3 -4 6 0 q 3 -4 6 0`} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `lby-flap ${0.5 + i * 0.07}s ease-in-out infinite` }} />
      ))}
    </g>
  );
}

/** Lampion yang naik (HTML agar cahayanya lembut). */
/** edges: hanya di tepi kiri/kanan agar tidak menutupi teks */
function Lanterns({ n = 10, seed = 1, big = false, edges = false }: { n?: number; seed?: number; big?: boolean; edges?: boolean }) {
  const r = seeded(seed);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const size = (big ? 16 : 8) + r() * (big ? 14 : 8);
        const dur = 16 + r() * 14;
        const delay = -r() * dur;
        return (
          <div key={i} style={{ position: 'absolute', left: `${edges ? (i % 2 ? 88 : 1) + r() * 9 : 4 + r() * 92}%`, bottom: '-8%', animation: `lby-rise ${dur}s linear ${delay}s infinite` }}>
            <div
              style={{
                width: size,
                height: size * 1.25,
                borderRadius: '40% 40% 30% 30%',
                background: 'radial-gradient(circle at 50% 70%, #FFE6A6 0%, #FFB45E 55%, #E0703D 100%)',
                boxShadow: `0 0 ${size * 1.8}px ${size * 0.5}px rgba(255,170,80,.45)`,
                animation: `lby-sway ${4 + (i % 3)}s ease-in-out infinite, lby-flicker ${1.2 + (i % 4) * 0.3}s ease-in-out infinite`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function Fireflies({ n = 24, seed = 2, top = 50 }: { n?: number; seed?: number; top?: number }) {
  const r = seeded(seed);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${r() * 100}%`,
            top: `${top + r() * (95 - top)}%`,
            width: 4,
            height: 4,
            borderRadius: 9,
            background: '#FFF1A8',
            boxShadow: '0 0 10px 3px rgba(255,236,140,.7)',
            animation: `lby-firefly ${3 + r() * 4}s ease-in-out ${-r() * 6}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

const ridge = (k: Pal, rg: { base: number; amp: number; rough?: number; seed: number }, haze: number) => <path d={ridgePath({ w: W, h: H, ...rg })} fill={k.haze(haze)} />;

function treeRow(rg: { base: number; amp: number; rough?: number; seed: number }, xs: number[], hMin: number, hMax: number, seed = 1) {
  const r = seeded(seed);
  return xs.map((x) => cypress(x, ridgeY({ w: W, ...rg }, x) + 5, hMin + r() * (hMax - hMin))).join(' ');
}

function boat(x: number, y: number) {
  return `M${x - 34} ${y} Q ${x} ${y + 14} ${x + 34} ${y} L ${x + 26} ${y + 8} Q ${x} ${y + 18} ${x - 26} ${y + 8} Z M${x - 2} ${y - 2} L ${x - 2} ${y - 62} L ${x + 30} ${y - 6} Z M${x - 6} ${y - 50} L ${x - 6} ${y - 4} L ${x - 30} ${y - 6} Z`;
}

function hut(x: number, y: number, s = 1) {
  return `M${x - 18 * s} ${y} V${y - 14 * s} H${x + 18 * s} V${y} Z M${x - 26 * s} ${y - 12 * s} L ${x} ${y - 34 * s} L ${x + 26 * s} ${y - 12 * s} Z M${x - 14 * s} ${y} V${y + 8 * s} M${x + 14 * s} ${y} V${y + 8 * s}`;
}

function houses(rg: { base: number; amp: number; rough?: number; seed: number }, xs: number[]) {
  let d = '';
  const wins: { x: number; y: number }[] = [];
  xs.forEach((x, i) => {
    const y = ridgeY({ w: W, ...rg }, x) + 4;
    const w = 16 + (i % 3) * 5;
    const h = 12 + (i % 2) * 5;
    d += `M${x - w / 2} ${y} V${y - h} L ${x} ${y - h - w * 0.45} L ${x + w / 2} ${y - h} V${y} Z `;
    wins.push({ x: x - 2, y: y - h + 4 });
  });
  return { d, wins };
}

// ------------------------------------------------------------------ bab

const HERO_PALMS = [palm(-4, 812, 250, 1, 3), palm(406, 812, 220, -1, 5), palm(370, 818, 146, -1, 9)];

function Back({ id }: { id: SectionId }) {
  const k = palette(TIME[id]);
  const sky = <Sky top={k.top} mid={k.mid} bottom={k.hz} />;
  switch (id) {
    case 'hero': {
      const rg = { base: 600, amp: 22, rough: 2, seed: 37 };
      return (
        <>
          <style>{KEYFRAMES}</style>
          {sky}
          <ArtLayer depth={0.04} hero order={0}>
            <ArtSvg>
              <Sun y={520} k={k} />
              <Clouds k={k} y={330} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.14} hero order={1}>
            <ArtSvg>
              <path d="M110 560 C 186 486, 234 430, 258 398 L 270 391 L 284 393 C 308 428, 352 488, 440 560 Z" fill={k.haze(0.74)} />
              <g fill={k.light}>
                {[0, 1, 2, 3].map((i) => (
                  <circle key={i} cx={272} cy={388} r={9} style={{ filter: 'blur(4px)', transformBox: 'fill-box', transformOrigin: 'center', animation: `lby-smoke 9s ease-out ${-i * 2.25}s infinite` }} />
                ))}
              </g>
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.26} hero order={2}>
            <ArtSvg>{ridge(k, { base: 560, amp: 26, rough: 2.2, seed: 11 }, 0.6)}</ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.4} hero order={3}>
            <ArtSvg>
              {ridge(k, rg, 0.42)}
              <g fill={k.haze(0.42)}>
                <path transform={`translate(108 ${ridgeY({ w: W, ...rg }, 108) + 3})`} d={candiPath(1)} />
                <path transform={`translate(150 ${ridgeY({ w: W, ...rg }, 150) + 3})`} d={candiPath(0.55)} />
              </g>
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'quote': {
      const rg = { base: 640, amp: 10, rough: 1.4, seed: 5 };
      return (
        <>
          {sky}
          <ArtLayer depth={0.04}>
            <ArtSvg>
              <Sun y={560} r={70} k={k} glow={240} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.18}>
            <ArtSvg>{ridge(k, { base: 610, amp: 22, rough: 2.4, seed: 19 }, 0.62)}</ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.36}>
            <ArtSvg>
              {ridge(k, rg, 0.3)}
              <g fill={k.haze(0.3)}>
                <path transform={`translate(200 ${ridgeY({ w: W, ...rg }, 200) + 4})`} d={candiPath(2.6)} />
                <path transform={`translate(110 ${ridgeY({ w: W, ...rg }, 110) + 4})`} d={candiPath(1.3)} />
                <path transform={`translate(292 ${ridgeY({ w: W, ...rg }, 292) + 4})`} d={candiPath(1.3)} />
                <path transform={`translate(52 ${ridgeY({ w: W, ...rg }, 52) + 4})`} d={candiPath(0.7)} />
                <path transform={`translate(350 ${ridgeY({ w: W, ...rg }, 350) + 4})`} d={candiPath(0.7)} />
              </g>
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'couple':
      return (
        <>
          {sky}
          <ArtLayer depth={0.04}>
            <ArtSvg>
              <Sun y={430} r={30} k={k} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.16}>
            <ArtSvg>
              {ridge(k, { base: 500, amp: 30, rough: 2.6, seed: 61 }, 0.6)}
              {ridge(k, { base: 530, amp: 18, rough: 1.8, seed: 67 }, 0.45)}
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.3}>
            <ArtSvg>
              <rect x={-40} y={540} width={480} height={300} fill={mix(k.hz, k.near, 0.32)} />
              <g stroke={k.light} strokeLinecap="round" opacity={0.8}>
                {Array.from({ length: 16 }, (_, i) => (
                  <line key={i} x1={200 - (30 - i * 1.4)} x2={200 + (30 - i * 1.4)} y1={552 + i * 14} y2={552 + i * 14} strokeWidth={2.2 - i * 0.1} style={{ animation: `lby-shimmer ${2 + (i % 3)}s ease-in-out ${-i * 0.3}s infinite` }} />
                ))}
              </g>
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'countdown': {
      const bands = [0, 1, 2, 3, 4, 5].map((i) => ({ base: 560 + i * 42, amp: 12 + i * 2, rough: 1.3 + i * 0.15, seed: 70 + i }));
      return (
        <>
          {sky}
          <ArtLayer depth={0.04}>
            <ArtSvg>
              <Sun y={520} r={40} k={k} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.15}>
            <ArtSvg>{ridge(k, { base: 540, amp: 34, rough: 2.4, seed: 83 }, 0.6)}</ArtSvg>
          </ArtLayer>
          {bands.map((b, i) => (
            <ArtLayer key={i} depth={0.25 + i * 0.1}>
              <ArtSvg>
                {ridge(k, b, 0.45 - i * 0.07)}
                <path d={ridgePath({ w: W, h: H, ...b }).replace(/ L \d+ 800 Z$/, '')} fill="none" stroke={k.light} strokeOpacity={0.55} strokeWidth={1.2} />
                {i === 2 && <path d={hut(300, ridgeY({ w: W, ...b }, 300) + 2, 1)} fill={k.haze(0.3)} stroke={k.haze(0.3)} />}
              </ArtSvg>
            </ArtLayer>
          ))}
        </>
      );
    }
    case 'events':
      return (
        <>
          {sky}
          <ArtLayer depth={0.04}>
            <ArtSvg>
              <Sun y={590} r={46} k={k} glow={220} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.12}>
            <ArtSvg>
              <path d="M250 592 C 280 560, 320 548, 360 556 C 390 562, 420 580, 440 592 Z" fill={k.haze(0.6)} />
              <rect x={330} y={520} width={8} height={40} fill={k.haze(0.6)} />
              <circle cx={334} cy={516} r={4} fill="#FFE6A6" style={{ animation: 'lby-flicker 2s ease-in-out infinite' }} />
              <rect x={-40} y={590} width={480} height={260} fill={mix(k.hz, k.near, 0.25)} />
            </ArtSvg>
          </ArtLayer>
          {[0, 1, 2].map((i) => (
            <ArtLayer key={i} depth={0.25 + i * 0.2}>
              <ArtSvg>
                <g style={{ animation: `lby-wave ${7 + i * 2}s ease-in-out ${-i}s infinite alternate` }}>
                  <path d={ridgePath({ w: W, h: H, base: 620 + i * 60, amp: 5 + i * 2, rough: 7 - i, seed: 90 + i })} fill={mix(k.hz, k.near, 0.35 + i * 0.18)} />
                </g>
                {i === 1 && (
                  <g style={{ animation: 'lby-bob 4s ease-in-out infinite' }}>
                    <path d={boat(120, 668)} fill={k.haze(0.18)} />
                  </g>
                )}
              </ArtSvg>
            </ArtLayer>
          ))}
        </>
      );
    case 'story': {
      const hill = { base: 640, amp: 24, rough: 1.6, seed: 101 };
      return (
        <>
          {sky}
          <ArtLayer depth={0.02}>
            <ArtSvg anchor="top">
              <Stars n={30} seed={4} opacity={0.35} maxY={300} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.14}>
            <ArtSvg>{ridge(k, { base: 560, amp: 30, rough: 2.4, seed: 97 }, 0.6)}</ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.36}>
            <ArtSvg>
              {ridge(k, hill, 0.38)}
              <path d="M196 640 C 186 660, 230 676, 214 700 C 196 728, 120 746, 150 800 L 250 800 C 236 760, 268 728, 240 700 C 222 682, 206 664, 204 640 Z" fill={mix(k.hz, '#FFFFFF', 0.12)} opacity={0.85} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.56}>
            <ArtSvg>
              <path d={treeRow({ base: 700, amp: 10, rough: 1.4, seed: 111 }, [26, 52, 92, 300, 330, 362, 388], 40, 74, 5)} fill={k.haze(0.18)} />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'gallery':
      return (
        <>
          {sky}
          <ArtLayer depth={0.02}>
            <ArtSvg anchor="top">
              <Stars n={50} seed={7} opacity={0.6} />
              <Moon x={334} y={165} r={14} />
            </ArtSvg>
          </ArtLayer>
          {[0, 1, 2, 3].map((i) => {
            const rg = { base: 560 + i * 60, amp: 14, rough: 1.6, seed: 120 + i };
            const xs = Array.from({ length: 14 }, (_, j) => j * 30 + ((i * 11) % 18));
            return (
              <ArtLayer key={i} depth={0.15 + i * 0.18}>
                <ArtSvg>
                  {ridge(k, rg, 0.55 - i * 0.15)}
                  <path d={treeRow(rg, xs, 40 + i * 14, 70 + i * 22, 130 + i)} fill={k.haze(0.55 - i * 0.15)} />
                </ArtSvg>
              </ArtLayer>
            );
          })}
          <ArtLayer depth={0.5}>
            <Fireflies n={22} seed={3} top={45} />
          </ArtLayer>
        </>
      );
    case 'gift':
      return (
        <>
          {sky}
          <ArtLayer depth={0.02}>
            <ArtSvg anchor="top">
              <Stars n={70} seed={8} />
              <Moon x={330} y={170} r={16} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.16}>
            <ArtSvg>
              {ridge(k, { base: 540, amp: 26, rough: 2.2, seed: 141 }, 0.55)}
              <rect x={-40} y={570} width={480} height={300} fill={mix(k.hz, k.near, 0.4)} />
              <g stroke="#F7EDD3" strokeLinecap="round" opacity={0.5}>
                {Array.from({ length: 10 }, (_, i) => (
                  <line key={i} x1={330 - (14 - i)} x2={330 + (14 - i)} y1={584 + i * 16} y2={584 + i * 16} strokeWidth={1.6} style={{ animation: `lby-shimmer ${2 + (i % 3)}s ease-in-out ${-i * 0.3}s infinite` }} />
                ))}
              </g>
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.35}>
            <Lanterns n={14} seed={21} />
          </ArtLayer>
        </>
      );
    case 'rsvp': {
      const village = { base: 640, amp: 20, rough: 1.8, seed: 151 };
      const h = houses(village, [40, 70, 96, 128, 270, 300, 334, 366]);
      return (
        <>
          {sky}
          <ArtLayer depth={0.02}>
            <ArtSvg anchor="top">
              <Stars n={90} seed={9} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.14}>
            <ArtSvg>{ridge(k, { base: 560, amp: 34, rough: 2.6, seed: 147 }, 0.55)}</ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.38}>
            <ArtSvg>
              {ridge(k, village, 0.32)}
              <path d={h.d} fill={k.haze(0.32)} />
              {h.wins.map((w, i) => (
                <rect key={i} x={w.x} y={w.y} width={4} height={4} fill="#FFD27A" style={{ animation: `lby-flicker ${1.5 + (i % 3) * 0.4}s ease-in-out infinite` }} />
              ))}
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.6}>
            <ArtSvg>{ridge(k, { base: 720, amp: 16, rough: 2, seed: 157 }, 0.14)}</ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'closing':
    default:
      return (
        <>
          {sky}
          <ArtLayer depth={0.02}>
            <ArtSvg anchor="top">
              <Stars n={100} seed={10} />
              <Moon x={336} y={160} r={18} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.14}>
            <ArtSvg>
              <path d="M110 600 C 186 526, 234 470, 258 438 L 270 431 L 284 433 C 308 468, 352 528, 440 600 Z" fill={k.haze(0.66)} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.3}>
            <Lanterns n={18} seed={31} />
          </ArtLayer>
          <ArtLayer depth={0.4}>
            <ArtSvg>{ridge(k, { base: 650, amp: 22, rough: 2, seed: 37 }, 0.3)}</ArtSvg>
          </ArtLayer>
        </>
      );
  }
}

/** Lapisan di DEPAN teks — membingkai, menutupi sebagian, dan melaju paling cepat. */
function Front({ id }: { id: SectionId }) {
  const k = palette(TIME[id]);
  const near = k.near;
  const grass = (seed: number, base = 770) => (
    <ArtSvg>
      <path d={ridgePath({ w: W, h: H, base, amp: 10, rough: 3, seed })} fill={near} />
    </ArtSvg>
  );
  switch (id) {
    case 'hero':
      return (
        <>
          <ArtLayer depth={0.7} hero order={4}>
            <ArtSvg>
              {ridge(k, { base: 690, amp: 24, rough: 3, seed: 41 }, 0.16)}
              <path d={treeRow({ base: 690, amp: 24, rough: 3, seed: 41 }, [14, 34, 300, 324, 352, 384], 36, 60, 2)} fill={k.haze(0.16)} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.9} hero order={5}>
            {grass(61, 760)}
          </ArtLayer>
          {HERO_PALMS.map((pl, i) => (
            <ArtLayer key={i} depth={1} hero order={6} exitX={i === 0 ? -0.6 : 0.6} origin={i === 0 ? '0% 100%' : '100% 100%'}>
              <ArtSvg>
                <g fill={near} stroke={near} strokeLinecap="round">
                  <path d={pl.trunk} stroke="none" />
                  <path d={pl.fronds} fill="none" strokeWidth={1.6} />
                </g>
              </ArtSvg>
            </ArtLayer>
          ))}
        </>
      );
    case 'quote':
      return (
        <>
          <ArtLayer depth={0.6}>
            <ArtSvg>
              <Birds x={40} y={300} color={near} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={1}>{grass(71, 770)}</ArtLayer>
        </>
      );
    case 'couple':
      return (
        <>
          <ArtLayer depth={0.85} exitX={-0.3}>
            <ArtSvg>
              <path d={cypress(14, 820, 330)} fill={near} />
              <path d={cypress(54, 830, 240)} fill={near} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.85} exitX={0.3}>
            <ArtSvg>
              <path d={cypress(388, 820, 300)} fill={near} />
              <path d={cypress(352, 830, 210)} fill={near} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={1}>
            <ArtSvg>
              <g stroke={near} strokeWidth={2} strokeLinecap="round" fill="none">
                {Array.from({ length: 26 }, (_, i) => {
                  const x = i < 13 ? i * 7 : 300 + (i - 13) * 8;
                  return <path key={i} d={`M${x} 820 Q ${x + 4} ${770 - (i % 5) * 8} ${x + 10 + (i % 3) * 4} ${730 - (i % 4) * 14}`} />;
                })}
              </g>
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'countdown':
      return (
        <ArtLayer depth={1}>
          <ArtSvg>
            <g stroke={near} strokeWidth={2.2} strokeLinecap="round" fill="none">
              {Array.from({ length: 40 }, (_, i) => {
                const x = (i / 40) * 420 - 10;
                const h = 40 + ((i * 37) % 50);
                return <path key={i} d={`M${x} 820 Q ${x + 6} ${800 - h / 2} ${x + 14} ${800 - h}`} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: `lby-grass ${3 + (i % 4)}s ease-in-out ${-i * 0.2}s infinite alternate` }} />;
              })}
            </g>
          </ArtSvg>
        </ArtLayer>
      );
    case 'events':
      return (
        <ArtLayer depth={1}>
          <ArtSvg>
            <g style={{ animation: 'lby-wave 6s ease-in-out infinite alternate' }}>
              <path d={ridgePath({ w: W, h: H, base: 780, amp: 8, rough: 5, seed: 99 })} fill={mix(k.hz, k.near, 0.85)} />
            </g>
          </ArtSvg>
        </ArtLayer>
      );
    case 'story':
      return (
        <>
          <ArtLayer depth={0.9}>
            <Fireflies n={14} seed={6} top={60} />
          </ArtLayer>
          <ArtLayer depth={1}>{grass(113, 776)}</ArtLayer>
        </>
      );
    case 'gallery':
      return (
        <>
          <ArtLayer depth={1} exitX={-0.25}>
            <ArtSvg>
              <rect x={-20} y={-100} width={34} height={1000} fill={near} />
              <path d="M14 120 C 60 140, 80 180, 70 230 C 40 200, 20 170, 14 160 Z" fill={near} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={1} exitX={0.25}>
            <ArtSvg>
              <rect x={380} y={-100} width={40} height={1000} fill={near} />
              <path d="M382 300 C 340 320, 320 360, 330 410 C 360 380, 376 350, 382 340 Z" fill={near} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.95}>
            <Fireflies n={10} seed={12} top={20} />
          </ArtLayer>
        </>
      );
    case 'gift':
      return (
        <ArtLayer depth={0.9}>
          <Lanterns n={6} seed={27} big edges />
        </ArtLayer>
      );
    case 'rsvp':
      return (
        <>
          <ArtLayer depth={0.95}>
            <Fireflies n={12} seed={15} top={55} />
          </ArtLayer>
          <ArtLayer depth={1}>{grass(161, 778)}</ArtLayer>
        </>
      );
    case 'closing':
    default:
      return (
        <>
          <ArtLayer depth={0.85}>
            <Lanterns n={6} seed={33} big edges />
          </ArtLayer>
          {HERO_PALMS.slice(0, 2).map((pl, i) => (
            <ArtLayer key={i} depth={1} origin={i === 0 ? '0% 100%' : '100% 100%'}>
              <ArtSvg>
                <g fill={near} stroke={near} strokeLinecap="round">
                  <path d={pl.trunk} stroke="none" />
                  <path d={pl.fronds} fill="none" strokeWidth={1.6} />
                </g>
              </ArtSvg>
            </ArtLayer>
          ))}
          <ArtLayer depth={0.95}>{grass(167, 784)}</ArtLayer>
        </>
      );
  }
}

const KEYFRAMES = `
  @keyframes lby-twinkle { 0%,100%{opacity:.25} 50%{opacity:1} }
  @keyframes lby-drift { from{transform:translateX(-50px)} to{transform:translateX(50px)} }
  @keyframes lby-smoke { 0%{transform:translate(0,0) scale(.6);opacity:0} 20%{opacity:.55} 100%{transform:translate(26px,-70px) scale(1.8);opacity:0} }
  @keyframes lby-rise { from{transform:translateY(0)} to{transform:translateY(-118vh)} }
  @keyframes lby-sway { 0%,100%{transform:translateX(-10px)} 50%{transform:translateX(10px)} }
  @keyframes lby-flock { from{transform:translate(-120px,30px)} to{transform:translate(480px,-60px)} }
  @keyframes lby-flap { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(-.6)} }
  @keyframes lby-flicker { 0%,100%{opacity:.8} 50%{opacity:1} }
  @keyframes lby-shimmer { 0%,100%{opacity:.25} 50%{opacity:1} }
  @keyframes lby-wave { from{transform:translateX(-14px)} to{transform:translateX(14px)} }
  @keyframes lby-bob { 0%,100%{transform:translateY(0) rotate(-1.5deg)} 50%{transform:translateY(5px) rotate(1.5deg)} }
  @keyframes lby-grass { from{transform:rotate(-3deg)} to{transform:rotate(4deg)} }
  @keyframes lby-firefly { 0%{transform:translate(0,0);opacity:.2} 50%{opacity:1} 100%{transform:translate(18px,-26px);opacity:.3} }
`;

export default function LembayungChapter({ id, layer }: { id: SectionId; layer: 'back' | 'front' }) {
  return layer === 'back' ? <Back id={id} /> : <Front id={id} />;
}

/** warna teks di atas ilustrasi tiap bab */
export const LEMBAYUNG_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: { color: '#3A1F33', shadow: '0 2px 18px rgba(255,236,210,.5)' },
  quote: { color: '#3A1F33' },
  couple: { color: '#3A1F33', shadow: '0 1px 12px rgba(255,230,200,.6)' },
  countdown: { color: '#FFF3E6', shadow: '0 2px 14px rgba(40,20,40,.45)' },
  events: { color: '#FFF3E6', shadow: '0 2px 14px rgba(40,20,40,.5)' },
  story: { color: '#FFF3E6', shadow: '0 2px 14px rgba(30,15,40,.5)' },
  gallery: { color: '#FFF3E6', shadow: '0 2px 14px rgba(20,10,40,.6)' },
  gift: { color: '#FFF3E6', shadow: '0 2px 14px rgba(10,10,40,.6)' },
  rsvp: { color: '#FFF3E6', shadow: '0 2px 14px rgba(10,10,40,.6)' },
  closing: { color: '#FDF3E7', shadow: '0 2px 16px rgba(0,0,0,.5)' },
};
