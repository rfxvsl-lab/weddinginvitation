'use client';

/**
 * Bab (chapter) untuk tema Spesial — terinspirasi situs naratif paralaks:
 * setiap bagian undangan adalah adegan ilustrasi layar penuh, teks berada DI DALAM
 * adegan (ada lapisan di belakang dan di depan teks), dan lapisan bergerak dengan
 * kecepatan berbeda saat bab masuk, ditahan, lalu keluar dari layar.
 *
 *   <ArtLayer depth={0..1}>  — lapisan adegan. 0 = jauh (tertinggal), 1 = dekat (melaju).
 *   popup                    — lapisan "berdiri" seperti buku pop-up saat bab masuk.
 *   hero                     — lapisan bab pembuka ikut animasi intro setelah sampul dibuka.
 *
 * Progres bab: 0 = tepi atas bab di bawah layar, 1 = tepi bawah bab di atas layar.
 */

import React, { useRef } from 'react';
import { smooth, useScene, useSceneIntro } from './scene';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOutBack = (t: number) => {
  const c = 1.5;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Progres bab dari elemen di dalamnya (mencari [data-chapter] terdekat). */
export function chapterProgress(el: Element, vh: number) {
  const ch = (el.closest('[data-chapter]') as HTMLElement) || el;
  const r = ch.getBoundingClientRect();
  return { p: clamp((vh - r.top) / (vh + r.height)), top: r.top, bottom: r.bottom, height: r.height };
}

interface ArtLayerProps {
  depth: number;
  children: React.ReactNode;
  /** urutan berdiri untuk popup (0 = paling belakang, muncul pertama) */
  order?: number;
  popup?: boolean;
  /** lapisan bab pembuka: ikut animasi intro kamera */
  hero?: boolean;
  /** pergeseran tambahan ke samping saat bab keluar (proporsi lebar layar), mis. nyiur membelah */
  exitX?: number;
  /** besar paralaks vertikal (proporsi tinggi layar). default 0.55 */
  strength?: number;
  style?: React.CSSProperties;
  origin?: string;
}

export function ArtLayer({ depth, children, order = 0, popup = false, hero = false, exitX = 0, strength = 0.55, style, origin = '50% 100%' }: ArtLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useSceneIntro();
  useScene((s) => {
    const el = ref.current;
    if (!el) return;
    if (s.reduced) {
      el.style.transform = 'none';
      el.style.visibility = 'visible';
      return;
    }
    const c = chapterProgress(el, s.vh);
    // Bab yang jauh dari layar disembunyikan agar tidak memakan memori GPU di ponsel
    const far = c.bottom < -s.vh * 0.25 || c.top > s.vh * 1.25;
    if (far) {
      if (el.style.visibility !== 'hidden') {
        el.style.visibility = 'hidden';
        el.style.willChange = 'auto';
      }
      return;
    }
    if (el.style.visibility === 'hidden') {
      el.style.visibility = 'visible';
      el.style.willChange = 'transform';
    }
    // bab ditahan (art sticky) saat isinya digulir; lapisan jauh tertinggal, lapisan dekat melaju
    let ty = (c.p - 0.5) * (0.45 - depth) * s.vh * strength;
    let tx = s.tiltX * depth * 18;
    ty += s.tiltY * depth * 8;
    let extra = '';
    const leave = smooth(0.55, 1, c.p);
    if (exitX) tx += exitX * s.vw * leave;
    if (hero) {
      const k = s.intro;
      if (mode === 'popup') {
        const e = easeOutBack(clamp((k - order * 0.1) / 0.45));
        extra += ` perspective(900px) rotateX(${((1 - e) * 86).toFixed(2)}deg)`;
      } else {
        // dolly: lapisan dekat datang dari bawah & membesar ke posisi
        const e = easeInOut(clamp((k - order * 0.04) / 0.8));
        ty += (1 - e) * depth * s.vh * 0.45;
        extra += ` scale(${(1 + (1 - e) * depth * 0.25).toFixed(4)})`;
      }
    } else if (popup) {
      // halaman pop-up: berdiri saat bab mulai masuk layar
      const start = 0.04 + order * 0.035;
      const e = easeOutBack(clamp((c.p - start) / 0.16));
      extra += ` perspective(900px) rotateX(${((1 - e) * 86).toFixed(2)}deg)`;
    }
    el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)${extra}`;
  });
  return (
    <div ref={ref} style={{ position: 'absolute', left: '-10%', right: '-10%', top: '-14%', bottom: '-14%', transformOrigin: origin, visibility: 'hidden', pointerEvents: 'none', ...style }}>
      {children}
    </div>
  );
}

/** Kanvas SVG 400×800 yang menempel di bawah lapisan (bukit, laut, dsb.). */
export function ArtSvg({ children, anchor = 'bottom', style }: { children: React.ReactNode; anchor?: 'bottom' | 'top' | 'center'; style?: React.CSSProperties }) {
  const par = anchor === 'bottom' ? 'xMidYMax slice' : anchor === 'top' ? 'xMidYMin slice' : 'xMidYMid slice';
  return (
    <svg viewBox="0 0 400 800" preserveAspectRatio={par} width="100%" height="100%" style={{ display: 'block', overflow: 'visible', ...style }}>
      {children}
    </svg>
  );
}

/** Langit bab (diam, tanpa paralaks). */
export function Sky({ top, mid, bottom }: { top: string; mid?: string; bottom: string }) {
  return <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${top} 0%, ${mid || top} 45%, ${bottom} 100%)` }} />;
}
