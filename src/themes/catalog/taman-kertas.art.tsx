/**
 * Taman Kertas — perkakas ilustrasi kertas potong (kirigami).
 *
 * Teknik yang membuat ilustrasi terasa seperti kertas sungguhan, bukan clip-art:
 * - tepi potongan tangan (feDisplacementMap halus) + serat kertas (feTurbulence)
 * - lubang tembus (fill-rule evenodd) seperti renda/punch: lapisan belakang terlihat lewat lubang
 * - tepi bergerigi bulat (scallop), daun & bunga dibentuk prosedural dengan variasi seed
 * - bentuk origami bersegi dua warna (bangau, pesawat) agar lipatannya terbaca
 *
 * Semua fungsi murni (mengembalikan path) kecuali komponen kecil di bawah.
 */
import React from 'react';
import { ridgeY, seeded } from '../kit/scene';

export const W = 400;
export const H = 800;

/** Palet washi: lembut, hangat, tidak jenuh seperti krayon. */
export const C = {
  paper: '#FFFBF4',
  cream: '#F5ECDF',
  sand: '#E9D9C3',
  blush: '#F0CDBF',
  rose: '#DE9A93',
  coral: '#CF7A68',
  terracotta: '#B9614E',
  mustard: '#E3B45B',
  butter: '#F3D892',
  sage: '#B5C4A6',
  fern: '#8BA685',
  moss: '#5F8266',
  teal: '#2F6A68',
  deep: '#22484A',
  lilac: '#C9BCD9',
  plum: '#4A3340',
  night: '#1F2547',
};

const f = (n: number) => n.toFixed(1);

