'use client';

/**
 * Dark Luxury Cinematic — bab-bab bergaya film.
 * Foto mempelai menjadi "shot" layar penuh dengan Ken Burns dan paralaks berlapis,
 * di atas hitam pekat dengan cahaya emas: berkas proyektor, bokeh, kebocoran cahaya,
 * pita film yang bergulir, butiran film, dan bilah letterbox di pembuka & penutup.
 */

import React from 'react';
import type { ChapterData, SectionId } from '../types';
import { seeded } from '../kit/scene';
import { ArtLayer } from '../kit/chapters';

const GOLD = '#C9A96E';
const BLACK = '#060507';

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Foto layar penuh dengan Ken Burns. */
function Shot({ src, dim = 0.55, gray = false, pos = 'center', drift = 'a' }: { src?: string; dim?: number; gray?: boolean; pos?: string; drift?: 'a' | 'b' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: BLACK, overflow: 'hidden' }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: pos,
            filter: gray ? 'grayscale(1) contrast(1.1)' : 'saturate(.85) contrast(1.05)',
            animation: `dlc-kb-${drift} 24s ease-in-out infinite alternate`,
          }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(6,5,7,${dim + 0.25}) 0%, rgba(6,5,7,${dim}) 40%, rgba(6,5,7,${dim + 0.1}) 70%, ${BLACK} 100%)` }} />
    </div>
  );
}

function Bokeh({ n = 18, seed = 1, warm = false }: { n?: number; seed?: number; warm?: boolean }) {
  const r = seeded(seed);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const s = 6 + r() * 34;
        const dur = 14 + r() * 16;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${r() * 100}%`,
              top: `${r() * 100}%`,
              width: s,
              height: s,
              borderRadius: 999,
              background: warm ? 'radial-gradient(circle, rgba(255,214,150,.55), rgba(255,180,90,0) 70%)' : `radial-gradient(circle, ${GOLD}88, ${GOLD}00 70%)`,
              filter: `blur(${s > 26 ? 2 : 0.5}px)`,
              animation: `dlc-float ${dur}s ease-in-out ${-r() * dur}s infinite alternate, dlc-pulse ${3 + r() * 4}s ease-in-out ${-r() * 4}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Kebocoran cahaya film — bulatan hangat yang bergeser pelan. */
function LightLeak({ x = '80%', y = '20%', color = 'rgba(255,150,80,.35)', size = 70 }: { x?: string; y?: string; color?: string; size?: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: `${size}vmax`,
        height: `${size}vmax`,
        transform: 'translate(-50%, -50%)',
        borderRadius: 999,
        background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
        mixBlendMode: 'screen',
        animation: 'dlc-leak 11s ease-in-out infinite alternate',
      }}
    />
  );
}

/** Dua berkas cahaya proyektor dari sudut atas. */
function Beams() {
  const beam = (left: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '-20%',
    [left ? 'left' : 'right']: '-10%',
    width: '60%',
    height: '140%',
    background: `linear-gradient(180deg, ${GOLD}55, ${GOLD}00 75%)`,
    clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
    transformOrigin: '50% 0',
    filter: 'blur(14px)',
    mixBlendMode: 'screen',
    animation: `dlc-beam-${left ? 'l' : 'r'} 9s ease-in-out infinite alternate`,
  });
  return (
    <>
      <div style={beam(true)} />
      <div style={beam(false)} />
    </>
  );
}

/** Pita film vertikal berisi foto, untuk bergulir di tepi layar. */
function FilmStrip({ photos, side, offset = 0 }: { photos: string[]; side: 'left' | 'right'; offset?: number }) {
  const frames = Array.from({ length: 10 }, (_, i) => photos[(i + offset) % Math.max(1, photos.length)]);
  const holes = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '6px 0' }}>
      {Array.from({ length: 60 }, (_, i) => (
        <span key={i} style={{ width: 7, height: 9, borderRadius: 2, background: '#2A2520' }} />
      ))}
    </div>
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: '-30%',
        [side]: -14,
        width: 92,
        height: '160%',
        background: '#0D0B09',
        display: 'flex',
        gap: 5,
        padding: '0 5px',
        transform: `rotate(${side === 'left' ? -4 : 4}deg)`,
        boxShadow: '0 0 40px rgba(0,0,0,.8)',
        opacity: 0.9,
      }}
    >
      <div style={{ overflow: 'hidden' }}>{holes}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8 }}>
        {frames.map((src, i) =>
          src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', filter: 'sepia(.35) saturate(.8)', opacity: 0.85 }} />
          ) : (
            <div key={i} style={{ width: '100%', aspectRatio: '3/4', background: '#1A1612' }} />
          )
        )}
      </div>
      <div style={{ overflow: 'hidden' }}>{holes}</div>
    </div>
  );
}

function Grain() {
  return <div style={{ position: 'absolute', inset: '-50%', backgroundImage: NOISE, opacity: 0.09, mixBlendMode: 'overlay', animation: 'dlc-grain .9s steps(4) infinite' }} />;
}

function Vignette({ strength = 0.75 }: { strength?: number }) {
  return <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${strength}) 100%)` }} />;
}

