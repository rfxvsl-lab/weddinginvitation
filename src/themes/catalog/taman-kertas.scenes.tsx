/**
 * Taman Kertas — komposisi 10 bab sebagai data lapisan.
 * Dirender oleh taman-kertas.chapters.tsx (ArtLayer paralaks) dan oleh lab pratinjau statis.
 *
 * Aturan: lapisan statis memakai filter kertas (tepi potong + serat); lapisan beranimasi
 * (matahari berputar, burung, bangau, lentera, amplop, kunang-kunang) TIDAK memakai filter
 * agar ponsel tidak menghitung ulang filter setiap frame.
 */
import React from 'react';
import type { SectionId } from '../types';
import { seeded } from '../kit/scene';
import {
  C,
  W,
  blades,
  broadLeaf,
  circ,
  cloud,
  crane,
  daisy,
  drop,
  envelope,
  fern,
  fieldHill,
  heartCanopy,
  house,
  peaks,
  sailboat,
  waves,
  hillY,
  laceHill,
  laceMoon,
  laceSun,
  lantern,
  leaf,
  paperFilter,
  paperTree,
  plane,
  star,
  swallow,
  wildBed,
} from './taman-kertas.art';

export interface Layer {
  depth: number;
  order?: number;
  anchor?: 'top' | 'bottom';
  exitX?: number;
  origin?: string;
  /** kekuatan bayangan jatuh (0..1) */
  lift?: number;
  /** isi SVG dalam viewBox 400×800 */
  svg?: React.ReactNode;
  /** isi HTML (partikel CSS) */
  html?: React.ReactNode;
}
export interface Scene {
  sky: [string, string];
  back: Layer[];
  front: Layer[];
}

const g = (fill: string, d: string, extra?: React.SVGProps<SVGPathElement>) => <path d={d} fill={fill} fillRule="evenodd" {...extra} />;
const P = { filter: paperFilter };

// ---------------------------------------------------------------- komponen adegan

function Hill({ base, amp, seed, r = 9, fill, holes = true }: { base: number; amp: number; seed: number; r?: number; fill: string; holes?: boolean }) {
  return <g style={P}>{g(fill, laceHill({ base, amp, seed, r, holes }))}</g>;
}

function Trees({ hill, xs, seed, h, cr, colors, shape = 'round' }: { hill: { base: number; amp: number; seed: number }; xs: number[]; seed: number; h: number; cr: number; colors: [string, string, string, string]; shape?: 'round' | 'tall' }) {
  return (
    <g style={P}>
      {xs.map((x, i) => {
        const t = paperTree(x, hillY(hill, x) + 6, h * (0.85 + ((i * 37) % 30) / 100), cr * (0.85 + ((i * 53) % 30) / 100), seed + i * 7, shape);
        return (
          <g key={i}>
            {g(colors[0], t.trunk)}
            {g(colors[1], t.leaves[0])}
            {g(colors[2], t.leaves[1])}
            {g(colors[3], t.leaves[2])}
          </g>
        );
      })}
    </g>
  );
}

function Ferns({ side, y = 820, tone = [C.moss, C.teal, C.fern] as [string, string, string], scale = 1 }: { side: 'left' | 'right'; y?: number; tone?: [string, string, string]; scale?: number }) {
  const l = side === 'left';
  const x = l ? 22 : W - 22;
  const set = l
    ? [fern(x, y, 230 * scale, -58, 0.22, 18), fern(x, y - 10, 180 * scale, -30, -0.2, 15), fern(x + 20, y, 150 * scale, -82, 0.18, 13)]
    : [fern(x, y, 230 * scale, -122, -0.22, 18), fern(x, y - 10, 180 * scale, -150, 0.2, 15), fern(x - 20, y, 150 * scale, -98, -0.18, 13)];
  return (
    <g style={P}>
      {set.map((s, i) => (
        <g key={i}>
          <path d={s.stem} stroke={tone[i]} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {g(tone[i], s.blades)}
        </g>
      ))}
    </g>
  );
}

function Meadow({ y, seed, n = 22, palette, grass = C.fern, grass2 = C.moss }: { y: number; seed: number; n?: number; palette?: string[]; grass?: string; grass2?: string }) {
  const b = wildBed(y, seed, n, palette);
  return (
    <g style={P}>
      {g(grass2, blades(y + 6, seed + 1, 80, 18, 44))}
      <path d={b.stems} stroke={C.moss} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {g(C.fern, b.leaves)}
      {Object.entries(b.heads).map(([col, d]) => (
        <React.Fragment key={col}>{g(col, d)}</React.Fragment>
      ))}
      {g(C.mustard, b.centers)}
      {g(grass, blades(y + 14, seed + 2, 90, 10, 30))}
      <rect x={-30} y={y + 12} width={W + 60} height={80} fill={grass} />
    </g>
  );
}

