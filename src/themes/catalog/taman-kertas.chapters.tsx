'use client';

/**
 * Taman Kertas — bab-bab adegan 2D bergaya buku pop-up.
 * Setiap bagian undangan adalah halaman pop-up kertas potong layar penuh:
 * gapura bunga → rumah kecil → pelangi & dua pohon → balon udara → tenda pesta →
 * jalan setapak → padang bunga → kado → pesawat kertas → malam berbintang gantung.
 * Lapisan kertas berdiri satu per satu saat halaman masuk layar, lalu bergeser
 * sesuai kedalamannya saat digulir.
 */

import React from 'react';
import type { SectionId } from '../types';
import { ridgePath, ridgeY, seeded } from '../kit/scene';
import { ArtLayer, ArtSvg, Sky } from '../kit/chapters';

const W = 400;
const H = 800;
const shadow = (d: number) => ({ filter: `drop-shadow(0 ${-2 - d * 3}px ${3 + d * 4}px rgba(90, 52, 66, ${0.14 + d * 0.08}))` });

const PAPER = {
  sun: '#F2C14E',
  cloud: '#FFFFFF',
  hills: ['#E4EDDC', '#C9DFC6', '#A9CBB0', '#F3CFC9', '#EBA9AE'],
  trunk: '#B98A6E',
  leaf: '#6E9C7F',
  leafVein: '#8DB89C',
  arch: '#FFFFFF',
  flower: ['#FFFFFF', '#F7D774', '#E07A8A', '#F4B6A9'],
};

const HILLS = [
  { base: 560, amp: 26, rough: 1.4, seed: 4, depth: 0.16 },
  { base: 610, amp: 22, rough: 1.8, seed: 9, depth: 0.3 },
  { base: 655, amp: 18, rough: 1.2, seed: 15, depth: 0.46 },
  { base: 705, amp: 20, rough: 2.0, seed: 21, depth: 0.64 },
  { base: 752, amp: 14, rough: 2.4, seed: 27, depth: 0.82 },
];


function cloud(x: number, y: number, s: number) {
  const r = 14 * s;
  return `M${x - 3 * r} ${y} a${r} ${r} 0 0 1 ${1.6 * r} ${-r * 0.7} a${r * 1.3} ${r * 1.3} 0 0 1 ${2.4 * r} ${-r * 0.5} a${r} ${r} 0 0 1 ${2 * r} ${r * 0.6} a${r * 0.8} ${r * 0.8} 0 0 1 ${0.6 * r} ${r * 0.6} Z`;
}

function flower(x: number, y: number, r: number) {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(a) * r * 0.62;
    const py = y + Math.sin(a) * r * 0.62;
    d += `M${(px + r * 0.5).toFixed(1)} ${py.toFixed(1)} a${r * 0.5} ${r * 0.5} 0 1 0 ${-r} 0 a${r * 0.5} ${r * 0.5} 0 1 0 ${r} 0 Z`;
  }
  return d;
}

