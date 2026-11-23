'use client';

/**
 * Standar undangan RuangHadir (dipakai semua tema Theme Kit):
 * - panggung pembuka 2.5D: kamera turun dari langit, lapisan taman naik satu per satu,
 *   kupu-kupu terbang, lalu nama mempelai masuk dari arah berbeda
 * - rangkaian bunga yang mengapit foto & panel, digerakkan oleh gulir
 *   (masuk dari samping lalu bergoyang mengikuti posisi gulir)
 * - tayangan foto (slideshow) layar penuh, daftar ucapan, menu navigasi, piringan musik
 */

import React, { useEffect, useMemo, useState } from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer, ArtSvg, Sky } from './chapters';
import { Px, mix, ridgePath, ridgeY, seeded } from './scene';

export type Flora = { colors: string[]; leaf: string };

/** Bunga bawaan: mawar blush, peach, putih, dan aksen warna utama tema; daun hijau sage. */
export function defaultFlora(p: ThemePalette): Flora {
  return { colors: ['#EDB4AE', '#F6D3C2', '#FFFFFF', mix(p.primary, '#F2C9B5', 0.45)], leaf: mix(p.secondary, '#5F7B59', 0.6) };
}

// ------------------------------------------------------------------ bunga

/** Mawar vektor: kelopak berlapis + spiral tengah. */
function Rose({ x, y, r, color, rot = 0 }: { x: number; y: number; r: number; color: string; rot?: number }) {
  const dark = mix(color, '#2A1A1A', 0.32);
  const light = mix(color, '#FFFFFF', 0.35);
  const arc = (ri: number, a0: number, span: number) => {
    const a1 = a0 + span;
    const p0 = [Math.cos(a0) * ri, Math.sin(a0) * ri];
    const p1 = [Math.cos(a1) * ri, Math.sin(a1) * ri];
    return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)} A${ri} ${ri} 0 ${span > Math.PI ? 1 : 0} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * r * 0.42} cy={Math.sin(a) * r * 0.42} r={r * 0.62} fill={color} />;
      })}
      <circle r={r * 0.78} fill={color} />
      <circle cx={-r * 0.25} cy={-r * 0.3} r={r * 0.5} fill={light} opacity={0.35} />
      <g fill="none" stroke={dark} strokeLinecap="round" strokeWidth={r * 0.05} opacity={0.75}>
        <path d={arc(r * 0.72, 0.4, 3.4)} />
        <path d={arc(r * 0.52, 2.6, 3.6)} />
        <path d={arc(r * 0.34, 5.0, 3.8)} />
        <path d={arc(r * 0.18, 1.2, 4.2)} />
      </g>
    </g>
  );
}

function Leaf({ x, y, len, angle, color }: { x: number; y: number; len: number; angle: number; color: string }) {
  const a = (angle * Math.PI) / 180;
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const nx = -Math.sin(a) * len * 0.3;
  const ny = Math.cos(a) * len * 0.3;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  return (
    <g>
      <path d={`M${x} ${y} Q ${mx + nx} ${my + ny} ${tx} ${ty} Q ${mx - nx} ${my - ny} ${x} ${y} Z`} fill={color} />
      <path d={`M${x} ${y} L ${tx} ${ty}`} stroke={mix(color, '#FFFFFF', 0.3)} strokeWidth={len * 0.025} />
    </g>
  );
}

