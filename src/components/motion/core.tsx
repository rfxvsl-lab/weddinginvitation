'use client';

/**
 * Motion core — primitif ala After Effects untuk komposisi video undangan.
 * Semua fungsi murni terhadap waktu komposisi `t` (detik), sehingga deterministik
 * per frame (bisa di-scrub, di-pause, dan dirender frame-by-frame).
 */

import React from 'react';

// ============================================================
// Matematika & easing (graph editor)
// ============================================================

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(1e-4, b - a));

/** Cubic-bezier seperti di AE/CSS (x1,y1,x2,y2) → fungsi easing. */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dsx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 6; i++) {
      const d = sx(u) - x;
      const dd = dsx(u);
      if (Math.abs(d) < 1e-5 || Math.abs(dd) < 1e-6) break;
      u -= d / dd;
    }
    return sy(clamp01(u));
  };
}

export const E = {
  linear: (x: number) => x,
  inCubic: (x: number) => x * x * x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
  outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: (x: number) =>
    x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  outBack: (x: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  /** "Ease ekstrem" khas motion designer: akselerasi tajam, mendarat sangat lembut */
  snap: bezier(0.85, 0, 0.15, 1),
  /** Masuk kencang lalu melambat panjang (whip-in) */
  whip: bezier(0.05, 0.9, 0.1, 1),
  /** Keluar: diam lalu melesat */
  launch: bezier(0.9, 0, 1, 0.4),
};

/** Spring teredam (overshoot alami). x = detik sejak mulai. */
export function spring(x: number, { freq = 2.2, damping = 5.5 } = {}) {
  if (x <= 0) return 0;
  const w = freq * Math.PI * 2;
  return 1 - Math.exp(-damping * x) * Math.cos(w * x);
}

/** Dua keyframe: nilai from→to antara waktu a..b. */
export function k(t: number, a: number, b: number, from: number, to: number, fn: (x: number) => number = E.outCubic) {
  return lerp(from, to, fn(seg(t, a, b)));
}

/** Banyak keyframe: [[waktu, nilai, easingKeSegmenBerikutnya?], ...] */
export function kf(t: number, keys: [number, number, ((x: number) => number)?][]) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0, fn] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t <= t1) return lerp(v0, v1, (fn || E.inOutCubic)(seg(t, t0, t1)));
  }
  return keys[keys.length - 1][1];
}

export function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

/** Kecepatan (unit per detik real) dari fungsi posisi, untuk motion blur. */
export function velocity(fn: (t: number) => number, t: number, speed = 1) {
  const h = 1 / 120;
  return ((fn(t + h) - fn(t - h)) / (2 * h)) * speed;
}

// ============================================================
// Time remapping (speed ramp)
// ============================================================

export interface SpeedZone {
  /** waktu komposisi mulai */
  from: number;
  /** waktu komposisi selesai */
  to: number;
  /** kecepatan putar (1 = normal, 0.3 = slow-mo, 3 = fast) */
  speed: number;
}

export interface TimeRemap {
  /** waktu real (0..realDur) → waktu komposisi */
  toComp: (real: number) => number;
  /** kecepatan putar pada waktu komposisi */
  speedAt: (comp: number) => number;
  compDur: number;
}

/**
 * Bangun kurva time-remap dari zona kecepatan. Perpindahan kecepatan dihaluskan
 * (blend kosinus) seperti speed ramp di AE/Premiere, lalu dinormalisasi
 * agar durasi real tepat `realDur`.
 */
