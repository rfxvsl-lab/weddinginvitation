'use client';

/**
 * Mesin adegan 2D / 2.5D untuk tema Spesial.
 *
 * - <SceneProvider> membaca progres gulir seluruh undangan (0 → 1), kemiringan
 *   perangkat (giroskop / kursor), dan progres intro setelah sampul dibuka.
 * - <Layer depth> menggeser lapisannya sesuai kedalaman: 0 = paling jauh (hampir diam),
 *   1 = paling dekat (bergerak paling banyak). Transformasi ditulis langsung ke DOM
 *   per frame — tanpa render ulang React.
 * - useScene(fn) memberi akses ke state per frame untuk efek lain (warna langit, opasitas).
 *
 * Semua gerak mati bila pengguna memilih "kurangi gerakan".
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';

export interface SceneState {
  /** progres gulir seluruh halaman 0..1 */
  progress: number;
  /** progres intro setelah sampul dibuka 0..1 */
  intro: number;
  /** kemiringan -1..1 */
  tiltX: number;
  tiltY: number;
  /** tinggi & lebar viewport px */
  vh: number;
  vw: number;
  /** posisi gulir px */
  scrollTop: number;
  /** progres keluar dari hero yang tertahan (0 = di atas, 1 = hero selesai) */
  hero: number;
  /** waktu (detik) sejak adegan dimulai */
  time: number;
  reduced: boolean;
}

export type SceneIntro = 'dolly' | 'popup' | 'rise' | 'descend';

type Listener = (s: SceneState) => void;

interface Driver {
  state: SceneState;
  intro: SceneIntro;
  subscribe: (fn: Listener) => () => void;
}