function LaceArch({ cx, by, w, h }: { cx: number; by: number; w: number; h: number }) {
  const t = 12;
  const R = w / 2;
  const Ri = R - t;
  const outer = `M${cx - R} ${by}V${by - h + R}A${R} ${R} 0 0 1 ${cx + R} ${by - h + R}V${by}H${cx + Ri}V${by - h + R}A${Ri} ${Ri} 0 0 0 ${cx - Ri} ${by - h + R}V${by}Z`;
  let holes = '';
  const mid = R - t / 2;
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI;
    holes += circ(cx + Math.cos(a) * mid, by - h + R + Math.sin(a) * mid, 2);
  }
  for (let yy = by - h + R + 12; yy < by - 6; yy += 14) holes += circ(cx - mid, yy, 2) + circ(cx + mid, yy, 2);
  // sulur daun di sisi luar lengkung
  let vine = '';
  let flowers = '';
  const r = seeded(77);
  for (let i = 0; i <= 22; i++) {
    const a = Math.PI + (i / 22) * Math.PI;
    const px = cx + Math.cos(a) * (R + 3);
    const py = by - h + R + Math.sin(a) * (R + 3);
    const out = (a * 180) / Math.PI;
    vine += leaf(px, py, 13 + r() * 7, out + (i % 2 ? 40 : -40), 0.38);
    if (i % 4 === 2) flowers += daisy(px + Math.cos(a) * 6, py + Math.sin(a) * 6, 8, 10, i * 9);
  }
  for (let yy = by - 8; yy > by - h + R; yy -= 16) {
    vine += leaf(cx - R - 2, yy, 14, 180 + (yy % 32 ? 30 : -30), 0.38) + leaf(cx + R + 2, yy, 14, yy % 32 ? 30 : -30, 0.38);
  }
  return (
    <g style={P}>
      {g(C.fern, vine)}
      {g(C.paper, outer + holes)}
      {g(C.paper, flowers)}
      {g(C.mustard, circ(cx - R * 0.72, by - h + R * 0.32, 3) + circ(cx, by - h - 6, 3) + circ(cx + R * 0.72, by - h + R * 0.32, 3))}
    </g>
  );
}

function Clouds({ y, tone = C.paper, shade = '#E8E1D9' }: { y: number; tone?: string; shade?: string }) {
  const one = (x: number, yy: number, s: number, dur: number, delay: number) => (
    <g style={{ animation: `tk-drift ${dur}s ease-in-out ${delay}s infinite alternate` }}>
      <path d={cloud(x + 4, yy + 5, s)} fill={shade} />
      <path d={cloud(x, yy, s)} fill={tone} />
      <path d={cloud(x - 6 * s, yy + 1, s * 0.62)} fill={tone} />
    </g>
  );
  return (
    <>
      {one(86, y, 1.15, 16, 0)}
      {one(318, y + 96, 0.85, 20, -6)}
      {one(196, y + 186, 0.6, 18, -3)}
    </>
  );
}

function Swallows({ n = 3, y = 230 }: { n?: number; y?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <g key={i} style={{ animation: `tk-fly ${18 + i * 3}s linear ${-i * 6}s infinite` }}>
          <g transform={`translate(${40 + i * 30} ${y + i * 26}) scale(${0.9 - i * 0.15})`}>
            <path d={swallow()} fill={C.plum} style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `tk-flap ${0.5 + i * 0.08}s ease-in-out infinite alternate` }} />
          </g>
        </g>
      ))}
    </>
  );
}

function Crane({ x, y, s, flip = false, delay = 0, light = C.paper, dark = '#E7D8CC' }: { x: number; y: number; s: number; flip?: boolean; delay?: number; light?: string; dark?: string }) {
  const c = crane();
  return (
    <g style={{ animation: `tk-glide ${9 + s * 3}s ease-in-out ${delay}s infinite alternate` }}>
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
        <path d={c.dark} fill={dark} />
        <path d={c.light} fill={light} />
        <g style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animation: `tk-wing ${1.6 + s * 0.4}s ease-in-out ${delay}s infinite alternate` }}>
          <path d={c.wing} fill={light} />
          <path d={c.wingFold} fill={dark} />
        </g>
      </g>
    </g>
  );
}