export function buildTimeRemap(zones: SpeedZone[], compDur: number, realDur: number, blend = 0.18): TimeRemap {
  const base = (c: number) => {
    for (const z of zones) if (c >= z.from && c < z.to) return z.speed;
    return 1;
  };
  const speedAt = (c: number) => {
    // rata-rata berbobot di sekitar c → transisi kecepatan yang halus
    let acc = 0, wsum = 0;
    for (let i = -4; i <= 4; i++) {
      const w = Math.cos((i / 5) * (Math.PI / 2));
      acc += base(c + (i / 4) * blend) * w;
      wsum += w;
    }
    return acc / wsum;
  };
  const N = 1400;
  const dc = compDur / N;
  const realAt = new Float64Array(N + 1);
  for (let i = 1; i <= N; i++) {
    const c = (i - 0.5) * dc;
    realAt[i] = realAt[i - 1] + dc / Math.max(0.05, speedAt(c));
  }
  const scale = realAt[N] / realDur;
  const toComp = (real: number) => {
    const r = Math.max(0, Math.min(realDur, real)) * scale;
    let lo = 0, hi = N;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (realAt[mid] < r) lo = mid;
      else hi = mid;
    }
    const span = realAt[hi] - realAt[lo] || 1;
    return (lo + (r - realAt[lo]) / span) * dc;
  };
  return { toComp, speedAt: (c) => speedAt(c) * scale, compDur };
}

// ============================================================
// Layer helpers
// ============================================================

/** Motion blur searah (SVG feGaussianBlur dengan stdDeviation x/y berbeda). */
export function MotionBlurDefs({ id, x, y }: { id: string; x: number; y: number }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={`${Math.min(24, Math.abs(x)).toFixed(2)} ${Math.min(24, Math.abs(y)).toFixed(2)}`} />
      </filter>
    </svg>
  );
}

export function mbFilter(id: string, x: number, y: number) {
  return Math.abs(x) > 0.25 || Math.abs(y) > 0.25 ? `url(#${id})` : undefined;
}

export type CharFrom = {
  x?: number;
  y?: number;
  /** persen tinggi glyph, untuk reveal dari balik mask */
  yPct?: number;
  rot?: number;
  scale?: number;
  blur?: number;
  opacity?: number;
  tracking?: number;
};

/**
 * Text animator per karakter (range selector + offset), opsional mask per huruf
 * dan animator keluar. Order: 'start' | 'end' | 'center' | 'random'.
 */
export function Chars({
  text,
  t,
  start,
  stagger = 0.04,
  dur = 0.6,
  ease = E.outExpo,
  from = {},
  mask = false,
  order = 'start',
  exit,
  style,
  charStyle,
}: {
  text: string;
  t: number;
  start: number;
  stagger?: number;
  dur?: number;
  ease?: (x: number) => number;
  from?: CharFrom;
  mask?: boolean;
  order?: 'start' | 'end' | 'center' | 'random';
  exit?: { at: number; stagger?: number; dur?: number; to: CharFrom; ease?: (x: number) => number };
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties;
}) {
  const chars = Array.from(text);
  const n = chars.length;
  const rank = (i: number) => {
    if (order === 'end') return n - 1 - i;
    if (order === 'center') return Math.abs(i - (n - 1) / 2);
    if (order === 'random') return seeded(i + n * 7) * n;
    return i;
  };
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre', ...style }} aria-label={text}>
      {chars.map((ch, i) => {
        const s = start + rank(i) * stagger;
        const p = ease(seg(t, s, s + dur));
        const q = exit ? (exit.ease || E.inExpo)(seg(t, exit.at + rank(i) * (exit.stagger ?? 0.02), exit.at + rank(i) * (exit.stagger ?? 0.02) + (exit.dur ?? 0.4))) : 0;
        const f = from;
        const o = exit?.to || {};
        const x = (f.x ?? 0) * (1 - p) + (o.x ?? 0) * q;
        const y = (f.y ?? 0) * (1 - p) + (o.y ?? 0) * q;
        const yPct = (f.yPct ?? 0) * (1 - p) + (o.yPct ?? 0) * q;
        const rot = (f.rot ?? 0) * (1 - p) + (o.rot ?? 0) * q;
        const sc = lerp(f.scale ?? 1, 1, p) * lerp(1, o.scale ?? 1, q);
        const bl = (f.blur ?? 0) * (1 - p) + (o.blur ?? 0) * q;
        const op = lerp(f.opacity ?? 1, 1, p) * lerp(1, o.opacity ?? 1, q);
        const tr = (f.tracking ?? 0) * (1 - p) + (o.tracking ?? 0) * q;
        const inner = (
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              transform: `translate3d(${x}px, calc(${y}px + ${yPct}%), 0) rotate(${rot}deg) scale(${sc})`,
              opacity: op,
              filter: bl > 0.2 ? `blur(${bl.toFixed(2)}px)` : undefined,
              marginRight: tr ? `${tr}em` : undefined,
              willChange: 'transform',
              ...(charStyle ? charStyle(i) : null),
            }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        );
        return mask ? (
          <span
            key={i}
            aria-hidden
            style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingTop: '0.12em', marginTop: '-0.12em', paddingBottom: '0.12em', marginBottom: '-0.12em' }}
          >
            {inner}
          </span>
        ) : (
          <React.Fragment key={i}>{inner}</React.Fragment>
        );
      })}
    </span>
  );
}