/** Bilah letterbox sinema dengan kredit kecil. */
function Letterbox({ left, right }: { left: string; right: string }) {
  const bar: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '8.5vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    fontFamily: "'Marcellus', serif",
    fontSize: 10,
    letterSpacing: '0.32em',
    color: 'rgba(233,216,182,.7)',
  };
  return (
    <>
      <div style={{ ...bar, top: 0, alignItems: 'flex-end', paddingBottom: 10 }}>
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div style={{ ...bar, bottom: 0 }} />
    </>
  );
}

function Rings() {
  return (
    <svg viewBox="-100 -100 200 200" style={{ position: 'absolute', left: '50%', top: '42%', width: '150vmin', height: '150vmin', transform: 'translate(-50%, -50%)', opacity: 0.22, animation: 'dlc-rotate 60s linear infinite' }}>
      {[92, 80, 66].map((r, i) => (
        <circle key={r} r={r} fill="none" stroke={GOLD} strokeWidth={i === 1 ? 0.6 : 0.3} strokeDasharray={i === 1 ? '1 3' : undefined} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} x1={0} y1={-92} x2={0} y2={i % 5 ? -88 : -84} stroke={GOLD} strokeWidth={0.4} transform={`rotate(${i * 6})`} />
      ))}
    </svg>
  );
}

const KEYFRAMES = `
  @keyframes dlc-kb-a { from { transform: scale(1.06) translate(0,0) } to { transform: scale(1.2) translate(-2%,-3%) } }
  @keyframes dlc-kb-b { from { transform: scale(1.18) translate(-2%,2%) } to { transform: scale(1.05) translate(2%,0) } }
  @keyframes dlc-float { from { transform: translate(0,0) } to { transform: translate(14px,-46px) } }
  @keyframes dlc-pulse { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
  @keyframes dlc-leak { from { transform: translate(-50%,-50%) scale(1); opacity: .7 } to { transform: translate(-56%,-44%) scale(1.15); opacity: 1 } }
  @keyframes dlc-beam-l { from { transform: rotate(-24deg); opacity: .55 } to { transform: rotate(-14deg); opacity: .9 } }
  @keyframes dlc-beam-r { from { transform: rotate(22deg); opacity: .9 } to { transform: rotate(12deg); opacity: .5 } }
  @keyframes dlc-grain { 0% { transform: translate(0,0) } 25% { transform: translate(-5%,3%) } 50% { transform: translate(4%,-4%) } 75% { transform: translate(-3%,-2%) } 100% { transform: translate(2%,4%) } }
  @keyframes dlc-rotate { to { transform: translate(-50%,-50%) rotate(360deg) } }
  @keyframes dlc-rain { from { transform: translateY(-10vh) } to { transform: translateY(115vh) } }
`;