function bigLeaf(x: number, y: number, len: number, angle: number) {
  const a = (angle * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * len * 0.32;
  const ny = Math.cos(a) * len * 0.32;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return {
    blade: `M${x} ${y} Q ${(mx + nx).toFixed(1)} ${(my + ny).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q ${(mx - nx).toFixed(1)} ${(my - ny).toFixed(1)} ${x} ${y} Z`,
    vein: `M${x} ${y} L ${tx.toFixed(1)} ${ty.toFixed(1)}`,
  };
}

type Sk = { top: string; bot: string; hills: string[] };
const SKIES: Record<SectionId, Sk> = {
  hero: { top: '#FBEDE3', bot: '#FDF6EE', hills: PAPER.hills },
  quote: { top: '#E4EFF1', bot: '#FBF6EE', hills: ['#E4EDDC', '#C9DFC6', '#A9CBB0', '#8DB89C'] },
  couple: { top: '#FDE6E1', bot: '#FFF6EE', hills: ['#F3CFC9', '#EBA9AE', '#C9DFC6', '#A9CBB0'] },
  countdown: { top: '#D9E9F2', bot: '#F7F2EA', hills: ['#E4EDDC', '#C9DFC6', '#A9CBB0', '#8DB89C'] },
  events: { top: '#FBE2D0', bot: '#FDF3EA', hills: ['#F6DCC0', '#EFC6A5', '#C9DFC6', '#A9CBB0'] },
  story: { top: '#F2E4D6', bot: '#FBF2E8', hills: ['#E9DCC6', '#D8C7A8', '#C9DFC6', '#9CC3A6'] },
  gallery: { top: '#ECE4F3', bot: '#FBF4EE', hills: ['#DCD3EA', '#C9DFC6', '#A9CBB0', '#8DB89C'] },
  gift: { top: '#F8DAD7', bot: '#FCEDE6', hills: ['#F3CFC9', '#EBA9AE', '#E07A8A', '#C9DFC6'] },
  rsvp: { top: '#E1E3F1', bot: '#F6EFEA', hills: ['#D5D9EC', '#C9DFC6', '#A9CBB0', '#8DB89C'] },
  closing: { top: '#262C55', bot: '#45497A', hills: ['#3B4170', '#323862', '#2A2F55', '#22274A'] },
};

const P = (d: number) => ({ ...shadow(d) });

/** Bukit kertas berlapis untuk sebuah bab (popup berurutan). */
function Hills({ sk, seed, from = 0, n = 4, base = 560, step = 58 }: { sk: Sk; seed: number; from?: number; n?: number; base?: number; step?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <ArtLayer key={i} depth={0.18 + i * 0.16} popup order={from + i}>
          <ArtSvg style={P(0.2 + i * 0.15)}>
            <path d={ridgePath({ w: W, h: H, base: base + i * step, amp: 18 + (i % 2) * 6, rough: 1.3 + i * 0.25, seed: seed + i })} fill={sk.hills[i % sk.hills.length]} />
          </ArtSvg>
        </ArtLayer>
      ))}
    </>
  );
}

function Clouds({ y = 220, color = PAPER.cloud }: { y?: number; color?: string }) {
  return (
    <g fill={color}>
      <path d={cloud(90, y, 1.1)} style={{ animation: 'tk-cloud 14s ease-in-out infinite alternate' }} />
      <path d={cloud(330, y + 110, 0.8)} style={{ animation: 'tk-cloud 18s ease-in-out -6s infinite alternate-reverse' }} />
      <path d={cloud(170, y + 190, 0.6)} style={{ animation: 'tk-cloud 16s ease-in-out -3s infinite alternate' }} />
    </g>
  );
}

function PaperSun({ x = 326, y = 140, r = 34 }: { x?: number; y?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} style={{ animation: 'tk-spin 40s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }}>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M0 ${-r - 12} L6 ${-r - 2} L-6 ${-r - 2} Z`} fill={PAPER.sun} transform={`rotate(${i * 30})`} />
      ))}
      <circle r={r} fill={PAPER.sun} />
      <circle r={r * 0.7} fill="#F6CF6B" />
    </g>
  );
}

function Tree({ x, y, h, r, c = '#7FAE8E' }: { x: number; y: number; h: number; r: number; c?: string }) {
  return (
    <g>
      <rect x={x - 3} y={y - h} width={6} height={h} fill={PAPER.trunk} />
      <circle cx={x} cy={y - h} r={r} fill={c} />
      <circle cx={x - r * 0.35} cy={y - h - r * 0.3} r={r * 0.35} fill="#A9CBB0" />
    </g>
  );
}

