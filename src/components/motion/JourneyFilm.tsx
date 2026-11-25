'use client';

/**
 * PERJALANAN (Storybook Journey) — film berparallax dengan tata bahasa kamera hasil reverse
 * engineering video cerita (docs: Reverse Engineering Video Story, 25 Nov 2026).
 *
 * Prinsip: kamera virtual bergerak di atas lukisan cat air berlapis; setiap gerakan tegas
 * (0,6–1,6 dtk) diikuti hold yang tetap "bernapas"; pergantian adegan memakai gerakan kamera
 * (crane, whip, portal), bukan cut. Layer: L4 latar (0,35x) · L2 subjek (1x) · L1 dedaunan
 * depan (1,8x) · L0 partikel (2,2x + gerak sendiri).
 *
 *  A 0.0–3.2   Langit pagi: judul "The Journey of", nama script (title-push, awan depan)
 *  B 3.2–4.1   crane-down menembus awan → desa (foliage wipe)
 *  C 4.1–7.7   Desa: foto berdua naik dari bawah (rise-reveal), nama lengkap, narasi
 *  D 7.7–8.5   whip-swap ke padang rumput (motion blur, roll kecil)
 *  E 8.5–11.7  Padang: potret mempelai beda kedalaman, orang tua (push-intimate)
 *  F 11.7–12.5 crane-sky ke langit malam (dedaunan menyapu)
 *  G 12.5–15.7 Malam: tanggal besar, rangkaian acara (bintang & kunang-kunang)
 *  H 15.7–16.6 portal-push: rumah terlihat di dalam bingkai lengkung, kamera menembus
 *  I 16.6–19.6 Rumah: sapaan tamu, nama, tautan undangan (breathe, fade)
 */

import React from 'react';
import { Chars, E, FilmProps, k, kf, L, MotionBlurDefs, mbFilter, seg, seeded, velocity, lerp } from './core';

export const JOURNEY_COMP_DUR = 19.6;
export const JOURNEY_SPEED = [
  { from: 3.25, to: 4.05, speed: 1.7 }, // crane-down
  { from: 7.75, to: 8.45, speed: 2.3 }, // whip-swap
  { from: 11.75, to: 12.45, speed: 1.8 }, // crane-sky
  { from: 15.8, to: 16.5, speed: 1.4 }, // portal
];

const IMG = {
  sky: '/assets/storybook/bg-sky-day.webp',
  village: '/assets/storybook/bg-village.webp',
  meadow: '/assets/storybook/bg-meadow.webp',
  night: '/assets/storybook/bg-night.webp',
  house: '/assets/storybook/bg-house.webp',
};
const C = {
  ink: '#3B2A1E',
  paper: '#FFFAF0',
  gold: '#C6A15B',
  brown: '#8A5A2B',
  cream: '#F6EEDC',
  night: '#F6EBD3',
};
const F = {
  display: "'Cinzel', Georgia, serif",
  body: "'EB Garamond', Georgia, serif",
  script: "'Italianno', cursive",
};

/** Lapisan latar cat air: gambar menutupi stage dengan margin agar kamera bisa bergerak. */
function Plate({ src, x, y, z, rot = 0, depth, W, H, pos = 'center', filter }: {
  src: string; x: number; y: number; z: number; rot?: number; depth: number; W: number; H: number; pos?: string; filter?: string;
}) {
  const s = 1 + (z - 1) * depth;
  return (
    <L style={{ inset: -H * 0.35, transform: `translate3d(${-x * depth}px, ${-y * depth}px, 0) scale(${s}) rotate(${rot}deg)`, transformOrigin: '50% 50%', filter }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos }} />
    </L>
  );
}

