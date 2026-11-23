'use client';

/**
 * Panggung pembuka "Lagu Kita": piringan hitam besar berputar dengan foto mempelai sebagai
 * label, lengan pemutar yang turun ke piringan, equalizer berdenyut, dan kanopi daun lukisan.
 */

import React from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer } from '../kit/chapters';
import { mix } from '../kit/scene';

export default function PlaylistStage({ palette: p, photo }: { palette: ThemePalette; photo?: string }) {
  const bars = Array.from({ length: 28 }, (_, i) => i);
  return (
    <>
      <style>{`
        @keyframes pl-spin { to { transform: rotate(360deg) } }
        @keyframes pl-eq { 0%,100% { transform: scaleY(.25) } 50% { transform: scaleY(1) } }
        @keyframes pl-arm { from { transform: rotate(-28deg) } to { transform: rotate(0deg) } }
      `}</style>
      <ArtLayer depth={0.02} hero order={0}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(90% 60% at 50% 45%, ${mix(p.primary, p.bg, 0.72)} 0%, ${p.bg} 70%)` }} />
      </ArtLayer>
      {/* equalizer */}
      <ArtLayer depth={0.12} hero order={1}>
        <div style={{ position: 'absolute', left: '6%', right: '6%', bottom: '14%', height: '16%', display: 'flex', alignItems: 'flex-end', gap: 4, opacity: 0.55 }}>
          {bars.map((i) => (
            <span key={i} style={{ flex: 1, height: '100%', borderRadius: 3, background: `linear-gradient(0deg, ${p.primary}, ${mix(p.primary, '#FFFFFF', 0.5)})`, transformOrigin: '50% 100%', animation: `pl-eq ${0.7 + (i % 5) * 0.17}s ease-in-out ${-(i % 7) * 0.13}s infinite` }} />
          ))}
        </div>
      </ArtLayer>
      {/* piringan hitam */}
      <ArtLayer depth={0.3} hero order={2}>
        <div style={{ position: 'absolute', left: '50%', bottom: '24%', width: '78%', maxWidth: 380, aspectRatio: '1', transform: 'translateX(-50%)' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'repeating-radial-gradient(circle, #111 0 2px, #1C1C1C 2px 4px)', boxShadow: '0 40px 60px -20px rgba(0,0,0,.8), inset 0 0 0 6px #0A0A0A', animation: 'pl-spin 6s linear infinite' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 30deg, transparent 0 40deg, rgba(255,255,255,.14) 50deg, transparent 70deg 210deg, rgba(255,255,255,.1) 225deg, transparent 245deg)' }} />
            <div style={{ position: 'absolute', inset: '31%', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${p.primary}` }}>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: p.primary }} />
              )}
            </div>
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 10, height: 10, margin: -5, borderRadius: 9, background: '#0A0A0A' }} />
          </div>
          {/* lengan pemutar */}
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', right: '-6%', top: '-10%', width: '46%', overflow: 'visible', transformOrigin: '82% 12%', animation: 'pl-arm 2.4s cubic-bezier(.4,0,.2,1) .8s both' }}>
            <circle cx="82" cy="12" r="9" fill="#C9CCD1" />
            <circle cx="82" cy="12" r="4" fill="#7D8188" />
            <path d="M82 12 L 70 70 L 52 86" stroke="#D9DCE1" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="42" y="80" width="16" height="10" rx="2" transform="rotate(40 50 85)" fill="#C9CCD1" />
          </svg>
        </div>
      </ArtLayer>
      {/* kanopi daun lukisan */}
      <ArtLayer depth={0.7} hero order={3} exitX={-0.25}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/art/leaves.webp" alt="" style={{ position: 'absolute', left: '-30%', top: '-4%', width: '120%', transform: 'scaleX(-1) rotate(8deg)', filter: 'saturate(.8) brightness(.85) drop-shadow(0 12px 14px rgba(0,0,0,.4))' }} />
      </ArtLayer>
      <ArtLayer depth={0.8} hero order={4} exitX={0.25}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/art/leaves.webp" alt="" style={{ position: 'absolute', right: '-34%', top: '-8%', width: '120%', transform: 'rotate(-6deg)', filter: 'saturate(.8) brightness(.8) drop-shadow(0 12px 14px rgba(0,0,0,.4))' }} />
      </ArtLayer>
    </>
  );
}
