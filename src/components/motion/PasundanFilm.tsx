'use client';

/**
 * PASUNDAN — film adat Sunda untuk tema undangan Pasundan (sunda-kujang), digambar ulang dari
 * nol (SVG prosedural) dengan tata bahasa kamera hasil reverse engineering video cerita:
 * gerakan tegas pendek, hold yang bernapas, transisi lewat kamera/awan (tanpa cut),
 * parallax gunung berlapis 5 kedalaman.
 *
 * Palet & tipografi mengikuti tema Pasundan: hijau leuweung #14281E, emas #C9A85C,
 * krem #F1EAD6; Gilda Display + Lora + Cinzel.
 *
 *  A 0.0–3.0   Fajar: punggung gunung berlapis, awan Mega Mendung, "Uleman Pernikahan" + nama
 *  B 3.0–3.8   crane-down menembus pita awan (cloud wipe) ke sawah terasering
 *  C 3.8–7.4   Sawah: foto berdua dalam bingkai oval emas naik, "Dua Insan, Satu Asih"
 *  D 7.4–8.2   whip ke kiri + roll kecil, motion blur
 *  E 8.2–11.4  "Pangantén": dua potret oval di kedalaman berbeda, sepasang kujang tergambar
 *  F 11.4–12.2 tilt ke langit malam (bulan & bintang)
 *  G 12.2–15.4 "Waktos & Tempat": tanggal + kartu acara
 *  H 15.4–16.2 awan Mega Mendung menutup dari kiri-kanan (portal awan)
 *  I 16.2–19.4 awan tersibak: "Hatur nuhun", sapaan tamu, nama, tautan
 */

import React from 'react';
import { Chars, E, FilmProps, k, kf, L, MotionBlurDefs, mbFilter, seg, seeded, velocity, lerp, Trim } from './core';

export const PASUNDAN_COMP_DUR = 19.4;
export const PASUNDAN_SPEED = [
  { from: 3.05, to: 3.75, speed: 1.6 }, // crane-down
  { from: 7.45, to: 8.15, speed: 2.2 }, // whip
  { from: 11.45, to: 12.15, speed: 1.6 }, // tilt ke langit
  { from: 15.45, to: 16.15, speed: 1.3 }, // awan menutup
];

const C = {
  forest: '#14281E',
  forest2: '#1C3427',
  deep: '#0E1D15',
  gold: '#C9A85C',
  gold2: '#A68D55',
  cream: '#F1EAD6',
  ink: '#F6EBCB',
  dawn1: '#F3C98B',
  dawn2: '#E9A77A',
  dawn3: '#8FA79A',
  night: '#0F2230',
};
const F = {
  display: "'Gilda Display', Georgia, serif",
  body: "'Lora', Georgia, serif",
  label: "'Cinzel', Georgia, serif",
};

