'use client';

/**
 * LUXURY PINK ELEGANT — dipentaskan sebagai surat cinta yang dibuka.
 * 1:1 dengan template: amplop #A83D68 / #D99AB3 dengan tutup #54243B dan segel lilin hati,
 * kartu "Wedding Invitation", Great Vibes + Playfair + Nunito Sans,
 * bingkai lengkung, sulur bunga, kotak hitung mundur, judul script raksasa.
 *
 *  A 0.0–4.1   Amplop jatuh & mendarat, segel berdetak, tutup terbuka, kartu naik, kamera menembus kartu
 *  B 4.1–7.3   The Wedding Of: nama ditulis tangan (write-on), tanggal
 *  C 7.3–10.6  Bingkai lengkung tergambar, foto naik, sulur & bunga mekar, hitung mundur dipercepat
 *  D 10.6–13.8 "Mempelai" script raksasa, kartu pria & wanita bersilangan (whip)
 *  E 13.8–16.8 Rangkaian Acara: garis waktu & kartu acara
 *  F 16.8–19.6 Kartu kembali ke amplop, segel dicap (impact), penutup
 */

import React from 'react';
import { Chars, E, FilmProps, k, kf, L, MotionBlurDefs, mbFilter, Photo, seg, spring, Trim, velocity, clamp01, lerp } from './core';

export const PINK_COMP_DUR = 19.6;
export const PINK_SPEED = [
  { from: 0.95, to: 1.85, speed: 0.5 }, // slow-mo: amplop melayang setelah mendarat
  { from: 3.55, to: 4.15, speed: 2.4 }, // menembus kartu
  { from: 4.4, to: 5.6, speed: 0.75 }, // tulisan tangan
  { from: 8.6, to: 9.4, speed: 2.6 }, // hitung mundur ngebut
  { from: 9.4, to: 9.9, speed: 0.45 }, // ...lalu slow-mo di hari H
  { from: 11.75, to: 12.2, speed: 2.4 }, // kartu bersilangan
  { from: 18.0, to: 18.25, speed: 0.4 }, // impact segel
];

const C = {
  bg: '#FCF3F6',
  pattern: '#F2DEE7',
  primary: '#A83D68',
  secondary: '#D99AB3',
  text: '#54243B',
};
const F = {
  script: "'Great Vibes', cursive",
  serif: "'Playfair Display', Georgia, serif",
  body: "'Nunito Sans', system-ui, sans-serif",
};

function Seal({ size, pulse = 1 }: { size: number; pulse?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `scale(${pulse})` }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 4px 8px rgba(159,18,57,0.5))' }} aria-hidden>
        <path d="M50 5 C75 3 95 20 97 45 C99 70 80 95 50 97 C20 98 5 75 3 50 C1 20 20 7 50 5 Z" fill={C.primary} />
        <path d="M50 12 C68 10 85 22 87 45 C89 68 72 85 50 87 C25 89 12 70 12 50 C12 25 25 15 50 12 Z" fill={C.text} />
      </svg>
      <svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} style={{ position: 'absolute', left: size * 0.29, top: size * 0.3 }} aria-hidden>
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill={C.bg} />
      </svg>
    </div>
  );
}