function GoldRain({ n = 26, seed = 4 }: { n?: number; seed?: number }) {
  const r = seeded(seed);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const dur = 7 + r() * 9;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${r() * 100}%`,
              top: 0,
              width: 2,
              height: 2 + r() * 3,
              borderRadius: 2,
              background: '#F1D9A6',
              boxShadow: '0 0 6px 1px rgba(241,217,166,.7)',
              animation: `dlc-rain ${dur}s linear ${-r() * dur}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

function Back({ id, data }: { id: SectionId; data: ChapterData }) {
  const ph = data.photos;
  const pick = (i: number) => ph[i % Math.max(1, ph.length)];
  switch (id) {
    case 'hero':
      return (
        <>
          <style>{KEYFRAMES}</style>
          <ArtLayer depth={0.12} hero order={0}>
            <Shot src={pick(0)} dim={0.42} />
          </ArtLayer>
          <ArtLayer depth={0.35} hero order={1}>
            <LightLeak x="88%" y="14%" />
            <LightLeak x="6%" y="86%" color="rgba(201,169,110,.28)" size={60} />
          </ArtLayer>
          <ArtLayer depth={0.6} hero order={2}>
            <Bokeh n={14} seed={2} warm />
          </ArtLayer>
        </>
      );
    case 'quote':
      return (
        <>
          <ArtLayer depth={0.15}>
            <Shot src={pick(1)} dim={0.78} gray drift="b" />
          </ArtLayer>
          <ArtLayer depth={0.5}>
            <Bokeh n={16} seed={5} />
          </ArtLayer>
        </>
      );
    case 'couple':
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 80% at 50% 0%, #1E1913 0%, ${BLACK} 70%)` }} />
          <ArtLayer depth={0.1}>
            <Beams />
          </ArtLayer>
          <ArtLayer depth={0.55}>
            <Bokeh n={20} seed={8} />
          </ArtLayer>
        </>
      );
    case 'countdown':
      return (
        <>
          <ArtLayer depth={0.12}>
            <Shot src={pick(2)} dim={0.72} drift="b" />
          </ArtLayer>
          <ArtLayer depth={0.3}>
            <Rings />
          </ArtLayer>
        </>
      );
    case 'events':
      return (
        <>
          <ArtLayer depth={0.14}>
            <Shot src={pick(3)} dim={0.66} pos="center 30%" />
          </ArtLayer>
          <ArtLayer depth={0.4}>
            <LightLeak x="10%" y="10%" color="rgba(201,169,110,.3)" size={55} />
          </ArtLayer>
        </>
      );
    case 'story':
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, #120F0C, ${BLACK})` }} />
          <ArtLayer depth={0.05}>
            <FilmStrip photos={ph} side="left" />
          </ArtLayer>
          <ArtLayer depth={0.85}>
            <FilmStrip photos={ph} side="right" offset={3} />
          </ArtLayer>
        </>
      );
    case 'gallery':
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: BLACK }} />
          <ArtLayer depth={0.2}>
            <LightLeak x="85%" y="25%" color="rgba(255,120,80,.28)" size={65} />
            <LightLeak x="15%" y="75%" color="rgba(201,169,110,.3)" size={60} />
          </ArtLayer>
          <ArtLayer depth={0.6}>
            <Bokeh n={22} seed={11} warm />
          </ArtLayer>
        </>
      );
    case 'gift':
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(100% 70% at 50% 100%, #221B12 0%, ${BLACK} 70%)` }} />
          <ArtLayer depth={0.3}>
            <GoldRain n={30} seed={13} />
          </ArtLayer>
          <ArtLayer depth={0.6}>
            <Bokeh n={10} seed={14} />
          </ArtLayer>
        </>
      );
    case 'rsvp':
      return (
        <>
          <ArtLayer depth={0.14}>
            <Shot src={pick(5)} dim={0.74} gray drift="b" />
          </ArtLayer>
          <ArtLayer depth={0.5}>
            <Bokeh n={14} seed={17} />
          </ArtLayer>
        </>
      );
    case 'closing':
    default:
      return (
        <>
          <ArtLayer depth={0.12}>
            <Shot src={pick(0)} dim={0.6} />
          </ArtLayer>
          <ArtLayer depth={0.4}>
            <LightLeak x="50%" y="95%" color="rgba(201,169,110,.35)" size={70} />
          </ArtLayer>
          <ArtLayer depth={0.6}>
            <Bokeh n={16} seed={19} warm />
          </ArtLayer>
        </>
      );
  }
}

function Front({ id, data }: { id: SectionId; data: ChapterData }) {
  const film = (
    <>
      <Vignette />
      <Grain />
    </>
  );
  if (id === 'hero') {
    return (
      <>
        {film}
        <Letterbox left="A LOVE STORY" right={data.dateShort} />
      </>
    );
  }
  if (id === 'closing') {
    return (
      <>
        {film}
        <Letterbox left="THE BEGINNING" right={`${data.groom} & ${data.bride}`.toUpperCase()} />
      </>
    );
  }
  if (id === 'gift' || id === 'couple') {
    return (
      <>
        <Vignette strength={0.6} />
        <Grain />
        <ArtLayer depth={1}>
          <GoldRain n={8} seed={id === 'gift' ? 21 : 23} />
        </ArtLayer>
      </>
    );
  }
  return film;
}

export default function CinematicChapter({ id, layer, data }: { id: SectionId; layer: 'back' | 'front'; data: ChapterData }) {
  return layer === 'back' ? <Back id={id} data={data} /> : <Front id={id} data={data} />;
}

const IVORY = { color: '#F4EDE0', shadow: '0 2px 22px rgba(0,0,0,.65)' };
export const CINEMATIC_INK: Partial<Record<SectionId, { color: string; shadow?: string }>> = {
  hero: IVORY,
  quote: IVORY,
  couple: IVORY,
  countdown: IVORY,
  events: IVORY,
  story: IVORY,
  gallery: IVORY,
  gift: IVORY,
  rsvp: IVORY,
  closing: IVORY,
};