/** Shape layer dengan Trim Paths (start/end 0..1). */
export function Trim({
  d,
  len,
  end,
  start = 0,
  stroke,
  width = 1.5,
  viewBox,
  style,
  fill = 'none',
  cap = 'round',
}: {
  d: string;
  len: number;
  end: number;
  start?: number;
  stroke: string;
  width?: number;
  viewBox: string;
  style?: React.CSSProperties;
  fill?: string;
  cap?: 'round' | 'butt' | 'square';
}) {
  const e = clamp01(end), s = clamp01(start);
  const visible = Math.max(0, e - s) * len;
  return (
    <svg viewBox={viewBox} style={{ position: 'absolute', overflow: 'visible', ...style }} aria-hidden>
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap={cap}
        strokeDasharray={`${visible} ${len + 10}`}
        strokeDashoffset={-s * len}
        style={{ opacity: visible > 0.01 ? 1 : 0 }}
      />
    </svg>
  );
}

/** Lapisan absolut sederhana. */
export function L({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ position: 'absolute', ...style }}>{children}</div>;
}

/** Foto dengan Ken Burns. */
export function Photo({
  src,
  t,
  a,
  b,
  s0 = 1.2,
  s1 = 1.04,
  x0 = 0,
  x1 = 0,
  y0 = 0,
  y1 = 0,
  pos = 'center',
  style,
}: {
  src: string;
  t: number;
  a: number;
  b: number;
  s0?: number;
  s1?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  pos?: string;
  style?: React.CSSProperties;
}) {
  const p = E.outCubic(seg(t, a, b));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: pos,
        transform: `translate3d(${lerp(x0, x1, p)}%, ${lerp(y0, y1, p)}%, 0) scale(${lerp(s0, s1, p)})`,
        willChange: 'transform',
        ...style,
      }}
    />
  );
}

export const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Data pasangan untuk komposisi. */
export interface FilmEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
}

export interface FilmData {
  groom: string;
  bride: string;
  groomFull: string;
  brideFull: string;
  groomParents: string;
  brideParents: string;
  dateLong: string; // "Sabtu, 8 Agustus 2026"
  weekday: string;
  day: string;
  month: string;
  monthNum: string;
  year: string;
  events: FilmEvent[];
  slug: string;
  guest: string;
  photos: { couple: string; groom: string; bride: string; gallery: string[] };
  /** Teks khusus dari Video Studio; kosong = teks bawaan film. */
  copy?: { tagline?: string; closing?: string };
}

export interface FilmProps {
  t: number; // waktu komposisi (detik)
  speed: number; // kecepatan putar saat ini (untuk motion blur)
  W: number; // lebar stage (unit)
  H: number; // tinggi stage (640)
  d: FilmData;
}