function Mobile({ items, color = '#C9BFB3' }: { items: { x: number; len: number; kind: 'moon' | 'star' | 'heart'; s: number; fill: string }[]; color?: string }) {
  return (
    <>
      {items.map((it, i) => (
        <g key={i} style={{ transformBox: 'view-box', transformOrigin: `${it.x}px 0px`, animation: `tk-hang ${3 + i * 0.37}s ease-in-out ${-i * 0.8}s infinite alternate` }}>
          <line x1={it.x} y1={-10} x2={it.x} y2={it.len + 110} stroke={color} strokeWidth={0.9} />
          <g transform={`translate(${it.x} ${it.len + 110 + it.s})`}>
            {it.kind === 'moon' ? (
              <path d={laceMoon(it.s)} fill={it.fill} fillRule="evenodd" transform="rotate(-20)" />
            ) : it.kind === 'star' ? (
              <path d={star(it.s)} fill={it.fill} />
            ) : (
              <path d={`M0 ${it.s * 0.9}C${-it.s * 1.6} ${-it.s * 0.2} ${-it.s * 0.7} ${-it.s * 1.3} 0 ${-it.s * 0.4}C${it.s * 0.7} ${-it.s * 1.3} ${it.s * 1.6} ${-it.s * 0.2} 0 ${it.s * 0.9}Z`} fill={it.fill} />
            )}
          </g>
        </g>
      ))}
    </>
  );
}

function Lanterns({ y = 40 }: { y?: number }) {
  const cols = [C.coral, C.butter, C.paper, C.rose, C.mustard, C.paper, C.coral];
  const n = cols.length;
  const yAt = (t: number) => (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 70) + t * t * y;
  return (
    <>
      <path d={`M-20 ${y}Q200 ${y + 140} 420 ${y}`} stroke="#B8A08C" strokeWidth={1.1} fill="none" />
      {cols.map((col, i) => {
        const t = (i + 0.7) / (n + 0.4);
        const x = -20 + t * 440;
        const yy = yAt(t);
        const s = i % 2 ? 0.8 : 1;
        const l = lantern(34 * s, 44 * s);
        return (
          <g key={i} style={{ transformBox: 'view-box', transformOrigin: `${x}px ${yy}px`, animation: `tk-hang ${2.6 + (i % 3) * 0.5}s ease-in-out ${-i * 0.4}s infinite alternate` }}>
            <line x1={x} y1={yy} x2={x} y2={yy + 10} stroke="#B8A08C" strokeWidth={1} />
            <g transform={`translate(${x} ${yy + 10 + 22 * s})`}>
              <rect x={-7 * s} y={-24 * s} width={14 * s} height={4} fill={C.plum} />
              <path d={l.body} fill={col} />
              <path d={l.ribs} stroke="rgba(74,51,64,.22)" strokeWidth={1} fill="none" />
              <rect x={-7 * s} y={20 * s} width={14 * s} height={4} fill={C.plum} />
              <path d={`M0 ${24 * s}v10`} stroke={C.coral} strokeWidth={2} />
            </g>
          </g>
        );
      })}
    </>
  );
}

function Path({ seed }: { seed: number }) {
  // jalan setapak berkelok naik ke bukit (pita kertas mengecil ke kejauhan)
  const pts = [
    [200, 820, 70],
    [150, 740, 44],
    [240, 680, 28],
    [196, 632, 18],
    [222, 600, 10],
  ];
  let l = '';
  let r = '';
  pts.forEach(([x, y, w], i) => {
    l += `${i ? 'L' : 'M'}${x - w} ${y}`;
    r = `L${x + w} ${y}` + r;
  });
  const stones = seeded(seed);
  let dots = '';
  for (let i = 0; i < 26; i++) {
    const t = stones();
    const k = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1)));
    const u = t * (pts.length - 1) - k;
    const [x0, y0, w0] = pts[k];
    const [x1, y1, w1] = pts[k + 1];
    const x = x0 + (x1 - x0) * u + (stones() - 0.5) * (w0 + (w1 - w0) * u) * 1.2;
    const y = y0 + (y1 - y0) * u;
    dots += circ(x, y, 1.2 + (1 - t) * 2.2);
  }
  return (
    <g style={P}>
      {g(C.cream, l + r + 'Z' + dots)}
    </g>
  );
}