function Flowers({ y, n = 12, seed = 1, size = 9 }: { y: number; n?: number; seed?: number; size?: number }) {
  const r = seeded(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = (i + 0.5) * (W / n) + (r() - 0.5) * 14;
        const yy = y + r() * 18;
        const c = PAPER.flower[i % 4];
        return (
          <g key={i}>
            <rect x={x - 1} y={yy} width={2} height={30} fill={PAPER.leaf} />
            <path d={flower(x, yy, size + r() * 4)} fill={c} />
            <circle cx={x} cy={yy} r={3} fill={c === '#F7D774' ? '#E07A8A' : '#F7D774'} />
          </g>
        );
      })}
    </g>
  );
}

function Leaves({ side, exit = 0, hero = false, order = 6 }: { side: 'left' | 'right'; exit?: number; hero?: boolean; order?: number }) {
  const l = side === 'left';
  const set = l
    ? [bigLeaf(-10, 815, 160, -62), bigLeaf(-14, 800, 128, -30), bigLeaf(10, 822, 104, -86)]
    : [bigLeaf(410, 815, 160, -118), bigLeaf(414, 800, 124, -150), bigLeaf(392, 822, 100, -96)];
  return (
    <ArtLayer depth={1} popup={!hero} hero={hero} order={order} exitX={exit} origin={l ? '0% 100%' : '100% 100%'}>
      <ArtSvg style={P(1)}>
        {set.map((lf, i) => (
          <g key={i}>
            <path d={lf.blade} fill={i === 1 ? '#7FAE8E' : PAPER.leaf} />
            <path d={lf.vein} stroke={PAPER.leafVein} strokeWidth={1.5} fill="none" />
          </g>
        ))}
      </ArtSvg>
    </ArtLayer>
  );
}

function Balloon({ x, y, s, c1, c2, delay }: { x: number; y: number; s: number; c1: string; c2: string; delay: number }) {
  return (
    <g style={{ animation: `tk-float ${6 + s * 2}s ease-in-out ${delay}s infinite alternate` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M0 -40 C 26 -40, 30 -10, 14 8 L 6 18 L -6 18 L -14 8 C -30 -10, -26 -40, 0 -40 Z" fill={c1} />
        <path d="M0 -40 C 10 -40, 12 -10, 6 8 L 3 18 L -3 18 L -6 8 C -12 -10, -10 -40, 0 -40 Z" fill={c2} />
        <path d="M-6 18 L -5 28 M6 18 L 5 28" stroke="#B98A6E" strokeWidth={1} />
        <rect x={-6} y={28} width={12} height={9} rx={2} fill="#B98A6E" />
      </g>
    </g>
  );
}

function Bunting({ y = 60, colors = ['#E07A8A', '#F7D774', '#9CC3A6', '#F4B6A9'] }: { y?: number; colors?: string[] }) {
  const n = 14;
  return (
    <g>
      <path d={`M-10 ${y} Q 200 ${y + 50} 410 ${y}`} stroke="#B98A6E" strokeWidth={1.4} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const x = -10 + t * 420;
        const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 50) + t * t * y;
        return <path key={i} d={`M${x - 11} ${yy} L ${x + 11} ${yy} L ${x} ${yy + 24} Z`} fill={colors[i % colors.length]} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%', animation: `tk-flag ${2 + (i % 3) * 0.4}s ease-in-out ${-i * 0.2}s infinite alternate` }} />;
      })}
    </g>
  );
}