/** Lingkaran sebagai subpath (untuk lubang evenodd). */
export function circ(cx: number, cy: number, r: number) {
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

/** Daun runcing dua sisi dari (x,y) ke arah `ang` (derajat). */
export function leaf(x: number, y: number, len: number, ang: number, wid = 0.34, bend = 0) {
  const a = (ang * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * len * wid;
  const ny = Math.cos(a) * len * wid;
  const mx = (x + tx) / 2 + Math.cos(a + Math.PI / 2) * bend;
  const my = (y + ty) / 2 + Math.sin(a + Math.PI / 2) * bend;
  return `M${f(x)} ${f(y)}Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)}Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)}Z`;
}

/** Tetes air (lubang punch berbentuk kelopak) mengarah ke `ang`. */
export function drop(x: number, y: number, len: number, ang: number) {
  return leaf(x, y, len, ang, 0.42);
}

/**
 * Bukit dengan tepi scallop + dua baris lubang renda di bawah tepinya.
 * Lubang memakai evenodd sehingga lapisan di belakang terlihat.
 */
export function laceHill({ base, amp, seed, r = 15, rough = 1.4, holes = true, h = H }: { base: number; amp: number; seed: number; r?: number; rough?: number; holes?: boolean; h?: number }) {
  const y = (x: number) => ridgeY({ w: W, base, amp, rough, seed }, x);
  let d = `M-24 ${h}L-24 ${f(y(-24))}`;
  for (let x = -24; x < W + 24; x += 2 * r) d += `A${r} ${r * 0.9} 0 0 1 ${f(x + 2 * r)} ${f(y(x + 2 * r))}`;
  d += `L${W + 24} ${h}Z`;
  if (holes) {
    for (let x = -24 + r; x < W + 24; x += 2 * r) d += circ(x, y(x) + r * 0.95, r * 0.16);
    for (let x = -24 + 3 * r; x < W + 24; x += 6 * r) d += drop(x, y(x) + r * 1.55, r * 0.75, 90) + circ(x - r * 0.55, y(x) + r * 2.1, r * 0.1) + circ(x + r * 0.55, y(x) + r * 2.1, r * 0.1);
  }
  return d;
}

/** Garis punggung bukit (untuk menaruh benda di atasnya). */
export function hillY(o: { base: number; amp: number; seed: number; rough?: number }, x: number) {
  return ridgeY({ w: W, rough: 1.4, ...o }, x);
}

/** Pakis: tangkai melengkung dengan anak daun berselang-seling yang mengecil ke ujung. */
export function fern(x: number, y: number, len: number, ang: number, curl = 0.25, n = 16, leafLen = 0.32) {
  const a = (ang * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const cx = (x + tx) / 2 - Math.sin(a) * len * curl;
  const cy = (y + ty) / 2 + Math.cos(a) * len * curl;
  const at = (t: number) => [(1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t * t * tx, (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t * t * ty];
  const tan = (t: number) => Math.atan2(2 * (1 - t) * (cy - y) + 2 * t * (ty - cy), 2 * (1 - t) * (cx - x) + 2 * t * (tx - cx));
  let blades = '';
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const [px, py] = at(t);
    const th = (tan(t) * 180) / Math.PI;
    const l = len * leafLen * (1 - t * 0.85) * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.6)));
    const side = i % 2 ? 1 : -1;
    blades += leaf(px, py, l, th + side * 58, 0.3, side * l * 0.08);
  }
  blades += leaf(tx, ty, len * 0.08, (tan(1) * 180) / Math.PI, 0.3);
  return { stem: `M${f(x)} ${f(y)}Q${f(cx)} ${f(cy)} ${f(tx)} ${f(ty)}`, blades };
}

/** Daun lebar bertulang (monstera-ish tanpa lubang) — untuk semak depan. */
export function broadLeaf(x: number, y: number, len: number, ang: number) {
  const body = leaf(x, y, len, ang, 0.42, len * 0.06);
  const a = (ang * Math.PI) / 180;
  let veins = '';
  for (let i = 1; i <= 5; i++) {
    const t = i / 6.5;
    const px = x + Math.cos(a) * len * t;
    const py = y + Math.sin(a) * len * t;
    const vl = len * 0.22 * (1 - t * 0.6);
    for (const s of [1, -1]) {
      const va = a + s * 0.9;
      veins += drop(px + Math.cos(va) * 3, py + Math.sin(va) * 3, vl, (va * 180) / Math.PI);
    }
  }
  return { body, veins };
}

/** Bunga aster/daisy: kelopak lonjong + pusat. */
export function daisy(x: number, y: number, r: number, n = 12, rot = 0) {
  let d = '';
  for (let i = 0; i < n; i++) d += leaf(x, y, r, rot + (i * 360) / n, 0.26);
  return d;
}

/** Kosmos: kelopak lebar bergerigi ujung. */
export function cosmos(x: number, y: number, r: number, rot = 0) {
  let d = '';
  for (let i = 0; i < 8; i++) {
    const a = ((rot + i * 45) * Math.PI) / 180;
    const w = r * 0.42;
    const p = (k: number, s: number) => [x + Math.cos(a) * r * k + Math.cos(a + Math.PI / 2) * w * s, y + Math.sin(a) * r * k + Math.sin(a + Math.PI / 2) * w * s];
    const [ax, ay] = p(0.95, -1);
    const [bx, by] = p(0.82, -0.3);
    const [cx2, cy2] = p(1, 0);
    const [dx, dy] = p(0.82, 0.3);
    const [ex, ey] = p(0.95, 1);
    d += `M${f(x)} ${f(y)}L${f(ax)} ${f(ay)}L${f(bx)} ${f(by)}L${f(cx2)} ${f(cy2)}L${f(dx)} ${f(dy)}L${f(ex)} ${f(ey)}Z`;
  }
  return d;
}

/** Tulip: cawan tiga kelopak. */
export function tulip(x: number, y: number, s: number) {
  return `M${f(x - s)} ${f(y - s * 1.6)}Q${f(x - s * 1.1)} ${f(y)} ${f(x)} ${f(y)}Q${f(x + s * 1.1)} ${f(y)} ${f(x + s)} ${f(y - s * 1.6)}L${f(x + s * 0.45)} ${f(y - s * 0.9)}L${f(x)} ${f(y - s * 1.8)}L${f(x - s * 0.45)} ${f(y - s * 0.9)}Z`;
}

/** Bulir lavender: deret kuncup lonjong mengecil ke atas. */
export function spike(x: number, y: number, len: number, lean = 0) {
  let d = '';
  for (let i = 0; i < 9; i++) {
    const t = i / 9;
    const px = x + lean * t * len;
    const py = y - t * len;
    const s = 4.2 * (1 - t * 0.55);
    d += leaf(px, py, s * 1.5, -90 - 32, 0.5) + leaf(px, py, s * 1.5, -90 + 32, 0.5);
  }
  return d;
}

/** Bunga lonceng menunduk. */
export function bell(x: number, y: number, s: number) {
  return `M${f(x - s)} ${f(y)}Q${f(x - s)} ${f(y + s * 1.6)} ${f(x - s * 0.5)} ${f(y + s * 1.7)}L${f(x - s * 0.25)} ${f(y + s * 1.4)}L${f(x)} ${f(y + s * 1.8)}L${f(x + s * 0.25)} ${f(y + s * 1.4)}L${f(x + s * 0.5)} ${f(y + s * 1.7)}Q${f(x + s)} ${f(y + s * 1.6)} ${f(x + s)} ${f(y)}Q${f(x)} ${f(y - s * 0.5)} ${f(x - s)} ${f(y)}Z`;
}

/** Bilah rumput sebagai segitiga melengkung. */
export function blades(y0: number, seed: number, n = 70, hMin = 14, hMax = 34, x0 = -20, x1 = W + 20) {
  const r = seeded(seed);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + r()) / n) * (x1 - x0);
    const hh = hMin + r() * (hMax - hMin);
    const lean = (r() - 0.5) * hh * 0.7;
    const w = 2.2 + r() * 2.4;
    d += `M${f(x - w)} ${f(y0)}Q${f(x + lean * 0.3)} ${f(y0 - hh * 0.6)} ${f(x + lean)} ${f(y0 - hh)}Q${f(x + lean * 0.2 + w * 0.4)} ${f(y0 - hh * 0.5)} ${f(x + w)} ${f(y0)}Z`;
  }
  return d;
}

