'use client';

import React, { useState } from 'react';
import type { ThemeSpec } from '../types';

interface CoverProps {
  spec: ThemeSpec;
  groom: string;
  bride: string;
  dateText: string;
  guestName: string;
  photo: string;
  onOpen: () => void;
}

const OPEN_MS = 1100;

/** Sampul undangan — 5 mekanik pembuka. Tamu menekan tombol, animasi berjalan, lalu konten tampil. */
export default function Cover({ spec, groom, bride, dateText, guestName, photo, onOpen }: CoverProps) {
  const [opening, setOpening] = useState(false);
  // hitung mundur pita film (sampul 'film')
  const [leader, setLeader] = useState(3);
  const p = spec.palette;
  const coverBg = p.cover || p.bg;
  const onCover = p.onCover || p.text;
  const copy = spec.copy || {};
  const label = copy.coverLabel || 'Kepada Yth. Bapak/Ibu/Saudara/i';
  const title = copy.coverTitle || 'The Wedding of';
  const button = copy.openButton || 'Buka Undangan';
  const display = spec.fonts.display;
  const script = spec.fonts.script || spec.fonts.display;
  const labelFont = spec.fonts.label || spec.fonts.body;

  // tombol harus kontras dengan latar sampul; bila warna utama terlalu dekat, pakai warna kedua
  const lum = (hex: string) => {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: string, b: string) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
  };
  const safe = /^#[0-9a-f]{6}$/i;
  const btnBg = safe.test(p.primary) && safe.test(coverBg) && contrast(p.primary, coverBg) < 2.2 ? p.secondary : p.primary;
  const btnFg = btnBg === p.primary ? p.onPrimary : safe.test(btnBg) && lum(btnBg) > 0.35 ? '#1A1A1A' : '#FFFFFF';

  const open = () => {
    if (opening) return;
    setOpening(true);
    if (spec.cover === 'film') {
      setLeader(3);
      window.setTimeout(() => setLeader(2), 520);
      window.setTimeout(() => setLeader(1), 1040);
      window.setTimeout(() => setLeader(0), 1560);
      window.setTimeout(onOpen, 2150);
      return;
    }
    window.setTimeout(onOpen, spec.cover === 'scene' ? 700 : OPEN_MS);
  };

  const ease = 'cubic-bezier(.7,0,.2,1)';
  const Art = spec.CoverArt;

  // Komposisi sampul standar (pola template premium): foto berbingkai → judul → nama → tanggal →
  // nama tamu di antara dua garis → tombol buka. Tanpa kartu putih generik.
  const frameRadius: Record<string, string> = { arch: '999px 999px 8px 8px', circle: '999px', oval: '50%', rect: '8px', polaroid: '3px' };
  const showPhoto = Boolean(photo) && spec.cover !== 'photo' && spec.cover !== 'scene' && spec.cover !== 'envelope' && spec.cover !== 'film';
  const fr = frameRadius[spec.frame] || frameRadius.arch;
  const inner = (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 28px', width: '100%', maxWidth: 420 }}>
      {showPhoto && (
        <div style={{ width: spec.frame === 'circle' ? 150 : 148, height: spec.frame === 'circle' ? 150 : 196, padding: 5, borderRadius: fr, border: `1px solid ${p.secondary}`, marginBottom: 26, boxShadow: '0 20px 40px -24px rgba(0,0,0,.6)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', borderRadius: fr, display: 'block' }} />
        </div>
      )}
      <p style={{ fontFamily: labelFont, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.85, margin: 0 }}>{title}</p>
      <h1 style={{ fontFamily: script, fontSize: 'clamp(44px, 13vw, 60px)', lineHeight: 1.08, fontWeight: 400, margin: '14px 0 10px', textWrap: 'balance' }}>
        {groom} <span style={{ fontFamily: display, fontSize: '0.55em', fontStyle: 'italic', color: p.secondary }}>&amp;</span> {bride}
      </h1>
      <p style={{ fontFamily: labelFont, fontSize: 12.5, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.9, margin: 0 }}>{dateText}</p>
      <div style={{ margin: '30px 0 26px', width: '100%', maxWidth: 300, textShadow: 'none' }}>
        <p style={{ fontFamily: labelFont, fontSize: 12.5, letterSpacing: '0.04em', opacity: 0.8, margin: 0 }}>{label}</p>
        <div style={{ margin: '12px 0 0', padding: '12px 8px', borderTop: `1px solid ${p.secondary}AA`, borderBottom: `1px solid ${p.secondary}AA` }}>
          <p style={{ fontFamily: display, fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{guestName}</p>
        </div>
        <p style={{ fontFamily: labelFont, fontSize: 11.5, opacity: 0.65, margin: '10px 0 0' }}>Mohon maaf bila ada kesalahan penulisan nama dan gelar</p>
      </div>
      <button
        data-kit-open
        type="button"
        onClick={open}
        className="kit-press"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 46,
          fontFamily: labelFont,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: btnFg,
          background: btnBg,
          border: 'none',
          borderRadius: Math.min(spec.radius, 999) >= 20 ? 999 : Math.max(6, Math.min(spec.radius, 14)),
          padding: '12px 26px',
          cursor: 'pointer',
          boxShadow: '0 14px 28px -14px rgba(0,0,0,.6)',
        }}
      >
        {spec.cover === 'film' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M8 5.5v13l10-6.5Z" fill="currentColor" /></svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
            <path d="m4 6.5 8 6 8-6" />
          </svg>
        )}
        {button}
      </button>
    </div>
  );

  const base: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    color: onCover,
    background: coverBg,
    backgroundImage: [spec.pattern, `radial-gradient(120% 80% at 50% 40%, transparent 40%, rgba(0,0,0,.28) 100%)`].filter(Boolean).join(', '),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    pointerEvents: 'auto',
  };

  // ---------------- photo: foto penuh, sampul naik ke atas ----------------
  if (spec.cover === 'photo') {
    return (
      <div style={{ ...base, transition: `transform ${OPEN_MS}ms ${ease}`, transform: opening ? 'translateY(-100%)' : 'none' }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${coverBg}55 0%, ${coverBg}CC 55%, ${coverBg} 100%)` }} />
        {Art && <Art palette={p} />}
        <div style={{ position: 'relative', zIndex: 2, marginTop: '30vh' }}>{inner}</div>
      </div>
    );
  }

  // ---------------- curtain: dua panel terbelah ----------------
  if (spec.cover === 'curtain') {
    const panel = (side: 'l' | 'r'): React.CSSProperties => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50.5%',
      [side === 'l' ? 'left' : 'right']: 0,
      background: `repeating-linear-gradient(90deg, ${coverBg} 0 18px, ${p.primary}22 18px 20px)`,
      backgroundColor: coverBg,
      transition: `transform ${OPEN_MS}ms ${ease}`,
      transform: opening ? `translateX(${side === 'l' ? '-100%' : '100%'})` : 'none',
      boxShadow: side === 'l' ? 'inset -20px 0 40px -20px rgba(0,0,0,.4)' : 'inset 20px 0 40px -20px rgba(0,0,0,.4)',
    });
    return (
      <div style={{ ...base, background: 'transparent', backgroundImage: 'none' }}>
        <div style={panel('l')} />
        <div style={panel('r')} />
        {Art && <Art palette={p} />}
        <div style={{ transition: `opacity 400ms ease, transform 600ms ${ease}`, opacity: opening ? 0 : 1, transform: opening ? 'scale(.94)' : 'none' }}>{inner}</div>
      </div>
    );
  }

  // ---------------- gate: dua daun pintu berputar 3D ----------------
  if (spec.cover === 'gate') {
    const door = (side: 'l' | 'r'): React.CSSProperties => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: '50%',
      [side === 'l' ? 'left' : 'right']: 0,
      background: coverBg,
      backgroundImage: [spec.pattern, side === 'l' ? 'linear-gradient(90deg, transparent 60%, rgba(0,0,0,.18))' : 'linear-gradient(270deg, transparent 60%, rgba(0,0,0,.18))'].filter(Boolean).join(', '),
      // bayangan lembut di sambungan pintu (tanpa garis yang memotong teks)
      boxShadow: side === 'l' ? 'inset -14px 0 22px -20px rgba(0,0,0,.28)' : 'inset 14px 0 22px -20px rgba(0,0,0,.28)',
      transformOrigin: side === 'l' ? '0 50%' : '100% 50%',
      transition: `transform ${OPEN_MS}ms ${ease}`,
      transform: opening ? `perspective(1200px) rotateY(${side === 'l' ? 100 : -100}deg)` : 'none',
    });
    return (
      <div style={{ ...base, background: 'transparent', backgroundImage: 'none', perspective: 1200 }}>
        <div style={door('l')} />
        <div style={door('r')} />
        {Art && <Art palette={p} />}
        <div style={{ transition: 'opacity 350ms ease', opacity: opening ? 0 : 1 }}>{inner}</div>
      </div>
    );
  }

  // ---------------- envelope: amplop + segel ----------------
  if (spec.cover === 'envelope') {
    return (
      <div style={{ ...base, transition: `opacity 500ms ease ${OPEN_MS - 450}ms`, opacity: opening ? 0 : 1 }}>
        {Art && <Art palette={p} />}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 280, height: 186, perspective: 800, marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, background: p.primary, borderRadius: 8, boxShadow: '0 24px 40px -22px rgba(0,0,0,.6)' }} />
            <div
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                top: 10,
                height: 164,
                background: p.surface,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: script,
                fontSize: 28,
                color: p.primary,
                transition: `transform 600ms ${ease} 350ms`,
                transform: opening ? 'translateY(-70%)' : 'none',
              }}
            >
              {groom} &amp; {bride}
            </div>
            <div style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0,50% 55%,100% 0,100% 100%,0 100%)', background: p.primary, filter: 'brightness(.92)', borderRadius: 8 }} />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: '58%',
                clipPath: 'polygon(0 0,100% 0,50% 100%)',
                background: p.primary,
                filter: 'brightness(.8)',
                transformOrigin: '50% 0',
                transition: `transform 450ms ${ease}`,
                transform: opening ? 'rotateX(180deg)' : 'none',
                zIndex: opening ? 0 : 3,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 'calc(50% - 22px)',
                top: 'calc(55% - 30px)',
                width: 44,
                height: 44,
                borderRadius: 999,
                background: p.secondary,
                border: `3px solid ${p.primary}`,
                zIndex: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: p.primary,
                fontSize: 18,
                transition: 'transform 250ms ease, opacity 250ms ease',
                transform: opening ? 'scale(0)' : 'none',
              }}
            >
              ♥
            </div>
          </div>
          {inner}
        </div>
      </div>
    );
  }

  // ---------------- film: kartu judul → hitung mundur pita film 3-2-1 → layar hitam terbelah ----------------
  if (spec.cover === 'film') {
    const half = (top: boolean): React.CSSProperties => ({
      position: 'absolute',
      left: 0,
      right: 0,
      [top ? 'top' : 'bottom']: 0,
      height: '50.5%',
      background: '#000',
      transition: `transform 560ms ${ease}`,
      transform: opening && leader === 0 ? `translateY(${top ? '-100%' : '100%'})` : 'none',
    });
    return (
      <div style={{ ...base, background: 'transparent', backgroundImage: 'none', color: onCover }}>
        <div style={half(true)} />
        <div style={half(false)} />
        {!opening && (
          <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            {Art && <Art palette={p} />}
            {inner}
          </div>
        )}
        {opening && leader > 0 && (
          <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #3A342B 0%, #15120E 70%)' }}>
            <style>{'@keyframes kit-leader { from { transform: rotate(0deg) } to { transform: rotate(360deg) } } @keyframes kit-flick { 0%,100% { opacity: .92 } 50% { opacity: 1 } }'}</style>
            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(240,230,210,.35)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(240,230,210,.35)' }} />
            <div style={{ position: 'relative', width: 'min(62vw, 260px)', aspectRatio: '1', borderRadius: 999, border: '2px solid rgba(240,230,210,.7)', boxShadow: 'inset 0 0 0 14px rgba(0,0,0,.25), inset 0 0 0 16px rgba(240,230,210,.4)', overflow: 'hidden', animation: 'kit-flick .12s steps(2) infinite' }}>
              <div key={leader} style={{ position: 'absolute', inset: 0, background: 'conic-gradient(rgba(240,230,210,.28) 0deg, rgba(240,230,210,.28) 0deg, transparent 0deg)', animation: 'kit-leader .52s linear', maskImage: 'conic-gradient(#000 0deg 360deg)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'conic-gradient(from 0deg, rgba(240,230,210,.32) 0deg 90deg, transparent 90deg)' }} />
              </div>
              <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontSize: 'min(36vw, 150px)', lineHeight: 1, color: 'rgba(245,236,218,.95)' }}>{leader}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- scene: tanpa latar — adegan paralaks di belakang yang menjadi sampul ----------------
  if (spec.cover === 'scene') {
    return (
      <div
        style={{
          ...base,
          background: 'transparent',
          backgroundImage: 'none',
          color: spec.scene?.heroText || onCover,
          alignItems: 'flex-start',
          paddingTop: '14vh',
          textShadow: '0 2px 18px rgba(0,0,0,.15)',
          transition: `opacity 650ms ease, transform 800ms ${ease}, filter 650ms ease`,
          opacity: opening ? 0 : 1,
          transform: opening ? 'translateY(-40px) scale(1.04)' : 'none',
          filter: opening ? 'blur(6px)' : 'none',
        }}
      >
        {Art && <Art palette={p} />}
        {inner}
      </div>
    );
  }

  // ---------------- card (default): kartu berbingkai, membesar lalu hilang ----------------
  return (
    <div style={{ ...base, transition: `opacity 600ms ease ${OPEN_MS - 600}ms`, opacity: opening ? 0 : 1 }}>
      {Art && <Art palette={p} />}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: 'min(88vw, 400px)',
          padding: '46px 0',
          border: `1px solid ${p.secondary}`,
          outline: `1px solid ${p.secondary}`,
          outlineOffset: 6,
          borderRadius: spec.radius,
          background: `${p.surface}E6`,
          // isi kartu berada di atas warna permukaan, bukan warna sampul
          color: p.text,
          transition: `transform ${OPEN_MS}ms ${ease}, filter ${OPEN_MS}ms ease`,
          transform: opening ? 'scale(1.25)' : 'none',
          filter: opening ? 'blur(8px)' : 'none',
        }}
      >
        {inner}
      </div>
    </div>
  );
}
