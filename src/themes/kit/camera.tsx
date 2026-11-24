'use client';

/**
 * Mesin kamera — satu dunia ilustrasi utuh yang dilewati kamera saat undangan digulir.
 *
 * Konsep (gaya "undangan seret" paralaks):
 * - Dunia digambar sekali, memanjang, dalam lapisan-lapisan berkedalaman (0 = jauh, 1 = dekat).
 * - Yang bergerak adalah KAMERA (x, y, zoom). Lapisan jauh bergeser pelan, lapisan dekat cepat.
 * - Tiap bagian undangan punya titik kamera (stasiun). Saat isi bagian dibaca kamera diam,
 *   lalu di jeda antar bagian kamera berjalan ke stasiun berikutnya — semua posisi di antaranya
 *   adalah bagian dunia yang sama (tidak ada ganti latar).
 * - Warna langit, rona waktu (pagi → malam), dan cahaya lampu mengikuti posisi kamera.
 * - Karakter 2.5D berlangganan posisi kamera lewat useCamera() untuk berjalan/menoleh.
 *
 * Satuan: tinggi layar = 800 unit. Lapisan dengan faktor paralaks k menampilkan koordinat
 * L = k·camX + 200 di tengah layar.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';

export const U_H = 800;
/** tinggi kanvas lapisan: 400 unit di atas & bawah layar untuk gerak vertikal / zoom */
const PAD = 400;
const TILE = 1200;

export interface CamPoint {
  x: number;
  y?: number;
  z?: number;
}

export interface CamState {
  x: number;
  y: number;
  z: number;
  /** indeks stasiun asal & tujuan, progres perjalanan 0..1 (0 = diam di stasiun) */
  from: number;
  to: number;
  travel: number;
  /** progres seluruh perjalanan 0..1 */
  journey: number;
  /** unit → piksel */
  u: number;
  vw: number;
  vh: number;
}

export interface CamLayer {
  depth: number;
  /** isi lapisan dalam koordinat lapisan (lebar `width`, y −400..1200) */
  content: React.ReactNode;
  width: number;
  /** di atas rona waktu (lampu, kunang-kunang) */
  above?: boolean;
  /** opasitas mengikuti perjalanan: [[journey, opacity], ...] */
  fade?: [number, number][];
}

/** faktor paralaks dari kedalaman */
export const kOf = (depth: number) => 0.06 + 0.94 * depth;

type Sub = (c: CamState) => void;
const Ctx = createContext<{ sub: (f: Sub) => () => void } | null>(null);

