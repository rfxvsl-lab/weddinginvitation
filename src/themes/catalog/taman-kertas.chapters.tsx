'use client';

/**
 * Taman Kertas — bab-bab adegan 2D bergaya diorama kertas potong (kirigami).
 * Komposisi tiap bab ada di taman-kertas.scenes.tsx, perkakas gambar di taman-kertas.art.tsx.
 * Lapisan kertas berdiri satu per satu saat halaman masuk layar (pop-up), lalu bergeser
 * sesuai kedalamannya saat digulir.
 */

import React from 'react';
import type { SectionId } from '../types';
import { ArtLayer, ArtSvg, Sky } from '../kit/chapters';
import { PaperDefs } from './taman-kertas.art';
import { SCENES, TK_KEYFRAMES, lift, type Layer } from './taman-kertas.scenes';

function Layers({ id, list }: { id: SectionId; list: Layer[] }) {
  return (
    <>
      {list.map((l, i) => {
        const staged = l.order !== undefined;
        return (
          <ArtLayer
            key={i}
            depth={l.depth}
            order={l.order}
            hero={id === 'hero' && staged}
            popup={id !== 'hero' && staged}
            exitX={l.exitX}
            origin={l.origin}
          >
            {l.svg && (
              <ArtSvg anchor={l.anchor} style={{ filter: lift(l.lift ?? 0.3) }}>
                {l.svg}
              </ArtSvg>
            )}
            {l.html}
          </ArtLayer>
        );
      })}
    </>
  );
}

export default function TamanChapter({ id, layer }: { id: SectionId; layer: 'back' | 'front' }) {
  const sc = SCENES[id] || SCENES.hero;
  if (layer === 'front') return <Layers id={id} list={sc.front} />;
  return (
    <>
      {id === 'hero' && <style>{TK_KEYFRAMES}</style>}
      <PaperDefs />
      <Sky top={sc.sky[0]} bottom={sc.sky[1]} />
      <Layers id={id} list={sc.back} />
    </>
  );
}

const DARK = { color: '#4A3340', shadow: '0 1px 0 rgba(255,255,255,.75)' };
export const TAMAN_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: DARK,
  quote: DARK,
  couple: DARK,
  countdown: DARK,
  events: DARK,
  story: DARK,
  gallery: DARK,
  gift: DARK,
  rsvp: DARK,
  closing: { color: '#FFF6E8', shadow: '0 2px 12px rgba(10,10,40,.55)' },
};