/** Matahari renda (doily): tepi scallop, cincin lubang, kelopak tembus di tengah. */
export function laceSun(r: number) {
  const n = 28;
  let outer = '';
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    outer += i === 0 ? `M${f(x)} ${f(y)}` : `A${f(r * 0.12)} ${f(r * 0.12)} 0 0 1 ${f(x)} ${f(y)}`;
  }
  outer += 'Z';
  let holes = '';
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    holes += circ(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, r * 0.045);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 360;
    holes += drop(Math.cos((a * Math.PI) / 180) * r * 0.22, Math.sin((a * Math.PI) / 180) * r * 0.22, r * 0.36, a);
  }
  holes += circ(0, 0, r * 0.1);
  return outer + holes;
}

/** Awan kertas berlapis: tumpukan lengkung + bayangan bawah datar. */
export function cloud(x: number, y: number, s: number) {
  const r = 12 * s;
  return `M${f(x - 4 * r)} ${f(y)}A${f(r * 1.1)} ${f(r * 1.1)} 0 0 1 ${f(x - 2.2 * r)} ${f(y - r * 0.9)}A${f(r * 1.5)} ${f(r * 1.5)} 0 0 1 ${f(x + 0.2 * r)} ${f(y - r * 1.5)}A${f(r * 1.3)} ${f(r * 1.3)} 0 0 1 ${f(x + 2.4 * r)} ${f(y - r * 0.6)}A${f(r)} ${f(r)} 0 0 1 ${f(x + 4 * r)} ${f(y)}Z`;
}

/** Burung layang-layang (siluet ekor bercabang), sayap dianimasikan lewat skala. */
export function swallow() {
  return 'M0 0C-5 -5 -13 -9 -24 -8C-15 -5 -9 -1 -6 3L-13 13L-3 6L2 10L1 3C7 0 15 -6 25 -14C14 -11 6 -5 0 0Z';
}

/** Bangau origami (dua warna segi) di sekitar (0,0). */
export function crane() {
  return {
    light: 'M-30 2L0 -6L8 4ZM0 -6L22 -34L10 0ZM8 4L34 -2L44 -16L36 4Z',
    dark: 'M-30 2L8 4L-6 12ZM8 4L36 4L18 10ZM-30 2L-40 -10L-24 0Z',
    wing: 'M-4 -2L-18 -40L12 -4Z',
    wingFold: 'M-4 -2L-18 -40L2 -10Z',
  };
}

/** Pesawat kertas bersegi. */
export function plane() {
  return { top: 'M0 0L44 -14L10 4Z', side: 'M10 4L44 -14L16 10Z', keel: 'M10 4L16 10L12 14Z' };
}