/** Berlangganan kamera tiap frame (untuk karakter / elemen imperatif). */
export function useCamera(fn: Sub) {
  const ctx = useContext(Ctx);
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => ctx?.sub((c) => ref.current(c)), [ctx]);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function hex(c: string) {
  const h = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function mixHex(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
}
/** interpolasi keyframe [[pos, ...values]] */
export function track<T extends unknown[]>(frames: [number, ...T][], p: number, mixer: (a: T, b: T, t: number) => T): T {
  if (p <= frames[0][0]) return frames[0].slice(1) as T;
  for (let i = 0; i < frames.length - 1; i++) {
    const [p0, ...a] = frames[i];
    const [p1, ...b] = frames[i + 1];
    if (p <= p1) return mixer(a as T, b as T, (p - p0) / Math.max(1e-6, p1 - p0));
  }
  return frames[frames.length - 1].slice(1) as T;
}

export interface CameraStageProps {
  stations: CamPoint[];
  layers: CamLayer[];
  /** [journey, langit atas, langit bawah] */
  sky: [number, string, string][];
  /** rona waktu (multiply): [journey, warna, opasitas] */
  tint: [number, string, number][];
  /** karakter (memakai useCamera) — disisipkan di antara lapisan pada kedalaman `actorDepth` */
  actors?: React.ReactNode;
  actorDepth?: number;
  children?: React.ReactNode;
  /** selektor bagian di dokumen; tiap bagian punya [data-cam-hold] (isi) & [data-cam-gap] (jeda) */
  root: React.RefObject<HTMLElement | null>;
}

/**
 * Panggung kamera: menempel (sticky) memenuhi layar di belakang isi undangan.
 */
export function CameraStage({ stations, layers, sky, tint, actors, actorDepth = 0.72, children, root }: CameraStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tileRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const subs = useRef(new Set<Sub>());
  const ctx = useRef({
    sub: (f: Sub) => {
      subs.current.add(f);
      return () => subs.current.delete(f);
    },
  }).current;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const doc = stage.ownerDocument;
    const win = doc.defaultView || window;
    const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const frame = () => {
      raf = 0;
      const vh = win.innerHeight || 800;
      const vw = stage.clientWidth || win.innerWidth || 400;
      const u = vh / U_H;
      // posisi kamera dari posisi bagian di layar
      const holds = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-cam-hold]') || []);
      const gaps = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-cam-gap]') || []);
      const ref = vh * 0.55;
      let from = 0;
      let travel = 0;
      for (let i = 0; i < holds.length; i++) {
        const hold = holds[i].getBoundingClientRect();
        const gap = gaps[i]?.getBoundingClientRect();
        if (hold.top <= ref) from = i;
        if (gap && gap.top <= ref && gap.bottom > ref) {
          from = i;
          travel = clamp((ref - gap.top) / Math.max(1, gap.height));
        } else if (gap && gap.bottom <= ref) {
          from = Math.min(i + 1, stations.length - 1);
          travel = 0;
        }
      }
      from = Math.min(from, stations.length - 1);
      const to = Math.min(from + 1, stations.length - 1);
      const e = ease(travel);
      const A = stations[from];
      const B = stations[to];
      // kamera melambung sedikit (dolly) di tengah perjalanan → kesan bergerak, bukan geser datar
      const arc = Math.sin(Math.PI * travel);
      const cam: CamState = {
        x: lerp(A.x, B.x, e),
        y: lerp(A.y || 0, B.y || 0, e) + arc * 26,
        z: lerp(A.z || 1, B.z || 1, e) * (1 - arc * 0.06),
        from,
        to,
        travel,
        journey: (from + e) / Math.max(1, stations.length - 1),
        u,
        vw,
        vh,
      };
      // langit & rona waktu
      const [top, bot] = track<[string, string]>(sky.map(([p, a, b]) => [p, a, b] as [number, string, string]), cam.journey, (a, b, t) => [mixHex(a[0], b[0], t), mixHex(a[1], b[1], t)]);
      stage.style.background = `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`;
      const [tc, to2] = track<[string, number]>(tint.map(([p, c, o]) => [p, c, o] as [number, string, number]), cam.journey, (a, b, t) => [mixHex(a[0], b[0], t), lerp(a[1], b[1], t)]);
      if (tintRef.current) {
        tintRef.current.style.background = tc;
        tintRef.current.style.opacity = String(to2);
      }
      // lapisan
      layers.forEach((l, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        const k = kOf(l.depth);
        const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * k);
        const center = k * cam.x + 200;
        const tx = vw / 2 - center * u;
        const ty = -PAD * u + k * cam.y * u;
        el.style.transform = `translate3d(${(vw / 2) * (1 - zl) + tx * zl}px, ${(vh / 2) * (1 - zl) + ty * zl}px, 0) scale(${zl.toFixed(4)})`;
        if (l.fade) el.style.opacity = String(track<[number]>(l.fade.map(([p, o]) => [p, o] as [number, number]), cam.journey, (a, b, t) => [lerp(a[0], b[0], t)])[0]);
        // ubin di luar layar tidak dirender
        const halfView = vw / u / 2 / zl + 120;
        (tileRefs.current[i] || []).forEach((tile, j) => {
          if (!tile) return;
          const x0 = j * TILE;
          const show = x0 < center + halfView && x0 + TILE > center - halfView;
          const want = show ? 'block' : 'none';
          if (tile.style.display !== want) tile.style.display = want;
        });
      });
      subs.current.forEach((f) => f(cam));
    };
    const schedule = () => {
      if (!raf) raf = win.requestAnimationFrame(frame);
    };
    frame();
    // gambar ulang sesudah font & gambar dimuat (tinggi bagian berubah)
    const t1 = win.setTimeout(schedule, 400);
    const t2 = win.setTimeout(schedule, 1500);
    doc.addEventListener('scroll', schedule, { capture: true, passive: true });
    win.addEventListener('resize', schedule);
    if (reduced) stage.dataset.reduced = '1';
    return () => {
      doc.removeEventListener('scroll', schedule, { capture: true } as EventListenerOptions);
      win.removeEventListener('resize', schedule);
      win.clearTimeout(t1);
      win.clearTimeout(t2);
      if (raf) win.cancelAnimationFrame(raf);
    };
  }, [layers, stations, sky, tint, root]);

  const layerEl = (l: CamLayer, i: number) => {
    const tiles = Math.ceil(l.width / TILE);
    tileRefs.current[i] = tileRefs.current[i] || [];
    return (
      <div
        key={i}
        ref={(el) => {
          layerRefs.current[i] = el;
        }}
        style={{ position: 'absolute', left: 0, top: 0, height: `${((U_H + 2 * PAD) / U_H) * 100}%`, width: 0, transformOrigin: '0 0', willChange: 'transform', pointerEvents: 'none' }}
      >
        {Array.from({ length: tiles }, (_, j) => (
          <div
            key={j}
            ref={(el) => {
              tileRefs.current[i][j] = el;
            }}
            style={{ position: 'absolute', top: 0, height: '100%', left: `calc(${j * TILE} * var(--cam-u))`, width: `calc(${TILE} * var(--cam-u))`, display: 'none' }}
          >
            <svg viewBox={`${j * TILE} ${-PAD} ${TILE} ${U_H + 2 * PAD}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
              {l.content}
            </svg>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Ctx.Provider value={ctx}>
      <div
        ref={stageRef}
        aria-hidden
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ['--cam-u' as string]: 'calc(100vh / 800)' }}
      >
        {layers.map((l, i) => (!l.above && l.depth <= actorDepth ? layerEl(l, i) : null))}
        {actors}
        {layers.map((l, i) => (!l.above && l.depth > actorDepth ? layerEl(l, i) : null))}
        <div ref={tintRef} style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
        {layers.map((l, i) => (l.above ? layerEl(l, i) : null))}
        {children}
      </div>
    </Ctx.Provider>
  );
}

/** Ubah koordinat dunia (lapisan k) ke piksel layar untuk elemen imperatif. */
export function toScreen(c: CamState, depth: number, L: number, y: number) {
  const k = kOf(depth);
  const zl = 1 + (c.z - 1) * (0.25 + 0.75 * k);
  const sx = c.vw / 2 + (L - (k * c.x + 200)) * c.u * zl;
  const sy = c.vh / 2 + (y - U_H / 2 + k * c.y) * c.u * zl;
  return { x: sx, y: sy, s: c.u * zl };
}

/** Posisi L di lapisan berkedalaman `depth` yang berada di tengah layar pada stasiun dengan camX. */
export const atStation = (depth: number, camX: number, dx = 0) => kOf(depth) * camX + 200 + dx;