function Fireflies({ n = 18 }: { n?: number }) {
  const r = seeded(91);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${8 + r() * 84}%`,
            top: `${46 + r() * 40}%`,
            width: 5,
            height: 5,
            borderRadius: 99,
            background: '#FFE3A1',
            boxShadow: '0 0 10px 3px rgba(255,214,130,.65)',
            animation: `tk-firefly ${5 + r() * 5}s ease-in-out ${-r() * 8}s infinite alternate, tk-twinkle ${1.6 + r() * 2}s ease-in-out ${-r() * 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Envelopes() {
  const r = seeded(5);
  const cols = [C.paper, C.blush, C.butter, C.paper, C.rose];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 7 }, (_, i) => {
        const e = envelope(40);
        const left = i % 2 ? 72 + r() * 20 : 2 + r() * 20;
        return (
          <svg
            key={i}
            viewBox="-24 -16 48 32"
            width={46 + r() * 16}
            style={{ position: 'absolute', left: `${left}%`, top: '-10%', overflow: 'visible', filter: 'drop-shadow(0 6px 6px rgba(74,51,64,.18))', animation: `tk-letter ${11 + r() * 6}s linear ${-r() * 16}s infinite` }}
          >
            <path d={e.body} fill={cols[i % cols.length]} />
            <path d={e.folds} stroke="rgba(74,51,64,.18)" strokeWidth={0.8} fill="none" />
            <path d={e.flap} fill="rgba(74,51,64,.06)" />
            <path d={e.seal} fill={C.terracotta} />
          </svg>
        );
      })}
    </div>
  );
}

function Planes() {
  const p = plane();
  const one = (x: number, y: number, s: number, delay: number, col: string) => (
    <g style={{ animation: `tk-loop 14s ease-in-out ${delay}s infinite alternate` }}>
      <path d={`M${x - 150} ${y + 60}C${x - 110} ${y + 10} ${x - 60} ${y + 70} ${x - 6} ${y + 8}`} stroke="#B9AFC4" strokeWidth={1.2} strokeDasharray="4 6" fill="none" />
      <g transform={`translate(${x} ${y}) scale(${s}) rotate(-14)`}>
        <path d={p.side} fill="#DCD6E4" />
        <path d={p.top} fill={col} />
        <path d={p.keel} fill="#C7BFD3" />
      </g>
    </g>
  );
  return (
    <>
      {one(250, 120, 1.3, 0, C.paper)}
      {one(120, 250, 0.9, -5, '#FFF6EA')}
    </>
  );
}

// ---------------------------------------------------------------- set tambahan

function Field({ base, amp, seed, fill, rows = 4 }: { base: number; amp: number; seed: number; fill: string; rows?: number }) {
  return <g style={P}>{g(fill, fieldHill({ base, amp, seed, rows }))}</g>;
}

function Peaks({ base, seed, fill, snow = C.paper, n = 5, hMin = 70, hMax = 150 }: { base: number; seed: number; fill: string; snow?: string; n?: number; hMin?: number; hMax?: number }) {
  const k = peaks({ base, seed, n, hMin, hMax });
  return (
    <g style={P}>
      {g(fill, k.d)}
      {g(snow, k.snow)}
    </g>
  );
}

function Village({ hill, xs, lit = false, roofs = [C.coral, C.terracotta, C.rose, C.mustard] }: { hill: { base: number; amp: number; seed: number }; xs: number[]; lit?: boolean; roofs?: string[] }) {
  return (
    <g style={P}>
      {xs.map((x, i) => {
        const w = 30 + ((i * 13) % 16);
        const hs = house(x, hillY(hill, x) + 8, w, 0.55 + ((i * 7) % 3) * 0.1);
        return (
          <g key={i}>
            {lit && <rect x={x - w / 2 + 2} y={hillY(hill, x) + 8 - w * 0.7 + 2} width={w - 4} height={w * 0.7 - 4} fill="#FFD98A" />}
            {g(lit ? '#3A3F6E' : C.paper, hs.walls)}
            {g(roofs[i % roofs.length], hs.roof)}
          </g>
        );
      })}
    </g>
  );
}

function Sea() {
  const tones = ['#BFD3DA', '#9FBFCB', '#7FA8B8', '#5E8FA3'];
  return (
    <>
      {tones.map((t, i) => (
        <g key={i} style={{ animation: `tk-wave ${6 + i}s ease-in-out ${-i}s infinite alternate` }}>
          <path d={waves(560 + i * 40, 16 + i * 3, i * 9)} fill={t} />
        </g>
      ))}
    </>
  );
}

