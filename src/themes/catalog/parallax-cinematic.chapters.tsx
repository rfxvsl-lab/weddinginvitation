'use client';

/**
 * Cinematic 2D Parallax — perjalanan lukisan cat air bab per bab:
 * pagi di padang bunga → langit → pondok → bukit → desa → malam berbintang.
 * Tiap bab: lukisan jauh (lambat), potongan latar depan (cepat), buket lukisan di sudut
 * yang membelah saat bab ditinggalkan, kupu-kupu.
 */

import React from 'react';
import type { ChapterData, SectionId } from '../types';
import { ArtLayer } from '../kit/chapters';
import { Butterflies, FloraCluster, floraArtUrl } from '../kit/standard';

type Scene = 'meadow' | 'house' | 'village' | 'night' | 'sky';
const PLAN: Record<SectionId, { scene: Scene; flora?: string; fly?: boolean }> = {
  hero: { scene: 'meadow', flora: 'blush', fly: true },
  quote: { scene: 'sky' },
  couple: { scene: 'house', flora: 'peach' },
  interlude: { scene: 'meadow' },
  countdown: { scene: 'meadow', fly: true },
  events: { scene: 'village', flora: 'ivory' },
  gift: { scene: 'house', flora: 'blush' },
  gallery: { scene: 'sky', fly: true },
  story: { scene: 'village' },
  rsvp: { scene: 'night' },
  wishes: { scene: 'night' },
  closing: { scene: 'night', flora: 'lavender' },
};

function Paint({ src, pos = 'center bottom', mask, style }: { src: string; pos?: string; mask?: string; style?: React.CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, WebkitMaskImage: mask, maskImage: mask, ...style }} />
  );
}

function Back({ id }: { id: SectionId }) {
  const { scene } = PLAN[id];
  const hero = id === 'hero';
  const sky = scene === 'night' ? '/assets/art/wc-night.webp' : '/assets/art/wc-sky-day.webp';
  return (
    <>
      <style>{'@keyframes pc-kb { from { transform: scale(1.04) } to { transform: scale(1.14) } }'}</style>
      <ArtLayer depth={0.03} hero={hero} order={0}>
        <Paint src={sky} pos="center top" style={{ animation: 'pc-kb 30s ease-in-out infinite alternate' }} />
      </ArtLayer>
      {scene !== 'night' && scene !== 'sky' && (
        <ArtLayer depth={0.16} hero={hero} order={1}>
          <Paint src={`/assets/art/wc-${scene}.webp`} mask="linear-gradient(180deg, transparent 16%, #000 40%)" style={{ top: '14%', height: '86%' }} />
        </ArtLayer>
      )}
    </>
  );
}

function Front({ id, data }: { id: SectionId; data: ChapterData }) {
  const { scene, flora, fly } = PLAN[id];
  const hero = id === 'hero';
  const front = scene === 'sky' ? 'meadow' : scene;
  const fl = { colors: ['#EDB4AE', '#F6D3C2', '#FFFFFF'], leaf: '#6B8A5E', art: floraArtUrl(flora) };
  return (
    <>
      <ArtLayer depth={0.62} hero={hero} order={2}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/art/wc-${front}-front.webp`} alt="" style={{ position: 'absolute', left: 0, right: 0, bottom: '-2%', width: '100%', height: '30%', objectFit: 'cover', objectPosition: 'center top', transform: 'scale(1.12)', transformOrigin: '50% 100%' }} />
      </ArtLayer>
      {flora && (
        <>
          <ArtLayer depth={0.9} hero={hero} order={3} exitX={-0.4} origin="0% 100%">
            <div style={{ position: 'absolute', left: '-16%', bottom: '-4%', width: '54%', aspectRatio: '1' }}>
              <FloraCluster flora={fl} seed={3} style={{ transform: 'rotate(16deg)' }} />
            </div>
          </ArtLayer>
          <ArtLayer depth={0.95} hero={hero} order={4} exitX={0.4} origin="100% 100%">
            <div style={{ position: 'absolute', right: '-18%', bottom: '-7%', width: '60%', aspectRatio: '1' }}>
              <FloraCluster flora={fl} seed={8} style={{ transform: 'rotate(-20deg) scaleX(-1)' }} />
            </div>
          </ArtLayer>
        </>
      )}
      {fly && (
        <ArtLayer depth={0.5} hero={hero} order={5}>
          <Butterflies colors={['#F2A7B5', '#F7D774', '#9CC3E6']} n={3} seed={id.length} />
        </ArtLayer>
      )}
      <span hidden>{data.groom}</span>
    </>
  );
}

export default function ParallaxChapter({ id, layer, data }: { id: SectionId; layer: 'back' | 'front'; data: ChapterData }) {
  return layer === 'back' ? <Back id={id} /> : <Front id={id} data={data} />;
}

const DAY = { color: '#173238', shadow: '0 0 18px rgba(255,255,255,.9), 0 1px 0 rgba(255,255,255,.8)' };
const NIGHT = { color: '#F2F7F4', shadow: '0 2px 16px rgba(0,0,0,.6)' };
export const PARALLAX_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: DAY,
  quote: DAY,
  couple: DAY,
  countdown: DAY,
  events: DAY,
  gift: DAY,
  gallery: DAY,
  story: DAY,
  rsvp: NIGHT,
  closing: NIGHT,
};
