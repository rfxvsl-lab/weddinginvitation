'use client';

/**
 * GRAND BALLROOM — dipentaskan seperti pembukaan tirai gedung pesta.
 * 1:1 dengan template: tirai slate #345579 bergaris #8FA8C2, mahkota, plakat OPEN,
 * tali swag, kartu "The Wedding Celebration", bingkai persegi berlapis,
 * "08 . 08 . 2026" Cinzel, potret oval, "Order of Events".
 *
 *  A 0.0–3.4   Tirai tertutup, mahkota turun di tali, celah cahaya → tirai tersibak (whip)
 *  B 3.4–6.7   The Wedding Celebration: tali swag jatuh, nama berjatuhan seperti kristal
 *  C 6.7–9.9   Bingkai berlapis dibangun, foto terbuka seperti tirai, tanggal slot-machine
 *  D 9.9–13.4  The Couple: potret oval pria, kartu berbalik 3D ke wanita
 *  E 13.4–16.8 Order of Events: garis waktu turun, kamera meluncur (speed ramp)
 *  F 16.8–19.6 Tirai menutup kembali, mahkota, nama & tautan
 */

import React from 'react';
import { Chars, E, FilmProps, k, kf, L, MotionBlurDefs, mbFilter, Photo, seg, spring, Trim, velocity, clamp01, lerp } from './core';

export const BALLROOM_COMP_DUR = 19.6;
export const BALLROOM_SPEED = [
  { from: 1.3, to: 2.3, speed: 0.5 }, // slow-mo: cahaya menembus celah tirai
  { from: 2.35, to: 3.1, speed: 2.6 }, // tirai disibak
  { from: 4.6, to: 5.5, speed: 0.6 }, // slow-mo: huruf mendarat
  { from: 10.85, to: 11.35, speed: 2.4 }, // flip kartu
  { from: 14.75, to: 15.3, speed: 2.2 }, // kamera meluncur
  { from: 16.5, to: 17.2, speed: 0.55 }, // tirai menutup pelan
];

const C = {
  bg: '#F3F6FA',
  pattern: '#E1E9F2',
  primary: '#345579',
  secondary: '#8FA8C2',
  text: '#23364D',
};
const F = {
  grand: "'Cinzel', Georgia, serif",
  lux: "'Playfair Display', Georgia, serif",
  body: "'Lato', system-ui, sans-serif",
};

function Crown({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.45))' }}>
      <path d="M10 80 L90 80 L95 90 L5 90 Z" fill={C.secondary} />
      <path d="M15 80 L10 40 L30 60 L50 20 L70 60 L90 40 L85 80 Z" fill={C.bg} />
      <circle cx="10" cy="35" r="5" fill="#FFF" opacity="0.8" />
      <circle cx="50" cy="15" r="7" fill="#FFF" opacity="0.9" />
      <circle cx="90" cy="35" r="5" fill="#FFF" opacity="0.8" />
    </svg>
  );
}

function Curtain({ side, W, H, open, blurId }: { side: 'left' | 'right'; W: number; H: number; open: number; blurId?: string }) {
  const left = side === 'left';
  const sway = Math.sin(open * Math.PI) * 6;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: left ? 0 : W / 2,
        width: W / 2 + 1,
        height: H,
        transformOrigin: left ? '0 50%' : '100% 50%',
        transform: `translateX(${(left ? -100 : 100) * open}%) scaleX(${1 - 0.2 * open}) skewY(${left ? -sway : sway}deg)`,
        filter: blurId,
        zIndex: 20,
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <path d="M0 0 H100 V90 Q50 100 0 90 Z" fill={C.primary} />
        <path d="M20 0 V92 M50 0 V95 M80 0 V92" fill="none" stroke={C.secondary} strokeWidth="0.4" />
      </svg>
      {/* lipatan kain */}
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 6px, rgba(255,255,255,0.04) 6px 14px, rgba(0,0,0,0.08) 14px 24px)', opacity: 0.6 }} />
    </div>
  );
}

