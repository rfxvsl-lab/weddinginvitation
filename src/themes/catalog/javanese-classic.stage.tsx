'use client';

/**
 * Panggung pembuka Javanese Classic: kelir (layar wayang) yang diterangi blencong,
 * bayangan gunungan bergoyang seperti digerakkan dalang, pinggiran batik kawung sogan,
 * dan rangkaian bunga putih-emas di kedua sisi.
 */

import React from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer } from '../kit/chapters';
import { mix } from '../kit/scene';

function KawungBand({ color, bg, top }: { color: string; bg: string; top: boolean }) {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <pattern id={`kw-${top ? 't' : 'b'}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill={bg} />
          <g fill={color}>
            <ellipse cx="16" cy="6" rx="5" ry="7" />
            <ellipse cx="16" cy="26" rx="5" ry="7" />
            <ellipse cx="6" cy="16" rx="7" ry="5" />
            <ellipse cx="26" cy="16" rx="7" ry="5" />
          </g>
          <circle cx="16" cy="16" r="1.6" fill={bg} />
          <g fill={mix(bg, '#000', 0.25)}>
            <circle cx="16" cy="6" r="1.2" />
            <circle cx="16" cy="26" r="1.2" />
            <circle cx="6" cy="16" r="1.2" />
            <circle cx="26" cy="16" r="1.2" />
          </g>
        </pattern>
      </defs>
      <rect width="400" height="80" fill={`url(#kw-${top ? 't' : 'b'})`} />
      <rect y={top ? 74 : 0} width="400" height="6" fill={color} />
    </svg>
  );
}

export default function JawaStage({ palette: p }: { palette: ThemePalette }) {
  const sogan = p.primary;
  const kelir = mix(p.bg, '#FFFFFF', 0.4);
  return (
    <>
      <style>{`
        @keyframes jw-flick { 0%,100% { opacity: .92 } 40% { opacity: 1 } 70% { opacity: .85 } }
        @keyframes jw-dalang { 0% { transform: translateX(-50%) rotate(-2.5deg) } 50% { transform: translateX(-50%) rotate(2deg) } 100% { transform: translateX(-50%) rotate(-2.5deg) } }
      `}</style>
      {/* kelir diterangi blencong */}
      <ArtLayer depth={0.02} hero order={0}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(70% 55% at 50% 42%, ${kelir} 0%, ${mix(p.bg, sogan, 0.25)} 62%, ${mix(sogan, '#1A0D06', 0.55)} 100%)`, animation: 'jw-flick 2.6s ease-in-out infinite' }} />
      </ArtLayer>
      {/* bayangan gunungan */}
      <ArtLayer depth={0.2} hero order={1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/art/gunungan.webp"
          alt=""
          style={{ position: 'absolute', left: '50%', bottom: '20%', width: '86%', maxWidth: 420, transformOrigin: '50% 100%', animation: 'jw-dalang 9s ease-in-out infinite', filter: 'blur(.6px) drop-shadow(10px 14px 10px rgba(40,20,10,.35))', opacity: 0.88 }}
        />
      </ArtLayer>
      {/* pinggiran batik */}
      <ArtLayer depth={0.35} hero order={2}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '6%', height: 54 }}>
          <KawungBand color={sogan} bg={mix(p.secondary, '#FFFFFF', 0.35)} top />
        </div>
      </ArtLayer>
      <ArtLayer depth={0.5} hero order={3}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '6%', height: 70 }}>
          <KawungBand color={sogan} bg={mix(p.secondary, '#FFFFFF', 0.35)} top={false} />
        </div>
      </ArtLayer>
    </>
  );
}
