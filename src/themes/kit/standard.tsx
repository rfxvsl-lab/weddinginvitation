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

// ------------------------------------------------------------------ standar kompetitor: navigasi bawah, aside desktop, lightbox

/**
 * Lapisan "fixed" yang dibatasi ke kolom undangan. Di desktop kolom berada di kanan
 * (lebar --kit-col) sehingga lapisan ini mulai dari --kit-l. `transform` membuat
 * turunan ber-`position: fixed` mengikuti kotak lapisan ini, bukan seluruh layar.
 */
export function KitOverlay({ z, children }: { z: number; children: React.ReactNode }) {
  return (
    <div
      className="kit-overlay"
      style={{ position: 'fixed', top: 0, bottom: 0, right: 0, left: 'var(--kit-l, 0px)', zIndex: z, pointerEvents: 'none', transform: 'translateZ(0)' }}
    >
      {children}
    </div>
  );
}

export type NavIcon = 'home' | 'couple' | 'events' | 'gallery' | 'gift' | 'wishes' | 'story';

/**
 * Navigasi bawah gaya undangan premium: pil mengambang berisi ikon + label,
 * bagian yang sedang terlihat ditandai.
 */
export function BottomNav({ items, p, font }: { items: { id: string; label: string; icon: React.ReactNode }[]; p: ThemePalette; font: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const ref = React.useRef<HTMLElement | null>(null);
  const ids = items.map((i) => i.id).join(',');
  useEffect(() => {
    // undangan bisa dirender di dalam iframe: pakai dokumen & window milik elemen ini
    const doc = ref.current?.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    const els = ids
      .split(',')
      .map((id) => doc.querySelector<HTMLElement>(`[data-section="${id}"]`))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const IO = win.IntersectionObserver || IntersectionObserver;
    const io = new IO(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.getAttribute('data-section') || undefined);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  if (items.length < 2) return null;
  const go = (id: string) => ref.current?.ownerDocument.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <nav
      ref={ref}
      aria-label="Navigasi undangan"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 14,
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        padding: 6,
        maxWidth: 'calc(100% - 24px)',
        borderRadius: 999,
        background: `${p.surface}E8`,
        backdropFilter: 'blur(14px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
        border: `1px solid ${p.secondary}55`,
        boxShadow: '0 16px 36px -18px rgba(0,0,0,.55)',
        pointerEvents: 'auto',
      }}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => go(it.id)}
            aria-label={it.label}
            aria-current={on ? 'true' : undefined}
            className="kit-press"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: 50,
              padding: '7px 8px 6px',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              background: on ? p.primary : 'transparent',
              color: on ? p.onPrimary : p.text,
              transition: 'background-color .3s cubic-bezier(.22,1,.36,1), color .3s cubic-bezier(.22,1,.36,1)',
            }}
          >
            {it.icon}
            <span style={{ fontFamily: font, fontSize: 10, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** Tombol musik bundar (piringan) di kanan bawah, di atas navigasi. */
export function MusicDisc({ playing, onToggle, p }: { playing: boolean; onToggle: () => void; p: ThemePalette }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? 'Jeda musik' : 'Putar musik'}
      className="kit-press"
      style={{ position: 'fixed', right: 14, bottom: 86, width: 46, height: 46, padding: 0, border: `1px solid ${p.secondary}66`, borderRadius: 999, background: `${p.surface}E8`, color: p.primary, cursor: 'pointer', boxShadow: '0 10px 24px -12px rgba(0,0,0,.6)', pointerEvents: 'auto', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      <svg viewBox="0 0 46 46" width="44" height="44" aria-hidden style={{ position: 'absolute', inset: 0, margin: 'auto', animation: 'std-spin 5s linear infinite', animationPlayState: playing ? 'running' : 'paused' }}>
        <circle cx="23" cy="23" r="17" fill="none" stroke="currentColor" strokeOpacity=".25" strokeDasharray="2 3" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M8.5 5.5v13M15.5 5.5v13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M8 5.5v13l10-6.5Z" fill="currentColor" /></svg>
        )}
      </span>
      <style>{'@keyframes std-spin { to { transform: rotate(360deg) } }'}</style>
    </button>
  );
}

/**
 * Panel kiri tampilan desktop (≥ 1024px, dipakai DesktopInvitationWrapper): foto pasangan
 * layar penuh berganti pelan, nama mempelai dan tanggal — kolom undangan berada di kanan.
 */