function PaperPlane({ x, y, s = 1, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g style={{ animation: `tk-plane 12s ease-in-out ${delay}s infinite alternate` }}>
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(-12)`}>
        <path d="M-60 6 Q -30 30 0 6" stroke="#C9A9B4" strokeWidth={1.2} strokeDasharray="3 5" fill="none" />
        <path d="M0 0 L 34 -10 L 8 10 Z" fill="#FFFFFF" />
        <path d="M8 10 L 34 -10 L 12 2 Z" fill="#E9E2EA" />
      </g>
    </g>
  );
}

function House({ x, y, lit = false }: { x: number; y: number; lit?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-34} y={-46} width={68} height={46} fill="#FFFDF9" />
      <path d="M-44 -44 L 0 -84 L 44 -44 Z" fill="#E07A8A" />
      <rect x={18} y={-80} width={10} height={22} fill="#C4566B" />
      <rect x={-8} y={-26} width={16} height={26} fill="#B98A6E" />
      <rect x={-26} y={-36} width={12} height={12} fill={lit ? '#FFD27A' : '#BFD8E6'} />
      <rect x={14} y={-36} width={12} height={12} fill={lit ? '#FFD27A' : '#BFD8E6'} />
    </g>
  );
}

function Fence({ y, from = 0, to = 400 }: { y: number; from?: number; to?: number }) {
  const n = Math.floor((to - from) / 16);
  return (
    <g fill="#FFFDF9">
      <rect x={from} y={y - 22} width={to - from} height={4} />
      <rect x={from} y={y - 10} width={to - from} height={4} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${from + i * 16 + 3} ${y} V${y - 30} L ${from + i * 16 + 8} ${y - 36} L ${from + i * 16 + 13} ${y - 30} V${y} Z`} />
      ))}
    </g>
  );
}

function Gift({ x, y, w, c, r }: { x: number; y: number; w: number; c: string; r: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - w * 0.8} width={w} height={w * 0.8} fill={c} />
      <rect x={x - w / 2 - 4} y={y - w * 0.8 - 12} width={w + 8} height={14} fill={c} />
      <rect x={x - 4} y={y - w * 0.8 - 12} width={8} height={w * 0.8 + 12} fill={r} />
      <path d={`M${x} ${y - w * 0.8 - 12} C ${x - 22} ${y - w - 26}, ${x - 26} ${y - w + 2}, ${x} ${y - w * 0.8 - 12} C ${x + 22} ${y - w - 26}, ${x + 26} ${y - w + 2}, ${x} ${y - w * 0.8 - 12} Z`} fill={r} />
    </g>
  );
}

const HERO_ARCH_Y = ridgeY({ w: W, ...HILLS[2] }, 200) + 4;