/** Pohon kertas: batang meruncing bercabang + tajuk dari banyak daun potong. */
export function paperTree(x: number, gy: number, h: number, cr: number, seed: number, shape: 'round' | 'tall' = 'round') {
  const r = seeded(seed);
  const tw = Math.max(4, h * 0.05);
  const top = gy - h;
  let trunk = `M${f(x - tw)} ${gy}C${f(x - tw * 0.6)} ${f(gy - h * 0.5)} ${f(x - 1.5)} ${f(top + cr * 0.4)} ${f(x)} ${f(top)}C${f(x + 1.5)} ${f(top + cr * 0.4)} ${f(x + tw * 0.6)} ${f(gy - h * 0.5)} ${f(x + tw)} ${gy}Z`;
  for (const s of [-1, 1]) {
    const by = gy - h * (0.45 + r() * 0.15);
    trunk += `M${f(x)} ${f(by)}Q${f(x + s * cr * 0.35)} ${f(by - cr * 0.3)} ${f(x + s * cr * 0.6)} ${f(by - cr * 0.65)}L${f(x + s * cr * 0.6 + s * 2)} ${f(by - cr * 0.6)}Q${f(x + s * cr * 0.3)} ${f(by - cr * 0.15)} ${f(x + s * 1)} ${f(by + 6)}Z`;
  }
  const leaves: string[] = ['', '', ''];
  const N = Math.round(cr * 3.4);
  for (let i = 0; i < N; i++) {
    const t = r() * Math.PI * 2;
    const rr = Math.sqrt(r());
    const ry = shape === 'tall' ? cr * 1.5 : cr;
    const lx = x + Math.cos(t) * cr * rr;
    const ly = top + Math.sin(t) * ry * rr * 0.92;
    const ang = (t * 180) / Math.PI + (r() - 0.5) * 50;
    leaves[i % 3] += leaf(lx, ly, cr * (0.3 + r() * 0.2), ang, 0.4);
  }
  return { trunk, leaves };
}

/** Tajuk berbentuk hati dari daun potong (dua pohon yang bertemu). */
export function heartCanopy(cx: number, cy: number, s: number, seed: number, n = 150) {
  const r = seeded(seed);
  const out: string[] = ['', '', ''];
  let placed = 0;
  let guard = 0;
  while (placed < n && guard++ < n * 20) {
    const u = (r() - 0.5) * 2.6;
    const v = (r() - 0.5) * 2.6;
    const X = u;
    const Y = -v;
    if ((X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 > 0) continue;
    const ang = (Math.atan2(v, u) * 180) / Math.PI + (r() - 0.5) * 70;
    out[placed % 3] += leaf(cx + u * s * 0.5, cy + v * s * 0.5, s * (0.09 + r() * 0.07), ang, 0.38);
    placed++;
  }
  return out;
}

/** Lentera kertas akordeon. */
export function lantern(w: number, h: number) {
  const body = `M${f(-w * 0.32)} ${f(-h / 2)}C${f(-w * 0.62)} ${f(-h * 0.3)} ${f(-w * 0.62)} ${f(h * 0.3)} ${f(-w * 0.32)} ${f(h / 2)}L${f(w * 0.32)} ${f(h / 2)}C${f(w * 0.62)} ${f(h * 0.3)} ${f(w * 0.62)} ${f(-h * 0.3)} ${f(w * 0.32)} ${f(-h / 2)}Z`;
  let ribs = '';
  for (let i = 1; i < 6; i++) {
    const yy = -h / 2 + (i * h) / 6;
    const k = Math.sin((i / 6) * Math.PI);
    ribs += `M${f(-w * (0.32 + 0.18 * k))} ${f(yy)}Q0 ${f(yy + 3)} ${f(w * (0.32 + 0.18 * k))} ${f(yy)}`;
  }
  return { body, ribs };
}

/** Amplop dengan segel lilin bergerigi. */
export function envelope(w: number) {
  const h = w * 0.64;
  return {
    body: `M${f(-w / 2)} ${f(-h / 2)}H${f(w / 2)}V${f(h / 2)}H${f(-w / 2)}Z`,
    folds: `M${f(-w / 2)} ${f(h / 2)}L0 ${f(h * 0.02)}L${f(w / 2)} ${f(h / 2)}`,
    flap: `M${f(-w / 2)} ${f(-h / 2)}L0 ${f(h * 0.12)}L${f(w / 2)} ${f(-h / 2)}Z`,
    seal: (() => {
      let d = '';
      const R = w * 0.1;
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const rr = i % 2 ? R * 0.86 : R;
        d += `${i ? 'L' : 'M'}${f(Math.cos(a) * rr)} ${f(h * 0.1 + Math.sin(a) * rr)}`;
      }
      return d + 'Z';
    })(),
  };
}

