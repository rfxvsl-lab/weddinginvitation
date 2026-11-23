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

  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, OPEN_MS);
  };

  const ease = 'cubic-bezier(.7,0,.2,1)';
  const Art = spec.CoverArt;

  const inner = (
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 28px' }}>
      <p style={{ fontFamily: labelFont, fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.8 }}>{title}</p>
      <h1 style={{ fontFamily: script, fontSize: 'clamp(44px, 13vw, 64px)', lineHeight: 1.05, fontWeight: 400, margin: '14px 0 6px' }}>
        {groom} <span style={{ fontFamily: display, fontSize: '0.6em', fontStyle: 'italic', color: p.secondary }}>&amp;</span> {bride}
      </h1>
      <p style={{ fontFamily: spec.fonts.body, fontSize: 14, opacity: 0.85 }}>{dateText}</p>
      <div style={{ width: 60, height: 1, background: p.secondary, margin: '26px 0 18px' }} />
      <p style={{ fontFamily: labelFont, fontSize: 11, letterSpacing: '0.12em', opacity: 0.75 }}>{label}</p>
      <p style={{ fontFamily: display, fontSize: 24, margin: '6px 0 26px' }}>{guestName}</p>
      <button
        data-kit-open
        type="button"
        onClick={open}
        style={{
          fontFamily: labelFont,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: p.onPrimary,
          background: p.primary,
          border: 'none',
          borderRadius: Math.min(spec.radius, 999),
          padding: '14px 26px',
          cursor: 'pointer',
          boxShadow: '0 12px 26px -14px rgba(0,0,0,.55)',
        }}
      >
        ✉ {button}
      </button>
    </div>
  );

  const base: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    color: onCover,
    background: coverBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
      <div style={{ ...base, background: 'transparent' }}>
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
      // bayangan lembut di sambungan pintu (tanpa garis yang memotong teks)
      boxShadow: side === 'l' ? 'inset -14px 0 22px -20px rgba(0,0,0,.28)' : 'inset 14px 0 22px -20px rgba(0,0,0,.28)',
      transformOrigin: side === 'l' ? '0 50%' : '100% 50%',
      transition: `transform ${OPEN_MS}ms ${ease}`,
      transform: opening ? `perspective(1200px) rotateY(${side === 'l' ? 100 : -100}deg)` : 'none',
    });
    return (
      <div style={{ ...base, background: 'transparent', perspective: 1200 }}>
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