function Boat({ x, y, s }: { x: number; y: number; s: number }) {
  const b = sailboat(s);
  return (
    <g style={{ animation: 'tk-bob 4s ease-in-out infinite alternate' }}>
      <g transform={`translate(${x} ${y})`}>
        <path d={b.sail} fill={C.paper} />
        <path d={b.sail2} fill="#F3E6D8" />
        <path d={b.hull} fill={C.terracotta} />
      </g>
    </g>
  );
}

// ---------------------------------------------------------------- adegan
// Bidang terlihat di ponsel kira-kira x 30–370, y 90–710 (lapisan diperbesar untuk paralaks).

const GROUND = 702;
const HERO_HILLS = [
  { base: 470, amp: 30, seed: 4 },
  { base: 540, amp: 24, seed: 9 },
  { base: 600, amp: 20, seed: 15 },
  { base: 652, amp: 16, seed: 21 },
];

export const SCENES: Record<SectionId, Scene> = {
  hero: {
    sky: ['#F6D8C6', '#FBF1E6'],
    back: [
      {
        depth: 0.04,
        lift: 0.15,
        svg: (
          <>
            <g transform="translate(300 205)">
              <path d={laceSun(52)} fill={C.butter} fillRule="evenodd" style={{ animation: 'tk-spin 60s linear infinite', transformBox: 'fill-box', transformOrigin: 'center' }} />
            </g>
            <Swallows y={330} />
          </>
        ),
      },
      { depth: 0.1, order: 0, lift: 0.2, svg: <Peaks base={HERO_HILLS[0].base + 20} seed={2} fill="#EDD3C6" snow="#FFF8F0" hMin={60} hMax={120} /> },
      {
        depth: 0.22,
        order: 1,
        lift: 0.3,
        svg: (
          <>
            <Trees hill={HERO_HILLS[1]} xs={[48, 74, 100, 300, 326, 352]} seed={3} h={70} cr={13} shape="tall" colors={['#9C7B66', C.fern, C.sage, '#A2B79A']} />
            <Field {...HERO_HILLS[1]} fill="#E8BCAE" />
          </>
        ),
      },
      {
        depth: 0.38,
        order: 2,
        lift: 0.42,
        svg: (
          <>
            <LaceArch cx={200} by={hillY(HERO_HILLS[2], 200) + 14} w={150} h={236} />
            <Hill {...HERO_HILLS[2]} r={16} fill={C.sage} />
          </>
        ),
      },
    ],
    front: [
      {
        depth: 0.6,
        order: 3,
        lift: 0.55,
        svg: (
          <>
            <Trees hill={HERO_HILLS[3]} xs={[44, 356]} seed={12} h={150} cr={40} colors={['#8E6E5B', C.moss, C.fern, '#6E9271']} />
            <Hill {...HERO_HILLS[3]} r={18} fill={C.fern} />
          </>
        ),
      },
      { depth: 0.82, order: 4, lift: 0.7, svg: <Meadow y={GROUND - 6} seed={41} n={24} /> },
      { depth: 1, order: 5, exitX: -0.55, origin: '0% 100%', lift: 0.9, svg: <Ferns side="left" y={GROUND + 30} /> },
      { depth: 1, order: 5, exitX: 0.55, origin: '100% 100%', lift: 0.9, svg: <Ferns side="right" y={GROUND + 30} tone={[C.teal, C.moss, C.fern]} /> },
    ],
  },

  quote: {
    sky: ['#D8E6EA', '#F8F3EA'],
    back: [
      {
        depth: 0.05,
        svg: (
          <>
            <Clouds y={200} />
            <Crane x={300} y={180} s={1.2} />
            <Crane x={110} y={140} s={0.75} flip delay={-3} />
          </>
        ),
      },
      { depth: 0.16, order: 0, lift: 0.22, svg: <Field base={540} amp={24} seed={51} fill="#D6E2D8" rows={3} /> },
      {
        depth: 0.34,
        order: 1,
        lift: 0.4,
        svg: (
          <>
            <Trees hill={{ base: 600, amp: 20, seed: 57 }} xs={[52, 96, 304, 348]} seed={21} h={80} cr={24} colors={['#9C7B66', C.moss, C.fern, C.sage]} />
            <Field base={600} amp={20} seed={57} fill={C.sage} />
          </>
        ),
      },
      { depth: 0.55, order: 2, lift: 0.55, svg: <Hill base={650} amp={14} seed={58} r={18} fill={C.fern} /> },
    ],
    front: [{ depth: 0.9, order: 3, lift: 0.7, svg: <Meadow y={GROUND} seed={61} n={18} palette={[C.paper, C.butter, C.lilac, C.rose]} /> }],
  },

  couple: {
    sky: ['#F4D6CF', '#FCF2EB'],
    back: [
      {
        depth: 0.05,
        svg: <Mobile items={[64, 112, 160, 240, 288, 336].map((x, i) => ({ x, len: 40 + ((i * 29) % 46), kind: 'heart' as const, s: 9 + (i % 2) * 3, fill: [C.rose, C.paper, C.coral][i % 3] }))} />,
      },
      { depth: 0.16, order: 0, lift: 0.22, svg: <Field base={560} amp={22} seed={71} fill="#EFCFC4" rows={3} /> },
      { depth: 0.34, order: 1, lift: 0.4, svg: <Hill base={618} amp={18} seed={77} r={16} fill={C.blush} /> },
    ],
    front: [
      {
        depth: 0.85,
        order: 2,
        exitX: -0.35,
        origin: '0% 100%',
        lift: 0.8,
        svg: (() => {
          const t = paperTree(-4, GROUND + 40, 250, 52, 81, 'round');
          return (
            <g style={P}>
              {g('#8E6E5B', t.trunk)}
              {g(C.moss, t.leaves[0])}
              {g(C.fern, t.leaves[1])}
              {g(C.rose, t.leaves[2])}
            </g>
          );
        })(),
      },
      {
        depth: 0.85,
        order: 2,
        exitX: 0.35,
        origin: '100% 100%',
        lift: 0.8,
        svg: (() => {
          const t = paperTree(404, GROUND + 40, 220, 48, 87, 'round');
          return (
            <g style={P}>
              {g('#8E6E5B', t.trunk)}
              {g(C.fern, t.leaves[0])}
              {g(C.sage, t.leaves[1])}
              {g(C.coral, t.leaves[2])}
            </g>
          );
        })(),
      },
      { depth: 1, order: 3, lift: 0.8, svg: <Meadow y={GROUND + 4} seed={91} n={20} palette={[C.paper, C.rose, C.coral, C.butter]} /> },
    ],
  },

  countdown: {
    sky: ['#D6CDE4', '#F5EEF0'],
    back: [
      {
        depth: 0.04,
        anchor: 'top',
        svg: (
          <Mobile
            items={[
              { x: 290, len: 70, kind: 'moon', s: 34, fill: C.butter },
              { x: 96, len: 46, kind: 'star', s: 11, fill: C.paper },
              { x: 150, len: 112, kind: 'star', s: 8, fill: C.butter },
              { x: 344, len: 150, kind: 'star', s: 9, fill: C.paper },
              { x: 210, len: 36, kind: 'star', s: 7, fill: C.paper },
            ]}
          />
        ),
      },
      { depth: 0.12, order: 0, lift: 0.22, svg: <Peaks base={560} seed={101} fill="#D3C8E2" snow="#FBF8FF" n={4} hMin={110} hMax={190} /> },
      {
        depth: 0.3,
        order: 1,
        lift: 0.4,
        svg: (
          <>
            <Trees hill={{ base: 610, amp: 22, seed: 107 }} xs={[44, 72, 100, 300, 328, 356]} seed={31} h={84} cr={15} shape="tall" colors={['#7D6A78', '#8F86A8', '#A79FBE', '#7B739A']} />
            <Hill base={610} amp={22} seed={107} r={16} fill="#BDB2D2" />
          </>
        ),
      },
    ],
    front: [
      { depth: 0.72, order: 2, lift: 0.6, svg: <Field base={664} amp={14} seed={113} fill="#9C93BA" rows={3} /> },
      { depth: 1, order: 3, exitX: 0.5, origin: '100% 100%', lift: 0.9, svg: <Ferns side="right" y={GROUND + 30} tone={['#6E6690', '#585279', '#857DA6']} /> },
    ],
  },

  events: {
    sky: ['#F6D9C1', '#FCF3E9'],
    back: [
      { depth: 0.06, anchor: 'top', svg: <Lanterns y={96} /> },
      { depth: 0.16, order: 0, lift: 0.22, svg: <Field base={560} amp={22} seed={121} fill="#F0D2B6" rows={3} /> },
      {
        depth: 0.34,
        order: 1,
        lift: 0.42,
        svg: (
          <>
            <Village hill={{ base: 616, amp: 16, seed: 127 }} xs={[58, 96, 138, 262, 304, 344]} />
            <Hill base={616} amp={16} seed={127} r={16} fill="#E3B796" />
          </>
        ),
      },
    ],
    front: [
      {
        depth: 0.95,
        order: 2,
        lift: 0.8,
        svg: (() => {
          const L = [broadLeaf(24, GROUND + 24, 170, -62), broadLeaf(28, GROUND + 16, 130, -28), broadLeaf(376, GROUND + 24, 170, -118), broadLeaf(372, GROUND + 16, 130, -152)];
          return (
            <g style={P}>
              {g(C.sage, blades(GROUND, 131, 70, 10, 28))}
              <rect x={-30} y={GROUND - 4} width={460} height={140} fill={C.sage} />
              {L.map((b, i) => (
                <React.Fragment key={i}>{g(i % 2 ? C.fern : C.moss, b.body + b.veins)}</React.Fragment>
              ))}
            </g>
          );
        })(),
      },
    ],
  },

  story: {
    sky: ['#EEDFCB', '#FAF4EC'],
    back: [
      { depth: 0.05, svg: <Swallows n={2} y={200} /> },
      { depth: 0.14, order: 0, lift: 0.2, svg: <Peaks base={520} seed={141} fill="#E6D7C1" snow="#FFF9F0" n={4} hMin={60} hMax={110} /> },
      {
        depth: 0.28,
        order: 1,
        lift: 0.35,
        svg: (
          <>
            <Trees hill={{ base: 566, amp: 24, seed: 147 }} xs={[60, 118, 286, 340]} seed={41} h={56} cr={18} colors={['#8E6E5B', C.fern, C.sage, C.moss]} />
            <Field base={566} amp={24} seed={147} fill="#CDBE9F" />
          </>
        ),
      },
      {
        depth: 0.48,
        order: 2,
        lift: 0.5,
        svg: (
          <>
            <Field base={620} amp={18} seed={153} fill={C.fern} rows={3} />
            <Path seed={155} />
          </>
        ),
      },
    ],
    front: [{ depth: 0.9, order: 3, lift: 0.8, svg: <Meadow y={GROUND} seed={161} n={20} palette={[C.paper, C.mustard, C.coral, C.butter]} /> }],
  },

  gallery: {
    sky: ['#E5DEEE', '#FBF6F0'],
    back: [
      { depth: 0.05, svg: <Clouds y={160} tone="#FBF8FF" shade="#E2DCEA" /> },
      { depth: 0.16, order: 0, lift: 0.22, svg: <Field base={570} amp={24} seed={171} fill="#D8D0E6" rows={3} /> },
      { depth: 0.36, order: 1, lift: 0.4, svg: <Hill base={630} amp={18} seed={177} r={16} fill="#BBC8B2" /> },
    ],
    front: [
      { depth: 0.85, order: 2, lift: 0.75, svg: <Meadow y={GROUND} seed={181} n={28} palette={[C.paper, C.rose, C.lilac, C.coral, C.butter]} /> },
      { depth: 1, order: 3, exitX: -0.5, origin: '0% 100%', lift: 0.9, svg: <Ferns side="left" y={GROUND + 30} scale={0.9} /> },
    ],
  },

  gift: {
    sky: ['#F3D3CB', '#FCEEE7'],
    back: [
      { depth: 0.08, html: <Envelopes /> },
      { depth: 0.16, order: 0, lift: 0.22, svg: <Field base={590} amp={22} seed={191} fill="#EEC9BE" rows={3} /> },
      { depth: 0.36, order: 1, lift: 0.4, svg: <Hill base={646} amp={16} seed={197} r={16} fill={C.rose} /> },
    ],
    front: [
      { depth: 1, order: 2, exitX: 0.5, origin: '100% 100%', lift: 0.9, svg: <Ferns side="right" y={GROUND + 30} tone={[C.moss, C.fern, C.teal]} scale={0.9} /> },
    ],
  },

  rsvp: {
    sky: ['#D9E3EA', '#F7F2EC'],
    back: [
      { depth: 0.06, svg: <Planes /> },
      { depth: 0.12, order: 0, lift: 0.2, svg: <Peaks base={560} seed={211} fill="#D3DCE4" snow="#FBFDFF" n={3} hMin={60} hMax={100} /> },
      {
        depth: 0.3,
        svg: (
          <>
            <Sea />
            <Boat x={250} y={590} s={1} />
          </>
        ),
      },
    ],
    front: [{ depth: 0.95, order: 2, lift: 0.8, svg: <Hill base={GROUND - 8} amp={10} seed={221} r={18} fill="#E9D9C3" /> }],
  },

  closing: {
    sky: ['#1E2446', '#3A3E6B'],
    back: [
      {
        depth: 0.04,
        anchor: 'top',
        svg: (
          <Mobile
            color="#6B6E95"
            items={[
              { x: 300, len: 60, kind: 'moon', s: 30, fill: '#F6E3AE' },
              { x: 80, len: 40, kind: 'star', s: 9, fill: '#F6E3AE' },
              { x: 150, len: 96, kind: 'star', s: 7, fill: '#FFF6E0' },
              { x: 350, len: 140, kind: 'star', s: 8, fill: '#F6E3AE' },
              { x: 220, len: 30, kind: 'star', s: 6, fill: '#FFF6E0' },
            ]}
          />
        ),
      },
      {
        depth: 0.18,
        order: 0,
        lift: 0.3,
        svg: (
          <>
            <path d={laceHill({ base: 600, amp: 26, seed: 231, r: 16, holes: false })} fill="#F3C77A" opacity={0.9} transform="translate(0 16)" />
            <Hill base={600} amp={26} seed={231} r={16} fill="#2E3460" />
          </>
        ),
      },
      {
        depth: 0.36,
        order: 1,
        lift: 0.45,
        svg: (
          <>
            <Village hill={{ base: 650, amp: 16, seed: 237 }} xs={[60, 100, 300, 342]} lit roofs={['#2A2F57', '#30366A']} />
            <Hill base={650} amp={16} seed={237} r={18} fill="#252A52" holes={false} />
          </>
        ),
      },
    ],
    front: [
      { depth: 0.6, html: <Fireflies /> },
      { depth: 1, order: 2, exitX: -0.5, origin: '0% 100%', lift: 0.9, svg: <Ferns side="left" y={GROUND + 40} scale={0.7} tone={['#1A1F3F', '#20264A', '#171B36']} /> },
      { depth: 1, order: 2, exitX: 0.5, origin: '100% 100%', lift: 0.9, svg: <Ferns side="right" y={GROUND + 40} scale={0.7} tone={['#20264A', '#1A1F3F', '#171B36']} /> },
    ],
  },

  interlude: { sky: ['#F4D6CF', '#FCF2EB'], back: [], front: [] },
  wishes: { sky: ['#D9DFEA', '#F7F2EC'], back: [], front: [] },
};