function Divider({ t, start, w = 64, cx, y }: { t: number; start: number; w?: number; cx: number; y: number }) {
  const p = k(t, start, start + 0.7, 0, 1, E.outExpo);
  return (
    <>
      <L style={{ left: cx - 16 - w * p, top: y, width: w * p, height: 1, background: C.secondary }} />
      <L style={{ left: cx + 16, top: y, width: w * p, height: 1, background: C.secondary }} />
      <svg viewBox="0 0 24 24" width={22} height={22} style={{ position: 'absolute', left: cx - 11, top: y - 11, transform: `rotate(${(1 - E.outBack(seg(t, start, start + 0.8))) * -270}deg) scale(${E.outBack(seg(t, start, start + 0.6))})` }} aria-hidden>
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={C.primary} />
      </svg>
    </>
  );
}

/** Angka slot-machine: setiap karakter berputar vertikal lalu berhenti. */
function Slot({ text, t, start, style }: { text: string; t: number; start: number; style: React.CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', ...style }}>
      {Array.from(text).map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{ display: 'inline-block', width: '0.7em', textAlign: 'center' }}>{ch}</span>;
        const target = Number(ch);
        const p = E.outQuint(seg(t, start + i * 0.06, start + i * 0.06 + 1.1));
        const pos = p * (20 + target);
        const blur = (1 - p) * 4;
        return (
          <span key={i} style={{ display: 'inline-block', height: '1.25em', width: '0.68em', overflow: 'hidden', textAlign: 'center', lineHeight: '1.25em' }}>
            <span style={{ display: 'block', transform: `translateY(${-(pos % 10) * 1.25}em)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
              {Array.from({ length: 11 }, (_, n) => (
                <span key={n} style={{ display: 'block', height: '1.25em' }}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function BallroomFilm({ t, speed, W, H, d }: FilmProps) {
  const cx = W / 2;
  const col = cx - 180;

  // A — tirai
  const crownY = (tt: number) => 268 * spring(tt - 0.2, { freq: 1.3, damping: 4.2 }) - 300;
  const openC = (tt: number) => k(tt, 2.4, 3.1, 0, 1, E.inOutExpo);
  const curtainOpen = openC(t);
  const vCurtain = velocity((tt) => openC(tt) * W * 0.5, t, speed);
  const seam = k(t, 1.15, 2.35, 0, 1, E.inOutCubic);
  const crownLift = k(t, 2.3, 2.75, 0, -420, E.inExpo);
  const swing = Math.sin((t - 0.3) * 5.2) * 14 * Math.exp(-Math.max(0, t - 0.3) * 1.6);

  // F — tirai menutup
  const closeC = (tt: number) => k(tt, 16.45, 17.35, 1, 0, E.snap);
  const closeOpen = closeC(t);

  // E — kamera meluncur
  const camY = (tt: number) => k(tt, 14.75, 15.3, 0, -260, E.snap);
  const vCam = velocity(camY, t, speed);

  const sceneA = t < 3.2;
  const sceneB = t >= 2.4 && t < 6.85;
  const sceneC = t >= 6.6 && t < 10.0;
  const sceneD = t >= 9.8 && t < 13.5;
  const sceneE = t >= 13.35 && t < 17.4;
  const sceneF = t >= 16.4;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, color: C.text, overflow: 'hidden' }}>
      <MotionBlurDefs id="bl-mb-cur" x={Math.abs(vCurtain) / 180} y={0} />
      <MotionBlurDefs id="bl-mb-cam" x={0} y={Math.abs(vCam) / 160} />
      {/* Pola latar halus */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, ${C.bg} 45%, ${C.pattern} 100%)` }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.5 }} aria-hidden>
        <defs>
          <pattern id="bl-pat" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke={C.secondary} strokeWidth="0.4" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bl-pat)" />
      </svg>

      {/* ================= B ================= */}
      {sceneB && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 6.55, 6.85, 1, 0) }}>
          {/* Tali swag (spring) */}
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0, width: W, height: 70, overflow: 'visible' }} aria-hidden>
            {(() => {
              const s1 = spring(t - 3.15, { freq: 0.9, damping: 3.4 });
              const s2 = spring(t - 3.25, { freq: 0.8, damping: 3.0 });
              return (
                <>
                  <path d={`M -50 -10 Q 250 ${-10 + 190 * s1}, 500 ${-10 + 70 * s1} Q 750 ${-10 + 190 * s1}, 1050 -10`} fill="none" stroke={C.secondary} strokeWidth="4" opacity="0.6" />
                  <path d={`M -50 -5 Q 250 ${-5 + 145 * s2}, 500 ${-5 + 35 * s2} Q 750 ${-5 + 145 * s2}, 1050 -5`} fill="none" stroke={C.secondary} strokeWidth="8" />
                </>
              );
            })()}
          </svg>

          {/* Kartu putih bertepi ganda (template) */}
          <L style={{ left: cx - 160, top: 96, width: 320, height: 440, background: '#FFFFFF', boxShadow: '0 30px 60px -30px rgba(35,54,77,0.45)', transform: `scale(${k(t, 3.05, 3.6, 0.92, 1, E.outCubic)})`, opacity: k(t, 3.05, 3.4, 0, 1) }}>
            <Trim viewBox="0 0 304 424" d="M152 0 H304 V424 H0 V0 Z" len={1456} end={k(t, 3.3, 4.4, 0, 1, E.inOutCubic)} stroke={C.secondary} width={1} style={{ left: 8, top: 8, width: 304, height: 424 }} />
          </L>

          <L style={{ left: col, width: 360, top: 140, textAlign: 'center', fontFamily: F.body, fontSize: 11, color: C.primary, letterSpacing: `${k(t, 3.5, 4.6, 0.8, 0.22, E.outQuint)}em`, opacity: k(t, 3.5, 3.9, 0, 1) }}>
            THE WEDDING CELEBRATION
          </L>

          {/* Nama: huruf berjatuhan seperti kristal lampu gantung */}
          <L style={{ left: col, width: 360, top: 190, textAlign: 'center', fontFamily: F.lux, fontSize: 70, lineHeight: 1, color: C.primary }}>
            <Chars text={d.groom} t={t} start={3.75} stagger={0.07} dur={0.9} ease={(x) => clamp01(spring(x * 0.9, { freq: 1.6, damping: 6 }))} from={{ y: -260, rot: -25, opacity: 0 }} />
          </L>
          <L style={{ left: col, width: 360, top: 272, textAlign: 'center', fontFamily: F.lux, fontStyle: 'italic', fontSize: 40, color: C.primary, transform: `rotate(${(1 - E.outBack(seg(t, 4.4, 5.0))) * -180}deg) scale(${E.outBack(seg(t, 4.4, 5.0))})` }}>
            &amp;
          </L>
          <L style={{ left: col, width: 360, top: 326, textAlign: 'center', fontFamily: F.lux, fontSize: 70, lineHeight: 1, color: C.primary }}>
            <Chars text={d.bride} t={t} start={4.55} stagger={0.07} dur={0.9} ease={(x) => clamp01(spring(x * 0.9, { freq: 1.6, damping: 6 }))} from={{ y: 260, rot: 25, opacity: 0 }} order="end" />
          </L>

          <Divider t={t} start={5.3} cx={cx} y={442} />
          <L style={{ left: cx - 120, top: 470, width: 240, padding: '10px 0', textAlign: 'center', background: C.pattern, border: `1px solid ${C.secondary}`, opacity: k(t, 5.6, 6.0, 0, 1), transform: `translateY(${k(t, 5.6, 6.1, 14, 0, E.outExpo)}px)` }}>
            <div style={{ fontFamily: F.body, fontSize: 9, letterSpacing: '0.2em', color: C.primary }}>DEAR GUEST,</div>
            <div style={{ fontFamily: F.lux, fontSize: 18, color: C.text, marginTop: 2 }}>{d.guest}</div>
          </L>
        </div>
      )}

      {/* ================= C ================= */}
      {sceneC && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 6.6, 6.8, 0, 1) * k(t, 9.8, 10.0, 1, 0) }}>
          {(() => {
            const fw = 232, fh = 300, fx = cx - fw / 2, fy = 120;
            const l1 = E.snap(seg(t, 6.6, 7.15));
            const l2 = E.snap(seg(t, 6.8, 7.35));
            const l3 = seg(t, 7.0, 7.8);
            const split = E.inOutExpo(seg(t, 7.35, 8.2));
            return (
              <>
                {/* Lapisan 1: bingkai tebal */}
                <L style={{ left: fx - 16, top: fy - 16, width: fw + 32, height: fh + 32, background: C.secondary, border: `1px solid ${C.primary}`, transform: `scale(${l1})`, boxShadow: '0 30px 60px -30px rgba(35,54,77,0.6)' }} />
                {/* Lapisan 2: matting */}
                <L style={{ left: fx - 4, top: fy - 4, width: fw + 8, height: fh + 8, background: C.bg, transform: `scale(${l2})` }} />
                {/* Lapisan 3: garis dalam (trim) */}
                <Trim viewBox={`0 0 ${fw} ${fh}`} d={`M${fw / 2} 0 H${fw} V${fh} H0 V0 Z`} len={2 * (fw + fh)} end={l3} stroke={C.secondary} width={2} cap="butt" style={{ left: fx, top: fy, width: fw, height: fh }} />
                {/* Foto: terbuka dari tengah seperti tirai */}
                <L style={{ left: fx + 6, top: fy + 6, width: fw - 12, height: fh - 12, overflow: 'hidden', clipPath: `inset(0 ${50 - split * 50}% 0 ${50 - split * 50}%)` }}>
                  <Photo src={d.photos.couple} t={t} a={7.5} b={10} s0={1.3} s1={1.06} />
                  <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 50px rgba(0,0,0,0.75)' }} />
                </L>
              </>
            );
          })()}

          {/* Tanggal slot-machine */}
          <L style={{ left: col, width: 360, top: 462, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <span style={{ width: 48 * k(t, 8.3, 8.9, 0, 1, E.outExpo), height: 1, background: C.secondary }} />
            <Slot text={`${d.day} . ${d.monthNum} . ${d.year}`} t={t} start={8.2} style={{ fontFamily: F.grand, fontWeight: 700, fontSize: 17, color: C.primary, letterSpacing: '0.12em' }} />
            <span style={{ width: 48 * k(t, 8.3, 8.9, 0, 1, E.outExpo), height: 1, background: C.secondary }} />
          </L>
          <L style={{ left: col, width: 360, top: 506, textAlign: 'center', fontFamily: F.lux, fontStyle: 'italic', fontSize: 16, color: C.text, opacity: k(t, 8.9, 9.3, 0, 1) }}>
            {d.dateLong}
          </L>
        </div>
      )}

      {/* ================= D ================= */}
      {sceneD && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 9.8, 10.05, 0, 1) * k(t, 13.4, 13.5, 1, 0), transform: `translateY(${k(t, 13.3, 13.5, 0, -80, E.inCubic)}px)` }}>
          <L style={{ left: col, width: 360, top: 56, textAlign: 'center', fontFamily: F.lux, fontSize: 34, color: C.primary }}>
            <Chars text="The Couple" t={t} start={9.9} stagger={0.03} mask from={{ yPct: 110 }} />
          </L>
          <Divider t={t} start={10.15} cx={cx} y={114} w={40} />

          {(() => {
            const flip = E.inOutExpo(seg(t, 10.85, 11.35));
            const deg = flip * 180;
            const showBride = deg > 90;
            const p = showBride
              ? { name: d.brideFull, role: 'THE BRIDE', parents: `Putri dari ${d.brideParents}`, photo: d.photos.bride, s: 11.2 }
              : { name: d.groomFull, role: 'THE GROOM', parents: `Putra dari ${d.groomParents}`, photo: d.photos.groom, s: 10.0 };
            const enter = (tt: number) => (showBride ? 0 : kf(tt, [[10.0, -W, E.whip], [10.4, 0]]));
            const v = velocity(enter, t, speed);
            return (
              <div
                style={{
                  position: 'absolute',
                  left: cx - 150,
                  top: 140,
                  width: 300,
                  height: 420,
                  perspective: 900,
                }}
              >
                <MotionBlurDefs id="bl-mb-in" x={Math.abs(v) / 180} y={0} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    transform: `translateX(${enter(t)}px) rotateY(${showBride ? deg - 180 : deg}deg)`,
                    filter: mbFilter('bl-mb-in', v / 180, 0),
                  }}
                >
                  {/* oval potret, cincin ganda berputar */}
                  <div style={{ position: 'absolute', left: 150 - 86, top: 0, width: 172, height: 222 }}>
                    <svg viewBox="0 0 172 222" width={172} height={222} style={{ position: 'absolute', inset: 0, transform: `rotate(${t * 6}deg)` }} aria-hidden>
                      <ellipse cx="86" cy="111" rx="84" ry="109" fill="none" stroke={C.secondary} strokeWidth="1" strokeDasharray="2 5" />
                    </svg>
                    <div style={{ position: 'absolute', left: 8, top: 8, width: 156, height: 206, borderRadius: '50%', border: `3px solid ${C.secondary}`, padding: 4, background: '#fff' }}>
                      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                        <Photo src={p.photo} t={t} a={p.s} b={p.s + 2.4} s0={1.3} s1={1.06} pos="center 30%" />
                      </div>
                    </div>
                  </div>
                  <L style={{ left: 0, width: 300, top: 244, textAlign: 'center', fontFamily: F.lux, fontSize: 24, color: C.primary }}>
                    <Chars key={p.role} text={p.name} t={t} start={p.s + 0.3} stagger={0.02} mask from={{ yPct: 110 }} />
                  </L>
                  <L style={{ left: 0, width: 300, top: 284, textAlign: 'center', fontFamily: F.grand, fontSize: 10, color: C.text, letterSpacing: `${k(t, p.s + 0.4, p.s + 1.2, 0.8, 0.3, E.outQuint)}em`, opacity: k(t, p.s + 0.4, p.s + 0.7, 0, 1) }}>
                    {p.role}
                  </L>
                  <L style={{ left: 20, width: 260, top: 312, textAlign: 'center', fontFamily: F.lux, fontStyle: 'italic', fontSize: 12.5, lineHeight: 1.6, color: C.text, opacity: k(t, p.s + 0.6, p.s + 1.0, 0, 1) }}>
                    {p.parents}
                  </L>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= E ================= */}
      {sceneE && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 13.35, 13.45, 0, 1) }}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateY(${camY(t)}px)`, filter: mbFilter('bl-mb-cam', 0, vCam / 160) }}>
            <L style={{ left: col, width: 360, top: 50, textAlign: 'center', fontFamily: F.lux, fontSize: 34, color: C.primary }}>
              <Chars text="Order of Events" t={t} start={13.4} stagger={0.025} mask from={{ yPct: 110 }} />
            </L>
            {/* garis waktu */}
            <L style={{ left: cx - 0.5, top: 112, width: 1, height: 620 * k(t, 13.45, 15.0, 0, 1, E.inOutCubic), background: C.secondary }} />
            {d.events.slice(0, 2).map((ev, i) => {
              const s = 13.55 + i * 1.15;
              const y = 130 + i * 300;
              return (
                <React.Fragment key={ev.title}>
                  <L style={{ left: cx - 6, top: y, width: 12, height: 12, borderRadius: 999, background: C.bg, border: `2px solid ${C.primary}`, transform: `scale(${E.outBack(seg(t, s, s + 0.4))})` }} />
                  <L style={{ left: col, width: 360, top: y + 26, textAlign: 'center', fontFamily: F.grand, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: `${k(t, s + 0.1, s + 0.9, 0.7, 0.3, E.outQuint)}em`, opacity: k(t, s + 0.1, s + 0.4, 0, 1) }}>
                    {i === 0 ? '♛  CEREMONY' : '◆  RECEPTION'}
                  </L>
                  <L style={{ left: col, width: 360, top: y + 48, textAlign: 'center', fontFamily: F.lux, fontSize: 30, color: C.text, background: C.bg }}>
                    <Chars text={ev.title} t={t} start={s + 0.2} stagger={0.025} mask from={{ yPct: 110 }} />
                  </L>
                  <L style={{ left: col, width: 360, top: y + 92, textAlign: 'center', fontFamily: F.body, fontSize: 12, color: C.text, opacity: k(t, s + 0.45, s + 0.8, 0, 1), background: C.bg }}>
                    {ev.date} | {ev.time}
                  </L>
                  <L style={{ left: cx - 140, top: y + 120, width: 280, padding: '12px 14px', background: C.pattern, border: `1px solid ${C.secondary}`, fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.text, textAlign: 'center', transform: `translateY(${k(t, s + 0.6, s + 1.1, 20, 0, E.outExpo)}px)`, opacity: k(t, s + 0.6, s + 0.9, 0, 1) }}>
                    {ev.venue}
                  </L>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= F ================= */}
      {sceneF && (
        <>
          <Curtain side="left" W={W} H={H} open={closeOpen} />
          <Curtain side="right" W={W} H={H} open={closeOpen} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, color: '#fff' }}>
            <L style={{ left: cx - 40, top: 150 + (1 - spring(t - 17.2, { freq: 1.2, damping: 4.5 })) * -260, width: 80 }}>
              <Crown size={80} />
            </L>
            <L style={{ left: 0, width: W, top: 252, textAlign: 'center', fontFamily: F.lux, fontSize: 52, lineHeight: 1.05, color: '#fff' }}>
              <Chars text={d.groom} t={t} start={17.45} stagger={0.05} mask from={{ yPct: 110 }} />
            </L>
            <L style={{ left: 0, width: W, top: 312, textAlign: 'center', fontFamily: F.lux, fontStyle: 'italic', fontSize: 30, color: C.secondary, opacity: k(t, 17.6, 17.9, 0, 1) }}>&amp;</L>
            <L style={{ left: 0, width: W, top: 350, textAlign: 'center', fontFamily: F.lux, fontSize: 52, lineHeight: 1.05, color: '#fff' }}>
              <Chars text={d.bride} t={t} start={17.6} stagger={0.05} mask from={{ yPct: 110 }} />
            </L>
            <L style={{ left: 0, width: W, top: 436, textAlign: 'center', fontFamily: F.grand, fontSize: 13, fontWeight: 700, letterSpacing: `${k(t, 17.9, 18.8, 0.6, 0.3, E.outQuint)}em`, color: '#fff', opacity: k(t, 17.9, 18.2, 0, 1) }}>
              {`${d.day} . ${d.monthNum} . ${d.year}`}
            </L>
            <L style={{ left: cx - 110, top: 478, width: 220, padding: '11px 0', textAlign: 'center', background: '#fff', color: C.primary, fontFamily: F.grand, fontSize: 10, letterSpacing: '0.15em', transform: `scale(${E.outBack(seg(t, 18.2, 18.6))})` }}>
              {d.slug.toUpperCase()}
            </L>
          </div>
        </>
      )}

      {/* ================= A (di atas segalanya saat aktif) ================= */}
      {sceneA && (
        <>
          {/* Cahaya di balik celah tirai */}
          <div style={{ position: 'absolute', left: cx - 2 - seam * 30, top: 0, width: 4 + seam * 60, height: H, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)', zIndex: 21, opacity: seam * (1 - curtainOpen), filter: 'blur(2px)' }} />
          <Curtain side="left" W={W} H={H} open={curtainOpen} blurId={mbFilter('bl-mb-cur', vCurtain / 180, 0)} />
          <Curtain side="right" W={W} H={H} open={curtainOpen} blurId={mbFilter('bl-mb-cur', vCurtain / 180, 0)} />
          {/* banjir cahaya saat tirai tersibak */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 22, background: '#fff', opacity: Math.max(0, 1 - Math.abs(t - 2.85) / 0.35) * 0.85 }} />
          {/* tali + mahkota + plakat OPEN */}
          <div style={{ position: 'absolute', left: cx - 70, top: crownY(t) + crownLift, width: 140, height: 200, zIndex: 25, transformOrigin: '50% -300px', transform: `rotate(${swing * 0.15}deg)` }}>
            <L style={{ left: 69, top: -300, width: 2, height: 330, background: C.secondary }} />
            <L style={{ left: 30, top: 18 }}>
              <Crown size={80} />
            </L>
            <svg viewBox="0 0 100 20" width={170} height={20} style={{ position: 'absolute', left: -15, top: 88 }} preserveAspectRatio="none" aria-hidden>
              <path d="M0 10 Q50 15 100 10" fill="none" stroke={C.secondary} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <L style={{ left: 24, top: 108, width: 92, padding: '10px 0', textAlign: 'center', background: C.bg, border: `1px solid ${C.secondary}`, fontFamily: F.grand, fontSize: 11, letterSpacing: '0.3em', color: C.primary, boxShadow: '0 10px 24px -10px rgba(0,0,0,0.6)', transform: `rotate(${swing}deg) scale(${kf(t, [[1.9, 1], [2.0, 0.9, E.outCubic], [2.2, 1.05, E.outBack], [2.3, 1]])})`, transformOrigin: '50% -10px' }}>
              OPEN
            </L>
          </div>
        </>
      )}
    </div>
  );
}
