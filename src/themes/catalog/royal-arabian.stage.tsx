'use client';

/**
 * Panggung pembuka Royal Arabian Night: langit malam cat air dengan bulan sabit,
 * tiga lapis gerbang mihrab berukir pola bintang delapan berlapis emas, lentera
 * yang berayun, dan foto mempelai di gerbang tengah.
 */

import React from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer } from '../kit/chapters';
import { mix } from '../kit/scene';

const GOLD = '#D7B86D';
const GOLD_D = '#8C6A2E';
const GOLD_L = '#F6E3A8';

/** Lengkung runcing (ogee) selebar w, tinggi h, alas di (cx, y). */
function ogee(cx: number, y: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const spring = y - h * 0.58;
  return `M${l} ${y} V${spring} C ${l} ${spring - h * 0.28}, ${cx - w * 0.12} ${y - h * 0.86}, ${cx} ${y - h} C ${cx + w * 0.12} ${y - h * 0.86}, ${r} ${spring - h * 0.28}, ${r} ${spring} V${y}`;
}

function StarPattern({ id, color }: { id: string; color: string }) {
  return (
    <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
      <g fill="none" stroke={color} strokeWidth="0.9">
        <path d="M18 2 L22 14 L34 18 L22 22 L18 34 L14 22 L2 18 L14 14 Z" />
        <rect x="9" y="9" width="18" height="18" transform="rotate(45 18 18)" />
        <circle cx="18" cy="18" r="3" />
      </g>
    </pattern>
  );
}

function Gate({ w, h, wall, photo, pid }: { w: number; h: number; wall: string; photo?: string; pid: string }) {
  const outer = ogee(200, 800, w, h);
  const inner = ogee(200, 800, w - 34, h - 26);
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,.45))' }}>
      <defs>
        <linearGradient id={`${pid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={GOLD_L} />
          <stop offset="0.45" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD_D} />
        </linearGradient>
        <StarPattern id={`${pid}-star`} color={GOLD} />
        {photo && (
          <clipPath id={`${pid}-clip`}>
            <path d={`${inner} Z`} />
          </clipPath>
        )}
      </defs>
      {/* dinding berukir di sekitar gerbang */}
      <path d={`M-40 ${800 - h * 0.62} H440 V820 H-40 Z M${outer.slice(1)} Z`} fill={wall} fillRule="evenodd" />
      <path d={`M-40 ${800 - h * 0.62} H440 V820 H-40 Z M${outer.slice(1)} Z`} fill={`url(#${pid}-star)`} fillRule="evenodd" opacity={0.35} />
      {photo ? (
        <image href={photo} x={200 - w / 2} y={800 - h} width={w} height={h} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${pid}-clip)`} />
      ) : null}
      <path d={outer} fill="none" stroke={`url(#${pid}-gold)`} strokeWidth={9} />
      <path d={inner} fill="none" stroke={`url(#${pid}-gold)`} strokeWidth={3} />
      <path d={outer} fill="none" stroke={GOLD_L} strokeWidth={1} strokeDasharray="1 6" opacity={0.8} />
      <circle cx={200} cy={800 - h - 10} r={7} fill={`url(#${pid}-gold)`} />
    </svg>
  );
}

function Lantern({ x, len, s = 1, delay = 0 }: { x: string; len: number; s?: number; delay?: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: 0, transformOrigin: '50% 0', animation: `ra-swing ${4 + s}s ease-in-out ${delay}s infinite alternate` }}>
      <div style={{ width: 1.5, height: len, margin: '0 auto', background: GOLD }} />
      <svg width={42 * s} viewBox="0 0 42 80" style={{ display: 'block', overflow: 'visible', marginTop: -1 }}>
        <defs>
          <radialGradient id={`ra-l-${x}`}>
            <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFB347" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={21} cy={44} r={38} fill={`url(#ra-l-${x})`} style={{ animation: 'ra-glow 2.4s ease-in-out infinite' }} />
        <path d="M21 0 L 27 8 L 15 8 Z" fill={GOLD} />
        <path d="M12 10 H30 L 38 30 C 40 46, 34 58, 21 66 C 8 58, 2 46, 4 30 Z" fill="#3B2A10" stroke={GOLD} strokeWidth={1.6} />
        <path d="M14 18 H28 L 33 32 C 34 44, 29 53, 21 58 C 13 53, 8 44, 9 32 Z" fill="#FFD98A" opacity={0.85} />
        <path d="M21 18 V58 M12 32 H30" stroke={GOLD_D} strokeWidth={1.2} />
        <path d="M17 66 H25 L 21 78 Z" fill={GOLD} />
      </svg>
    </div>
  );
}

export default function ArabianStage({ palette: p, photo }: { palette: ThemePalette; photo?: string }) {
  const wall = mix(p.bg, '#000000', 0.15);
  const wall2 = mix(p.bg, '#000000', 0.32);
  return (
    <>
      <style>{`
        @keyframes ra-swing { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
        @keyframes ra-glow { 0%,100% { opacity: .75 } 50% { opacity: 1 } }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, background: p.bg }} />
      <ArtLayer depth={0.03} hero order={0}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/art/wc-night.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'hue-rotate(-25deg) saturate(.9)' }} />
      </ArtLayer>
      <ArtLayer depth={0.16} hero order={1}>
        <Gate w={300} h={470} wall={wall2} pid="ra-g3" />
      </ArtLayer>
      <ArtLayer depth={0.32} hero order={2}>
        <Gate w={220} h={380} wall={wall} pid="ra-g2" photo={photo} />
      </ArtLayer>
      <ArtLayer depth={0.55} hero order={3}>
        <Lantern x="12%" len={150} s={1.1} />
        <Lantern x="78%" len={110} s={0.9} delay={-1.2} />
        <Lantern x="62%" len={60} s={0.6} delay={-2} />
      </ArtLayer>
    </>
  );
}