export const TK_KEYFRAMES = `
  @keyframes tk-spin { to { transform: rotate(360deg) } }
  @keyframes tk-drift { from { transform: translateX(-26px) } to { transform: translateX(26px) } }
  @keyframes tk-fly { from { transform: translate(-80px, 30px) } to { transform: translate(520px, -120px) } }
  @keyframes tk-flap { from { transform: scaleY(1) } to { transform: scaleY(.35) } }
  @keyframes tk-glide { from { transform: translate(-14px, 8px) rotate(-2deg) } to { transform: translate(18px, -10px) rotate(2deg) } }
  @keyframes tk-wing { from { transform: scaleY(1) } to { transform: scaleY(.45) } }
  @keyframes tk-hang { from { transform: rotate(-5deg) } to { transform: rotate(5deg) } }
  @keyframes tk-letter { 0% { transform: translateY(0) rotate(-12deg) } 50% { transform: translateY(60vh) rotate(10deg) } 100% { transform: translateY(120vh) rotate(-8deg) } }
  @keyframes tk-loop { from { transform: translate(0, 0) } to { transform: translate(40px, -24px) } }
  @keyframes tk-wave { from { transform: translateX(-10px) } to { transform: translateX(10px) } }
  @keyframes tk-bob { from { transform: translateY(0) rotate(-2deg) } to { transform: translateY(-6px) rotate(2deg) } }
  @keyframes tk-firefly { from { transform: translate(0, 0) } to { transform: translate(18px, -26px) } }
  @keyframes tk-twinkle { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }
  @media (prefers-reduced-motion: reduce) { [style*="animation"] { animation: none !important } }
`;

/** Bayangan jatuh lapisan kertas. */
export const lift = (k = 0.4) => `drop-shadow(0 ${(-2 - k * 4).toFixed(1)}px ${(3 + k * 6).toFixed(1)}px rgba(74, 51, 64, ${(0.2 + k * 0.14).toFixed(2)}))`;