/** Bintang lima sudut. */
export function star(r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${f(Math.cos(a) * rr)} ${f(Math.sin(a) * rr)}`;
  }
  return d + 'Z';
}

/** Bulan sabit renda dengan lubang bintang kecil. */
export function laceMoon(r: number) {
  let d = `M0 ${f(-r)}A${f(r)} ${f(r)} 0 1 0 0 ${f(r)}A${f(r * 0.78)} ${f(r * 0.78)} 0 1 1 0 ${f(-r)}Z`;
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.62 + i * 0.19);
    d += circ(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, r * 0.06);
  }
  return d;
}

/** Hamparan bunga liar campuran: tangkai, daun, kepala bunga bermacam jenis. */
export function wildBed(y0: number, seed: number, n = 22, palette = [C.paper, C.rose, C.mustard, C.coral, C.lilac], x0 = -10, x1 = W + 10) {
  const r = seeded(seed);
  let stems = '';
  let leaves = '';
  const heads: Record<string, string> = {};
  const centers: string[] = [];
  const add = (c: string, d: string) => (heads[c] = (heads[c] || '') + d);
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + r()) / n) * (x1 - x0);
    const hh = 40 + r() * 70;
    const lean = (r() - 0.5) * 26;
    const tx = x + lean;
    const ty = y0 - hh;
    stems += `M${f(x)} ${f(y0)}Q${f(x + lean * 0.2)} ${f(y0 - hh * 0.5)} ${f(tx)} ${f(ty)}`;
    leaves += leaf(x + lean * 0.1, y0 - hh * 0.3, 14 + r() * 8, -90 + (r() > 0.5 ? 50 : -50), 0.3);
    const kind = Math.floor(r() * 5);
    const col = palette[Math.floor(r() * palette.length)];
    if (kind === 0) {
      add(col, daisy(tx, ty, 9 + r() * 4, 12, r() * 30));
      centers.push(circ(tx, ty, 3));
    } else if (kind === 1) add(col, cosmos(tx, ty, 11 + r() * 4, r() * 45));
    else if (kind === 2) add(col, tulip(tx, ty + 4, 6 + r() * 2));
    else if (kind === 3) add(C.lilac, spike(tx, ty + 18, 30 + r() * 10, (r() - 0.5) * 0.3));
    else {
      add(col, bell(tx - 6, ty + 4, 5) + bell(tx + 6, ty + 10, 4.5));
      stems += `M${f(tx)} ${f(ty)}Q${f(tx - 6)} ${f(ty - 4)} ${f(tx - 6)} ${f(ty + 4)}M${f(tx)} ${f(ty)}Q${f(tx + 6)} ${f(ty)} ${f(tx + 6)} ${f(ty + 10)}`;
    }
  }
  return { stems, leaves, heads, centers: centers.join('') };
}

// ------------------------------------------------------------------ komponen

/** Filter kertas: tepi potong tangan + serat. Sertakan sekali per dokumen (id identik aman). */
export function PaperDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <filter id="tk-paper" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="cut" />
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" result="fiber" />
          <feColorMatrix in="fiber" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.18  0.22 0 0 0 -0.07" result="speck" />
          <feComposite in="speck" in2="cut" operator="in" result="grain" />
          <feMorphology in="cut" operator="erode" radius="1.2" result="inner" />
          <feComposite in="cut" in2="inner" operator="out" result="rim" />
          <feColorMatrix in="rim" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .38 0" result="rimLight" />
          <feOffset in="rimLight" dy="-0.6" result="rimUp" />
          <feComposite in="rimUp" in2="cut" operator="in" result="edge" />
          <feMerge>
            <feMergeNode in="cut" />
            <feMergeNode in="grain" />
            <feMergeNode in="edge" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

export const paperFilter = 'url(#tk-paper)';

/** Ladang: punggung halus + celah alur (slit) sejajar punggung — seperti kertas yang diiris. */
export function fieldHill({ base, amp, seed, rows = 4, gap = 13, h = H }: { base: number; amp: number; seed: number; rows?: number; gap?: number; h?: number }) {
  const y = (x: number) => ridgeY({ w: W, base, amp, rough: 1.1, seed }, x);
  let d = `M-24 ${h}`;
  for (let x = -24; x <= W + 24; x += 8) d += `L${x} ${f(y(x))}`;
  d += `L${W + 24} ${h}Z`;
  const r = seeded(seed + 99);
  for (let k = 1; k <= rows; k++) {
    let x = -10 + r() * 30;
    while (x < W) {
      const len = 30 + r() * 60;
      const x2 = Math.min(W + 10, x + len);
      const o = k * gap;
      const t = 1.1 + k * 0.25;
      // celah tipis meruncing di kedua ujung
      d += `M${f(x)} ${f(y(x) + o)}Q${f((x + x2) / 2)} ${f(y((x + x2) / 2) + o - t)} ${f(x2)} ${f(y(x2) + o)}Q${f((x + x2) / 2)} ${f(y((x + x2) / 2) + o + t)} ${f(x)} ${f(y(x) + o)}Z`;
      x = x2 + 10 + r() * 24;
    }
  }
  return d;
}

/** Pegunungan runcing + topi salju terpisah. */
export function peaks({ base, seed, n = 5, hMin = 70, hMax = 150 }: { base: number; seed: number; n?: number; hMin?: number; hMax?: number }) {
  const r = seeded(seed);
  const pts: [number, number][] = [[-30, base]];
  const tops: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const x = -30 + ((i + 0.5 + (r() - 0.5) * 0.5) / n) * (W + 60);
    const hh = hMin + r() * (hMax - hMin);
    pts.push([x - 40 - r() * 20, base - hh * 0.35]);
    pts.push([x, base - hh]);
    tops.push([x, base - hh, hh]);
    pts.push([x + 36 + r() * 20, base - hh * 0.4]);
  }
  pts.push([W + 30, base]);
  let d = `M-30 ${H}`;
  pts.forEach(([x, yy]) => (d += `L${f(x)} ${f(yy)}`));
  d += `L${W + 30} ${H}Z`;
  let snow = '';
  tops.forEach(([x, yy, hh]) => {
    const s = hh * 0.22;
    snow += `M${f(x)} ${f(yy)}L${f(x + s * 0.95)} ${f(yy + s)}L${f(x + s * 0.45)} ${f(yy + s * 0.8)}L${f(x + s * 0.1)} ${f(yy + s * 1.15)}L${f(x - s * 0.35)} ${f(yy + s * 0.78)}L${f(x - s * 0.85)} ${f(yy + s * 1.02)}Z`;
  });
  return { d, snow };
}

/** Rumah kecil beratap pelana dengan jendela tembus (evenodd). */
export function house(x: number, y: number, w: number, roof = 0.7) {
  const h = w * 0.7;
  let walls = `M${f(x - w / 2)} ${f(y)}V${f(y - h)}H${f(x + w / 2)}V${f(y)}Z`;
  const ww = w * 0.16;
  walls += `M${f(x - w * 0.3)} ${f(y - h * 0.68)}h${f(ww)}v${f(ww)}h${f(-ww)}Z`;
  walls += `M${f(x + w * 0.14)} ${f(y - h * 0.68)}h${f(ww)}v${f(ww)}h${f(-ww)}Z`;
  walls += `M${f(x - ww * 0.55)} ${f(y)}v${f(-h * 0.42)}h${f(ww * 1.1)}v${f(h * 0.42)}Z`;
  const roofD = `M${f(x - w * 0.62)} ${f(y - h + 2)}L${f(x)} ${f(y - h - w * roof)}L${f(x + w * 0.62)} ${f(y - h + 2)}Z`;
  return { walls, roof: roofD };
}

/** Ombak kertas berlapis (scallop terbalik). */
export function waves(base: number, r: number, phase = 0, h = H) {
  let d = `M-30 ${h}L-30 ${base}`;
  for (let x = -30 + phase; x < W + 30; x += 2 * r) d += `Q${f(x + r * 0.5)} ${f(base - r * 0.9)} ${f(x + r)} ${f(base - r * 0.2)}Q${f(x + r * 1.3)} ${f(base + r * 0.25)} ${f(x + 2 * r)} ${base}`;
  d += `L${W + 30} ${h}Z`;
  return d;
}

/** Perahu layar kertas. */
export function sailboat(s: number) {
  return {
    hull: `M${-30 * s} 0L${30 * s} 0L${20 * s} ${12 * s}L${-22 * s} ${12 * s}Z`,
    sail: `M${-2 * s} ${-4 * s}L${-2 * s} ${-52 * s}L${-26 * s} ${-6 * s}Z`,
    sail2: `M${2 * s} ${-4 * s}L${2 * s} ${-44 * s}L${22 * s} ${-6 * s}Z`,
  };
}