/** Rangkaian bunga (mawar, kuncup, daun, bunga kecil) — SVG 200×200, pusat di (100,100). */
export function FloraCluster({ flora, seed = 1, style }: { flora: Flora; seed?: number; style?: React.CSSProperties }) {
  const g = useMemo(() => {
    const r = seeded(seed);
    const leaves = Array.from({ length: 7 }, (_, i) => ({ angle: -170 + i * 50 + r() * 20, len: 52 + r() * 34 }));
    const roses = [
      { x: 100, y: 100, r: 30, c: 0 },
      { x: 62 + r() * 8, y: 112 + r() * 8, r: 22, c: 1 },
      { x: 136 + r() * 8, y: 90 + r() * 10, r: 20, c: 2 },
    ];
    const buds = Array.from({ length: 3 }, () => ({ x: 50 + r() * 100, y: 50 + r() * 30, a: -40 + r() * 80 }));
    const fill = Array.from({ length: 12 }, () => ({ x: 40 + r() * 120, y: 50 + r() * 100, s: 2 + r() * 3 }));
    return { leaves, roses, buds, fill };
  }, [seed]);
  const col = (i: number) => flora.colors[i % flora.colors.length];
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.16))', ...style }} aria-hidden>
      {g.leaves.map((l, i) => (
        <Leaf key={i} x={100} y={100} len={l.len} angle={l.angle} color={i % 2 ? flora.leaf : mix(flora.leaf, '#FFFFFF', 0.18)} />
      ))}
      {g.buds.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.a})`}>
          <ellipse rx={6} ry={10} fill={col(i + 1)} />
          <path d="M-6 4 Q 0 14 6 4 L 0 12 Z" fill={flora.leaf} />
        </g>
      ))}
      {g.roses.map((ro, i) => (
        <Rose key={i} x={ro.x} y={ro.y} r={ro.r} color={col(ro.c)} rot={i * 40} />
      ))}
      {g.fill.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.s} fill={i % 3 ? '#FFFFFF' : col(3)} opacity={0.9} />
      ))}
    </svg>
  );
}

/**
 * Rangkaian bunga yang mengapit elemen. Masuk dari samping saat elemen muncul,
 * lalu bergoyang pelan mengikuti posisi gulir (seperti template premium).
 */
export function Bloom({ flora, side, top, bottom, size = 150, seed = 1, offset = -46, tilt = 18 }: { flora: Flora; side: 'left' | 'right'; top?: number | string; bottom?: number | string; size?: number; seed?: number; offset?: number; tilt?: number }) {
  const l = side === 'left';
  return (
    <Px
      aria-hidden
      style={{ position: 'absolute', [side]: offset, top, bottom, width: size, height: size, zIndex: 3, pointerEvents: 'none' }}
      x={[l ? -size * 1.4 : size * 1.4, 0]}
      opacity={[0, 1]}
      range={[0.02, 0.36]}
      ease="out"
    >
      <Px style={{ width: '100%', height: '100%' }} rotate={[l ? -tilt : tilt, l ? tilt * 0.4 : -tilt * 0.4]} scale={[0.86, 1.06]} transformOrigin={l ? '20% 80%' : '80% 80%'}>
        <FloraCluster flora={flora} seed={seed} />
      </Px>
    </Px>
  );
}

/** Buket di atas panel lengkung — membesar saat muncul. */
export function Bouquet({ flora, seed = 3, size = 130 }: { flora: Flora; seed?: number; size?: number }) {
  return (
    <Px aria-hidden style={{ width: size, height: size, margin: `-${size * 0.55}px auto 6px`, position: 'relative', zIndex: 3 }} scale={[0.4, 1]} rotate={[-12, 0]} range={[0, 0.3]} ease="back">
      <FloraCluster flora={flora} seed={seed} />
    </Px>
  );
}

// ------------------------------------------------------------------ kupu-kupu

export function Butterflies({ colors, n = 3, seed = 2 }: { colors: string[]; n?: number; seed?: number }) {
  const r = seeded(seed);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <style>{`
        @keyframes std-fly { 0% { transform: translate(0,0) } 25% { transform: translate(28vw,-14vh) } 50% { transform: translate(52vw,-4vh) } 75% { transform: translate(30vw,-26vh) } 100% { transform: translate(0,0) } }
        @keyframes std-flap { 0%,100% { transform: scaleX(1) } 50% { transform: scaleX(.2) } }
      `}</style>
      {Array.from({ length: n }, (_, i) => {
        const c = colors[i % colors.length];
        const dur = 14 + r() * 10;
        return (
          <div key={i} style={{ position: 'absolute', left: `${r() * 50}%`, top: `${40 + r() * 40}%`, animation: `std-fly ${dur}s ease-in-out ${-r() * dur}s infinite` }}>
            <svg width={26 + r() * 10} viewBox="-16 -14 32 28" style={{ overflow: 'visible', animation: `std-flap ${0.32 + r() * 0.12}s ease-in-out infinite`, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,.2))' }}>
              <path d="M0 0 C -10 -13, -17 -2, -10 4 C -14 11, -4 12, 0 4 C 4 12, 14 11, 10 4 C 17 -2, 10 -13, 0 0 Z" fill={c} />
              <path d="M0 0 C -6 -8, -10 -1, -6 2 M0 0 C 6 -8, 10 -1, 6 2" stroke={mix(c, '#000000', 0.35)} strokeWidth={1} fill="none" />
              <rect x={-0.8} y={-6} width={1.6} height={12} rx={0.8} fill="#2A2020" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ panggung pembuka (taman)

function cypress(x: number, y: number, h: number) {
  const w = h * 0.2;
  return `M${x} ${y - h} C ${x + w * 0.9} ${y - h * 0.55}, ${x + w} ${y - h * 0.15}, ${x + w * 0.35} ${y} L ${x - w * 0.35} ${y} C ${x - w} ${y - h * 0.15}, ${x - w * 0.9} ${y - h * 0.55}, ${x} ${y - h} Z`;
}

function Pavilion({ x, y, s, p }: { x: number; y: number; s: number; p: ThemePalette }) {
  const stone = mix(p.surface, '#FFFFFF', 0.4);
  const shade = mix(stone, p.secondary, 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-70} y={-8} width={140} height={10} fill={shade} />
      <rect x={-62} y={-16} width={124} height={8} fill={stone} />
      {[-52, -26, 0, 26, 52].map((cx) => (
        <rect key={cx} x={cx - 4} y={-112} width={8} height={96} fill={stone} />
      ))}
      <rect x={-64} y={-122} width={128} height={12} fill={shade} />
      <path d="M-58 -122 Q 0 -200 58 -122 Z" fill={stone} />
      <path d="M-58 -122 Q 0 -200 58 -122" fill="none" stroke={shade} strokeWidth={3} />
      <rect x={-3} y={-206} width={6} height={18} fill={shade} />
      <circle cx={0} cy={-210} r={6} fill={p.primary} />
    </g>
  );
}

/** Panggung taman prosedural — dipakai tema yang tidak menyediakan Stage sendiri. */
export function GardenStage({ palette: p, flora, photo }: { palette: ThemePalette; flora: Flora; photo?: string }) {
  const skyTop = mix(p.bg, '#BFD9EA', 0.55);
  const hill = (k: number) => mix(flora.leaf, mix(p.bg, '#DCE8F0', 0.4), k);
  const h1 = { base: 520, amp: 30, rough: 1.8, seed: 31 };
  const h2 = { base: 600, amp: 22, rough: 2.2, seed: 37 };
  const h3 = { base: 690, amp: 18, rough: 2.6, seed: 43 };
  const bushes = (rg: typeof h3, n: number, seed: number, rad: number, color: string) => {
    const r = seeded(seed);
    return Array.from({ length: n }, (_, i) => {
      const x = (i + 0.5) * (400 / n) + (r() - 0.5) * 20;
      const y = ridgeY({ w: 400, ...rg }, x) + 8;
      const rr = rad * (0.7 + r() * 0.6);
      return (
        <g key={i}>
          <circle cx={x} cy={y - rr * 0.6} r={rr} fill={color} />
          {[0, 1, 2].map((j) => (
            <circle key={j} cx={x + (r() - 0.5) * rr * 1.4} cy={y - rr * 0.6 + (r() - 0.5) * rr} r={2.5 + r() * 2} fill={flora.colors[(i + j) % flora.colors.length]} />
          ))}
        </g>
      );
    });
  };
  return (
    <>
      <Sky top={skyTop} mid={mix(skyTop, p.bg, 0.5)} bottom={mix(p.bg, '#FFFFFF', 0.2)} />
      <ArtLayer depth={0.03} hero order={0}>
        <ArtSvg anchor="top">
          <g fill="#FFFFFF" opacity={0.85} style={{ filter: 'blur(2px)' }}>
            <ellipse cx={80} cy={130} rx={90} ry={22} />
            <ellipse cx={130} cy={116} rx={60} ry={20} />
            <ellipse cx={320} cy={210} rx={110} ry={20} />
            <ellipse cx={290} cy={196} rx={50} ry={16} />
          </g>
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.1} hero order={1}>
        <ArtSvg>
          <path d={ridgePath({ w: 400, h: 800, ...h1 })} fill={hill(0.62)} />
          <path d={[30, 52, 340, 362, 384].map((x, i) => cypress(x, ridgeY({ w: 400, ...h1 }, x) + 6, 60 + (i % 3) * 18)).join(' ')} fill={hill(0.5)} />
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.22} hero order={2}>
        <ArtSvg>
          {photo ? (
            <g>
              <defs>
                <clipPath id="std-arch">
                  <path d="M120 600 V430 A80 80 0 0 1 280 430 V600 Z" />
                </clipPath>
              </defs>
              <image href={photo} x={110} y={340} width={180} height={270} preserveAspectRatio="xMidYMid slice" clipPath="url(#std-arch)" />
              <path d="M120 600 V430 A80 80 0 0 1 280 430 V600" fill="none" stroke={mix(p.surface, '#FFFFFF', 0.4)} strokeWidth={10} />
              <path d="M120 600 V430 A80 80 0 0 1 280 430 V600" fill="none" stroke={p.secondary} strokeWidth={2} />
            </g>
          ) : (
            <Pavilion x={200} y={612} s={1.05} p={p} />
          )}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.36} hero order={3}>
        <ArtSvg>
          <path d={ridgePath({ w: 400, h: 800, ...h2 })} fill={hill(0.32)} />
          {bushes(h2, 7, 51, 16, hill(0.22))}
        </ArtSvg>
      </ArtLayer>
      <ArtLayer depth={0.55} hero order={4}>
        <ArtSvg>
          <path d={ridgePath({ w: 400, h: 800, ...h3 })} fill={hill(0.14)} />
          {bushes(h3, 6, 57, 24, hill(0.08))}
        </ArtSvg>
      </ArtLayer>
    </>
  );
}

/** Lapisan depan panggung: rangkaian bunga besar di sudut bawah + kupu-kupu. */
export function StageFront({ flora }: { flora: Flora }) {
  return (
    <>
      <ArtLayer depth={0.85} hero order={5} exitX={-0.35} origin="0% 100%">
        <div style={{ position: 'absolute', left: '-8%', bottom: '6%', width: '62%', aspectRatio: '1' }}>
          <FloraCluster flora={flora} seed={11} />
        </div>
      </ArtLayer>
      <ArtLayer depth={0.95} hero order={6} exitX={0.35} origin="100% 100%">
        <div style={{ position: 'absolute', right: '-10%', bottom: '2%', width: '66%', aspectRatio: '1' }}>
          <FloraCluster flora={flora} seed={17} />
        </div>
      </ArtLayer>
      <ArtLayer depth={0.5} hero order={7}>
        <Butterflies colors={[flora.colors[0], flora.colors[2] || flora.colors[1]]} n={3} seed={5} />
      </ArtLayer>
    </>
  );
}

// ------------------------------------------------------------------ tayangan foto

export function Slideshow({ photos, height = '86vh' }: { photos: string[]; height?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), 4200);
    return () => clearInterval(t);
  }, [photos.length]);
  if (!photos.length) return null;
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden' }}>
      <style>{'@keyframes std-kb { from { transform: scale(1.04) } to { transform: scale(1.16) } }'}</style>
      <Px style={{ position: 'absolute', inset: '-12% 0' }} y={[-60, 60]}>
        {photos.map((src, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src + k}
            src={src}
            alt=""
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: k === i ? 1 : 0, transition: 'opacity 1.4s ease', animation: k === i ? 'std-kb 6s ease-out forwards' : undefined }}
          />
        ))}
      </Px>
    </div>
  );
}

// ------------------------------------------------------------------ menu & musik

export interface NavItem {
  id: string;
  label: string;
}

export function NavMenu({ items, p, font }: { items: NavItem[]; p: ThemePalette; font: string }) {
  const [open, setOpen] = useState(false);
  const go = (id: string, el: HTMLElement) => {
    setOpen(false);
    el.ownerDocument.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Tutup menu' : 'Buka menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'fixed', top: 14, right: 14, zIndex: 70, width: 44, height: 44, borderRadius: 999, border: 'none', background: `${p.surface}EE`, color: p.text, boxShadow: '0 6px 18px -8px rgba(0,0,0,.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          {open ? <path d="M4 4l10 10M14 4L4 14" /> : <path d="M3 5h12M3 9h12M3 13h12" />}
        </svg>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Navigasi undangan"
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 69, background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(3px)' }}
        >
          <nav
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 66, right: 14, width: 220, background: p.surface, color: p.text, borderRadius: 16, padding: 8, boxShadow: '0 20px 40px -20px rgba(0,0,0,.6)' }}
          >
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={(e) => go(it.id, e.currentTarget)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', border: 'none', borderRadius: 10, background: 'transparent', color: 'inherit', fontFamily: font, fontSize: 14, cursor: 'pointer' }}
              >
                {it.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

/** Tombol musik berbentuk piringan hitam yang berputar saat lagu diputar. */
export function Vinyl({ playing, onToggle, accent }: { playing: boolean; onToggle: () => void; accent: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Jeda musik' : 'Putar musik'}
      style={{ position: 'fixed', left: 14, bottom: 16, zIndex: 70, width: 48, height: 48, padding: 0, border: 'none', borderRadius: 999, background: 'transparent', cursor: 'pointer', boxShadow: '0 8px 20px -8px rgba(0,0,0,.6)' }}
    >
      <style>{'@keyframes std-spin { to { transform: rotate(360deg) } }'}</style>
      <svg viewBox="0 0 48 48" width="48" height="48" style={{ animation: 'std-spin 4s linear infinite', animationPlayState: playing ? 'running' : 'paused', display: 'block' }}>
        <circle cx="24" cy="24" r="24" fill="#121212" />
        {[20, 17, 14].map((r) => (
          <circle key={r} cx="24" cy="24" r={r} fill="none" stroke="#2C2C2C" strokeWidth="0.8" />
        ))}
        <circle cx="24" cy="24" r="9" fill={accent} />
        <circle cx="24" cy="24" r="2" fill="#121212" />
        <path d="M10 14 A16 16 0 0 1 22 8" stroke="rgba(255,255,255,.25)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      {!playing && (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>▶</span>
      )}
    </button>
  );
}

// ------------------------------------------------------------------ ucapan

export function relTime(iso: string) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const s = Math.round((t - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  const abs = Math.abs(s);
  if (abs < 60) return rtf.format(s, 'second');
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(s / 86400), 'day');
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
