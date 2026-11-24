'use client';

/**
 * Pasundan — panggung pembuka, tepi halaman, dan sampul.
 * Fajar di Priangan: Tangkuban Parahu berukir emas, awan Mega Mendung berpita yang melayang
 * di kaki gunung, sawah terasering memantulkan cahaya, saung julang ngapak, dan dua tebing
 * awan Mega Mendung besar di depan yang membelah ke samping saat digulir.
 */
import React from 'react';
import type { ThemePalette } from '../types';
import { ArtLayer, ArtSvg } from '../kit/chapters';
import { Px, mix, ridgePath, ridgeY, seeded } from '../kit/scene';
import { Coil, Kujang, MegaMendung, Saung, W, egret, engrave, megaBands, tangkuban, terraces } from './sunda-kujang.art';

export interface StageLayer {
  depth: number;
  order?: number;
  exitX?: number;
  origin?: string;
  svg: React.ReactNode;
}

const CSS = `
@keyframes psd-drift { from { transform: translateX(-18px) } to { transform: translateX(18px) } }
@keyframes psd-glow { 0%,100% { opacity: .55 } 50% { opacity: .8 } }
@media (prefers-reduced-motion: reduce) { .psd-anim { animation: none !important } }
`;

export function stageLayers(p: ThemePalette): StageLayer[] {
  const gold = p.primary;
  const goldLight = mix(gold, '#FFF3CF', 0.55);
  const bands = megaBands(p.bg, 8, '#DDEBDD', 0.82);
  const mistBands = megaBands(mix(p.bg, '#3F6B5D', 0.4), 7, '#D9E4CF', 0.72);
  const farBands = megaBands(mix(p.bg, '#6E9585', 0.45), 5, '#EFE9D4', 0.8);
  const terr = { base: 566, amp: 14, rough: 1.1, seed: 7 };
  const near = { base: 650, amp: 18, rough: 1.4, seed: 13 };
  const t = terraces(terr, 9, 15);
  const r = seeded(41);
  const greens = [mix(p.bg, '#6E8F5C', 0.55), mix(p.bg, '#87A56E', 0.5)];
  return [
    {
      depth: 0.03,
      order: 0,
      svg: (
        <>
          <style>{CSS}</style>
          <defs>
            <radialGradient id="psd-sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#F6DC98" stopOpacity={0.85} />
              <stop offset="1" stopColor="#F6DC98" stopOpacity={0} />
            </radialGradient>
          </defs>
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={30 + r() * 340} cy={100 + r() * 220} r={0.6 + r() * 1} fill="#FFF6DA" opacity={0.25 + r() * 0.45} />
          ))}
          <circle className="psd-anim" cx={292} cy={418} r={170} fill="url(#psd-sun)" style={{ animation: 'psd-glow 6s ease-in-out infinite' }} />
          <Coil x={292} y={418} r={34} colors={[mix(gold, '#FFE9B0', 0.2), mix(gold, '#FFE9B0', 0.45), mix(gold, '#FFF4D6', 0.6), '#FFF1CC', '#FFF7E2']} />
        </>
      ),
    },
    {
      depth: 0.07,
      order: 1,
      svg: (
        <>
          <g className="psd-anim" style={{ animation: 'psd-drift 14s ease-in-out infinite alternate' }}>
            <MegaMendung x={92} y={436} w={120} lobes={3} seed={3} colors={farBands} band={2.6} />
          </g>
          <g className="psd-anim" style={{ animation: 'psd-drift 18s ease-in-out -5s infinite alternate-reverse' }}>
            <MegaMendung x={330} y={402} w={92} lobes={3} seed={8} colors={farBands} band={2.6} flip />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={egret(150 + i * 18, 372 - i * 9, 1 - i * 0.15)} stroke="#FFF6DA" strokeWidth={1.2} fill="none" opacity={0.85} />
          ))}
        </>
      ),
    },
    {
      depth: 0.1,
      order: 2,
      svg: (
        <>
          <defs>
            <linearGradient id="psd-mtn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mix(p.bg, '#9DB3A0', 0.42)} />
              <stop offset="0.3" stopColor={mix(p.bg, '#6C8A78', 0.4)} />
            </linearGradient>
          </defs>
          <path d={tangkuban(540, 1.1)} fill="url(#psd-mtn)" />
          {/* ukiran garis emas di lereng */}
          {Array.from({ length: 7 }, (_, k) => (
            <path key={k} d={tangkuban(540 + 7 + k * 9, 1.1 - k * 0.09)} fill="none" stroke={goldLight} strokeWidth={0.7} opacity={0.32 - k * 0.03} />
          ))}
        </>
      ),
    },
    {
      depth: 0.18,
      order: 3,
      svg: (
        <>
          <g className="psd-anim" style={{ animation: 'psd-drift 16s ease-in-out -3s infinite alternate' }}>
            <MegaMendung x={70} y={540} w={200} lobes={4} seed={11} colors={mistBands} band={2.6} />
          </g>
          <g className="psd-anim" style={{ animation: 'psd-drift 20s ease-in-out -8s infinite alternate-reverse' }}>
            <MegaMendung x={340} y={556} w={170} lobes={4} seed={17} colors={mistBands} band={2.6} flip />
          </g>
        </>
      ),
    },
    {
      depth: 0.3,
      order: 4,
      svg: (
        <>
          <path d={ridgePath({ w: W, h: 800, ...terr })} fill={greens[0]} />
          {t.bands.map((b, i) => (
            <path key={i} d={b} fill={i % 2 ? greens[0] : greens[1]} />
          ))}
          {t.rims.map((rim, i) => (
            <path key={i} d={rim} stroke={i % 3 === 0 ? '#F6DC98' : goldLight} strokeWidth={i % 3 === 0 ? 1.4 : 0.8} opacity={0.65 - i * 0.04} fill="none" />
          ))}
          <Saung x={258} y={ridgeY({ w: W, ...terr }, 258) + 6} s={1.25} fill={mix(p.bg, '#000000', 0.35)} glow="#F6DC98" />
        </>
      ),
    },
    {
      depth: 0.48,
      order: 5,
      svg: (
        <>
          <path d={ridgePath({ w: W, h: 800, ...near })} fill={mix(p.bg, '#000000', 0.15)} />
          <path d={engrave(near, 6, 9, 8)} stroke={gold} strokeWidth={0.7} opacity={0.35} fill="none" />
        </>
      ),
    },
    {
      depth: 0.78,
      order: 6,
      exitX: -0.4,
      origin: '0% 100%',
      svg: (
        <>
          <MegaMendung x={60} y={690} w={290} lobes={5} seed={23} colors={bands} band={3.4} />
          <Coil x={14} y={630} r={22} colors={bands} />
        </>
      ),
    },
    {
      depth: 0.9,
      order: 7,
      exitX: 0.4,
      origin: '100% 100%',
      svg: (
        <>
          <MegaMendung x={344} y={712} w={260} lobes={4} seed={29} colors={bands} band={3.4} flip />
          <Coil x={388} y={660} r={18} colors={bands} />
        </>
      ),
    },
  ];
}

