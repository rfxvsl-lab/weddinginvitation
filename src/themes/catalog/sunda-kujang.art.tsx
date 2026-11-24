/**
 * Pasundan — perkakas gambar: awan Mega Mendung, Tangkuban Parahu, sawah terasering berukir,
 * kujang, dan saung julang ngapak.
 *
 * Mega Mendung (batik pesisir Jawa Barat) digambar dengan teknik aslinya: satu siluet awan
 * berlobus dengan ujung bergulung, diwarnai pita-pita sejajar dari gelap (tepi) ke terang
 * (tengah). Di sini pita dibuat dengan menumpuk garis tepi yang makin tipis dan makin terang
 * (stroke bertumpuk), jadi bentuknya tetap satu path ringan.
 */
import React from 'react';
import { mix, ridgeY, seeded } from '../kit/scene';

export const W = 400;
const f = (n: number) => n.toFixed(1);

/**
 * Siluet awan Mega Mendung di sekitar (0,0): alas bergelombang, lobus atas berukuran
 * berbeda (tengah paling tinggi), ujung kanan & kiri menggulung ke bawah.
 */
export function megaCloud(w: number, lobes = 4, seed = 1) {
  const r = seeded(seed);
  const h = w * 0.13;
  const xs: number[] = [];
  for (let i = 0; i <= lobes; i++) xs.push(-w / 2 + (i / lobes) * w + (i > 0 && i < lobes ? (r() - 0.5) * (w / lobes) * 0.35 : 0));
  let d = `M${f(-w / 2)} 0`;
  for (let i = 0; i < lobes; i++) {
    const mid = 1 - Math.abs((i + 0.5) / lobes - 0.5) * 1.3;
    const lift = h * (0.8 + mid * 1.3 + r() * 0.3);
    const cusp = i === lobes - 1 ? 0 : h * 0.12;
    d += `C${f(xs[i] - 2)} ${f(-lift * 1.32)} ${f(xs[i + 1] + 2)} ${f(-lift * 1.32)} ${f(xs[i + 1])} ${f(cusp)}`;
  }
  // ujung kanan menggulung ke dalam (kait khas Mega Mendung)
  const s2 = h * 1.05;
  const R = w / 2;
  d += `C${f(R + s2 * 1.05)} ${f(-s2 * 0.25)} ${f(R + s2 * 1.15)} ${f(s2 * 0.95)} ${f(R + s2 * 0.25)} ${f(s2 * 1.05)}`;
  d += `C${f(R - s2 * 0.45)} ${f(s2 * 1.12)} ${f(R - s2 * 0.55)} ${f(s2 * 0.45)} ${f(R - s2 * 0.05)} ${f(s2 * 0.42)}`;
  // alas hampir datar dengan riak kecil
  const steps = lobes + 1;
  for (let i = 1; i <= steps; i++) {
    const x1 = R - s2 * 0.05 - (i / steps) * (w - s2 * 0.1);
    const xm = x1 + (w - s2 * 0.1) / steps / 2;
    d += `Q${f(xm)} ${f(s2 * (0.62 + (i % 2) * 0.12))} ${f(x1)} ${f(s2 * 0.42)}`;
  }
  // ujung kiri menggulung
  d += `C${f(-R - s2 * 0.55)} ${f(s2 * 0.45)} ${f(-R - s2 * 0.45)} ${f(s2 * 1.12)} ${f(-R - s2 * 0.25)} ${f(s2 * 1.05)}`;
  d += `C${f(-R - s2 * 1.15)} ${f(s2 * 0.95)} ${f(-R - s2 * 1.05)} ${f(-s2 * 0.25)} ${f(-R)} 0Z`;
  return d;
}

/** Warna pita Mega Mendung dari gelap ke terang, satu rona dengan `base`. */
export function megaBands(base: string, n = 8, light = '#F4F1E6', max = 0.9, dark = '#000000') {
  // langkah terang yang jelas antar pita (seperti celupan bertingkat), pita pertama paling gelap
  return Array.from({ length: n }, (_, i) => (i === 0 ? mix(base, dark, 0.45) : mix(base, light, max * Math.pow(i / (n - 1), 1.15))));
}

/** Awan Mega Mendung berpita (stroke bertumpuk). `band` = lebar satu pita. */
export function MegaMendung({ x, y, w, lobes = 4, seed = 1, colors, band = 3.2, flip = false, style }: { x: number; y: number; w: number; lobes?: number; seed?: number; colors: string[]; band?: number; flip?: boolean; style?: React.CSSProperties }) {
  const d = megaCloud(w, lobes, seed);
  const n = colors.length;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} style={style}>
      {colors.slice(0, n - 1).map((c, i) => (
        <path key={i} d={d} fill="none" stroke={c} strokeWidth={(n - 1 - i) * band * 2} strokeLinejoin="round" />
      ))}
      <path d={d} fill={colors[n - 1]} />
    </g>
  );
}