/** Punggung gunung prosedural (deterministik per seed). */
function ridgePath(W: number, baseY: number, amp: number, seed: number, freq = 3, H = 900) {
  const n = 28;
  let d = `M ${-W} ${H}`;
  for (let i = 0; i <= n; i++) {
    const x = -W + (i / n) * W * 3;
    const r = seeded(seed * 13 + i);
    const y = baseY - amp * (0.55 + 0.45 * Math.sin((i / n) * Math.PI * freq + seed)) - r * amp * 0.25;
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L ${2 * W} ${H} Z`;
}

/** Awan Mega Mendung: lobus berlapis dari gelap (tepi) ke terang (tengah) + kait spiral. */
function MegaCloud({ x, y, s = 1, flip = false, palette = ['#2E5A6B', '#3F7484', '#5C93A0', '#86B5BC', '#C4DEDC'] }: {
  x: number; y: number; s?: number; flip?: boolean; palette?: string[];
}) {
  const lobe = 'M -70 10 C -72 -12, -52 -26, -34 -20 C -30 -42, 4 -50, 18 -30 C 34 -44, 66 -34, 64 -10 C 80 -6, 82 12, 66 16 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {palette.map((c, i) => (
        <path key={i} d={lobe} transform={`scale(${1 - i * 0.17}) translate(0 ${i * 3})`} fill={c} stroke="rgba(14,29,21,0.35)" strokeWidth={0.8} />
      ))}
      <path d="M 64 -10 C 92 -14, 100 12, 82 18 C 70 22, 66 8, 76 6" fill="none" stroke={palette[0]} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

/** Sepasang kujang emas (siluet sederhana, digambar dengan trim paths). */
const KUJANG_D =
  'M 0 120 L 0 70 C -4 52, -18 40, -14 18 C -10 2, 4 -18, 2 -46 C 14 -28, 18 -6, 12 10 C 22 6, 26 18, 18 26 C 12 32, 10 44, 8 70 L 8 120';

function TerraceLines({ W, H, y0, t, color }: { W: number; H: number; y0: number; t: number; color: string }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
      {Array.from({ length: 9 }, (_, i) => {
        const y = y0 + i * 34 + i * i * 2.2;
        const a = 10 + i * 3;
        const d = `M ${-W * 0.6} ${y} C ${W * 0.1} ${y - a}, ${W * 0.4} ${y + a}, ${W * 0.8} ${y - a * 0.6} S ${W * 1.4} ${y + a}, ${W * 1.7} ${y}`;
        return (
          <g key={i}>
            <path d={`${d} L ${W * 1.7} ${H + 400} L ${-W * 0.6} ${H + 400} Z`} fill={i % 2 ? '#2F5A3A' : '#3B6A43'} opacity={0.96} />
            <path d={d} fill="none" stroke={color} strokeWidth={1.3} opacity={0.75 * clampOp(t, 3.6 + i * 0.05)} />
          </g>
        );
      })}
    </svg>
  );
}
const clampOp = (t: number, a: number) => Math.max(0, Math.min(1, (t - a) / 0.6));

function Oval({ children, w, h, style }: { children: React.ReactNode; w: number; h: number; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'absolute', width: w, height: h, borderRadius: '50%', padding: 5, background: `linear-gradient(160deg, ${C.gold}, ${C.gold2})`, boxShadow: '0 20px 40px -18px rgba(0,0,0,0.6)', ...style }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.forest}` }}>{children}</div>
    </div>
  );
}