export function DesktopAside({ photos, title, groom, bride, dateText, quote, fonts, accent }: { photos: string[]; title: string; groom: string; bride: string; dateText: string; quote?: string; fonts: { display: string; script: string; label: string; body: string }; accent: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % photos.length), 6000);
    return () => clearInterval(t);
  }, [photos.length]);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#111' }}>
      <style>{'@keyframes kit-kb { from { transform: scale(1.02) } to { transform: scale(1.12) } }'}</style>
      {photos.map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + k}
          src={src}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: k === i ? 1 : 0, transition: 'opacity 1.6s cubic-bezier(.22,1,.36,1)', animation: k === i ? 'kit-kb 9s ease-out forwards' : undefined }}
        />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.62) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,.1) 100%), linear-gradient(0deg, rgba(0,0,0,.55) 0%, transparent 45%)' }} />
      <div style={{ position: 'absolute', left: 'clamp(32px, 5vw, 80px)', bottom: 'clamp(40px, 8vh, 88px)', right: 'clamp(32px, 5vw, 80px)', color: '#fff', textShadow: '0 2px 20px rgba(0,0,0,.35)' }}>
        <p style={{ fontFamily: fonts.label, fontSize: 13, letterSpacing: '0.32em', textTransform: 'uppercase', margin: 0, opacity: 0.85 }}>{title}</p>
        <h2 style={{ fontFamily: fonts.script, fontSize: 'clamp(56px, 6vw, 96px)', fontWeight: 400, lineHeight: 1.02, margin: '16px 0 14px' }}>
          {groom} <span style={{ color: accent }}>&amp;</span> {bride}
        </h2>
        <p style={{ fontFamily: fonts.label, fontSize: 15, letterSpacing: '0.24em', textTransform: 'uppercase', margin: 0 }}>{dateText}</p>
        {quote && <p style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 1.8, maxWidth: 520, margin: '26px 0 0', opacity: 0.85 }}>{quote}</p>}
      </div>
    </div>
  );
}

/** Lightbox galeri dengan tombol sebelumnya/berikutnya, penghitung, dan geser. */
export function Lightbox({ photos, index, onIndex, onClose }: { photos: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [x0, setX0] = useState<number | null>(null);
  const n = photos.length;
  const prev = () => onIndex((index - 1 + n) % n);
  const next = () => onIndex((index + 1) % n);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n);
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [index, n, onClose, onIndex]);
  const nav: React.CSSProperties = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(0,0,0,.35)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
  return (
    <div
      role="dialog"
      aria-label={`Foto ${index + 1} dari ${n}`}
      onClick={onClose}
      onTouchStart={(e) => setX0(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) (dx > 0 ? prev : next)();
        setX0(null);
      }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 12px', pointerEvents: 'auto' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[index]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }} />
      <p style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.8)', fontSize: 13, letterSpacing: '0.12em', margin: 0 }}>
        {index + 1} / {n}
      </p>
      <button type="button" aria-label="Tutup" onClick={onClose} style={{ ...nav, top: 30, right: 12, transform: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      {n > 1 && (
        <>
          <button type="button" aria-label="Sebelumnya" onClick={(e) => { e.stopPropagation(); prev(); }} style={{ ...nav, left: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
          </button>
          <button type="button" aria-label="Berikutnya" onClick={(e) => { e.stopPropagation(); next(); }} style={{ ...nav, right: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M9.5 5.5 16 12l-6.5 6.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Ornamen sudut bagian: lukisan bunga di sudut kiri atas & kanan bawah (bergoyang pelan),
 * atau ornamen garis tema. Selalu di tepi — tidak pernah di atas kartu/teks.
 */
export function SectionOrnament({ mode, flora, svg, color, flip = false, seed = 1 }: { mode: 'flora' | 'line' | 'none'; flora: Flora; svg?: string; color: string; flip?: boolean; seed?: number }) {
  if (mode === 'none') return null;
  if (mode === 'line' && svg) {
    const corner = (pos: 'tl' | 'br') => (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          [pos === 'tl' ? 'top' : 'bottom']: 18,
          [(pos === 'tl') !== flip ? 'left' : 'right']: 14,
          width: 64,
          height: 64,
          color,
          opacity: 0.85,
          transform: `rotate(${pos === 'tl' ? (flip ? 90 : 0) : flip ? 270 : 180}deg)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
        dangerouslySetInnerHTML={{ __html: svg.replace('<svg ', '<svg width="100%" height="100%" ') }}
      />
    );
    return (
      <>
        {corner('tl')}
        {corner('br')}
      </>
    );
  }
  const a = flip ? 'right' : 'left';
  const b = flip ? 'left' : 'right';
  return (
    <>
      <div aria-hidden style={{ position: 'absolute', top: -28, [a]: 0, width: 0, height: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Bloom flora={flora} side={a} top={0} size={138} seed={seed} offset={-56} tilt={10} />
      </div>
      <div aria-hidden style={{ position: 'absolute', bottom: 6, [b]: 0, width: 0, height: 0, zIndex: 1, pointerEvents: 'none' }}>
        <Bloom flora={flora} side={b} bottom={0} size={118} seed={seed + 3} offset={-52} tilt={10} />
      </div>
    </>
  );
}