/** Dedaunan depan (L1): siluet daun cat air, dipakai sebagai wipe saat kamera bergerak. */
function Foliage({ W, H, x, y, side, tint, seed, scale = 1, opacity = 1, blur = 0 }: {
  W: number; H: number; x: number; y: number; side: 'top' | 'bottom' | 'left' | 'right'; tint: string; seed: number; scale?: number; opacity?: number; blur?: number;
}) {
  const leaves = Array.from({ length: 9 }, (_, i) => {
    const r = seeded(seed * 31 + i);
    const r2 = seeded(seed * 17 + i * 3);
    const along = (i / 8) * (side === 'top' || side === 'bottom' ? W + 120 : H + 120) - 60;
    const out = r * 60;
    const px = side === 'top' || side === 'bottom' ? along : side === 'left' ? out - 20 : W - out + 20;
    const py = side === 'left' || side === 'right' ? along : side === 'top' ? out - 30 : H - out + 30;
    const rot = (side === 'top' ? 180 : side === 'left' ? 90 : side === 'right' ? -90 : 0) + (r2 - 0.5) * 70;
    return { px, py, rot, s: (0.8 + r2 * 0.9) * scale, c: i % 3 };
  });
  const shades = [tint, '#4E6E45', '#6E8F5A'];
  return (
    <L style={{ inset: 0, transform: `translate3d(${x}px, ${y}px, 0)`, opacity, filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined, pointerEvents: 'none' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
        {leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.px} ${l.py}) rotate(${l.rot}) scale(${l.s})`}>
            <path d="M0 0 C 18 -22, 22 -58, 0 -92 C -22 -58, -18 -22, 0 0 Z" fill={shades[l.c]} opacity={0.92} />
            <path d="M0 -4 L0 -86" stroke="#2F4A2A" strokeWidth={1.2} opacity={0.45} />
          </g>
        ))}
      </svg>
    </L>
  );
}

/** Partikel (L0): kunang-kunang/kelopak/bintang dengan gerak sendiri + parallax kuat. */
function Particles({ W, H, t, camX, camY, n, color, size, seed, glow = false, drift = 12 }: {
  W: number; H: number; t: number; camX: number; camY: number; n: number; color: string; size: number; seed: number; glow?: boolean; drift?: number;
}) {
  return (
    <L style={{ inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const r = seeded(seed + i * 7.3);
        const r2 = seeded(seed + i * 3.1);
        const depth = 1.6 + r2 * 0.9;
        const bx = r * (W + 200) - 100 - camX * depth + Math.sin(t * 0.9 + i) * drift;
        const by = r2 * (H + 200) - 100 - camY * depth + Math.cos(t * 0.7 + i * 1.7) * drift - t * 6 * r;
        const x = ((bx % (W + 200)) + W + 200) % (W + 200) - 100;
        const y = ((by % (H + 200)) + H + 200) % (H + 200) - 100;
        const tw = glow ? 0.55 + 0.45 * Math.sin(t * 3 + i * 2.1) : 1;
        const s = size * (0.6 + r * 0.8);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: color,
              opacity: tw * 0.9,
              boxShadow: glow ? `0 0 ${s * 3}px ${s}px ${color}` : undefined,
            }}
          />
        );
      })}
    </L>
  );
}

function Frame({ children, w, h, arch = false, style }: { children: React.ReactNode; w: number; h: number; arch?: boolean; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: w,
        height: h,
        padding: 7,
        background: C.paper,
        borderRadius: arch ? `${w / 2}px ${w / 2}px 10px 10px` : 10,
        boxShadow: '0 18px 36px -18px rgba(59,42,30,0.55), 0 0 0 1px rgba(198,161,91,0.55)',
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: arch ? `${w / 2 - 7}px ${w / 2 - 7}px 6px 6px` : 6 }}>{children}</div>
    </div>
  );
}

function Img({ src, pos = 'center', scale = 1 }: { src: string; pos?: string; scale?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${scale})` }} />
  );
}

