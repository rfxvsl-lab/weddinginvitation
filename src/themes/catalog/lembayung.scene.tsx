'use client';

import React, { useMemo, useRef } from 'react';
import type { ThemePalette } from '../types';
import { Layer, keyframeColors, mix, ridgePath, ridgeY, seeded, smooth, useScene } from '../kit/scene';

/**
 * Lembayung — tema Spesial 2.5D.
 * Lanskap berlapis (gunung api, punggung bukit, candi, pohon, nyiur) dengan
 * perspektif udara. Menggulir undangan = waktu berjalan dari senja keemasan,
 * lembayung, hingga malam berbintang dengan lampion yang naik. Giroskop/kursor
 * menggeser lapisan sesuai kedalaman; membuka sampul = kamera maju (dolly).
 */

const W = 400;
const H = 800;

// keyframe warna langit sepanjang undangan
const SKY: [number, Record<'top' | 'mid' | 'hz' | 'sun' | 'near', string>][] = [
  [0, { top: '#E9A178', mid: '#F4C08F', hz: '#FBE3BD', sun: '#FFF3DA', near: '#5B3241' }],
  [0.3, { top: '#D9826F', mid: '#EFA27F', hz: '#F9CFA0', sun: '#FFE2B4', near: '#4E2A3D' }],
  [0.55, { top: '#7D4E7E', mid: '#C66E80', hz: '#F09A7C', sun: '#FFBE8E', near: '#3A2038' }],
  [0.78, { top: '#30305E', mid: '#5A3F72', hz: '#A9607A', sun: '#F59B83', near: '#1F1630' }],
  [1, { top: '#0E1431', mid: '#1C2250', hz: '#3E3263', sun: '#F3E7C6', near: '#0B0C1C' }],
];

const RIDGES = [
  { base: 528, amp: 26, rough: 2.2, seed: 11, haze: 0.62, depth: 0.2 },
  { base: 570, amp: 30, rough: 2.8, seed: 23, haze: 0.48, depth: 0.32 },
  { base: 612, amp: 20, rough: 2.0, seed: 37, haze: 0.34, depth: 0.46 },
  { base: 664, amp: 26, rough: 3.2, seed: 41, haze: 0.2, depth: 0.62 },
  { base: 716, amp: 18, rough: 2.4, seed: 53, haze: 0.08, depth: 0.8 },
];

