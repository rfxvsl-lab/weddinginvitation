'use client';

/**
 * Heirloom Storybook — tiap bab adalah halaman buku cerita bersampul kulit:
 * ilustrasi cat air di jendela halaman yang dibalik masuk (rotateY) saat bab muncul,
 * lapisan latar depan ilustrasi bergerak lebih cepat, bingkai emas timbul, buket di sudut.
 */

import React from 'react';
import type { ChapterData, SectionId } from '../types';
import { ArtLayer } from '../kit/chapters';
import { FloraCluster } from '../kit/standard';
import { Px } from '../kit/scene';

const GOLD = '#C6A15B';
type Scene = 'meadow' | 'house' | 'village' | 'night' | 'sky';
const PAGE: Record<SectionId, Scene> = {
  hero: 'house',
  quote: 'sky',
  couple: 'meadow',
  interlude: 'meadow',
  countdown: 'village',
  events: 'house',
  gift: 'meadow',
  gallery: 'sky',
  story: 'village',
  rsvp: 'night',
  wishes: 'night',
  closing: 'night',
};

function Leather() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(120% 80% at 50% 20%, #3A2820 0%, #241915 55%, #150E0B 100%), repeating-linear-gradient(35deg, rgba(255,255,255,.015) 0 2px, transparent 2px 6px)',
        backgroundBlendMode: 'overlay',
      }}
    >
      <div style={{ position: 'absolute', inset: 12, border: `1.5px solid ${GOLD}`, borderRadius: 10, opacity: 0.55 }} />
      <div style={{ position: 'absolute', inset: 18, border: `0.8px solid ${GOLD}`, borderRadius: 7, opacity: 0.35 }} />
    </div>
  );
}

function Illustration({ scene }: { scene: Scene }) {
  const back = scene === 'night' ? 'wc-night' : scene === 'sky' ? 'wc-sky-day' : `wc-${scene}`;
  const front = scene === 'sky' ? 'wc-meadow-front' : `wc-${scene}-front`;
  return (
    <div style={{ position: 'absolute', left: '7%', right: '7%', top: '7%', height: '39%', borderRadius: '120px 120px 12px 12px', overflow: 'hidden', background: '#F4EAD5', padding: 8, boxShadow: `0 0 0 2px ${GOLD}, 0 24px 40px -18px rgba(0,0,0,.8)` }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '112px 112px 8px 8px', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/art/${back}.webp`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 70%', animation: 'sb-kb 26s ease-in-out infinite alternate' }} />
        <Px source="chapter" style={{ position: 'absolute', left: '-6%', right: '-6%', bottom: '-6%', height: '58%' }} y={[40, -30]}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/art/${front}.webp`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        </Px>
      </div>
    </div>
  );
}

function Back({ id }: { id: SectionId }) {
  const hero = id === 'hero';
  return (
    <>
      <style>{'@keyframes sb-kb { from { transform: scale(1.04) } to { transform: scale(1.16) } }'}</style>
      <Leather />
      <ArtLayer depth={0.05} hero={hero} turn={!hero} order={0} origin="0% 50%">
        <Illustration scene={PAGE[id]} />
      </ArtLayer>
    </>
  );
}

function Front({ id }: { id: SectionId }) {
  if (!['hero', 'couple', 'events', 'gift', 'closing'].includes(id)) return null;
  const fl = { colors: ['#F2D9A6'], leaf: '#6B5A3A', art: '/assets/art/bouquet-gold.webp' };
  return (
    <ArtLayer depth={0.85} hero={id === 'hero'} popup={id !== 'hero'} order={2} origin="0% 0%">
      <div style={{ position: 'absolute', left: '-6%', top: '2%', width: '36%', aspectRatio: '1' }}>
        <FloraCluster flora={fl} seed={4} style={{ transform: 'rotate(-30deg)' }} />
      </div>
      <div style={{ position: 'absolute', right: '-8%', top: '30%', width: '32%', aspectRatio: '1' }}>
        <FloraCluster flora={fl} seed={9} style={{ transform: 'rotate(140deg)' }} />
      </div>
    </ArtLayer>
  );
}

export default function StorybookChapter({ id, layer }: { id: SectionId; layer: 'back' | 'front'; data: ChapterData }) {
  return layer === 'back' ? <Back id={id} /> : <Front id={id} />;
}

const INK = { color: '#F6EBD3', shadow: '0 2px 12px rgba(0,0,0,.6)' };
export const STORYBOOK_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: INK,
  quote: INK,
  couple: INK,
  countdown: INK,
  events: INK,
  gift: INK,
  gallery: INK,
  story: INK,
  rsvp: INK,
  closing: INK,
};
