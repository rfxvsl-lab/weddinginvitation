'use client';

import React, { useMemo, useRef } from 'react';
import type { ThemePalette } from '../types';
import { Layer, keyframeColors, ridgePath, ridgeY, seeded, smooth, useScene } from '../kit/scene';

/**
 * Taman Kertas — tema Spesial 2D paralaks bergaya buku pop-up.
 * Lapisan kertas potong (bukit, pohon, gapura bunga, bunga, daun) dengan bayangan
 * di antaranya. Saat sampul dibuka, lapisan berdiri satu per satu seperti halaman
 * pop-up; saat digulir, tiap lapisan bergeser sesuai kedalamannya.
 */

const W = 400;
const H = 800;
const svgProps = { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMax slice', width: '100%', height: '100%', style: { display: 'block', overflow: 'visible' } } as const;
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

const SKY: [number, Record<'top' | 'bot', string>][] = [
  [0, { top: '#FBEDE3', bot: '#FDF6EE' }],
  [0.6, { top: '#F8DCD3', bot: '#FCEBDF' }],
  [1, { top: '#E7D3E6', bot: '#F8E3DA' }],
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

export default function PaperBackdrop({ palette }: { palette: ThemePalette }) {
  const sky = useRef<HTMLDivElement>(null);
  const sun = useRef<SVGGElement>(null);

  const geo = useMemo(() => {
    const r = seeded(12);
    const archBaseY = ridgeY({ w: W, ...HILLS[2] }, 200) + 4;
    const trees = [28, 70, 318, 356, 386].map((x, i) => {
      const y = ridgeY({ w: W, ...HILLS[3] }, x) + 4;
      const h = 46 + ((i * 17) % 26);
      return { x, y, h, rr: 15 + ((i * 7) % 8) };
    });
    const flowers = Array.from({ length: 16 }, (_, i) => {
      const x = 8 + i * 25 + r() * 10;
      return { x, y: ridgeY({ w: W, ...HILLS[4] }, x) + 6 + r() * 14, r: 7 + r() * 6, c: PAPER.flower[i % 4] };
    });
    const leaves = [
      bigLeaf(-10, 805, 150, -62),
      bigLeaf(-14, 790, 120, -30),
      bigLeaf(10, 812, 100, -86),
      bigLeaf(410, 805, 150, -118),
      bigLeaf(414, 792, 118, -150),
      bigLeaf(392, 812, 96, -96),
    ];
    return { archBaseY, trees, flowers, leaves, hills: HILLS.map((h) => ridgePath({ w: W, h: H, ...h })) };
  }, []);

  useScene((s) => {
    const k = keyframeColors(SKY, s.progress);
    if (sky.current) sky.current.style.background = `linear-gradient(180deg, ${k.top}, ${k.bot})`;
    sun.current?.setAttribute('transform', `translate(326 ${(128 + smooth(0.3, 1, s.progress) * 300).toFixed(1)})`);
  });

  const ay = geo.archBaseY;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <style>{`
        @keyframes tk-cloud { from{transform:translateX(-30px)} to{transform:translateX(30px)} }
        @keyframes tk-flutter { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(.25)} }
        @keyframes tk-path { 0%{transform:translate(0,0)} 25%{transform:translate(60px,-30px)} 50%{transform:translate(130px,10px)} 75%{transform:translate(60px,40px)} 100%{transform:translate(0,0)} }
      `}</style>
      <div ref={sky} style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${SKY[0][1].top}, ${SKY[0][1].bot})` }} />

      {/* matahari & awan kertas — tidak ikut pop-up */}
      <Layer depth={0.06} noIntro>
        <svg {...svgProps} style={{ ...svgProps.style, ...shadow(0.2) }}>
          <g ref={sun} transform="translate(326 128)">
            <circle r={34} fill={PAPER.sun} />
            <circle r={24} fill="#F6CF6B" />
          </g>
          <g fill={PAPER.cloud}>
            <path d={cloud(90, 210, 1.1)} style={{ animation: 'tk-cloud 14s ease-in-out infinite alternate' }} />
            <path d={cloud(330, 330, 0.8)} style={{ animation: 'tk-cloud 18s ease-in-out -6s infinite alternate-reverse' }} />
            <path d={cloud(150, 400, 0.65)} style={{ animation: 'tk-cloud 16s ease-in-out -3s infinite alternate' }} />
          </g>
        </svg>
      </Layer>

      {/* kupu-kupu kertas */}
      <Layer depth={0.4} noIntro>
        <svg {...svgProps}>
          {[
            [70, 470, 0, '#E07A8A'],
            [250, 430, -4, '#F7D774'],
          ].map(([x, y, delay, c], i) => (
            <g key={i} style={{ animation: `tk-path ${16 + i * 5}s ease-in-out ${delay}s infinite` }}>
              <g transform={`translate(${x} ${y})`}>
                <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `tk-flutter ${0.35 + i * 0.08}s ease-in-out infinite` }}>
                  <path d="M0 0 C -10 -12, -16 -2, -10 4 C -14 10, -4 12, 0 4 C 4 12, 14 10, 10 4 C 16 -2, 10 -12, 0 0 Z" fill={c as string} />
                </g>
              </g>
            </g>
          ))}
        </svg>
      </Layer>

      {/* bukit berlapis */}
      {geo.hills.map((d, i) => (
        <Layer key={i} depth={HILLS[i].depth} order={i}>
          <svg {...svgProps} style={{ ...svgProps.style, ...shadow(HILLS[i].depth) }}>
            <g fill={PAPER.hills[i]}>
              <path d={d} />
              {i === 2 && (
                <g transform={`translate(200 ${ay.toFixed(1)})`}>
                  {/* gapura bunga */}
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
                  {[
                    [-30, -104],
                    [30, -104],
                    [-50, -56],
                    [50, -56],
                  ].map(([x, y], j) => (
                    <ellipse key={j} cx={x} cy={y} rx={9} ry={4} transform={`rotate(${x < 0 ? -40 : 40} ${x} ${y})`} fill={PAPER.leaf} />
                  ))}
                </g>
              )}
              {i === 3 &&
                geo.trees.map((t, j) => (
                  <g key={j}>
                    <rect x={t.x - 2.5} y={t.y - t.h} width={5} height={t.h} fill={PAPER.trunk} />
                    <circle cx={t.x} cy={t.y - t.h} r={t.rr} fill={j % 2 ? '#8DB89C' : '#7FAE8E'} />
                    <circle cx={t.x - t.rr * 0.35} cy={t.y - t.h - t.rr * 0.3} r={t.rr * 0.35} fill="#A9CBB0" />
                  </g>
                ))}
              {i === 4 &&
                geo.flowers.map((f, j) => (
                  <g key={j}>
                    <path d={flower(f.x, f.y, f.r)} fill={f.c} />
                    <circle cx={f.x} cy={f.y} r={f.r * 0.28} fill={f.c === '#F7D774' ? '#E07A8A' : '#F7D774'} />
                  </g>
                ))}
            </g>
          </svg>
        </Layer>
      ))}

      {/* bingkai daun besar di depan */}
      <Layer depth={1} order={5}>
        <svg {...svgProps} style={{ ...svgProps.style, ...shadow(1) }}>
          {geo.leaves.map((l, i) => (
            <g key={i}>
              <path d={l.blade} fill={i % 3 === 1 ? '#7FAE8E' : PAPER.leaf} />
              <path d={l.vein} stroke={PAPER.leafVein} strokeWidth={1.5} fill="none" />
            </g>
          ))}
        </svg>
      </Layer>

      {/* serat kertas */}
      <svg aria-hidden width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.22, mixBlendMode: 'multiply' }}>
        <filter id="tk-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0.55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tk-grain)" />
      </svg>
      <span hidden>{palette.primary}</span>
    </div>
  );
}


