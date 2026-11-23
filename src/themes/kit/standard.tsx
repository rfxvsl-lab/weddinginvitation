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

export type Flora = { colors: string[]; leaf: string; art: string };

const FLORA_NAMES = ['blush', 'ivory', 'burgundy', 'peach', 'lavender', 'dustyblue', 'coral', 'rose', 'gold'];
/** Nama buket siap pakai → URL lukisan. URL lain dipakai apa adanya. */
export function floraArtUrl(name?: string) {
  if (!name) return '/assets/art/bouquet-blush.webp';
  return FLORA_NAMES.includes(name) ? `/assets/art/bouquet-${name}.webp` : name;
}

/** Bunga bawaan: buket mawar blush (lukisan). */
export function defaultFlora(p: ThemePalette, art?: string): Flora {
  return { colors: ['#EDB4AE', '#F6D3C2', '#FFFFFF', mix(p.primary, '#F2C9B5', 0.45)], leaf: mix(p.secondary, '#5F7B59', 0.6), art: floraArtUrl(art) };
}

// ------------------------------------------------------------------ bunga (lukisan)

/** Lukisan buket — variasi arah & putaran dari seed agar tiap rangkaian berbeda. */
export function FloraCluster({ flora, seed = 1, style }: { flora: Flora; seed?: number; style?: React.CSSProperties }) {
  const r = seeded(seed);
  const flip = r() > 0.5;
  const rot = Math.round((r() - 0.5) * 50);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flora.art}
      alt=""
      aria-hidden
      loading="lazy"
      draggable={false}
      style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.22))', userSelect: 'none', ...style }}
    />
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
      <FloraCluster flora={flora} seed={seed} style={{ transform: 'none' }} />
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

// ------------------------------------------------------------------ panggung pembuka (lukisan cat air)

/** Gambar penuh lapisan (object-fit cover, menempel ke bawah). */
function Paint({ src, mask, pos = 'center bottom', style }: { src: string; mask?: string; pos?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, WebkitMaskImage: mask, maskImage: mask, ...style }}
    />
  );
}

/**
 * Panggung pembuka bawaan dari lukisan cat air berlapis:
 * langit (paling jauh) → lukisan pemandangan (tepi atas memudar) → foto berbingkai lengkung →
 * potongan latar depan lukisan (bunga liar/jalan setapak) yang melaju paling cepat.
 */
export function PaintedStage({ palette: p, photo, scene = 'meadow' }: { palette: ThemePalette; flora: Flora; photo?: string; scene?: 'meadow' | 'house' | 'village' | 'night' }) {
  const sky = scene === 'night' ? '/assets/art/wc-night.webp' : '/assets/art/wc-sky-day.webp';
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: p.bg }} />
      <ArtLayer depth={0.03} hero order={0}>
        <Paint src={sky} pos="center top" />
      </ArtLayer>
      {scene !== 'night' && (
        <ArtLayer depth={0.14} hero order={1}>
          <Paint src={`/assets/art/wc-${scene}.webp`} mask="linear-gradient(180deg, transparent 18%, #000 42%)" style={{ top: '16%', height: '84%' }} />
        </ArtLayer>
      )}
      {photo && (
        <ArtLayer depth={0.3} hero order={2}>
          <div style={{ position: 'absolute', left: '50%', bottom: '21%', width: '50%', maxWidth: 250, aspectRatio: '3 / 4.3', transform: 'translateX(-50%)', borderRadius: '999px 999px 10px 10px', padding: 7, background: mix(p.surface, '#FFFFFF', 0.5), boxShadow: '0 30px 50px -24px rgba(0,0,0,.55)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '999px 999px 6px 6px', display: 'block' }} />
          </div>
        </ArtLayer>
      )}
      <ArtLayer depth={0.6} hero order={3}>
        <Paint src={`/assets/art/wc-${scene}-front.webp`} style={{ top: 'auto', bottom: '-3%', height: '32%', transform: 'scale(1.12)', transformOrigin: '50% 100%' }} />
      </ArtLayer>
    </>
  );
}

/** @deprecated nama lama — kini lukisan cat air */
export const GardenStage = PaintedStage;

/** Lapisan depan panggung: buket lukisan besar di sudut bawah + kupu-kupu. */
export function StageFront({ flora }: { flora: Flora }) {
  return (
    <>
      <ArtLayer depth={0.85} hero order={5} exitX={-0.35} origin="0% 100%">
        <div style={{ position: 'absolute', left: '-14%', bottom: '-2%', width: '58%', aspectRatio: '1' }}>
          <FloraCluster flora={flora} seed={11} style={{ transform: 'rotate(18deg)' }} />
        </div>
      </ArtLayer>
      <ArtLayer depth={0.95} hero order={6} exitX={0.35} origin="100% 100%">
        <div style={{ position: 'absolute', right: '-16%', bottom: '-6%', width: '64%', aspectRatio: '1' }}>
          <FloraCluster flora={flora} seed={17} style={{ transform: 'rotate(-22deg) scaleX(-1)' }} />
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