function Img({ src, pos = 'center', scale = 1 }: { src: string; pos?: string; scale?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${scale})` }} />
  );
}

function Stars({ W, H, t, n, camY, seed }: { W: number; H: number; t: number; n: number; camY: number; seed: number }) {
  return (
    <L style={{ inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const r = seeded(seed + i * 2.7);
        const r2 = seeded(seed + i * 5.9);
        const depth = 0.3 + r2 * 0.9;
        const y = ((r2 * H * 0.75 - camY * depth) % (H + 40) + H + 40) % (H + 40) - 20;
        const s = 1 + r * 2.2;
        return (
          <div key={i} style={{ position: 'absolute', left: r * W, top: y, width: s, height: s, borderRadius: '50%', background: '#FFF6DC', opacity: 0.45 + 0.55 * Math.abs(Math.sin(t * 2 + i)), boxShadow: `0 0 ${s * 3}px rgba(255,240,200,0.8)` }} />
        );
      })}
    </L>
  );
}

export default function PasundanFilm({ t, speed, W, H, d }: FilmProps) {
  const cx = W / 2;
  const center = { color: C.ink, textAlign: 'center' as const };

  // ---------------------------------------------------------------- A + B
  const showAB = t < 4.0;
  const craneAB = (tt: number) => kf(tt, [[0, 0], [3.0, -10, E.inOutCubic], [3.8, H * 1.2, E.outCubic]]);
  const zA = k(t, 0, 3.0, 1.0, 1.07, E.inOutCubic);
  const vAB = velocity(craneAB, t, speed);
  const sunY = k(t, 0, 3.0, H * 0.62, H * 0.5, E.outCubic);

  // ---------------------------------------------------------------- C + D + E (dunia horizontal: sawah → pangantén)
  const showCE = t > 3.0 && t < 12.3;
  const pan = (tt: number) => kf(tt, [[0, 0], [7.4, -6, E.inOutCubic], [8.2, -W * 1.25, E.inOutCubic], [11.4, -W * 1.25 - 8]]);
  const camY = kf(t, [[3.0, -H * 1.2], [3.8, 0, E.outCubic], [7.4, 6, E.inOutCubic], [11.3, 0], [12.2, -H * 1.1, E.inOutCubic]]);
  const zC = kf(t, [[3.8, 1.06], [7.4, 1.0, E.outCubic], [8.2, 1.0], [11.4, 1.05, E.inOutCubic]]);
  const roll = kf(t, [[7.4, 0], [7.8, 2.5, E.inOutCubic], [8.2, 0, E.outCubic]]);
  const vPan = velocity(pan, t, speed);
  const vTilt = velocity((tt) => kf(tt, [[11.3, 0], [12.2, -H * 1.1, E.inOutCubic]]), t, speed);

  // ---------------------------------------------------------------- F + G
  const showFG = t > 11.4 && t < 16.4;
  // dunia malam berada DI ATAS sawah: saat kamera tilt naik, malam turun masuk dari atas
  const camYG = kf(t, [[11.4, -H * 1.1], [12.2, 0, E.outCubic], [15.4, 8, E.inOutCubic]]);

  // ---------------------------------------------------------------- H + I (awan menutup lalu tersibak)
  const close = E.inOutCubic(seg(t, 15.4, 16.2));
  const open = E.outCubic(seg(t, 16.4, 17.4));
  const curtain = close * (1 - open);
  const showI = t > 16.1;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.forest }}>
      <MotionBlurDefs id="ps-mb-ab" x={0} y={Math.abs(vAB) / 140} />
      <MotionBlurDefs id="ps-mb-pan" x={Math.abs(vPan) / 150} y={0} />
      <MotionBlurDefs id="ps-mb-tilt" x={0} y={Math.abs(vTilt) / 140} />

      {/* ================= A + B: fajar & gunung berlapis ================= */}
      {showAB && (
        <L style={{ inset: 0, filter: mbFilter('ps-mb-ab', 0, Math.abs(vAB) / 140) }}>
          <L style={{ inset: 0, background: `linear-gradient(180deg, ${C.dawn3} 0%, ${C.dawn1} 46%, ${C.dawn2} 70%, ${C.forest2} 100%)`, transform: `translateY(${-craneAB(t) * 0.25}px)` }} />
          <L style={{ left: cx - 70, top: sunY - craneAB(t) * 0.3, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, #FFF2CF 0%, rgba(255,226,170,0.6) 45%, transparent 70%)' }} />
          {[0, 1, 2, 3, 4].map((i) => {
            const depth = [0.3, 0.45, 0.6, 0.8, 1.0][i];
            const cols = ['#9DB3A6', '#7E9A8A', '#5C7E68', '#3E6249', '#24412F'];
            return (
              <svg
                key={i}
                width={W}
                height={H}
                viewBox={`0 0 ${W} ${H}`}
                style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translate3d(0, ${-craneAB(t) * depth}px, 0) scale(${1 + (zA - 1) * depth})`, transformOrigin: '50% 70%' }}
                aria-hidden
              >
                <path d={ridgePath(W, H * (0.6 + i * 0.075), 60 - i * 6, i + 1, 2 + i * 0.6, H * 3)} fill={cols[i]} />
              </svg>
            );
          })}
          {/* awan Mega Mendung melayang di kaki gunung */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translate3d(${Math.sin(t * 0.5) * 6}px, ${-craneAB(t) * 0.7}px, 0)` }} aria-hidden>
            <MegaCloud x={W * 0.18 + t * 4} y={H * 0.66} s={0.9} />
            <MegaCloud x={W * 0.86 - t * 3} y={H * 0.7} s={0.75} flip />
          </svg>
          <L style={{ left: 0, right: 0, top: H * 0.15 - craneAB(t) * 1.0, ...center, color: C.forest }}>
            <div style={{ fontFamily: F.label, fontSize: 12, fontWeight: 600, letterSpacing: '0.34em', opacity: k(t, 0.3, 0.9, 0, 1) }}>
              <Chars text="ULEMAN PERNIKAHAN" t={t} start={0.3} stagger={0.03} from={{ y: 8, opacity: 0, blur: 4 }} />
            </div>
            <div style={{ fontFamily: F.display, fontSize: 58, lineHeight: 1.05, marginTop: 12 }}>
              <Chars text={d.groom} t={t} start={0.65} stagger={0.05} dur={0.8} from={{ y: 16, opacity: 0, blur: 8 }} />
            </div>
            <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 22, color: '#7A5A2A', opacity: k(t, 1.1, 1.6, 0, 1) }}>&amp;</div>
            <div style={{ fontFamily: F.display, fontSize: 58, lineHeight: 1.05 }}>
              <Chars text={d.bride} t={t} start={1.15} stagger={0.05} dur={0.8} from={{ y: 16, opacity: 0, blur: 8 }} />
            </div>
          </L>
          {/* pita awan depan menyapu saat crane-down (cloud wipe) */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translate3d(0, ${H * 1.3 - craneAB(t) * 2.0}px, 0)` }} aria-hidden>
            {[-0.1, 0.35, 0.8].map((fx, i) => (
              <MegaCloud key={i} x={W * fx + 40} y={60 + i * 40} s={2.2} flip={i % 2 === 1} />
            ))}
          </svg>
        </L>
      )}

      {/* ================= C + D + E ================= */}
      {showCE && (
        <L style={{ inset: 0, transform: `rotate(${roll}deg)`, filter: mbFilter('ps-mb-pan', Math.abs(vPan) / 150, 0) || mbFilter('ps-mb-tilt', 0, Math.abs(vTilt) / 140) }}>
          {/* langit & gunung jauh (0,3x) */}
          <L style={{ left: -60, top: -60, bottom: -60, right: -W * 0.6, background: `linear-gradient(180deg, ${C.dawn1} 0%, #C9C29A 40%, ${C.forest2} 75%)`, transform: `translate3d(${pan(t) * 0.15}px, ${-camY * 0.2}px, 0)` }} />
          <L style={{ left: W * 0.62 + pan(t) * 0.15, top: H * 0.2 - camY * 0.2, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,242,207,0.95) 0%, rgba(255,226,170,0.45) 45%, transparent 70%)' }} />
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translate3d(${pan(t) * 0.3}px, ${-camY * 0.3}px, 0)` }} aria-hidden>
            <path d={ridgePath(W, H * 0.42, 50, 7, 2.4, H * 2)} fill="#5C7E68" />
          </svg>
          {/* sawah terasering (0,6x) */}
          <L style={{ inset: 0, transform: `translate3d(${pan(t) * 0.6}px, ${-camY * 0.6}px, 0) scale(${zC})`, transformOrigin: '50% 60%' }}>
            <TerraceLines W={W} H={H} y0={H * 0.5} t={t} color={C.gold} />
          </L>

          {/* subjek (1x) */}
          <L style={{ left: 0, top: 0, width: W, height: H, transform: `translate3d(${pan(t)}px, ${-camY}px, 0) scale(${zC})`, transformOrigin: '50% 50%' }}>
            {/* C: foto berdua dalam oval emas, naik dari bawah */}
            <Oval w={220} h={286} style={{ left: cx - 110, top: lerp(H + 30, H * 0.12, E.outCubic(seg(t, 3.8, 4.8))) }}>
              <Img src={d.photos.couple} pos="center 30%" scale={k(t, 3.8, 7.4, 1.18, 1.04)} />
            </Oval>
            <L style={{ left: 22, right: 22, top: H * 0.12 + 300, ...center }}>
              <div style={{ padding: '12px 14px 14px', borderRadius: 10, background: 'rgba(20,40,30,0.86)', border: `1px solid ${C.gold}`, opacity: k(t, 4.6, 5.1, 0, 1), transform: `translateY(${k(t, 4.6, 5.3, 14, 0)}px)` }}>
                <div style={{ fontFamily: F.label, fontSize: 10.5, letterSpacing: '0.3em', color: C.gold, textTransform: 'uppercase' }}>{d.copy?.tagline || 'Dua insan, satu asih'}</div>
                <div style={{ fontFamily: F.display, fontSize: 19, marginTop: 6, lineHeight: 1.3 }}>
                  <Chars text={d.groomFull} t={t} start={5.0} stagger={0.018} from={{ y: 6, opacity: 0, blur: 5 }} />
                  <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 15, color: C.gold, opacity: k(t, 5.5, 5.9, 0, 1) }}>sareng</div>
                  <Chars text={d.brideFull} t={t} start={5.7} stagger={0.018} from={{ y: 6, opacity: 0, blur: 5 }} />
                </div>
              </div>
            </L>

            {/* E: Pangantén */}
            <L style={{ left: W * 1.25, top: 0, width: W, height: H }}>
              <L style={{ left: 0, right: 0, top: H * 0.06, ...center }}>
                <div style={{ fontFamily: F.label, fontSize: 11, letterSpacing: '0.34em', color: C.gold, opacity: k(t, 8.3, 8.8, 0, 1) }}>PANGANTÉN</div>
              </L>
              {/* sepasang kujang tergambar di tengah */}
              {[0, 1].map((i) => (
                <Trim
                  key={i}
                  d={KUJANG_D}
                  len={420}
                  end={k(t, 8.6 + i * 0.15, 9.8 + i * 0.15, 0, 1, E.inOutCubic)}
                  stroke={C.gold}
                  width={2}
                  viewBox="-30 -60 60 190"
                  style={{ left: cx - 30 + (i ? 10 : -10), top: H * 0.2, width: 60, height: 190, transform: `scaleX(${i ? -1 : 1}) rotate(${i ? -8 : 8}deg)`, opacity: 0.9 }}
                />
              ))}
              <Oval w={124} h={164} style={{ left: cx - 150 + k(t, 8.2, 9.2, -40, 0, E.outCubic) * 1.2, top: H * 0.13, opacity: k(t, 8.2, 8.8, 0, 1) }}>
                <Img src={d.photos.groom} pos="center 25%" scale={k(t, 8.2, 11.4, 1.14, 1.02)} />
              </Oval>
              <Oval w={124} h={164} style={{ left: cx + 26 + k(t, 8.4, 9.4, 40, 0, E.outCubic), top: H * 0.17, opacity: k(t, 8.4, 9.0, 0, 1) }}>
                <Img src={d.photos.bride} pos="center 25%" scale={k(t, 8.4, 11.4, 1.14, 1.02)} />
              </Oval>
              <L style={{ left: 12, width: W / 2 - 18, top: H * 0.13 + 178, ...center, opacity: k(t, 9.0, 9.6, 0, 1) }}>
                <div style={{ fontFamily: F.display, fontSize: 18 }}>{d.groom}</div>
                <div style={{ fontFamily: F.body, fontSize: 11.5, marginTop: 4, lineHeight: 1.4, padding: '6px 8px', borderRadius: 8, background: 'rgba(20,40,30,0.78)' }}>Putra ti {d.groomParents}</div>
              </L>
              <L style={{ left: W / 2 + 6, width: W / 2 - 18, top: H * 0.17 + 178, ...center, opacity: k(t, 9.3, 9.9, 0, 1) }}>
                <div style={{ fontFamily: F.display, fontSize: 18 }}>{d.bride}</div>
                <div style={{ fontFamily: F.body, fontSize: 11.5, marginTop: 4, lineHeight: 1.4, padding: '6px 8px', borderRadius: 8, background: 'rgba(20,40,30,0.78)' }}>Putri ti {d.brideParents}</div>
              </L>
            </L>
          </L>

          {/* L1: rumpun padi/daun depan, hanya melintas saat whip (1,9x) */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translate3d(${pan(t) * 1.9 + W * 1.15}px, ${-camY * 1.8}px, 0)`, filter: 'blur(1.5px)' }} aria-hidden>
            {Array.from({ length: 16 }, (_, i) => {
              const x = i * 24 + seeded(i + 40) * 10;
              const h = 140 + seeded(i + 90) * 120;
              return <path key={i} d={`M ${x} ${H + 10} C ${x - 10} ${H - h * 0.5}, ${x + 18} ${H - h * 0.8}, ${x + 26} ${H - h}`} stroke={i % 2 ? '#2E5536' : '#3E6B44'} strokeWidth={9} fill="none" strokeLinecap="round" />;
            })}
          </svg>
        </L>
      )}

      {/* ================= F + G: malam ================= */}
      {showFG && (
        <L style={{ inset: 0 }}>
          <L style={{ left: -20, right: -20, top: -20, bottom: -H * 0.6, background: `linear-gradient(180deg, ${C.night} 0%, #15303A 45%, rgba(21,48,58,0.75) 72%, rgba(21,48,58,0) 100%)`, transform: `translateY(${camYG}px)` }} />
          <Stars W={W} H={H} t={t} n={40} camY={-camYG} seed={7} />
          <L style={{ left: W * 0.7, top: H * 0.08 + camYG * 0.4, width: 54, height: 54, borderRadius: '50%', background: '#FFF4D6', boxShadow: '0 0 40px rgba(255,240,200,0.6)' }} />
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', transform: `translateY(${camYG * 0.6}px)` }} aria-hidden>
            <path d={ridgePath(W, H * 0.92, 40, 11, 2.2, H * 1.2)} fill="#0E1D15" />
          </svg>
          <L style={{ left: 0, right: 0, top: H * 0.17 + camYG, ...center }}>
            <div style={{ fontFamily: F.label, fontSize: 11, letterSpacing: '0.34em', color: C.gold, opacity: k(t, 12.3, 12.9, 0, 1) }}>WAKTOS &amp; TEMPAT</div>
            <div style={{ fontFamily: F.display, fontSize: Math.min(46, W / 7.4), lineHeight: 1.1, marginTop: 10, whiteSpace: 'nowrap' }}>
              <Chars text={`${d.day} · ${d.monthNum} · ${d.year}`} t={t} start={12.5} stagger={0.045} dur={0.7} from={{ y: 16, opacity: 0, blur: 9 }} />
            </div>
            <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 16, marginTop: 6, opacity: k(t, 13.2, 13.7, 0, 1) }}>{d.dateLong}</div>
            <div style={{ margin: '22px auto 0', width: Math.min(300, W - 40), display: 'grid', gap: 12 }}>
              {d.events.slice(0, 2).map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(20,40,30,0.72)',
                    border: `1px solid ${C.gold2}`,
                    opacity: k(t, 13.5 + i * 0.35, 14.1 + i * 0.35, 0, 1),
                    transform: `translateY(${k(t, 13.5 + i * 0.35, 14.3 + i * 0.35, 14, 0)}px)`,
                  }}
                >
                  <div style={{ fontFamily: F.label, fontSize: 13, letterSpacing: '0.08em', color: C.gold }}>{e.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: 13, marginTop: 2 }}>{e.time}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, opacity: 0.85 }}>{e.venue}</div>
                </div>
              ))}
            </div>
          </L>
        </L>
      )}

      {/* ================= I: penutup ================= */}
      {showI && (
        <L style={{ inset: 0, background: `radial-gradient(120% 90% at 50% 40%, ${C.forest2} 0%, ${C.deep} 100%)` }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: 0.55 }} aria-hidden>
            <MegaCloud x={W * 0.12} y={H * 0.9} s={1.1} />
            <MegaCloud x={W * 0.9} y={H * 0.1} s={1} flip />
          </svg>
          <L style={{ left: 0, right: 0, top: H * 0.2 + kf(t, [[16.2, 10], [19.4, -6, E.inOutCubic]]), ...center }}>
            <div style={{ fontFamily: F.label, fontSize: 10.5, letterSpacing: '0.3em', color: C.gold, opacity: k(t, 16.6, 17.1, 0, 1) }}>KEPADA YTH.</div>
            <div style={{ fontFamily: F.display, fontSize: 24, marginTop: 6 }}>
              <Chars text={d.guest} t={t} start={16.8} stagger={0.02} from={{ y: 6, opacity: 0, blur: 4 }} />
            </div>
            <div style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 15, marginTop: 18, opacity: k(t, 17.3, 17.8, 0, 1) }}>{d.copy?.closing || 'Hatur nuhun kana sagala doa sareng rawuhna'}</div>
            <div style={{ fontFamily: F.display, fontSize: 40, lineHeight: 1.15, marginTop: 10, opacity: k(t, 17.6, 18.2, 0, 1) }}>
              {d.groom} <span style={{ fontFamily: F.body, fontStyle: 'italic', fontSize: 22, color: C.gold }}>&amp;</span> {d.bride}
            </div>
            <div style={{ fontFamily: F.label, fontSize: 10, letterSpacing: '0.14em', color: C.gold, marginTop: 12, opacity: k(t, 18.0, 18.5, 0, 1) }}>{d.slug}</div>
          </L>
        </L>
      )}

      {/* ================= H: tirai awan Mega Mendung (menutup lalu tersibak) ================= */}
      {curtain > 0.001 && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (i / 4) * H;
            const fromL = i % 2 === 0;
            const xL = lerp(-W * 0.9, W * 0.32, curtain);
            const xR = lerp(W * 1.9, W * 0.68, curtain);
            return (
              <g key={i}>
                <MegaCloud x={(fromL ? xL : xR) + (i % 2 ? 30 : -30)} y={y} s={2.4} flip={!fromL} />
                <MegaCloud x={(fromL ? xR : xL) + (i % 2 ? -20 : 20)} y={y + H / 8} s={2.2} flip={fromL} />
              </g>
            );
          })}
        </svg>
      )}

      <L style={{ inset: 0, pointerEvents: 'none', background: 'radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.25) 100%)' }} />
    </div>
  );
}