/** Amplop template: belakang, kartu, kantong depan, tutup ber-segel. */
function Envelope({ w, h, flap, card, groom, bride, t, sealPulse, showSeal }: { w: number; h: number; flap: number; card: number; groom: string; bride: string; t: number; sealPulse: number; showSeal: boolean }) {
  const flapDeg = flap * 178;
  return (
    <div style={{ position: 'relative', width: w, height: h, perspective: 800 }}>
      <div style={{ position: 'absolute', inset: 0, background: C.primary, borderRadius: '0 0 12px 12px', boxShadow: '0 30px 50px -20px rgba(84,36,59,0.55)' }} />
      {/* tutup terbuka berada di BELAKANG kartu */}
      {flapDeg > 90 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h / 2, transformOrigin: '50% 0%', transform: `rotateX(${flapDeg}deg)`, background: C.text, clipPath: 'polygon(0 0, 100% 0, 50% 100%)', borderRadius: '12px 12px 0 0' }} />
      )}
      {/* kartu undangan */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          right: 8,
          top: 8,
          height: h * 0.9,
          background: C.bg,
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${-card * h * 0.95}px)`,
          boxShadow: '0 4px 12px rgba(84,36,59,0.15)',
          zIndex: card > 0.85 ? 40 : 10,
        }}
      >
        <div style={{ fontFamily: F.script, fontSize: 36, color: C.primary, lineHeight: 1.1 }}>
          {groom} &amp; {bride}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: C.text, marginTop: 8 }}>WEDDING INVITATION</div>
        <svg viewBox="0 0 24 24" width={16} height={16} style={{ marginTop: 12 }} aria-hidden>
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="none" stroke={C.primary} strokeWidth="2" />
        </svg>
      </div>
      {/* kantong depan */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: C.primary, borderRadius: '0 0 0 12px', clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: C.secondary, borderRadius: '0 0 12px 0', clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: C.primary, borderRadius: '0 0 12px 12px', clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)', filter: 'brightness(0.92)' }} />
      </div>
      {/* tutup tertutup di DEPAN */}
      {flapDeg <= 90 && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: h / 2, transformOrigin: '50% 0%', transform: `rotateX(${flapDeg}deg)`, zIndex: 30 }}>
          <div style={{ position: 'absolute', inset: 0, background: C.text, clipPath: 'polygon(0 0, 100% 0, 50% 100%)', borderRadius: '12px 12px 0 0' }} />
          {showSeal && (
            <div style={{ position: 'absolute', left: w / 2 - 28, top: 28 }}>
              <Seal size={56} pulse={sealPulse} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Vine({ t, start, x, y, size }: { t: number; start: number; x: number; y: number; size: number }) {
  const draw = k(t, start, start + 1.6, 0, 1, E.outCubic);
  const bloom = spring(t - start - 0.9, { freq: 1.1, damping: 4 });
  const cxv = 60, cyv = 140;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: 'absolute', left: x, top: y, overflow: 'visible', zIndex: 3 }} aria-hidden>
      <path d="M 10,10 C 10,80 40,110 60,140 C 80,170 140,180 190,190" fill="none" stroke={C.secondary} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${draw * 260} 400`} />
      <path d="M 30,0 C 20,70 50,100 70,130 C 90,160 150,170 200,170" fill="none" stroke={C.secondary} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${k(t, start + 0.3, start + 1.9, 0, 260, E.outCubic)} 400`} />
      <g style={{ transformOrigin: `${cxv}px ${cyv}px`, transform: `scale(${Math.max(0, bloom) * (1 + Math.sin(t * 1.6) * 0.06)}) rotate(${(1 - clamp01(bloom)) * -90}deg)` }}>
        <path d={`M ${cxv},${cyv} m -18,-18 c 22,-22 45,0 18,18 c 22,22 0,45 -18,18 c -22,22 -45,0 -18,-18 c -22,-22 0,-45 18,-18 z`} fill={C.secondary} opacity="0.85" />
        <path d={`M ${cxv},${cyv} m -12,-12 c 15,-15 30,0 12,12 c 15,15 0,30 -12,12 c -15,15 -30,0 -12,-12 c -15,-15 0,-30 12,-12 z`} fill={C.primary} />
        <circle cx={cxv} cy={cyv} r="5" fill={C.bg} />
      </g>
    </svg>
  );
}

function Petals({ t, W, H }: { t: number; W: number; H: number }) {
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const r1 = Math.sin(i * 91.7) * 0.5 + 0.5;
        const r2 = Math.sin(i * 47.3 + 2) * 0.5 + 0.5;
        const sp = 30 + r2 * 40;
        const y = ((r1 * H + t * sp) % (H + 40)) - 20;
        const x = (r2 * W + Math.sin(t * 0.9 + i) * 24) % W;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 9 + r1 * 6,
              height: 6 + r1 * 4,
              borderRadius: '80% 10% 80% 10%',
              background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
              opacity: 0.45,
              transform: `rotate(${t * (40 + r2 * 80) + i * 30}deg)`,
              zIndex: 50,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
}

export default function PinkFilm({ t, speed, W, H, d }: FilmProps) {
  const cx = W / 2;
  const col = cx - 180;
  const ew = 300, eh = 206;

  // A — amplop
  const drop = (tt: number) => -520 * (1 - spring(tt - 0.1, { freq: 0.95, damping: 4.4 }));
  const vDrop = velocity(drop, t, speed);
  const rotIn = (1 - clamp01(spring(t - 0.1, { freq: 0.8, damping: 3.5 }))) * -24;
  const beat = 1 + 0.12 * Math.max(0, Math.sin((t - 1.0) * 9)) * (t > 1.0 && t < 2.05 ? 1 : 0);
  const press = kf(t, [[2.05, 1], [2.15, 0.82, E.outCubic], [2.3, 1.1, E.outBack], [2.4, 0]]);
  const flap = k(t, 2.3, 2.95, 0, 1, E.inOutCubic);
  const cardUp = (tt: number) => kf(tt, [[2.85, 0, E.whip], [3.2, 1.05, E.outCubic], [3.55, 1.0]]);
  const card = cardUp(t);
  const dive = k(t, 3.55, 4.1, 1, 7, E.inExpo);

  // D — kartu bersilangan
  const crossG = (tt: number) => kf(tt, [[10.65, -W, E.whip], [11.0, 0]]);
  const swapP = E.snap(seg(t, 11.75, 12.2));
  const vSwap = velocity((tt) => E.snap(seg(tt, 11.75, 12.2)) * W + crossG(tt), t, speed);

  // F — kartu kembali & segel dicap
  const stamp = (tt: number) => kf(tt, [[17.75, 4.5, E.inExpo], [18.0, 1, E.linear]]);
  const stampS = stamp(t);
  const shake = t > 18.0 ? Math.sin((t - 18.0) * 70) * 6 * Math.exp(-(t - 18.0) * 10) : 0;

  const sceneA = t < 4.15;
  const sceneB = t >= 3.85 && t < 7.4;
  const sceneC = t >= 7.2 && t < 10.7;
  const sceneD = t >= 10.55 && t < 13.9;
  const sceneE = t >= 13.75 && t < 16.95;
  const sceneF = t >= 16.8;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.pattern, color: C.text, overflow: 'hidden' }}>
      <MotionBlurDefs id="pk-mb-drop" x={0} y={Math.abs(vDrop) / 240} />
      <MotionBlurDefs id="pk-mb-swap" x={Math.abs(vSwap) / 170} y={0} />

      {/* ================= B..E punya latar krem muda ================= */}
      {!sceneA || t > 3.85 ? <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 30%, #FFFFFF, ${C.bg} 55%, ${C.pattern})` }} /> : null}

      {/* ================= B ================= */}
      {sceneB && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 7.15, 7.4, 1, 0) }}>
          {/* Tipografi latar: script raksasa melayang */}
          <L style={{ left: 0, width: W, top: 60, textAlign: 'center', fontFamily: F.script, fontSize: 230, lineHeight: 1, color: C.secondary, opacity: 0.16, whiteSpace: 'nowrap', transform: `translateX(${k(t, 3.9, 7.4, 60, -60, E.linear)}px)` }}>
            {d.groom}
          </L>
          <L style={{ left: 0, width: W, top: 330, textAlign: 'center', fontFamily: F.script, fontSize: 230, lineHeight: 1, color: C.secondary, opacity: 0.16, whiteSpace: 'nowrap', transform: `translateX(${k(t, 3.9, 7.4, -60, 60, E.linear)}px)` }}>
            {d.bride}
          </L>

          <L style={{ left: cx - 8, top: 150, color: C.primary, transform: `translateY(${Math.abs(Math.sin(t * 4)) * -6}px)`, opacity: k(t, 4.0, 4.3, 0, 1) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
          </L>
          <L style={{ left: col, width: 360, top: 196, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 12, color: C.text, letterSpacing: `${k(t, 4.1, 5.0, 0.7, 0.2, E.outQuint)}em`, opacity: k(t, 4.1, 4.4, 0, 1) }}>
            THE WEDDING OF
          </L>
          {/* Nama ditulis tangan: mask miring bergerak kiri→kanan */}
          {(() => {
            const w = k(t, 4.35, 5.75, -10, 112, E.inOutCubic);
            const mask = `linear-gradient(100deg, #000 ${w - 6}%, transparent ${w + 4}%)`;
            return (
              <L style={{ left: 0, width: W, top: 222, textAlign: 'center', fontFamily: F.script, fontSize: 66, lineHeight: 1.3, color: C.primary, whiteSpace: 'nowrap', WebkitMaskImage: mask, maskImage: mask, textShadow: '0 0 18px rgba(255,255,255,0.9)' }}>
                {d.groom} &amp; {d.bride}
              </L>
            );
          })()}
          {/* ujung pena */}
          {t > 4.35 && t < 5.8 && (
            <L style={{ left: lerp(cx - 150, cx + 150, E.inOutCubic(seg(t, 4.35, 5.75))), top: 262 + Math.sin(t * 22) * 10, width: 6, height: 6, borderRadius: 999, background: '#fff', boxShadow: `0 0 12px 4px ${C.secondary}` }} />
          )}
          <L style={{ left: col, width: 360, top: 318, textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: C.text }}>
            <Chars text={d.dateLong} t={t} start={5.7} stagger={0.018} from={{ opacity: 0, y: 8, blur: 4 }} />
          </L>
          <L style={{ left: col, width: 360, top: 380, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', color: C.text, opacity: k(t, 6.1, 6.4, 0, 1) }}>
            KEPADA YTH,
          </L>
          <L style={{ left: cx - 90, top: 400, width: 180, padding: '8px 0', textAlign: 'center', borderRadius: 999, background: C.bg, border: `1px solid ${C.pattern}`, fontFamily: F.body, fontWeight: 700, fontSize: 16, color: C.primary, transform: `scale(${E.outBack(seg(t, 6.2, 6.6))})`, boxShadow: '0 8px 20px -12px rgba(84,36,59,0.5)' }}>
            {d.guest}
          </L>
        </div>
      )}

      {/* ================= C ================= */}
      {sceneC && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 7.2, 7.45, 0, 1) * k(t, 10.5, 10.7, 1, 0) }}>
          {(() => {
            const aw = 196, ah = 262, ax = cx - aw / 2, ay = 60;
            const perim = 2 * (ah - aw / 2) + Math.PI * (aw / 2) + aw;
            const reveal = E.snap(seg(t, 7.45, 8.2));
            return (
              <>
                <Trim viewBox={`0 0 ${aw} ${ah}`} d={`M0 ${ah} V${aw / 2} A${aw / 2} ${aw / 2} 0 0 1 ${aw} ${aw / 2} V${ah} Z`} len={perim} end={k(t, 7.2, 7.9, 0, 1, E.inOutCubic)} stroke={C.secondary} width={4} style={{ left: ax, top: ay, width: aw, height: ah }} />
                <L style={{ left: ax + 8, top: ay + 8, width: aw - 16, height: ah - 16, borderRadius: `${(aw - 16) / 2}px ${(aw - 16) / 2}px 0 0`, overflow: 'hidden', clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`, background: C.bg }}>
                  <Photo src={d.photos.couple} t={t} a={7.75} b={10.6} s0={1.35} s1={1.08} y0={8} y1={0} />
                </L>
                <Vine t={t} start={8.0} x={ax - 56} y={ay + ah - 110} size={120} />
              </>
            );
          })()}

          {/* Hitung mundur yang dipercepat menuju hari H */}
          {(() => {
            const labels = ['HARI', 'JAM', 'MENIT', 'DETIK'];
            const ff = E.inOutCubic(seg(t, 8.6, 9.4));
            const vals = [Math.round(lerp(258, 0, ff)), Math.round(lerp(23, 0, ff)), Math.round(lerp(59, 0, ff)), Math.round(lerp(59, 0, ff))];
            const zero = t > 9.4;
            return (
              <L style={{ left: cx - 152, top: 360, width: 304, display: 'flex', gap: 8 }}>
                {labels.map((lb, i) => {
                  const fl = E.outBack(seg(t, 8.2 + i * 0.08, 8.6 + i * 0.08));
                  return (
                    <div key={lb} style={{ flex: 1, height: 70, borderRadius: 8, background: '#FFFFFFCC', border: `1px solid ${C.secondary}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `perspective(400px) rotateX(${(1 - fl) * 90}deg)`, boxShadow: zero ? `0 0 0 ${k(t, 9.4, 9.9, 0, 6)}px ${C.secondary}55` : undefined }}>
                      <div style={{ fontFamily: F.serif, fontSize: 24, fontWeight: 700, color: C.primary, filter: !zero && t > 8.6 ? 'blur(0.6px)' : undefined }}>{vals[i]}</div>
                      <div style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', color: C.text, marginTop: 2 }}>{lb}</div>
                    </div>
                  );
                })}
              </L>
            );
          })()}
          <L style={{ left: 0, width: W, top: 448, textAlign: 'center', fontFamily: F.script, fontSize: 40, color: C.primary }}>
            <Chars text="hari bahagia kami" t={t} start={9.45} stagger={0.035} from={{ opacity: 0, y: 12, blur: 6 }} />
          </L>
        </div>
      )}

      {/* ================= D ================= */}
      {sceneD && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 10.55, 10.8, 0, 1) * k(t, 13.7, 13.9, 1, 0) }}>
          <L style={{ left: 0, width: W, top: 30, textAlign: 'center', fontFamily: F.script, fontSize: 120, lineHeight: 1, color: C.primary, whiteSpace: 'nowrap', transform: `translateX(${k(t, 10.55, 13.9, 40, -40, E.linear)}px)` }}>
            <Chars text="Mempelai" t={t} start={10.6} stagger={0.04} dur={0.8} from={{ opacity: 0, x: -20, blur: 8 }} />
          </L>
          <div style={{ position: 'absolute', inset: 0, filter: mbFilter('pk-mb-swap', vSwap / 170, 0) }}>
            {[
              { name: d.groomFull, rel: `Putra dari ${d.groomParents}`, photo: d.photos.groom, x: cx - 150 + crossG(t) - swapP * W },
              { name: d.brideFull, rel: `Putri dari ${d.brideParents}`, photo: d.photos.bride, x: cx - 150 + W - swapP * W },
            ].map((p, i) => (
              <L key={i} style={{ left: p.x, top: 190, width: 300, height: 300, borderRadius: 14, background: '#FFFFFFB8', border: `1px solid ${C.secondary}`, boxShadow: '0 20px 40px -24px rgba(84,36,59,0.5)', backdropFilter: 'blur(6px)' }}>
                <div style={{ position: 'absolute', left: 90, top: 26, width: 120, height: 120, borderRadius: 999, overflow: 'hidden', border: `4px solid ${C.secondary}` }}>
                  <Photo src={p.photo} t={t} a={10.6 + i * 0.8} b={13.6} s0={1.3} s1={1.05} pos="center 30%" />
                </div>
                <L style={{ left: 10, width: 280, top: 166, textAlign: 'center', fontFamily: F.serif, fontWeight: 700, fontSize: 21, color: C.text }}>{p.name}</L>
                <L style={{ left: 24, width: 252, top: 204, textAlign: 'center', fontFamily: F.body, fontSize: 11.5, lineHeight: 1.5, color: C.primary }}>{p.rel}</L>
              </L>
            ))}
          </div>
          <L style={{ left: 0, width: W, top: 506, textAlign: 'center', fontFamily: F.script, fontSize: 48, color: C.primary, transform: `scale(${E.outBack(seg(t, 12.05, 12.45))}) rotate(${(1 - E.outBack(seg(t, 12.05, 12.45))) * 90}deg)` }}>&amp;</L>
        </div>
      )}

      {/* ================= E ================= */}
      {sceneE && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 13.75, 14.0, 0, 1) * k(t, 16.75, 16.95, 1, 0) }}>
          <L style={{ left: 0, width: W, top: 36, textAlign: 'center', fontFamily: F.script, fontSize: 64, lineHeight: 1.1, color: C.primary, whiteSpace: 'nowrap' }}>
            <Chars text="Rangkaian Acara" t={t} start={13.8} stagger={0.03} dur={0.7} from={{ opacity: 0, y: 20, blur: 8 }} />
          </L>
          <L style={{ left: col + 30, top: 140, width: 1, height: 400 * k(t, 14.0, 15.2, 0, 1, E.inOutCubic), background: C.secondary }} />
          {d.events.slice(0, 2).map((ev, i) => {
            const s = 14.2 + i * 0.9;
            const y = 140 + i * 206;
            const inX = (1 - E.whip(seg(t, s, s + 0.7))) * 320;
            return (
              <React.Fragment key={ev.title}>
                <L style={{ left: col + 24, top: y + 16, width: 13, height: 13, borderRadius: 999, background: C.primary, border: `3px solid ${C.bg}`, boxShadow: `0 0 0 1px ${C.secondary}`, transform: `scale(${E.outBack(seg(t, s - 0.1, s + 0.3))})` }} />
                <L style={{ left: col + 54, top: y, width: 290, padding: '18px 18px 16px', borderRadius: 12, background: '#FFFFFFC4', border: `1px solid ${C.secondary}`, transform: `translateX(${inX}px)`, boxShadow: '0 14px 30px -20px rgba(84,36,59,0.5)' }}>
                  <div style={{ fontFamily: F.serif, fontSize: 22, color: C.text }}>{ev.title}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.text, marginTop: 10 }}>▦ {ev.date}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.text, marginTop: 6 }}>◷ {ev.time}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.text, marginTop: 10, lineHeight: 1.4 }}>{ev.venue}</div>
                </L>
              </React.Fragment>
            );
          })}
          <L style={{ left: cx - 105, top: 556, width: 210, padding: '11px 0', textAlign: 'center', borderRadius: 999, background: C.primary, color: '#fff', fontFamily: F.body, fontWeight: 700, fontSize: 13, transform: `scale(${E.outBack(seg(t, 15.8, 16.2))})` }}>
            Lihat Lokasi (Maps)
          </L>
        </div>
      )}

      {/* ================= F ================= */}
      {sceneF && (
        <div style={{ position: 'absolute', inset: 0, background: C.pattern, opacity: k(t, 16.8, 17.05, 0, 1) }}>
          <L style={{ left: cx - ew / 2, top: 190 + k(t, 16.8, 17.3, 300, 0, E.whip), transform: `translate(${shake}px, 0)` }}>
            <Envelope w={ew} h={eh} flap={k(t, 17.35, 17.75, 1, 0, E.inOutCubic)} card={k(t, 16.95, 17.4, 1, 0, E.inOutCubic)} groom={d.groom} bride={d.bride} t={t} sealPulse={1} showSeal={false} />
          </L>
          {t > 17.75 && (
            <L style={{ left: cx - 28 + shake, top: 190 + 28, width: 56, height: 56, transform: `scale(${stampS})`, opacity: k(t, 17.75, 17.85, 0, 1), zIndex: 60 }}>
              <Seal size={56} />
            </L>
          )}
          {t > 18.0 && (
            <L style={{ left: cx - 50, top: 196, width: 100, height: 100, borderRadius: 999, border: `2px solid ${C.secondary}`, transform: `scale(${k(t, 18.0, 18.6, 0.5, 2.4, E.outCubic)})`, opacity: k(t, 18.0, 18.6, 0.9, 0) }} />
          )}
          <L style={{ left: 0, width: W, top: 436, textAlign: 'center', fontFamily: F.script, fontSize: 46, color: C.primary }}>
            <Chars text="Sampai jumpa" t={t} start={18.2} stagger={0.04} from={{ opacity: 0, y: 14, blur: 6 }} />
          </L>
          <L style={{ left: 0, width: W, top: 504, textAlign: 'center', fontFamily: F.body, fontWeight: 700, fontSize: 11, letterSpacing: '0.18em', color: C.text, opacity: k(t, 18.6, 18.9, 0, 1) }}>
            {d.slug.toUpperCase()}
          </L>
        </div>
      )}

      {/* ================= A ================= */}
      {sceneA && (
        <div style={{ position: 'absolute', inset: 0, background: t < 3.85 ? C.pattern : 'transparent' }}>
          {/* Tipografi tamu (template sampul) */}
          <L style={{ left: 0, width: W, top: 470, textAlign: 'center', fontFamily: F.script, fontSize: 46, color: C.primary, opacity: k(t, 1.0, 1.5, 0, 1) * k(t, 2.3, 2.6, 1, 0) }}>
            <Chars text={d.guest} t={t} start={1.0} stagger={0.03} from={{ opacity: 0, y: 10, blur: 6 }} />
          </L>
          <L style={{ left: 0, width: W, top: 538, textAlign: 'center', fontFamily: F.body, fontSize: 11, letterSpacing: `${k(t, 1.3, 2.3, 0.6, 0.2, E.outQuint)}em`, color: C.text, opacity: k(t, 1.3, 1.6, 0, 1) * k(t, 2.3, 2.6, 1, 0) }}>
            SPECIAL INVITATION
          </L>

          <div
            style={{
              position: 'absolute',
              left: cx - ew / 2,
              top: 190 + drop(t) + Math.sin(t * 2.4) * 7 * seg(t, 0.9, 1.3) * (1 - seg(t, 2.0, 2.3)),
              transform: `perspective(900px) rotateY(${Math.sin(t * 1.7) * 14 * seg(t, 0.9, 1.3) * (1 - seg(t, 2.0, 2.3))}deg) rotate(${rotIn + Math.sin(t * 1.3) * 2 * seg(t, 0.9, 1.3) * (1 - seg(t, 2.0, 2.3))}deg) scale(${dive * k(t, 0.9, 2.2, 1, 1.08, E.inOutCubic)})`,
              transformOrigin: '50% -92px',
              filter: mbFilter('pk-mb-drop', 0, vDrop / 240),
            }}
          >
            <Envelope w={ew} h={eh} flap={flap} card={card} groom={d.groom} bride={d.bride} t={t} sealPulse={beat * press} showSeal={press > 0.01} />
          </div>
          {t > 2.05 && t < 2.6 && (
            <L style={{ left: cx - 28, top: 190 + 28, width: 56, height: 56, borderRadius: 999, border: `2px solid ${C.secondary}`, transform: `scale(${k(t, 2.05, 2.6, 1, 2.6, E.outCubic)})`, opacity: k(t, 2.05, 2.6, 0.9, 0) }} />
          )}
          {/* kartu memenuhi layar → putih */}
          <div style={{ position: 'absolute', inset: 0, background: C.bg, opacity: k(t, 3.85, 4.1, 0, 1) }} />
        </div>
      )}

      <Petals t={t} W={W} H={H} />
    </div>
  );
}