/** Panggung pembuka (dipakai KitLayout sebagai `Stage`). */
export function PasundanStage({ palette: p }: { palette: ThemePalette }) {
  const sky = `linear-gradient(180deg, ${mix(p.bg, '#000000', 0.3)} 0%, ${mix(p.bg, '#2F5A55', 0.55)} 36%, ${mix('#E9C989', p.bg, 0.18)} 58%, ${p.bg} 86%)`;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: sky }} />
      {stageLayers(p).map((l, i) => (
        <ArtLayer key={i} depth={l.depth} hero order={l.order} exitX={l.exitX} origin={l.origin}>
          <ArtSvg>{l.svg}</ArtSvg>
        </ArtLayer>
      ))}
    </>
  );
}

/** Tepi halaman: awan Mega Mendung kecil mengintip dari kiri & kanan, bergeser saat digulir. */
export function MegaEdges({ palette: p }: { palette: ThemePalette }) {
  const bands = megaBands(mix(p.bg, '#000000', 0.05), 6, mix(p.surface, p.primary, 0.35));
  const edge = (side: 'left' | 'right', travel: number, seed: number) => (
    <Px aria-hidden source="page" y={[0, -travel]} style={{ position: 'fixed', top: 0, [side]: -70, width: 150, height: '100vh', overflow: 'visible', zIndex: 1, pointerEvents: 'none', opacity: 0.5 }}>
      <svg viewBox="0 0 150 1800" width={150} style={{ display: 'block', overflow: 'visible', transform: side === 'right' ? 'scaleX(-1)' : undefined }}>
        {[220, 760, 1300].map((y, i) => (
          <MegaMendung key={y} x={70} y={y + seed * 90} w={130 - i * 12} lobes={3} seed={seed * 10 + i} colors={bands} band={2.6} />
        ))}
      </svg>
    </Px>
  );
  return (
    <>
      {edge('left', 900, 1)}
      {edge('right', 700, 2)}
    </>
  );
}

/** Sampul: awan Mega Mendung menggantung dari sudut atas, tebing awan di bawah, sepasang kujang. */
export function PasundanCover({ palette: p }: { palette: ThemePalette }) {
  const cov = p.cover || p.bg;
  const bands = megaBands(cov, 8, '#DDEBDD', 0.8);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMin slice" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="psd-cgold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F3E2A6" />
            <stop offset="0.5" stopColor={p.primary} />
            <stop offset="1" stopColor={mix(p.primary, '#3A2E14', 0.45)} />
          </linearGradient>
        </defs>
        <MegaMendung x={20} y={52} w={180} lobes={3} seed={5} colors={bands} band={3} />
        <MegaMendung x={384} y={84} w={150} lobes={3} seed={9} colors={bands} band={3} flip />
      </svg>
      <style>{'@media (max-height: 760px) { .psd-crest { display: none } }'}</style>
      <svg className="psd-crest" viewBox="0 0 200 90" width={140} style={{ position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%)', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.35))' }}>
        <defs>
          <linearGradient id="psd-cgold2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F3E2A6" />
            <stop offset="0.5" stopColor={p.primary} />
            <stop offset="1" stopColor={mix(p.primary, '#3A2E14', 0.45)} />
          </linearGradient>
        </defs>
        <Kujang x={58} y={0} s={0.58} gold="url(#psd-cgold2)" hole={cov} />
        <Kujang x={142} y={0} s={0.58} flip gold="url(#psd-cgold2)" hole={cov} />
        <Coil x={100} y={46} r={12} colors={[mix(p.primary, '#3A2E14', 0.3), p.primary, '#F3E2A6', '#FFF4D6']} />
      </svg>
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" width="100%" height="22%" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <MegaMendung x={90} y={176} w={290} lobes={5} seed={23} colors={bands} band={3.2} />
        <MegaMendung x={330} y={192} w={250} lobes={4} seed={29} colors={bands} band={3.2} flip />
      </svg>
    </div>
  );
}