const svgProps = { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMax slice', width: '100%', height: '100%', style: { display: 'block' } } as const;

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

export default function LembayungBackdrop({ palette }: { palette: ThemePalette }) {
  const sky = useRef<HTMLDivElement>(null);
  const sun = useRef<SVGGElement>(null);
  const sunStop = useRef<SVGStopElement>(null);
  const sunDisc = useRef<SVGCircleElement>(null);
  const moon = useRef<SVGGElement>(null);
  const stars = useRef<SVGGElement>(null);
  const clouds = useRef<SVGGElement>(null);
  const volcano = useRef<SVGPathElement>(null);
  const smoke = useRef<SVGGElement>(null);
  const ridges = useRef<(SVGPathElement | null)[]>([]);
  const candi = useRef<SVGGElement>(null);
  const trees = useRef<SVGPathElement>(null);
  const fg = useRef<SVGGElement>(null);
  const lanterns = useRef<HTMLDivElement>(null);
  const birds = useRef<SVGGElement>(null);

  const geo = useMemo(() => {
    const r = seeded(7);
    const starList = Array.from({ length: 80 }, () => ({ x: r() * W, y: r() * 430, s: 0.4 + r() * 1.3, d: r() * 4 }));
    const candiX = 108;
    const candiY = ridgeY(RIDGES[2], candiX) + 3;
    const perwaraX = 150;
    const perwaraY = ridgeY(RIDGES[2], perwaraX) + 3;
    const trees = [14, 34, 52, 296, 318, 336, 362, 384].map((x, i) => cypress(x, ridgeY(RIDGES[3], x) + 4, 34 + ((i * 13) % 22))).join(' ');
    const lanternList = Array.from({ length: 12 }, (_, i) => ({ left: 6 + r() * 88, delay: -r() * 22, dur: 18 + r() * 12, size: 9 + r() * 8, sway: 8 + r() * 18, i }));
    return {
      starList,
      ridgeD: RIDGES.map((rg) => ridgePath({ w: W, h: H, ...rg })),
      candi: [
        { t: `translate(${candiX} ${candiY.toFixed(1)})`, d: candiPath(1) },
        { t: `translate(${perwaraX} ${perwaraY.toFixed(1)})`, d: candiPath(0.55) },
      ],
      trees,
      fgHill: ridgePath({ w: W, h: H, base: 778, amp: 10, rough: 3, seed: 61 }),
      palms: [palm(-4, 800, 236, 1, 3), palm(406, 800, 210, -1, 5), palm(372, 806, 140, -1, 9)],
      lanternList,
    };
  }, []);

  useScene((s) => {
    const p = s.progress;
    const k = keyframeColors(SKY, p);
    if (sky.current) sky.current.style.background = `linear-gradient(180deg, ${k.top} 0%, ${k.mid} 46%, ${k.hz} 72%, ${k.hz} 100%)`;
    // matahari terbenam di balik punggung bukit, bulan muncul di malam hari
    const sunY = 430 + smooth(0.05, 0.62, p) * 170;
    sun.current?.setAttribute('transform', `translate(200 ${sunY.toFixed(1)})`);
    sunStop.current?.setAttribute('stop-color', k.sun);
    sunDisc.current?.setAttribute('fill', mix(k.sun, '#FFFFFF', 0.35));
    if (moon.current) moon.current.style.opacity = String(smooth(0.7, 0.92, p));
    if (stars.current) stars.current.style.opacity = String(smooth(0.62, 0.95, p));
    if (clouds.current) clouds.current.setAttribute('fill', mix(k.hz, k.top, 0.35));
    volcano.current?.setAttribute('fill', mix(k.near, k.hz, 0.74));
    smoke.current?.setAttribute('fill', mix(k.hz, '#FFFFFF', 0.35));
    RIDGES.forEach((rg, i) => ridges.current[i]?.setAttribute('fill', mix(k.near, k.hz, rg.haze)));
    candi.current?.setAttribute('fill', mix(k.near, k.hz, RIDGES[2].haze));
    trees.current?.setAttribute('fill', mix(k.near, k.hz, RIDGES[3].haze));
    fg.current?.setAttribute('fill', k.near);
    fg.current?.setAttribute('stroke', k.near);
    if (lanterns.current) lanterns.current.style.opacity = String(smooth(0.58, 0.82, p));
    if (birds.current) birds.current.style.opacity = String(1 - smooth(0.5, 0.7, p));
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <style>{`
        @keyframes lby-twinkle { 0%,100%{opacity:.25} 50%{opacity:1} }
        @keyframes lby-drift { from{transform:translateX(-60px)} to{transform:translateX(60px)} }
        @keyframes lby-smoke { 0%{transform:translate(0,0) scale(.6);opacity:0} 20%{opacity:.55} 100%{transform:translate(26px,-70px) scale(1.8);opacity:0} }
        @keyframes lby-rise { from{transform:translateY(0)} to{transform:translateY(-118vh)} }
        @keyframes lby-sway { 0%,100%{margin-left:calc(var(--sw) * -1)} 50%{margin-left:var(--sw)} }
        @keyframes lby-flock { from{transform:translate(-80px,0)} to{transform:translate(520px,-60px)} }
        @keyframes lby-flap { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(-.6)} }
        @keyframes lby-flicker { 0%,100%{opacity:.85} 50%{opacity:1} }
      `}</style>
      <div ref={sky} style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${SKY[0][1].top}, ${SKY[0][1].hz})` }} />

      {/* bintang & bulan — hampir diam */}
      <Layer depth={0.03}>
        <svg {...svgProps} preserveAspectRatio="xMidYMin slice">
          <g ref={stars} style={{ opacity: 0 }} fill="#FFF6E0">
            {geo.starList.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.s} style={{ animation: `lby-twinkle ${2.5 + st.d}s ease-in-out ${-st.d}s infinite` }} />
            ))}
          </g>
          <g ref={moon} style={{ opacity: 0 }} transform="translate(318 66)">
            <circle r={70} fill="#F3E7C6" opacity={0.08} />
            <circle r={40} fill="#F3E7C6" opacity={0.1} />
            <circle r={20} fill="#F7EDD3" />
            <circle r={20} cx={8} cy={-5} fill="#1C2250" opacity={0.9} />
          </g>
        </svg>
      </Layer>

      {/* matahari */}
      <Layer depth={0.06}>
        <svg {...svgProps}>
          <defs>
            <radialGradient id="lby-sun">
              <stop ref={sunStop} offset="0" stopColor="#FFF3DA" stopOpacity={0.9} />
              <stop offset="1" stopColor="#FFF3DA" stopOpacity={0} />
            </radialGradient>
          </defs>
          <g ref={sun} transform="translate(200 430)">
            <circle r={170} fill="url(#lby-sun)" opacity={0.55} />
            <circle ref={sunDisc} r={34} fill="#FFF8EA" />
          </g>
        </svg>
      </Layer>

      {/* awan tipis berarak */}
      <Layer depth={0.12}>
        <svg {...svgProps}>
          <g ref={clouds} fill="#F6CFA5" opacity={0.55} style={{ filter: 'blur(3px)' }}>
            <g style={{ animation: 'lby-drift 38s ease-in-out infinite alternate' }}>
              <ellipse cx={90} cy={300} rx={90} ry={9} />
              <ellipse cx={130} cy={290} rx={50} ry={7} />
            </g>
            <g style={{ animation: 'lby-drift 46s ease-in-out -12s infinite alternate-reverse' }}>
              <ellipse cx={300} cy={360} rx={110} ry={8} />
              <ellipse cx={330} cy={350} rx={44} ry={6} />
            </g>
            <g style={{ animation: 'lby-drift 52s ease-in-out -30s infinite alternate' }}>
              <ellipse cx={200} cy={420} rx={140} ry={6} />
            </g>
          </g>
        </svg>
      </Layer>

      {/* gunung api di kejauhan + asap */}
      <Layer depth={0.14}>
        <svg {...svgProps}>
          <path ref={volcano} d="M120 540 C 190 470, 236 420, 258 392 L 270 386 L 284 388 C 306 420, 350 478, 430 540 Z" fill="#C98F84" />
          <g ref={smoke} fill="#FFF">
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={272} cy={384} r={9} style={{ filter: 'blur(4px)', transformBox: 'fill-box', transformOrigin: 'center', animation: `lby-smoke 9s ease-out ${-i * 2.25}s infinite` }} />
            ))}
          </g>
        </svg>
      </Layer>

      {/* burung — hilang ketika malam */}
      <Layer depth={0.3}>
        <svg {...svgProps}>
          <g ref={birds} stroke="#3A2038" strokeWidth={1.4} fill="none" strokeLinecap="round">
            <g style={{ animation: 'lby-flock 34s linear -8s infinite' }}>
              {[
                [0, 250],
                [18, 242],
                [30, 256],
                [44, 238],
                [10, 264],
              ].map(([x, y], i) => (
                <path key={i} d={`M${x - 6} ${y} q 3 -4 6 0 q 3 -4 6 0`} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `lby-flap ${0.5 + i * 0.07}s ease-in-out infinite` }} />
              ))}
            </g>
          </g>
        </svg>
      </Layer>

      {/* punggung bukit berlapis — perspektif udara */}
      {RIDGES.map((rg, i) => (
        <Layer key={i} depth={rg.depth}>
          <svg {...svgProps}>
            <path ref={(el) => void (ridges.current[i] = el)} d={geo.ridgeD[i]} fill={mix(SKY[0][1].near, SKY[0][1].hz, rg.haze)} />
            {i === 2 && (
              <g ref={candi} fill={mix(SKY[0][1].near, SKY[0][1].hz, rg.haze)}>
                {geo.candi.map((c, j) => (
                  <path key={j} transform={c.t} d={c.d} />
                ))}
              </g>
            )}
            {i === 3 && <path ref={trees} d={geo.trees} fill={mix(SKY[0][1].near, SKY[0][1].hz, rg.haze)} />}
          </svg>
        </Layer>
      ))}

      {/* lampion naik di malam hari */}
      <Layer depth={0.5} travel={0.2}>
        <div ref={lanterns} style={{ position: 'absolute', inset: 0, opacity: 0 }}>
          {geo.lanternList.map((l) => (
            <div
              key={l.i}
              style={
                {
                  position: 'absolute',
                  left: `${l.left}%`,
                  bottom: '-6%',
                  '--sw': `${l.sway}px`,
                  animation: `lby-rise ${l.dur}s linear ${l.delay}s infinite, lby-sway ${l.dur / 4}s ease-in-out ${l.delay}s infinite`,
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  width: l.size,
                  height: l.size * 1.25,
                  borderRadius: '40% 40% 30% 30%',
                  background: 'radial-gradient(circle at 50% 70%, #FFE6A6 0%, #FFB45E 55%, #E0703D 100%)',
                  boxShadow: `0 0 ${l.size * 1.6}px ${l.size * 0.5}px rgba(255,170,80,.45)`,
                  animation: `lby-flicker ${1.2 + (l.i % 4) * 0.3}s ease-in-out infinite`,
                }}
              />
            </div>
          ))}
        </div>
      </Layer>

      {/* latar depan: bukit + nyiur */}
      <Layer depth={1}>
        <svg {...svgProps}>
          <g ref={fg} fill={SKY[0][1].near} stroke={SKY[0][1].near} strokeLinecap="round">
            <path d={geo.fgHill} stroke="none" />
            {geo.palms.map((pl, i) => (
              <g key={i}>
                <path d={pl.trunk} stroke="none" />
                <path d={pl.fronds} fill="none" strokeWidth={1.6} />
              </g>
            ))}
          </g>
        </svg>
      </Layer>
      <span hidden>{palette.primary}</span>
    </div>
  );
}