const Ctx = createContext<Driver | null>(null);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutBack = (t: number) => {
  const c = 1.45;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Mintalah izin giroskop (iOS 13+) — panggil dari klik pengguna, mis. tombol "Buka Undangan". */
export function requestTiltPermission() {
  const DOE = (typeof window !== 'undefined' ? (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent : undefined);
  if (DOE && typeof DOE.requestPermission === 'function') {
    DOE.requestPermission().catch(() => {});
  }
}

export function SceneProvider({
  opened,
  intro = 'dolly',
  introMs = 1800,
  children,
}: {
  opened: boolean;
  intro?: SceneIntro;
  introMs?: number;
  children: React.ReactNode;
}) {
  const listeners = useRef(new Set<Listener>());
  const state = useRef<SceneState>({ progress: 0, intro: opened ? 1 : 0, tiltX: 0, tiltY: 0, vh: 800, vw: 400, scrollTop: 0, hero: 0, time: 0, reduced: false });
  const target = useRef({ progress: 0, tiltX: 0, tiltY: 0, scrollTop: 0 });
  const openedAt = useRef<number | null>(opened ? -1 : null);
  const anchor = useRef<HTMLDivElement>(null);
  const driver = useRef<Driver>({
    state: state.current,
    intro,
    subscribe: (fn) => {
      listeners.current.add(fn);
      fn(state.current);
      return () => listeners.current.delete(fn);
    },
  });

  useEffect(() => {
    if (opened && openedAt.current === null) openedAt.current = performance.now();
  }, [opened]);

  useEffect(() => {
    const doc = anchor.current?.ownerDocument || document;
    const win = doc.defaultView || window;
    const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    state.current.reduced = reduced;

    const readScroll = (el: Element | null) => {
      // pratinjau iframe menggulir <body>; halaman biasa menggulir <html>
      const s = el && el.scrollHeight - el.clientHeight > 40 ? el : doc.scrollingElement || doc.documentElement;
      const max = s.scrollHeight - s.clientHeight;
      if (max > 40) {
        target.current.progress = clamp(s.scrollTop / max);
        target.current.scrollTop = s.scrollTop;
      }
    };
    // cek nodeType, bukan instanceof: undangan bisa dirender ke dalam iframe (realm berbeda)
    const onScroll = (e: Event) => readScroll(e.target && (e.target as Node).nodeType === 1 ? (e.target as Element) : null);
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      target.current.tiltX = clamp((e.clientX / win.innerWidth) * 2 - 1, -1, 1);
      target.current.tiltY = clamp((e.clientY / win.innerHeight) * 2 - 1, -1, 1);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.current.tiltX = clamp(e.gamma / 25, -1, 1);
      target.current.tiltY = clamp((e.beta - 45) / 30, -1, 1);
    };
    doc.addEventListener('scroll', onScroll, { capture: true, passive: true });
    win.addEventListener('pointermove', onPointer, { passive: true });
    win.addEventListener('deviceorientation', onOrient, { passive: true });

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const s = state.current;
      const tg = target.current;
      s.vh = win.innerHeight || 800;
      s.vw = win.innerWidth || 400;
      s.scrollTop = reduced ? tg.scrollTop : lerp(s.scrollTop, tg.scrollTop, 0.2);
      s.hero = clamp(s.scrollTop / (s.vh * 0.9));
      s.time = (now - t0) / 1000;
      s.progress = reduced ? tg.progress : lerp(s.progress, tg.progress, 0.12);
      s.tiltX = reduced ? 0 : lerp(s.tiltX, tg.tiltX, 0.06);
      s.tiltY = reduced ? 0 : lerp(s.tiltY, tg.tiltY, 0.06);
      if (openedAt.current === -1) s.intro = 1;
      else if (openedAt.current !== null) s.intro = reduced ? 1 : clamp((now - openedAt.current) / introMs);
      listeners.current.forEach((fn) => fn(s));
      raf = win.requestAnimationFrame(loop);
    };
    raf = win.requestAnimationFrame(loop);
    return () => {
      win.cancelAnimationFrame(raf);
      doc.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions);
      win.removeEventListener('pointermove', onPointer);
      win.removeEventListener('deviceorientation', onOrient);
    };
  }, [introMs]);

  return (
    <Ctx.Provider value={driver.current}>
      <div ref={anchor} style={{ display: 'contents' }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** Jalankan `fn` setiap frame dengan state adegan. */
export function useScene(fn: Listener) {
  const d = useContext(Ctx);
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => (d ? d.subscribe((s) => ref.current(s)) : undefined), [d]);
}

export function useSceneIntro(): SceneIntro {
  return useContext(Ctx)?.intro || 'dolly';
}

/**
 * Kurva gerak gulir default: lapisan turun perlahan saat konten dibaca, lalu
 * kembali naik di akhir undangan untuk adegan penutup.
 */
export const sinkCurve = (p: number) => smooth(0, 0.14, p) * (1 - smooth(0.86, 1, p));

interface LayerProps {
  depth: number;
  children: React.ReactNode;
  /** seberapa jauh lapisan bergerak saat digulir (proporsi tinggi layar × depth) */
  travel?: number;
  /** kurva progres gulir → 0..1 */
  curve?: (p: number) => number;
  /** kekuatan efek miring (px × depth) */
  tilt?: number;
  /** urutan muncul untuk intro "popup"/"rise" (0 = pertama) */
  order?: number;
  /** lapisan tidak ikut animasi intro (mis. langit, matahari) */
  noIntro?: boolean;
  /**
   * Gerak saat keluar dari hero yang tertahan: lapisan membelah/menjauh agar kamera
   * "menembus" adegan. x,y dalam proporsi layar; scale tambahan. Kembali di penutup.
   */
  exit?: { x?: number; y?: number; scale?: number; rotate?: number };
  style?: React.CSSProperties;
  className?: string;
}

/** Satu lapisan adegan. Anak biasanya <svg> dengan preserveAspectRatio "xMidYMax slice". */
export function Layer({ depth, children, travel = 0.42, curve = sinkCurve, tilt = 22, order = 0, noIntro = false, exit, style, className }: LayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useSceneIntro();
  useScene((s) => {
    const el = ref.current;
    if (!el) return;
    if (s.reduced) {
      el.style.transform = 'none';
      return;
    }
    let tx = s.tiltX * tilt * depth;
    let ty = curve(s.progress) * travel * s.vh * depth + s.tiltY * tilt * 0.5 * depth;
    let extra = '';
    if (noIntro) {
      // tanpa intro
    } else if (mode === 'dolly') {
      // kamera maju: lapisan dekat membesar & turun, yang jauh hampir diam
      const k = easeInOut(s.intro);
      extra = ` scale(${(1 + k * depth * 0.22).toFixed(4)})`;
      ty += k * depth * s.vh * 0.14;
    } else if (mode === 'popup') {
      // buku pop-up: lapisan berdiri satu per satu dari belakang ke depan
      const start = order * 0.11;
      const k = clamp((s.intro - start) / 0.42);
      const e = k <= 0 ? 0 : easeOutBack(k);
      extra = ` perspective(900px) rotateX(${(1 - e) * 86}deg)`;
    } else {
      // rise: lapisan naik dari bawah bergantian
      const start = order * 0.08;
      const k = easeOutBack(clamp((s.intro - start) / 0.5));
      ty += (1 - k) * s.vh * (0.25 + depth * 0.35);
    }
    if (exit) {
      const e = easeInOut(s.hero) * (1 - smooth(0.9, 1, s.progress));
      tx += (exit.x || 0) * s.vw * e;
      ty += (exit.y || 0) * s.vh * e;
      if (exit.scale) extra += ` scale(${(1 + exit.scale * e).toFixed(4)})`;
      if (exit.rotate) extra += ` rotate(${(exit.rotate * e).toFixed(2)}deg)`;
    }
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)${extra}`;
  });
  return (
    <div
      ref={ref}
      className={className}
      style={{ position: 'absolute', left: '-8%', right: '-8%', top: '-6%', bottom: '-10%', transformOrigin: '50% 100%', willChange: 'transform', pointerEvents: 'none', ...style }}
    >
      {children}
    </div>
  );
}

// ------------------------------------------------------------------ util warna & bentuk

const hexToRgb = (h: string) => {
  const x = h.replace('#', '');
  const n = parseInt(x.length === 3 ? x.split('').map((c) => c + c).join('') : x, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');

/** Campur dua warna hex. */
export function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}

/** Interpolasi palet berdasar keyframe progres: [[0, {...}], [0.5, {...}], [1, {...}]] */
export function keyframeColors<K extends string>(frames: [number, Record<K, string>][], p: number): Record<K, string> {
  let i = 0;
  while (i < frames.length - 2 && p > frames[i + 1][0]) i++;
  const [p0, a] = frames[i];
  const [p1, b] = frames[Math.min(i + 1, frames.length - 1)];
  const t = p1 === p0 ? 0 : smooth(p0, p1, p);
  const out = {} as Record<K, string>;
  (Object.keys(a) as K[]).forEach((k) => (out[k] = mix(a[k], b[k], t)));
  return out;
}

/** Bilangan acak deterministik. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Punggung bukit/gunung prosedural untuk viewBox lebar `w` dan tinggi `h`.
 * `base` = garis rata-rata (y), `amp` = tinggi gelombang, `rough` = jumlah lekuk.
 */
export function ridgePath({ w = 400, h = 800, base, amp, rough = 3, seed = 1, step = 8 }: { w?: number; h?: number; base: number; amp: number; rough?: number; seed?: number; step?: number }) {
  const r = seeded(seed);
  const waves = Array.from({ length: 4 }, (_, i) => ({ f: (rough * (i + 1) * (0.6 + r() * 0.8)) / w, ph: r() * Math.PI * 2, a: amp / (i + 1.3) }));
  const pts: [number, number][] = [];
  for (let x = -20; x <= w + 20; x += step) {
    const y = base - waves.reduce((sum, wv) => sum + Math.sin(x * wv.f * Math.PI * 2 + wv.ph) * wv.a, 0);
    pts.push([x, y]);
  }
  let d = `M -20 ${h} L ${pts[0][0]} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${pts[i][0]} ${pts[i][1].toFixed(1)} ${mx} ${my.toFixed(1)}`;
  }
  return `${d} L ${w + 20} ${h} Z`;
}

/** Tinggi punggung bukit di titik x (untuk menaruh pohon/candi tepat di atasnya). */
export function ridgeY({ w = 400, base, amp, rough = 3, seed = 1 }: { w?: number; base: number; amp: number; rough?: number; seed?: number }, x: number) {
  const r = seeded(seed);
  const waves = Array.from({ length: 4 }, (_, i) => ({ f: (rough * (i + 1) * (0.6 + r() * 0.8)) / w, ph: r() * Math.PI * 2, a: amp / (i + 1.3) }));
  return base - waves.reduce((sum, wv) => sum + Math.sin(x * wv.f * Math.PI * 2 + wv.ph) * wv.a, 0);
}

// ------------------------------------------------------------------ paralaks elemen konten

type Range = [number, number];

interface PxProps {
  children?: React.ReactNode;
  /** gaya tata letak (posisi, ukuran) — diterapkan ke pembungkus luar yang TIDAK ditransformasi */
  style?: React.CSSProperties;
  /** gaya untuk lapisan dalam yang ditransformasi */
  innerStyle?: React.CSSProperties;
  /** nilai [awal, akhir] sepanjang rentang progres */
  x?: Range;
  y?: Range;
  rotate?: Range;
  rotateX?: Range;
  scale?: Range;
  opacity?: Range;
  /** satuan x: 'px' (default) atau '%' lebar elemen */
  unit?: 'px' | '%';
  /**
   * sumber progres: 'self' = posisi elemen di layar (0 saat muncul di bawah, 1 saat hilang di atas),
   * 'hero' = progres keluar dari hero, 'page' = progres seluruh halaman
   */
  source?: 'self' | 'hero' | 'page' | 'chapter';
  /** bagian progres yang dipakai, mis. [0, 0.45] = animasi selesai saat elemen mendekati tengah layar */
  range?: Range;
  ease?: 'linear' | 'out' | 'inOut' | 'back';
  transformOrigin?: string;
  className?: string;
  'aria-hidden'?: boolean;
}

const EASES = {
  linear: (t: number) => t,
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: easeInOut,
  back: easeOutBack,
};

/**
 * Elemen yang bergerak terhadap posisinya sendiri di layar — dipakai untuk judul, foto,
 * kartu, dan ornamen per bagian (di depan maupun di belakang konten).
 */
export function Px({ children, style, innerStyle, x, y, rotate, rotateX, scale, opacity, unit = 'px', source = 'self', range = [0, 1], ease = 'linear', transformOrigin, className, ...rest }: PxProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  useScene((s) => {
    const el = inner.current;
    const box = outer.current;
    if (!el || !box) return;
    if (s.reduced) {
      if (last.current !== -2) {
        el.style.transform = 'none';
        el.style.opacity = '';
        last.current = -2;
      }
      return;
    }
    let p: number;
    if (source === 'hero') p = s.hero;
    else if (source === 'page') p = s.progress;
    else {
      const r = (source === 'chapter' ? (box.closest('[data-chapter]') as HTMLElement) || box : box).getBoundingClientRect();
      if (r.bottom < -s.vh * 0.5 || r.top > s.vh * 1.5) return; // di luar layar — lewati
      p = clamp((s.vh - r.top) / (s.vh + r.height));
    }
    const t = EASES[ease](clamp((p - range[0]) / (range[1] - range[0] || 1)));
    if (Math.abs(t - last.current) < 0.0005) return;
    last.current = t;
    const v = (rg?: Range) => (rg ? lerp(rg[0], rg[1], t) : 0);
    let tf = `translate3d(${v(x).toFixed(2)}${unit}, ${v(y).toFixed(2)}px, 0)`;
    if (rotate) tf += ` rotate(${v(rotate).toFixed(2)}deg)`;
    if (rotateX) tf += ` perspective(700px) rotateX(${v(rotateX).toFixed(2)}deg)`;
    if (scale) tf += ` scale(${v(scale).toFixed(4)})`;
    el.style.transform = tf;
    if (opacity) el.style.opacity = v(opacity).toFixed(3);
  });
  return (
    <div ref={outer} className={className} style={style} {...rest}>
      <div ref={inner} style={{ willChange: 'transform', transformOrigin, height: '100%', ...innerStyle }}>
        {children}
      </div>
    </div>
  );
}

/** Set variabel CSS di elemen akar adegan setiap frame (mis. warna langit untuk ornamen konten). */
export function useSceneVars(ref: React.RefObject<HTMLElement | null>, fn: (s: SceneState) => Record<string, string>) {
  useScene((s) => {
    const root = ref.current?.ownerDocument?.documentElement;
    if (!root) return;
    const vars = fn(s);
    for (const k in vars) root.style.setProperty(k, vars[k]);
  });
}