export default function JourneyFilm({ t, speed, W, H, d }: FilmProps) {
  const cx = W / 2;

  // ------------------------------------------------------------ A + B: langit → desa (satu dunia vertikal)
  const showAB = t < 4.3;
  const craneAB = (tt: number) => kf(tt, [[0, 0], [3.2, -8, E.inOutCubic], [4.1, H * 1.15, E.outCubic]]);
  const zA = k(t, 0, 3.2, 1, 1.08, E.inOutCubic);
  const vCraneAB = velocity(craneAB, t, speed);

  // ------------------------------------------------------------ C + D + E: desa → padang (dunia horizontal)
  const showCDE = t > 3.2 && t < 12.6;
  const panCE = (tt: number) => kf(tt, [[0, 0], [7.7, 6, E.inOutCubic], [8.5, W * 1.25, E.inOutCubic], [11.7, W * 1.25 + 10]]);
  const camYC = kf(t, [[3.2, -H * 1.15], [4.1, 0, E.outCubic], [7.7, -6, E.inOutCubic], [11.6, 0], [12.5, -H * 1.1, E.inOutCubic]]);
  const zC = kf(t, [[4.1, 1.06], [7.7, 1.0, E.outCubic], [8.5, 1.0, E.inOutCubic], [11.7, 1.05, E.inOutCubic]]);
  const rollD = kf(t, [[7.7, 0], [8.1, -2.5, E.inOutCubic], [8.5, 0, E.outCubic]]);
  const vPan = velocity(panCE, t, speed);
  const vCamYC = velocity((tt) => kf(tt, [[11.6, 0], [12.5, -H * 1.1, E.inOutCubic]]), t, speed);

  // ------------------------------------------------------------ F + G: malam
  const showFG = t > 11.7 && t < 16.7;
  const camYG = kf(t, [[11.7, H * 1.1], [12.5, 0, E.outCubic], [15.7, -10, E.inOutCubic]]);
  const zG = kf(t, [[12.5, 1.04], [15.7, 1.0, E.outCubic], [16.6, 1.0]]);

  // ------------------------------------------------------------ H + I: portal ke rumah
  const portal = seg(t, 15.7, 16.6);
  const portalE = E.inCubic(portal);
  const showHI = t > 15.6;
  const zI = kf(t, [[16.6, 1.1], [19.6, 1.0, E.outCubic]]);
  const camYI = kf(t, [[16.6, 12], [19.6, -4, E.inOutCubic]]);

  const textCol = { color: C.ink, textAlign: 'center' as const };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.cream }}>
      <MotionBlurDefs id="jr-mb-crane" x={0} y={Math.abs(vCraneAB) / 140} />
      <MotionBlurDefs id="jr-mb-pan" x={Math.abs(vPan) / 150} y={0} />
      <MotionBlurDefs id="jr-mb-sky" x={0} y={Math.abs(vCamYC) / 140} />

      {/* ============ A + B ============ */}
      {showAB && (
        <L style={{ inset: 0, filter: mbFilter('jr-mb-crane', 0, Math.abs(vCraneAB) / 140) }}>
          {/* langit naik keluar frame, desa naik dari bawah dan menyatu (motion blur menutup sambungan) */}
          <L style={{ inset: 0, transform: `translate3d(0, ${-craneAB(t) * 0.45}px, 0)` }}>
            <Plate src={IMG.sky} x={0} y={0} z={zA} depth={1} W={W} H={H} pos="center 30%" />
          </L>
          <L style={{ inset: 0, opacity: k(t, 3.3, 3.85, 0, 1), transform: `translate3d(0, ${(H * 1.15 - craneAB(t)) * 0.6}px, 0)` }}>
            <Plate src={IMG.village} x={0} y={0} z={1.06} depth={1} W={W} H={H} pos="center 62%" />
          </L>
          {/* Judul */}
          <L style={{ left: 0, right: 0, top: H * 0.26 - craneAB(t) * 1.0, ...textCol }}>
            <div style={{ fontFamily: F.display, fontSize: 13, fontWeight: 600, letterSpacing: '0.32em', color: C.brown, opacity: k(t, 0.3, 1.0, 0, 1) }}>
              <Chars text="THE JOURNEY OF" t={t} start={0.3} stagger={0.03} from={{ y: 8, opacity: 0, blur: 4 }} />
            </div>
            <div style={{ fontFamily: F.script, fontSize: 92, lineHeight: 1, color: C.ink, marginTop: 10, transform: `scale(${k(t, 0.6, 3.2, 1.04, 1, E.outCubic)})` }}>
              <Chars text={d.groom} t={t} start={0.7} stagger={0.05} dur={0.8} from={{ y: 14, opacity: 0, blur: 8 }} />
            </div>
            <div style={{ fontFamily: F.display, fontSize: 22, color: C.brown, opacity: k(t, 1.2, 1.7, 0, 1) }}>&amp;</div>
            <div style={{ fontFamily: F.script, fontSize: 92, lineHeight: 1, color: C.ink }}>
              <Chars text={d.bride} t={t} start={1.25} stagger={0.05} dur={0.8} from={{ y: 14, opacity: 0, blur: 8 }} />
            </div>
          </L>
          {/* awan depan: kelopak/partikel cahaya */}
          <Particles W={W} H={H} t={t} camX={0} camY={craneAB(t) * 0.6} n={14} color="rgba(255,250,235,0.9)" size={5} seed={3} glow />
          {/* foliage wipe saat crane-down */}
          <Foliage W={W} H={H} x={0} y={H * 1.25 - craneAB(t) * 2.1} side="bottom" tint="#5E7F4E" seed={2} scale={1.5} blur={2} />
        </L>
      )}

      {/* ============ C + D + E ============ */}
      {showCDE && (
        <L style={{ inset: 0, transform: `rotate(${rollD}deg)`, filter: mbFilter('jr-mb-pan', Math.abs(vPan) / 150, 0) || mbFilter('jr-mb-sky', 0, Math.abs(vCamYC) / 140) }}>
          {/* latar (L4, 0,35x): desa → padang; sambungan ditutup motion blur whip */}
          <L style={{ inset: 0, transform: `translate3d(${-panCE(t) * 0.35}px, ${-camYC * 0.35}px, 0)` }}>
            <Plate src={IMG.village} x={0} y={0} z={zC} depth={1} W={W} H={H} pos="center 62%" />
          </L>
          <L style={{ inset: 0, opacity: k(t, 7.85, 8.25, 0, 1, E.inOutCubic), transform: `translate3d(${(W * 1.25 - panCE(t)) * 0.35}px, ${-camYC * 0.35}px, 0)` }}>
            <Plate src={IMG.meadow} x={0} y={0} z={zC} depth={1} W={W} H={H} pos="center 55%" />
          </L>

          {/* C: foto berdua naik (rise-reveal) */}
          <L style={{ left: 0, top: 0, width: W, height: H, transform: `translate3d(${-panCE(t)}px, ${-camYC}px, 0) scale(${zC})`, transformOrigin: '50% 50%' }}>
            <L style={{ left: cx - 118, top: lerp(H + 40, H * 0.17, E.outCubic(seg(t, 4.1, 5.1))), transform: `rotate(${k(t, 4.1, 5.4, -6, -2.5, E.outCubic)}deg)` }}>
              <Frame w={236} h={300}>
                <Img src={d.photos.couple} pos="center 30%" scale={k(t, 4.1, 7.7, 1.18, 1.04, E.outCubic)} />
              </Frame>
            </L>
            <L style={{ left: 22, right: 22, top: H * 0.17 + 316, ...textCol }}>
              <div
                style={{
                  padding: '12px 14px 14px',
                  borderRadius: 14,
                  background: 'rgba(255,250,240,0.9)',
                  border: '1px solid rgba(198,161,91,0.55)',
                  boxShadow: '0 14px 30px -18px rgba(59,42,30,0.6)',
                  opacity: k(t, 4.9, 5.4, 0, 1),
                  transform: `translateY(${k(t, 4.9, 5.6, 16, 0)}px)`,
                }}
              >
                <div style={{ fontFamily: F.display, fontSize: 10.5, letterSpacing: '0.28em', color: C.brown, textTransform: 'uppercase' }}>{d.copy?.tagline || 'Dua cerita, satu tujuan'}</div>
                <div style={{ fontFamily: F.body, fontSize: 19, color: C.ink, marginTop: 6, lineHeight: 1.25 }}>
                  <Chars text={d.groomFull} t={t} start={5.3} stagger={0.018} from={{ y: 6, opacity: 0, blur: 5 }} />
                  <div style={{ fontFamily: F.script, fontSize: 30, lineHeight: 1, color: C.brown, opacity: k(t, 5.8, 6.2, 0, 1) }}>dan</div>
                  <Chars text={d.brideFull} t={t} start={6.0} stagger={0.018} from={{ y: 6, opacity: 0, blur: 5 }} />
                </div>
              </div>
            </L>

            {/* E: padang — potret mempelai pada kedalaman berbeda */}
            <L style={{ left: W * 1.25, top: 0, width: W, height: H }}>
              <L style={{ left: 0, right: 0, top: H * 0.07, ...textCol }}>
                <div style={{ fontFamily: F.script, fontSize: 52, color: C.ink, lineHeight: 1, textShadow: '0 0 14px rgba(255,250,240,0.95)' }}>
                  <Chars text="Para Tokoh" t={t} start={8.6} stagger={0.04} from={{ y: 10, opacity: 0, blur: 6 }} />
                </div>
              </L>
              <L style={{ left: cx - 144 + k(t, 8.4, 9.4, -40, 0, E.outCubic) * 1.15, top: H * 0.2, opacity: k(t, 8.4, 9.0, 0, 1) }}>
                <Frame w={132} h={176} arch>
                  <Img src={d.photos.groom} pos="center 25%" scale={k(t, 8.4, 11.7, 1.14, 1.02)} />
                </Frame>
              </L>
              <L style={{ left: cx + 12 + k(t, 8.6, 9.6, 40, 0, E.outCubic), top: H * 0.25, opacity: k(t, 8.6, 9.2, 0, 1) }}>
                <Frame w={132} h={176} arch>
                  <Img src={d.photos.bride} pos="center 25%" scale={k(t, 8.6, 11.7, 1.14, 1.02)} />
                </Frame>
              </L>
              <L style={{ left: 12, width: W / 2 - 18, top: H * 0.2 + 196, ...textCol, opacity: k(t, 9.2, 9.8, 0, 1) }}>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.ink, textShadow: '0 0 10px rgba(255,250,240,0.9)' }}>{d.groom}</div>
                <div style={{ fontFamily: F.body, fontSize: 11.5, color: C.ink, marginTop: 4, lineHeight: 1.35, padding: '6px 8px', borderRadius: 10, background: 'rgba(255,250,240,0.85)' }}>Putra dari {d.groomParents}</div>
              </L>
              <L style={{ left: W / 2 + 6, width: W / 2 - 18, top: H * 0.25 + 196, ...textCol, opacity: k(t, 9.5, 10.1, 0, 1) }}>
                <div style={{ fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.ink, textShadow: '0 0 10px rgba(255,250,240,0.9)' }}>{d.bride}</div>
                <div style={{ fontFamily: F.body, fontSize: 11.5, color: C.ink, marginTop: 4, lineHeight: 1.35, padding: '6px 8px', borderRadius: 10, background: 'rgba(255,250,240,0.85)' }}>Putri dari {d.brideParents}</div>
              </L>
            </L>
          </L>

          {/* L1 dedaunan depan: parallax kuat saat whip, menyapu saat crane-sky */}
          <Foliage W={W} H={H} x={-panCE(t) * 1.8 + W * 1.12} y={-camYC * 1.8 + 30} side="bottom" tint="#557A48" seed={5} scale={1.25} opacity={0.95} blur={1.5} />
          <Foliage W={W} H={H} x={-panCE(t) * 2.2 + W * 1.6} y={-camYC * 2.0} side="right" tint="#4F7344" seed={9} scale={1.4} blur={2.5} />
          <Particles W={W} H={H} t={t} camX={panCE(t)} camY={camYC} n={12} color="rgba(255,236,180,0.95)" size={4} seed={11} glow />
        </L>
      )}

      {/* ============ F + G: malam ============ */}
      {showFG && (
        <L style={{ inset: 0 }}>
          <L style={{ inset: 0, transform: `translate3d(0, ${-camYG * 0.35}px, 0)` }}>
            <Plate src={IMG.night} x={0} y={0} z={zG} depth={1} W={W} H={H} pos="center 40%" />
          </L>
          <Particles W={W} H={H} t={t} camX={0} camY={camYG * 0.9} n={26} color="rgba(255,255,255,0.95)" size={2.4} seed={21} glow drift={4} />
          <L style={{ left: 0, right: 0, top: H * 0.15 - camYG, ...textCol, color: C.night }}>
            <div style={{ fontFamily: F.display, fontSize: 11, letterSpacing: '0.32em', opacity: k(t, 12.6, 13.2, 0, 1) }}>HARI YANG DINANTI</div>
            <div style={{ fontFamily: F.display, fontSize: Math.min(48, W / 7.2), lineHeight: 1.1, marginTop: 10, whiteSpace: 'nowrap', color: '#FFF4D6', textShadow: '0 0 24px rgba(255,220,150,0.35)' }}>
              <Chars text={`${d.day} . ${d.monthNum} . ${d.year}`} t={t} start={12.75} stagger={0.045} dur={0.7} from={{ y: 18, opacity: 0, blur: 10 }} />
            </div>
            <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 17, marginTop: 6, opacity: k(t, 13.5, 14.0, 0, 1) }}>{d.dateLong}</div>
            <div style={{ margin: '22px auto 0', width: Math.min(300, W - 40), display: 'grid', gap: 12 }}>
              {d.events.slice(0, 2).map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(255,250,240,0.12)',
                    border: '1px solid rgba(246,235,211,0.35)',
                    opacity: k(t, 13.8 + i * 0.35, 14.4 + i * 0.35, 0, 1),
                    transform: `translateY(${k(t, 13.8 + i * 0.35, 14.6 + i * 0.35, 14, 0)}px)`,
                  }}
                >
                  <div style={{ fontFamily: F.display, fontSize: 14, letterSpacing: '0.08em' }}>{e.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: 13, marginTop: 2 }}>{e.time}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, opacity: 0.85 }}>{e.venue}</div>
                </div>
              ))}
            </div>
          </L>
          {/* dedaunan padang tersapu ke bawah saat crane-sky tiba */}
          <Foliage W={W} H={H} x={0} y={(1 - E.outCubic(seg(t, 11.7, 12.6))) * -H * 0.2 + E.outCubic(seg(t, 11.7, 12.6)) * H * 0.9} side="top" tint="#3E5B3A" seed={13} scale={1.6} blur={3} opacity={1 - seg(t, 12.3, 12.7)} />
        </L>
      )}

      {/* ============ H + I: portal → rumah ============ */}
      {showHI && (() => {
        // bingkai lengkung membesar sampai melewati tepi frame (portal-push)
        const archW = lerp(150, W * 3.2, portalE);
        const archH = archW * 1.45;
        const inside = (
          <L style={{ inset: 0, transform: `translate3d(0, ${-camYI * 0.35}px, 0)` }}>
            <Plate src={IMG.house} x={0} y={0} z={zI} depth={1} W={W} H={H} pos="center 55%" />
          </L>
        );
        return (
          <L style={{ inset: 0 }}>
            {portal < 1 ? (
              <L
                style={{
                  left: cx - archW / 2,
                  top: H * 0.5 - archH / 2,
                  width: archW,
                  height: archH,
                  borderRadius: `${archW / 2}px ${archW / 2}px 12px 12px`,
                  overflow: 'hidden',
                  boxShadow: `0 0 0 ${lerp(6, 40, portalE)}px rgba(255,250,240,${(1 - portalE) * 0.95})`,
                  opacity: k(t, 15.6, 15.9, 0, 1),
                }}
              >
                <L style={{ left: archW / 2 - W / 2, top: archH / 2 - H / 2, width: W, height: H }}>{inside}</L>
              </L>
            ) : (
              inside
            )}
            {t > 16.5 && (
              <L style={{ left: 0, right: 0, top: H * 0.1 - camYI, ...textCol }}>
                <div style={{ display: 'inline-block', padding: '16px 18px', borderRadius: 14, background: 'rgba(255,250,240,0.9)', border: '1px solid rgba(198,161,91,0.6)', maxWidth: W - 40, opacity: k(t, 16.6, 17.1, 0, 1), transform: `translateY(${k(t, 16.6, 17.3, 12, 0)}px)` }}>
                  <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: '0.28em', color: C.brown }}>KEPADA YTH.</div>
                  <div style={{ fontFamily: F.body, fontSize: 21, color: C.ink, marginTop: 4 }}>
                    <Chars text={d.guest} t={t} start={16.9} stagger={0.02} from={{ y: 6, opacity: 0, blur: 4 }} />
                  </div>
                  <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 14, color: C.ink, marginTop: 8, opacity: k(t, 17.4, 17.9, 0, 1) }}>
                    {d.copy?.closing || 'Sampai jumpa di hari bahagia kami'}
                  </div>
                  <div style={{ fontFamily: F.script, fontSize: 40, color: C.ink, lineHeight: 1.1, marginTop: 2, opacity: k(t, 17.7, 18.3, 0, 1) }}>
                    {d.groom} &amp; {d.bride}
                  </div>
                  <div style={{ fontFamily: F.display, fontSize: 10, letterSpacing: '0.12em', color: C.brown, marginTop: 6, opacity: k(t, 18.1, 18.6, 0, 1) }}>{d.slug}</div>
                </div>
              </L>
            )}
            <Particles W={W} H={H} t={t} camX={0} camY={camYI} n={10} color="rgba(255,226,170,0.95)" size={4} seed={31} glow />
          </L>
        );
      })()}

      {/* cahaya hangat di tepi (vignette lembut khas cat air) */}
      <L style={{ inset: 0, pointerEvents: 'none', background: 'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(59,42,30,0.22) 100%)' }} />
    </div>
  );
}