/** Gulungan bundar Mega Mendung (cincin berpita). */
export function Coil({ x, y, r, colors }: { x: number; y: number; r: number; colors: string[] }) {
  const n = colors.length;
  return (
    <g>
      {colors.map((c, i) => (
        <circle key={i} cx={x} cy={y} r={Math.max(0.5, r * (1 - i / n))} fill={c} />
      ))}
      <path d={`M${f(x)} ${f(y)}m${f(-r * 0.32)} 0a${f(r * 0.32)} ${f(r * 0.32)} 0 1 1 ${f(r * 0.32)} ${f(r * 0.32)}`} stroke={colors[0]} strokeWidth={1.2} fill="none" />
    </g>
  );
}

/** Profil Tangkuban Parahu (perahu terbalik): puncak datar memanjang, lereng panjang. */
export function tangkuban(base: number, s = 1) {
  const y = (v: number) => f(base - v * s);
  return `M-30 ${f(base + 400)}L-30 ${y(8)}C30 ${y(14)} 70 ${y(30)} 104 ${y(62)}C128 ${y(84)} 150 ${y(108)} 176 ${y(118)}C210 ${y(128)} 248 ${y(126)} 276 ${y(116)}C300 ${y(106)} 316 ${y(90)} 336 ${y(70)}C360 ${y(48)} 390 ${y(26)} 430 ${y(14)}L430 ${f(base + 400)}Z`;
}

/** Garis ukir (hatching) sejajar punggung — kesan gravir emas. */
export function engrave(o: { base: number; amp: number; rough: number; seed: number }, rows: number, gap: number, from = 6) {
  let d = '';
  for (let k = 0; k < rows; k++) {
    let seg = '';
    for (let x = -20; x <= W + 20; x += 10) {
      const yy = ridgeY({ w: W, ...o }, x) + from + k * gap + Math.sin((x / W) * Math.PI * 2 + k) * 1.5;
      seg += `${seg ? 'L' : 'M'}${x} ${f(yy)}`;
    }
    d += seg;
  }
  return d;
}

/** Petak sawah terasering: pita lengkung berselang dua warna + tepi emas tipis. */
export function terraces(o: { base: number; amp: number; rough: number; seed: number }, rows: number, gap: number) {
  const bands: string[] = [];
  const rims: string[] = [];
  for (let k = 0; k < rows; k++) {
    let top = '';
    let bot = '';
    for (let x = -20; x <= W + 20; x += 10) {
      const bend = Math.sin((x / W) * Math.PI) * (2 + k * 1.6);
      const y0 = ridgeY({ w: W, ...o }, x) + k * gap + bend;
      top += `${top ? 'L' : 'M'}${x} ${f(y0)}`;
      bot = `L${x} ${f(y0 + gap)}` + bot;
    }
    bands.push(top + bot + 'Z');
    rims.push(top);
  }
  return { bands, rims };
}

/** Saung beratap julang ngapak (atap bersayap) di atas tiang. */
export function Saung({ x, y, s, fill, glow }: { x: number; y: number; s: number; fill: string; glow: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-11 0V-10M11 0V-10M0 0V-10" stroke={fill} strokeWidth={1.6} />
      <rect x={-12} y={-19} width={24} height={10} fill={fill} />
      <rect x={-4} y={-17} width={8} height={6} fill={glow} opacity={0.9} />
      <path d="M-30 -16L-17 -20L0 -38L17 -20L30 -16L14 -19L-14 -19Z" fill={fill} />
      <path d="M0 -38V-44M-4 -44L0 -48L4 -44" stroke={fill} strokeWidth={1.4} fill="none" />
    </g>
  );
}

/** Kujang (bilah bergerigi dengan lubang mata) — emas. */
export const KUJANG =
  'M20 112C14 92 12 76 17 60L11 56L17 52C17 40 20 24 27 4C33 16 36 26 34 36C43 44 45 56 38 66C34 72 34 78 38 84C42 92 39 104 31 112Z';

export function Kujang({ x, y, s = 1, flip = false, gold, hole }: { x: number; y: number; s?: number; flip?: boolean; gold: string; hole: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={KUJANG} fill={gold} />
      <path d="M25 104C22 82 22 52 27 12" stroke="#3A2E14" strokeWidth={0.8} opacity={0.4} fill="none" />
      {[40, 54, 68, 82].map((yy, i) => (
        <circle key={yy} cx={25.5 + i * 0.7} cy={yy} r={1.9} fill={hole} />
      ))}
      <rect x={16} y={112} width={18} height={5} rx={1.6} fill="#E6CF8E" />
      <path d="M19 117C18 128 20 138 25 147C30 139 32 129 31 117Z" fill={gold} />
    </g>
  );
}

/** Burung kuntul terbang (garis). */
export function egret(x: number, y: number, s: number) {
  return `M${f(x - 9 * s)} ${f(y)}Q${f(x - 4 * s)} ${f(y - 5 * s)} ${f(x)} ${f(y)}Q${f(x + 4 * s)} ${f(y - 5 * s)} ${f(x + 9 * s)} ${f(y)}`;
}
