'use client';

/**
 * Panggung pembuka Grand Ballroom: dinding berpanel, jendela lengkung bercahaya dengan foto
 * berbingkai emas, lampu kristal yang berayun, lantai marmer memantul, dan tirai beludru
 * berlipit yang terbelah ke samping saat tamu mulai menggulir.
 */

import React from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer } from '../kit/chapters';
import { mix } from '../kit/scene';

const GOLD = '#D4B46A';
const GOLD_D = '#8C6A2E';
const GOLD_L = '#F6E3A8';

function Curtain({ side, velvet }: { side: 'left' | 'right'; velvet: string }) {
  const id = `gb-${side}`;
  const dark = mix(velvet, '#05070D', 0.55);
  const light = mix(velvet, '#FFFFFF', 0.12);
  // siluet tirai: lebar di atas, diikat di samping (y≈560), lalu jatuh ke lantai
  const d =
    side === 'left'
      ? 'M-30 0 L 190 0 C 186 140, 150 300, 70 520 C 60 548, 64 570, 76 600 C 92 680, 100 760, 96 820 L -30 820 Z'
      : 'M430 0 L 210 0 C 214 140, 250 300, 330 520 C 340 548, 336 570, 324 600 C 308 680, 300 760, 304 820 L 430 820 Z';
  const tie = side === 'left' ? { x: 70, y: 560 } : { x: 330, y: 560 };
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.45))' }}>
      <defs>
        <linearGradient id={`${id}-fold`} x1="0" x2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.35" stopColor={light} />
          <stop offset="0.55" stopColor={velvet} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <pattern id={`${id}-folds`} width="26" height="800" patternUnits="userSpaceOnUse" patternTransform={`skewX(${side === 'left' ? -6 : 6})`}>
          <rect width="26" height="800" fill={`url(#${id}-fold)`} />
        </pattern>
        <radialGradient id={`${id}-shade`} cx={side === 'left' ? '0.2' : '0.8'} cy="0.7" r="0.8">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${id}-folds)`} />
      <path d={d} fill={`url(#${id}-shade)`} />
      {/* tali pengikat & rumbai */}
      <path d={`M${tie.x - 34} ${tie.y - 8} Q ${tie.x} ${tie.y + 14} ${tie.x + 34} ${tie.y - 8}`} stroke={GOLD} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M${tie.x - 34} ${tie.y - 8} Q ${tie.x} ${tie.y + 14} ${tie.x + 34} ${tie.y - 8}`} stroke={GOLD_L} strokeWidth={1.5} fill="none" strokeDasharray="2 4" />
      <g transform={`translate(${tie.x} ${tie.y + 8})`}>
        <circle r={9} fill={GOLD} />
        <circle r={4} cx={-3} cy={-3} fill={GOLD_L} opacity={0.7} />
        <path d="M-8 6 L 8 6 L 12 52 L -12 52 Z" fill={GOLD_D} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-11 + i * 2.7} y1={10} x2={-12 + i * 3} y2={56} stroke={GOLD} strokeWidth={1.2} />
        ))}
      </g>
    </svg>
  );
}

function Valance({ velvet }: { velvet: string }) {
  const dark = mix(velvet, '#05070D', 0.5);
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" style={{ display: 'block', overflow: 'visible', filter: 'drop-shadow(0 12px 16px rgba(0,0,0,.5))' }}>
      <defs>
        <linearGradient id="gb-val" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.6" stopColor={velvet} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect x={-30} y={0} width={460} height={34} fill={dark} />
      {[-20, 70, 160, 250, 340].map((x) => (
        <g key={x}>
          <path d={`M${x} 30 Q ${x + 45} 110 ${x + 90} 30 L ${x + 90} 20 L ${x} 20 Z`} fill="url(#gb-val)" />
          <path d={`M${x} 30 Q ${x + 45} 110 ${x + 90} 30`} fill="none" stroke={GOLD} strokeWidth={2.2} />
          <path d={`M${x + 6} 40 Q ${x + 45} 100 ${x + 84} 40`} fill="none" stroke={mix(velvet, '#FFFFFF', 0.15)} strokeWidth={1} opacity={0.6} />
          <circle cx={x} cy={30} r={6} fill={GOLD} />
        </g>
      ))}
      <rect x={-30} y={30} width={460} height={3} fill={GOLD} opacity={0.8} />
    </svg>
  );
}

function Chandelier() {
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id="gb-glow">
          <stop offset="0" stopColor="#FFF1C9" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFF1C9" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gb-crystal" x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#CFE3FF" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '200px 0px', animation: 'gb-sway 7s ease-in-out infinite alternate' }}>
        <circle cx={200} cy={150} r={130} fill="url(#gb-glow)" style={{ animation: 'gb-flicker 3s ease-in-out infinite' }} />
        <line x1={200} y1={0} x2={200} y2={96} stroke={GOLD} strokeWidth={2} />
        {[-1, 1].map((s) =>
          [44, 78].map((w, i) => (
            <path key={`${s}${w}`} d={`M200 ${120 + i * 10} C ${200 + s * w * 0.4} ${150 + i * 10}, ${200 + s * w} ${150 + i * 6}, ${200 + s * w} ${126 + i * 8}`} fill="none" stroke={GOLD} strokeWidth={2.4} />
          ))
        )}
        <ellipse cx={200} cy={122} rx={18} ry={26} fill={GOLD} />
        <ellipse cx={194} cy={114} rx={5} ry={10} fill={GOLD_L} opacity={0.6} />
        {[-78, -44, 44, 78].map((dx) => (
          <g key={dx}>
            <rect x={200 + dx - 3} y={112} width={6} height={14} fill="#FFF6DD" />
            <ellipse cx={200 + dx} cy={108} rx={4} ry={7} fill="#FFE7A0" style={{ animation: 'gb-flicker 1.6s ease-in-out infinite' }} />
          </g>
        ))}
        {Array.from({ length: 15 }, (_, i) => {
          const x = 146 + i * 7.7;
          const y = 160 + Math.sin((i / 14) * Math.PI) * 28;
          return <path key={i} d={`M${x} ${y} l 3 8 l -3 8 l -3 -8 z`} fill="url(#gb-crystal)" opacity={0.9} />;
        })}
      </g>
    </svg>
  );
}

export default function BallroomStage({ palette: p, photo }: { palette: ThemePalette; photo?: string }) {
  const wall = mix(p.primary, '#070B16', 0.55);
  const velvet = mix(p.primary, '#1A0610', 0.25);
  return (
    <>
      <style>{`
        @keyframes gb-sway { from { transform: rotate(-1.4deg) } to { transform: rotate(1.4deg) } }
        @keyframes gb-flicker { 0%,100% { opacity: .85 } 50% { opacity: 1 } }
      `}</style>
      {/* dinding berpanel */}
      <ArtLayer depth={0.03} hero order={0}>
        <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="gb-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix(wall, '#000', 0.4)} />
              <stop offset="0.7" stopColor={wall} />
              <stop offset="1" stopColor={mix(wall, '#000', 0.3)} />
            </linearGradient>
            <radialGradient id="gb-window" cx="0.5" cy="0.45" r="0.6">
              <stop offset="0" stopColor="#FFF3D6" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#E9C98A" stopOpacity="0.25" />
              <stop offset="1" stopColor="#E9C98A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="800" fill="url(#gb-wall)" />
          {[30, 290].map((x) => (
            <g key={x} fill="none" stroke={GOLD} strokeOpacity={0.35}>
              <rect x={x} y={250} width={80} height={250} />
              <rect x={x + 8} y={258} width={64} height={234} />
            </g>
          ))}
          <ellipse cx={200} cy={420} rx={170} ry={230} fill="url(#gb-window)" />
          <path d="M110 640 V360 A90 90 0 0 1 290 360 V640" fill="none" stroke={GOLD} strokeOpacity={0.55} strokeWidth={3} />
        </svg>
      </ArtLayer>
      {/* foto berbingkai emas di jendela */}
      <ArtLayer depth={0.18} hero order={1}>
        <div style={{ position: 'absolute', left: '50%', bottom: '25%', width: '46%', maxWidth: 230, aspectRatio: '3 / 4', transform: 'translateX(-50%)', borderRadius: '50%', padding: 8, background: `conic-gradient(from 200deg, ${GOLD_D}, ${GOLD_L}, ${GOLD}, ${GOLD_D}, ${GOLD_L}, ${GOLD_D})`, boxShadow: '0 30px 60px -20px rgba(0,0,0,.7), 0 0 60px rgba(255,230,170,.25)' }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block', border: `3px solid ${GOLD_D}` }} />
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: wall }} />
          )}
        </div>
      </ArtLayer>
      {/* lantai marmer */}
      <ArtLayer depth={0.4} hero order={2}>
        <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="gb-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E9E2D3" />
              <stop offset="1" stopColor="#B9AE98" />
            </linearGradient>
          </defs>
          <path d="M-40 650 L 440 650 L 440 820 L -40 820 Z" fill="url(#gb-floor)" />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={200} y1={650} x2={-200 + i * 100} y2={820} stroke="#FFFFFF" strokeOpacity={0.45} />
          ))}
          {[680, 720, 775].map((y) => (
            <line key={y} x1={-40} x2={440} y1={y} y2={y} stroke="#FFFFFF" strokeOpacity={0.35} />
          ))}
          <ellipse cx={200} cy={690} rx={130} ry={18} fill="#FFF3D6" opacity={0.35} />
        </svg>
      </ArtLayer>
      {/* lampu kristal */}
      <ArtLayer depth={0.12} hero order={3}>
        <Chandelier />
      </ArtLayer>
      {/* tirai beludru — terbelah saat keluar dari pembuka */}
      <ArtLayer depth={0.75} hero order={4} exitX={-0.7} origin="0% 50%">
        <Curtain side="left" velvet={velvet} />
      </ArtLayer>
      <ArtLayer depth={0.75} hero order={4} exitX={0.7} origin="100% 50%">
        <Curtain side="right" velvet={velvet} />
      </ArtLayer>
      <ArtLayer depth={0.8} hero order={5}>
        <Valance velvet={velvet} />
      </ArtLayer>
    </>
  );
}