function Back({ id }: { id: SectionId }) {
  const sk = SKIES[id];
  const sky = <Sky top={sk.top} bottom={sk.bot} />;
  switch (id) {
    case 'hero':
      return (
        <>
          <style>{KEYFRAMES}</style>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <PaperSun />
              <Clouds />
            </ArtSvg>
          </ArtLayer>
          {HILLS.slice(0, 3).map((h, i) => (
            <ArtLayer key={i} depth={h.depth} hero order={i}>
              <ArtSvg style={P(h.depth)}>
                <path d={ridgePath({ w: W, h: H, ...h })} fill={PAPER.hills[i]} />
                {i === 2 && (
                  <g transform={`translate(200 ${HERO_ARCH_Y.toFixed(1)})`}>
                    <path d="M-46 0 V-70 A46 46 0 0 1 46 -70 V0 H36 V-70 A36 36 0 0 0 -36 -70 V0 Z" fill={PAPER.arch} />
                    {[
                      [-46, -70],
                      [-40, -96],
                      [-24, -112],
                      [0, -118],
                      [24, -112],
                      [40, -96],
                      [46, -70],
                      [-44, -40],
                      [44, -40],
                    ].map(([x, y], j) => (
                      <path key={j} d={flower(x, y, j % 2 ? 9 : 12)} fill={PAPER.flower[(j + 2) % 4]} />
                    ))}
                  </g>
                )}
              </ArtSvg>
            </ArtLayer>
          ))}
        </>
      );
    case 'quote':
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <Clouds y={150} />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={200} n={2} />
          <ArtLayer depth={0.5} popup order={2}>
            <ArtSvg style={P(0.5)}>
              <path d={ridgePath({ w: W, h: H, base: 690, amp: 14, rough: 1.2, seed: 205 })} fill={sk.hills[2]} />
              <House x={150} y={ridgeY({ w: W, base: 690, amp: 14, rough: 1.2, seed: 205 }, 150) + 6} />
              <g fill="#FFFFFF" opacity={0.9}>
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx={173} cy={604} r={6 + i * 2} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `tk-puff 6s ease-out ${-i * 2}s infinite` }} />
                ))}
              </g>
              <Tree x={260} y={ridgeY({ w: W, base: 690, amp: 14, rough: 1.2, seed: 205 }, 260) + 6} h={60} r={24} />
              <Tree x={300} y={ridgeY({ w: W, base: 690, amp: 14, rough: 1.2, seed: 205 }, 300) + 6} h={44} r={18} c="#8DB89C" />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'couple':
      return (
        <>
          {sky}
          <ArtLayer depth={0.06} popup order={0}>
            <ArtSvg style={P(0.3)}>
              {['#E07A8A', '#F4B6A9', '#F7D774', '#9CC3A6', '#BFD8E6'].map((c, i) => (
                <path key={c} d={`M${40 + i * 14} 620 A ${160 - i * 14} ${160 - i * 14} 0 0 1 ${360 - i * 14} 620`} stroke={c} strokeWidth={14} fill="none" />
              ))}
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={300} from={1} n={3} base={600} />
        </>
      );
    case 'countdown':
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <Clouds y={260} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.25}>
            <ArtSvg style={P(0.4)}>
              <Balloon x={80} y={360} s={1.1} c1="#E07A8A" c2="#F4B6A9" delay={0} />
              <Balloon x={310} y={300} s={1.4} c1="#9CC3A6" c2="#F7D774" delay={-2} />
              <Balloon x={220} y={470} s={0.8} c1="#F7D774" c2="#FFFFFF" delay={-4} />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={400} n={3} base={640} step={50} />
        </>
      );
    case 'events': {
      const rg = { base: 640, amp: 10, rough: 1.2, seed: 505 };
      const gy = ridgeY({ w: W, ...rg }, 200) + 6;
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <PaperSun x={80} y={170} r={28} />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={500} n={2} base={590} />
          <ArtLayer depth={0.5} popup order={2}>
            <ArtSvg style={P(0.5)}>
              <path d={ridgePath({ w: W, h: H, ...rg })} fill={sk.hills[2]} />
              <g transform={`translate(200 ${gy.toFixed(1)})`}>
                <path d="M-80 -70 L 0 -128 L 80 -70 Z" fill="#E07A8A" />
                <path d="M-80 -70 Q -66 -58 -53 -70 Q -40 -58 -27 -70 Q -13 -58 0 -70 Q 13 -58 27 -70 Q 40 -58 53 -70 Q 66 -58 80 -70 Z" fill="#F4B6A9" />
                <rect x={-72} y={-70} width={7} height={70} fill="#FFFDF9" />
                <rect x={65} y={-70} width={7} height={70} fill="#FFFDF9" />
                <rect x={-4} y={-70} width={7} height={70} fill="#FFFDF9" />
                <path d="M-72 -58 Q -36 -40 0 -58 Q 36 -40 72 -58" stroke="#F7D774" strokeWidth={1.2} fill="none" />
                {[-60, -42, -24, 0, 24, 42, 60].map((x, i) => (
                  <circle key={i} cx={x} cy={-50 + Math.abs(x) * -0.1 + (Math.abs(x) < 30 ? 6 : 0)} r={3} fill="#FFE6A6" style={{ animation: `tk-bulb ${1.6 + (i % 3) * 0.4}s ease-in-out ${-i * 0.3}s infinite` }} />
                ))}
              </g>
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'story':
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <Clouds y={200} />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={600} n={2} base={590} />
          <ArtLayer depth={0.55} popup order={2}>
            <ArtSvg style={P(0.5)}>
              <path d={ridgePath({ w: W, h: H, base: 680, amp: 12, rough: 1.2, seed: 610 })} fill={sk.hills[2]} />
              <path d="M196 676 C 180 700, 236 712, 222 736 C 206 764, 140 774, 150 820 L 262 820 C 252 780, 286 752, 252 724 C 232 708, 212 696, 206 676 Z" fill="#F6E7D2" />
              {[
                [204, 690, 6],
                [214, 716, 8],
                [196, 746, 10],
                [176, 778, 12],
              ].map(([x, y, r], i) => (
                <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r * 0.7} fill="#D8C7A8" />
              ))}
              <Fence y={ridgeY({ w: W, base: 680, amp: 12, rough: 1.2, seed: 610 }, 60) + 8} from={0} to={130} />
              <Fence y={ridgeY({ w: W, base: 680, amp: 12, rough: 1.2, seed: 610 }, 330) + 8} from={280} to={410} />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'gallery':
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <Clouds y={180} />
            </ArtSvg>
          </ArtLayer>
          {[0, 1, 2].map((i) => (
            <ArtLayer key={i} depth={0.2 + i * 0.2} popup order={i}>
              <ArtSvg style={P(0.2 + i * 0.2)}>
                <path d={ridgePath({ w: W, h: H, base: 600 + i * 66, amp: 16, rough: 1.5, seed: 700 + i })} fill={sk.hills[i]} />
                <Flowers y={584 + i * 66} n={10 + i * 2} seed={710 + i} size={6 + i * 3} />
              </ArtSvg>
            </ArtLayer>
          ))}
        </>
      );
    case 'gift': {
      const rg = { base: 660, amp: 12, rough: 1.2, seed: 805 };
      const y = (x: number) => ridgeY({ w: W, ...rg }, x) + 6;
      return (
        <>
          {sky}
          <ArtLayer depth={0.05}>
            <ArtSvg style={P(0.2)}>
              <Clouds y={210} color="#FFF7F4" />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={800} n={2} base={600} />
          <ArtLayer depth={0.5} popup order={2}>
            <ArtSvg style={P(0.5)}>
              <path d={ridgePath({ w: W, h: H, ...rg })} fill={sk.hills[3]} />
              <Gift x={80} y={y(80)} w={54} c="#F4B6A9" r="#C4566B" />
              <Gift x={140} y={y(140)} w={36} c="#9CC3A6" r="#F7D774" />
              <Gift x={300} y={y(300)} w={46} c="#F7D774" r="#E07A8A" />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'rsvp': {
      const rg = { base: 670, amp: 12, rough: 1.2, seed: 905 };
      const my = ridgeY({ w: W, ...rg }, 320) + 6;
      return (
        <>
          {sky}
          <ArtLayer depth={0.3}>
            <ArtSvg style={P(0.3)}>
              <PaperPlane x={60} y={260} delay={0} />
              <PaperPlane x={250} y={180} s={0.8} delay={-4} />
              <PaperPlane x={150} y={420} s={0.65} delay={-8} />
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={900} n={2} base={610} />
          <ArtLayer depth={0.5} popup order={2}>
            <ArtSvg style={P(0.5)}>
              <path d={ridgePath({ w: W, h: H, ...rg })} fill={sk.hills[2]} />
              <rect x={318} y={my - 70} width={6} height={70} fill="#B98A6E" />
              <path d={`M300 ${my - 70} h40 v-22 a20 20 0 0 0 -40 0 Z`} fill="#E07A8A" />
              <rect x={338} y={my - 108} width={4} height={22} fill="#C4566B" />
              <rect x={342} y={my - 108} width={12} height={8} fill="#C4566B" />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    }
    case 'closing':
    default:
      return (
        <>
          {sky}
          <ArtLayer depth={0.03}>
            <ArtSvg anchor="top">
              {Array.from({ length: 40 }, (_, i) => {
                const r = seeded(1000 + i);
                return <circle key={i} cx={r() * W} cy={r() * 420} r={1 + r() * 1.4} fill="#FFF6E0" style={{ animation: `tk-twinkle ${2 + r() * 3}s ease-in-out ${-r() * 3}s infinite` }} />;
              })}
            </ArtSvg>
          </ArtLayer>
          <Hills sk={sk} seed={1100} n={3} base={600} />
          <ArtLayer depth={0.7} popup order={3}>
            <ArtSvg style={P(0.6)}>
              <path d={ridgePath({ w: W, h: H, base: 760, amp: 12, rough: 1.4, seed: 1110 })} fill={sk.hills[3]} />
              <House x={290} y={ridgeY({ w: W, base: 760, amp: 12, rough: 1.4, seed: 1110 }, 290) + 6} lit />
            </ArtSvg>
          </ArtLayer>
        </>
      );
  }
}

function Front({ id }: { id: SectionId }) {
  const sk = SKIES[id];
  switch (id) {
    case 'hero':
      return (
        <>
          {HILLS.slice(3).map((h, i) => (
            <ArtLayer key={i} depth={h.depth} hero order={3 + i}>
              <ArtSvg style={P(h.depth)}>
                <path d={ridgePath({ w: W, h: H, ...h })} fill={PAPER.hills[3 + i]} />
                {i === 0 &&
                  [28, 70, 318, 356, 386].map((x, j) => <Tree key={j} x={x} y={ridgeY({ w: W, ...h }, x) + 4} h={46 + ((j * 17) % 26)} r={15 + ((j * 7) % 8)} c={j % 2 ? '#8DB89C' : '#7FAE8E'} />)}
                {i === 1 && <Flowers y={ridgeY({ w: W, ...h }, 200) - 10} n={14} seed={33} />}
              </ArtSvg>
            </ArtLayer>
          ))}
          <Leaves side="left" hero exit={-0.6} />
          <Leaves side="right" hero exit={0.6} />
        </>
      );
    case 'quote':
      return (
        <ArtLayer depth={0.95} popup order={3}>
          <ArtSvg style={P(0.8)}>
            <path d={ridgePath({ w: W, h: H, base: 770, amp: 10, rough: 2, seed: 210 })} fill={sk.hills[3]} />
            <Flowers y={752} n={14} seed={211} />
          </ArtSvg>
        </ArtLayer>
      );
    case 'couple':
      return (
        <>
          <ArtLayer depth={0.9} popup order={4} exitX={-0.3} origin="0% 100%">
            <ArtSvg style={P(0.8)}>
              <Tree x={30} y={830} h={190} r={70} />
              <circle cx={10} cy={600} r={40} fill="#8DB89C" />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={0.9} popup order={4} exitX={0.3} origin="100% 100%">
            <ArtSvg style={P(0.8)}>
              <Tree x={372} y={830} h={160} r={60} c="#8DB89C" />
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i} d={flower(340 + i * 14, 640 + (i % 2) * 20, 9)} fill={PAPER.flower[(i + 2) % 4]} />
              ))}
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'countdown':
      return <Leaves side="right" order={4} />;
    case 'events':
      return (
        <>
          <ArtLayer depth={0.8} popup order={3}>
            <ArtSvg anchor="top" style={P(0.6)}>
              <Bunting y={40} />
            </ArtSvg>
          </ArtLayer>
          <ArtLayer depth={1} popup order={4}>
            <ArtSvg style={P(0.8)}>
              <path d={ridgePath({ w: W, h: H, base: 780, amp: 8, rough: 2, seed: 520 })} fill={sk.hills[3]} />
              <Flowers y={764} n={12} seed={521} size={8} />
            </ArtSvg>
          </ArtLayer>
        </>
      );
    case 'story':
      return (
        <>
          <Leaves side="left" order={4} />
        </>
      );
    case 'gallery':
      return (
        <ArtLayer depth={1} popup order={4}>
          <ArtSvg style={P(0.9)}>
            <path d={ridgePath({ w: W, h: H, base: 790, amp: 8, rough: 2, seed: 730 })} fill={sk.hills[3]} />
            <Flowers y={770} n={8} seed={731} size={15} />
          </ArtSvg>
        </ArtLayer>
      );
    case 'gift':
      return (
        <ArtLayer depth={0.7}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 22 }, (_, i) => {
              const r = seeded(840 + i);
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${i % 2 ? 88 + r() * 10 : r() * 10}%`,
                    top: '-6%',
                    width: 8,
                    height: 12,
                    background: PAPER.flower[i % 4] === '#FFFFFF' ? '#9CC3A6' : PAPER.flower[i % 4],
                    boxShadow: '0 2px 3px rgba(90,52,66,.18)',
                    animation: `tk-confetti ${7 + r() * 6}s linear ${-r() * 12}s infinite`,
                  }}
                />
              );
            })}
          </div>
        </ArtLayer>
      );
    case 'rsvp':
      return <Leaves side="right" order={4} />;
    case 'closing':
    default:
      return (
        <ArtLayer depth={0.6} popup order={4} origin="50% 0%">
          <ArtSvg anchor="top" style={P(0.4)}>
            {[
              [60, 120, 'moon'],
              [140, 70, 'star'],
              [230, 150, 'star'],
              [320, 90, 'star'],
              [370, 170, 'star'],
            ].map(([x, len, kind], i) => (
              <g key={i} style={{ transformBox: 'view-box', transformOrigin: `${x}px 0px`, animation: `tk-hang ${3 + i * 0.4}s ease-in-out ${-i}s infinite alternate` }}>
                <line x1={x as number} y1={0} x2={x as number} y2={len as number} stroke="#C9C3D9" strokeWidth={1} />
                {kind === 'moon' ? (
                  <g transform={`translate(${x} ${(len as number) + 24})`}>
                    <circle r={24} fill="#F7E7B4" />
                    <circle r={22} cx={10} cy={-6} fill="#262C55" />
                  </g>
                ) : (
                  <path transform={`translate(${x} ${(len as number) + 12})`} d="M0 -12 L3.5 -4 L12 -3.5 L5.5 2 L7.5 10.5 L0 6 L-7.5 10.5 L-5.5 2 L-12 -3.5 L-3.5 -4 Z" fill="#F7D774" />
                )}
              </g>
            ))}
          </ArtSvg>
        </ArtLayer>
      );
  }
}

const KEYFRAMES = `
  @keyframes tk-cloud { from{transform:translateX(-30px)} to{transform:translateX(30px)} }
  @keyframes tk-spin { to{transform:rotate(360deg)} }
  @keyframes tk-float { from{transform:translateY(10px)} to{transform:translateY(-22px)} }
  @keyframes tk-flag { from{transform:rotate(-6deg)} to{transform:rotate(6deg)} }
  @keyframes tk-plane { from{transform:translate(0,0)} to{transform:translate(70px,-30px)} }
  @keyframes tk-puff { 0%{transform:translate(0,0) scale(.5);opacity:0} 20%{opacity:.9} 100%{transform:translate(14px,-60px) scale(1.6);opacity:0} }
  @keyframes tk-bulb { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes tk-confetti { from{transform:translateY(0) rotate(0)} to{transform:translateY(115vh) rotate(540deg)} }
  @keyframes tk-hang { from{transform:rotate(-4deg)} to{transform:rotate(4deg)} }
  @keyframes tk-twinkle { 0%,100%{opacity:.3} 50%{opacity:1} }
`;

export default function TamanChapter({ id, layer }: { id: SectionId; layer: 'back' | 'front' }) {
  return layer === 'back' ? <Back id={id} /> : <Front id={id} />;
}

const DARK = { color: '#4E3742', shadow: '0 1px 0 rgba(255,255,255,.7)' };
export const TAMAN_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: DARK,
  quote: DARK,
  couple: DARK,
  countdown: DARK,
  events: DARK,
  story: DARK,
  gallery: DARK,
  gift: DARK,
  rsvp: DARK,
  closing: { color: '#FFF6E8', shadow: '0 2px 12px rgba(10,10,40,.5)' },
};
