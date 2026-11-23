'use client';

/**
 * JAVANESE CLASSIC — dipentaskan seperti pagelaran wayang kulit.
 * 1:1 dengan template: latar #F8F0DF + batik kawung, gunungan, aksara Jawa,
 * Philosopher / Gelasio / Montserrat, bunga emas (flower.webp), panel bersudut.
 *
 * Babak (waktu komposisi):
 *  A 0.0–3.3   Blencong menyala, bayang gunungan di kelir, kayon diputar (kayonan)
 *  B 3.3–6.6   Aksara ꦥꦮꦶꦮꦲꦤ꧀ ditulis, sampul undangan, tombol "Mlebet Undangan" ditekan
 *  C 6.6–9.9   Sugeng Rawuh: bunga berputar masuk, foto berbingkai, nama raksasa
 *  D 9.9–13.3  Sang Penganten: kartu mempelai, whip-pan pria → wanita
 *  E 13.3–16.6 Pahargyan: tanggal raksasa + kartu acara bertumpuk
 *  F 16.6–19.4 Galeri bergulir lalu "tancep kayon" — penutup pagelaran
 */

import React from 'react';
import { Chars, E, FilmProps, k, kf, L, MotionBlurDefs, mbFilter, Photo, seg, spring, Trim, velocity, clamp01, lerp } from './core';

export const JAVANESE_COMP_DUR = 19.4;
export const JAVANESE_SPEED = [
  { from: 1.25, to: 2.35, speed: 0.55 }, // slow-mo: gunungan melayang
  { from: 2.55, to: 3.35, speed: 2.4 }, // kayonan whip
  { from: 3.7, to: 4.75, speed: 0.7 }, // aksara ditulis pelan
  { from: 6.05, to: 6.7, speed: 2.3 }, // keluar sampul
  { from: 7.95, to: 8.35, speed: 2.2 }, // nama melesat
  { from: 8.35, to: 9.3, speed: 0.5 }, // slow-mo nama mendarat
  { from: 11.35, to: 11.8, speed: 2.8 }, // whip-pan ke mempelai wanita
  { from: 16.6, to: 17.35, speed: 2.1 }, // galeri ngebut
  { from: 17.35, to: 17.9, speed: 0.6 },
];

const C = {
  bg: '#F8F0DF',
  pattern: '#EBDFC5',
  surface: '#F1E4CB',
  primary: '#8A452C',
  secondary: '#C59C62',
  text: '#493021',
};
const F = {
  title: "'Philosopher', Georgia, serif",
  body: "'Gelasio', Georgia, serif",
  modern: "'Montserrat', system-ui, sans-serif",
  aksara: "'Noto Sans Javanese', serif",
};
const GUNUNGAN = '/assets/video-sample/gunungan.webp';
const FLOWER = '/assets/video-sample/flower.webp';
const G_RATIO = 800 / 469;

function Kawung({ W, H, opacity = 0.5 }: { W: number; H: number; opacity?: number }) {
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity }} aria-hidden>
      <defs>
        <pattern id="jv-kawung" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M20 0 C30 10 30 30 20 40 C10 30 10 10 20 0 Z" fill="none" stroke={C.primary} strokeWidth="0.5" opacity="0.3" />
          <path d="M0 20 C10 10 30 10 40 20 C30 30 10 30 0 20 Z" fill="none" stroke={C.primary} strokeWidth="0.5" opacity="0.3" />
          <circle cx="20" cy="20" r="2" fill={C.primary} opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jv-kawung)" />
    </svg>
  );
}

/** Sudut bingkai khas template (javanese-border) — digambar dengan trim path. */
function Brackets({ w, h, p, color = C.primary }: { w: number; h: number; p: number; color?: string }) {
  return (
    <>
      <Trim viewBox="0 0 34 34" d="M2 34 V2 H34" len={64} end={p} stroke={color} width={2} cap="butt" style={{ left: -6, top: -6, width: 34, height: 34 }} />
      <Trim viewBox="0 0 34 34" d="M32 0 V32 H0" len={64} end={p} stroke={color} width={2} cap="butt" style={{ left: w - 28, top: h - 28, width: 34, height: 34 }} />
    </>
  );
}

function Flower({ x, y, size, t, start, spin = 1 }: { x: number; y: number; size: number; t: number; start: number; spin?: number }) {
  const s = spring(t - start, { freq: 0.9, damping: 3.2 });
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FLOWER}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        objectFit: 'contain',
        opacity: 0.85 * clamp01(s * 1.4),
        transform: `rotate(${lerp(-180, 0, clamp01(s)) + t * 8 * spin}deg) scale(${Math.max(0, s)})`,
        filter: 'drop-shadow(0 0 15px rgba(73,48,33,0.35))',
      }}
    />
  );
}

export default function JavaneseFilm({ t, speed, W, H, d }: FilmProps) {
  const cx = W / 2;
  const col = cx - 180;
  const gW = 210;
  const gH = gW * G_RATIO;

  // ---------------- A: Blencong & kayonan ----------------
  const gRise = (tt: number) => kf(tt, [[0.15, 460, E.whip], [0.8, 0, E.inOutCubic], [2.5, -10]]);
  const gY = gRise(t);
  const gVy = velocity(gRise, t, speed);
  // Kayonan: gunungan diputar (scaleX = cos) dua kali, lalu menerkam kamera
  const spinP = E.snap(seg(t, 2.5, 3.2));
  const flip = Math.cos(spinP * Math.PI * 4);
  const gZoom = k(t, 2.95, 3.35, 1, 9, E.inExpo);
  // Kayon "digetarkan" dalang selama slow-mo: goyang + geser + kamera mendorong pelan
  const trembleEnv = seg(t, 0.75, 1.1) * (1 - seg(t, 2.35, 2.55));
  const sway = (Math.sin(t * 1.6) * 1.6 + Math.sin(t * 6.5) * 4.5 * trembleEnv) * (1 - spinP);
  const gX = Math.sin(t * 2.2) * 14 * trembleEnv;
  const push = k(t, 0.8, 2.5, 1, 1.12, E.inOutCubic);
  const lamp = 0.82 + Math.sin(t * 9.3) * 0.05 + Math.sin(t * 23.1) * 0.03; // nyala api blencong

  // ---------------- B: aksara + sampul ----------------
  const aksaraWrite = seg(t, 3.4, 4.75);
  const coverExit = E.inExpo(seg(t, 6.05, 6.6));
  const pressed = kf(t, [[5.7, 1], [5.82, 0.93, E.outCubic], [6.0, 1.02, E.outBack], [6.1, 1]]);

  // ---------------- C: nama raksasa ----------------
  const rianX = (tt: number) => kf(tt, [[7.95, -W - 40, E.whip], [8.35, -18, E.outCubic], [9.3, -4, E.linear], [9.75, -W, E.inExpo]]);
  const salsaX = (tt: number) => kf(tt, [[8.05, W + 40, E.whip], [8.45, 14, E.outCubic], [9.3, 4, E.linear], [9.75, W, E.inExpo]]);
  const vR = velocity(rianX, t, speed);
  const vS = velocity(salsaX, t, speed);

  // ---------------- D: whip-pan mempelai ----------------
  const pan = (tt: number) => k(tt, 11.35, 11.8, 0, -W, E.snap);
  const panX = pan(t);
  const vPan = velocity(pan, t, speed);

  // ---------------- F: galeri ----------------
  const galY = (tt: number) => k(tt, 16.5, 17.95, 120, -720, E.inOutCubic);
  const vGal = velocity(galY, t, speed);

  const nameSize = (name: string) => Math.min(132, 340 / Math.max(3, name.length * 0.5));
  const echo = (fn: (tt: number) => number, i: number) => fn(t - i * 0.035);

  const sceneA = t < 3.4;
  const sceneB = t >= 3.25 && t < 6.7;
  const sceneC = t >= 6.3 && t < 9.95;
  const sceneD = t >= 9.8 && t < 13.4;
  const sceneE = t >= 13.25 && t < 16.7;
  const sceneF = t >= 16.5;

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, color: C.text, overflow: 'hidden' }}>
      <MotionBlurDefs id="jv-mb-g" x={0} y={Math.abs(gVy) / 260} />
      <MotionBlurDefs id="jv-mb-r" x={Math.abs(vR) / 220} y={0} />
      <MotionBlurDefs id="jv-mb-s" x={Math.abs(vS) / 220} y={0} />
      <MotionBlurDefs id="jv-mb-pan" x={Math.abs(vPan) / 160} y={0} />
      <MotionBlurDefs id="jv-mb-gal" x={0} y={Math.abs(vGal) / 200} />

      {/* Kelir: batik kawung muncul dengan radial wipe */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: `radial-gradient(circle at 50% 46%, #000 ${k(t, 0, 1.6, 0, 70, E.outCubic)}%, transparent ${k(t, 0, 1.6, 10, 95, E.outCubic)}%)`,
          maskImage: `radial-gradient(circle at 50% 46%, #000 ${k(t, 0, 1.6, 0, 70, E.outCubic)}%, transparent ${k(t, 0, 1.6, 10, 95, E.outCubic)}%)`,
        }}
      >
        <Kawung W={W} H={H} />
      </div>

      {/* ================= A ================= */}
      {sceneA && (
        <>
          {/* Cahaya blencong */}
          <div
            style={{
              position: 'absolute',
              left: cx - 260,
              top: 20,
              width: 520,
              height: 520,
              borderRadius: 999,
              background: `radial-gradient(circle, rgba(255,214,150,${0.55 * lamp}) 0%, rgba(255,214,150,0) 65%)`,
              opacity: k(t, 0.1, 0.9, 0, 1),
            }}
          />
          {/* Tipografi latar: aksara raksasa bergaris, bergeser pelan */}
          <L style={{ left: 0, width: W, top: 140, textAlign: 'center', fontFamily: F.aksara, fontSize: 150, lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px ${C.secondary}`, whiteSpace: 'nowrap', opacity: k(t, 0.3, 1.2, 0, 0.55) * k(t, 2.5, 2.8, 1, 0), transform: `translateX(${k(t, 0, 3.2, 70, -70, E.linear)}px)` }}>
            ꦥꦮꦶꦮꦲꦤ꧀
          </L>
          <L style={{ left: 0, width: W, top: 330, textAlign: 'center', fontFamily: F.aksara, fontSize: 150, lineHeight: 1, color: 'transparent', WebkitTextStroke: `1px ${C.secondary}`, whiteSpace: 'nowrap', opacity: k(t, 0.5, 1.4, 0, 0.35) * k(t, 2.5, 2.8, 1, 0), transform: `translateX(${k(t, 0, 3.2, -90, 50, E.linear)}px)` }}>
            ꦥꦮꦶꦮꦲꦤ꧀
          </L>
          {/* Bayang gunungan di kelir (bergeser mengikuti nyala lampu) */}
          <div
            style={{
              position: 'absolute',
              left: cx - gW / 2 + 16 + Math.sin(t * 9.3) * 2 + gX * 1.6,
              top: 118 + gY + 10,
              width: gW,
              height: gH,
              transform: `scaleX(${flip}) scale(${1.06 * gZoom * push}) rotate(${sway * 1.3}deg)`,
              transformOrigin: '50% 60%',
              filter: 'blur(5px) brightness(0)',
              opacity: 0.18,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GUNUNGAN} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: cx - gW / 2 + gX,
              top: 118 + gY,
              width: gW,
              height: gH,
              transform: `scaleX(${flip}) scale(${gZoom * push}) rotate(${sway}deg)`,
              transformOrigin: '50% 60%',
              filter: [mbFilter('jv-mb-g', 0, gVy), 'sepia(0.5) saturate(0.7) drop-shadow(0 4px 6px rgba(73,48,33,0.12))'].filter(Boolean).join(' '),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GUNUNGAN} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {/* Tangkai cempurit */}
          <L
            style={{
              left: cx - 1.5 + gX,
              top: 118 + gY + gH - 6,
              transform: `rotate(${sway}deg)`,
              transformOrigin: '50% 0%',
              width: 3,
              height: 160,
              background: `linear-gradient(${C.text}, ${C.text}00)`,
              opacity: 0.55 * (1 - seg(t, 2.6, 2.9)),
            }}
          />
          <L style={{ left: col, width: 360, top: 548, textAlign: 'center', fontFamily: F.modern, fontSize: 10, letterSpacing: `${k(t, 0.6, 2.2, 0.8, 0.42, E.outQuint)}em`, color: C.primary, opacity: k(t, 0.6, 1.2, 0, 1) * k(t, 2.4, 2.7, 1, 0) }}>
            PAHARGYAN PAWIWAHAN
          </L>
        </>
      )}

      {/* Menembus tubuh gunungan: warna wayang kulit menutup layar, lalu iris ke sampul */}
      {t > 2.95 && t < 3.8 && (
        <div style={{ position: 'absolute', inset: 0, background: '#3A2418', opacity: k(t, 2.95, 3.2, 0, 1, E.inCubic) }} />
      )}

      {/* ================= B ================= */}
      {sceneB && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `scale(${1 + coverExit * 0.5})`,
            filter: coverExit > 0.02 ? `blur(${coverExit * 20}px)` : undefined,
            opacity: 1 - coverExit,
            clipPath: t < 3.75 ? `circle(${k(t, 3.25, 3.75, 0, 120, E.outExpo)}% at 50% 48%)` : undefined,
            background: C.bg,
          }}
        >
          <Kawung W={W} H={H} />
          {t < 3.8 && (
            <div style={{ position: 'absolute', left: cx - 400, top: 307 - 400, width: 800, height: 800, borderRadius: 999, border: `3px solid ${C.secondary}`, transform: `scale(${k(t, 3.25, 3.75, 0, 1, E.outExpo)})`, opacity: k(t, 3.55, 3.8, 1, 0) }} />
          )}
          {/* Gunungan kecil kembali tegak (sampul template) */}
          <div
            style={{
              position: 'absolute',
              left: cx - 70,
              top: k(t, 4.4, 5.0, 40, 70, E.outCubic),
              width: 140,
              height: 140 * G_RATIO,
              opacity: k(t, 4.4, 4.9, 0, 1),
              transform: `scale(${k(t, 4.4, 5.0, 0.6, 0.62, E.outBack)}) rotate(${Math.sin(t * 1.4) * 1}deg)`,
              transformOrigin: '50% 0%',
              filter: 'sepia(0.5) saturate(0.7)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GUNUNGAN} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Aksara ditulis (brush wipe) lalu mengecil ke posisi judul */}
          {(() => {
            const shrink = E.snap(seg(t, 4.85, 5.3));
            const size = lerp(64, 30, shrink);
            const y = lerp(250, 222, shrink);
            const edge = aksaraWrite * 120 - 10;
            return (
              <L style={{ left: 0, width: W, top: y, textAlign: 'center', fontFamily: F.aksara, fontSize: size, lineHeight: 1.2, color: C.primary, whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    display: 'inline-block',
                    WebkitMaskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 12}%)`,
                    maskImage: `linear-gradient(90deg, #000 ${edge}%, transparent ${edge + 12}%)`,
                  }}
                >
                  ꦥꦮꦶꦮꦲꦤ꧀
                </span>
              </L>
            );
          })()}

          <L style={{ left: 0, width: W, top: 268, textAlign: 'center', fontFamily: F.title, fontSize: 38, lineHeight: 1.1, color: C.primary, whiteSpace: 'nowrap' }}>
            <Chars text={`${d.groom} & ${d.bride}`} t={t} start={5.05} stagger={0.03} dur={0.7} mask from={{ yPct: 110 }} ease={E.outExpo} />
          </L>

          <Trim viewBox="0 0 300 2" d="M150 1 H0" len={150} end={k(t, 5.2, 5.8, 0, 1, E.outExpo)} stroke={`${C.primary}55`} width={1} style={{ left: cx - 150, top: 330, width: 300, height: 2 }} />
          <Trim viewBox="0 0 300 2" d="M150 1 H300" len={150} end={k(t, 5.2, 5.8, 0, 1, E.outExpo)} stroke={`${C.primary}55`} width={1} style={{ left: cx - 150, top: 330, width: 300, height: 2 }} />
          <L style={{ left: col, width: 360, top: 346, textAlign: 'center', fontFamily: F.modern, fontSize: 9.5, letterSpacing: '0.18em', color: C.text, opacity: k(t, 5.3, 5.6, 0, 1) }}>
            KATUR DUMATENG BPK/IBU/SDR/I:
          </L>
          <L style={{ left: col, width: 360, top: 366, textAlign: 'center', fontFamily: F.title, fontSize: 22, color: C.text, opacity: k(t, 5.35, 5.7, 0, 1), transform: `translateY(${k(t, 5.35, 5.8, 8, 0, E.outExpo)}px)` }}>
            {d.guest}
          </L>
          <Trim viewBox="0 0 300 2" d="M0 1 H300" len={300} end={k(t, 5.3, 5.9, 0, 1, E.outExpo)} stroke={`${C.primary}55`} width={1} style={{ left: cx - 150, top: 406, width: 300, height: 2 }} />

          {/* Tombol Mlebet Undangan ditekan */}
          <L
            style={{
              left: cx - 92,
              top: 430,
              width: 184,
              height: 40,
              borderRadius: 4,
              background: C.primary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: F.modern,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              transform: `scale(${spring(t - 5.4, { freq: 1.6, damping: 6 }) * pressed})`,
              boxShadow: '0 10px 20px -10px rgba(73,48,33,0.6)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden>
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            MLEBET UNDANGAN
            {t > 5.8 && (
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 4,
                  border: `2px solid ${C.secondary}`,
                  transform: `scale(${k(t, 5.8, 6.3, 1, 1.5, E.outCubic)})`,
                  opacity: k(t, 5.8, 6.3, 0.9, 0),
                }}
              />
            )}
          </L>
        </div>
      )}

      {/* ================= C ================= */}
      {sceneC && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 6.3, 6.6, 0, 1) * k(t, 9.7, 9.95, 1, 0) }}>
          <Flower x={col + 10} y={60} size={250} t={t} start={6.35} />
          <Flower x={col + 360} y={H - 70} size={280} t={t} start={6.5} spin={-1} />

          <L style={{ left: col, width: 360, top: 46, textAlign: 'center', fontFamily: F.aksara, fontSize: 30, color: C.primary }}>
            <Chars text="ꦱꦸꦒꦼꦁꦫꦮꦸꦃ" t={t} start={6.75} stagger={0.05} dur={0.8} from={{ blur: 10, opacity: 0, y: 14 }} />
          </L>
          <L style={{ left: col, width: 360, top: 96, textAlign: 'center', fontFamily: F.title, fontSize: 20, color: C.primary }}>
            <Chars text="Sugeng Rawuh" t={t} start={6.95} stagger={0.03} from={{ blur: 8, opacity: 0, y: 10 }} />
          </L>

          {/* Nama raksasa: pria DI BELAKANG foto, dengan echo saat melesat */}
          {[3, 2, 1, 0].map((e) => (
            <L
              key={e}
              style={{
                left: 0,
                width: W,
                top: 112,
                textAlign: 'center',
                fontFamily: F.title,
                fontSize: nameSize(d.groom),
                lineHeight: 1,
                color: e ? 'transparent' : C.primary,
                WebkitTextStroke: e ? `1px ${C.primary}` : undefined,
                opacity: e ? 0.5 / e * clamp01(Math.abs(vR) / 400) : 1,
                transform: `translateX(${echo(rianX, e)}px)`,
                filter: e ? undefined : mbFilter('jv-mb-r', vR / 220, 0),
                whiteSpace: 'nowrap',
              }}
            >
              {d.groom}
            </L>
          ))}

          {/* Foto berbingkai (slideUpPop) */}
          {(() => {
            const pop = spring(t - 7.15, { freq: 1.1, damping: 5 });
            const w = 196, h = 236;
            return (
              <L style={{ left: cx - w / 2, top: 214, width: w, height: h, transform: `translateY(${(1 - pop) * 70}px) scale(${0.95 + 0.05 * pop})`, opacity: clamp01(pop * 1.5) }}>
                <div style={{ position: 'absolute', inset: 0, padding: 8, background: C.surface, boxShadow: '0 20px 40px -24px rgba(73,48,33,0.7)' }}>
                  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 2 }}>
                    <Photo src={d.photos.couple} t={t} a={7.1} b={9.9} s0={1.25} s1={1.05} y0={4} y1={0} />
                  </div>
                </div>
                <Brackets w={w} h={h} p={k(t, 7.5, 8.2, 0, 1, E.outCubic)} />
              </L>
            );
          })()}

          {/* "&" lalu Salsa DI DEPAN foto */}
          <L style={{ left: 0, width: W, top: 392, textAlign: 'center', fontFamily: F.body, fontStyle: 'italic', fontSize: 50, color: C.secondary, transform: `scale(${spring(t - 8.25, { freq: 1.4, damping: 4.5 })})` }}>
            &amp;
          </L>
          {[3, 2, 1, 0].map((e) => (
            <L
              key={e}
              style={{
                left: 0,
                width: W,
                top: 440,
                textAlign: 'center',
                fontFamily: F.title,
                fontSize: nameSize(d.bride),
                lineHeight: 1,
                color: e ? 'transparent' : C.primary,
                WebkitTextStroke: e ? `1px ${C.primary}` : undefined,
                opacity: e ? 0.5 / e * clamp01(Math.abs(vS) / 400) : 1,
                transform: `translateX(${echo(salsaX, e)}px)`,
                filter: e ? undefined : mbFilter('jv-mb-s', vS / 220, 0),
                whiteSpace: 'nowrap',
                textShadow: e ? undefined : '0 2px 0 rgba(248,240,223,0.6)',
              }}
            >
              {d.bride}
            </L>
          ))}
        </div>
      )}

      {/* ================= D ================= */}
      {sceneD && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 9.8, 10.05, 0, 1) * k(t, 13.15, 13.4, 1, 0) }}>
          <L style={{ left: col, width: 360, top: 40, textAlign: 'center', fontFamily: F.aksara, fontSize: 28, color: C.primary }}>
            <Chars text="ꦥꦔꦤ꧀ꦠꦺꦤ꧀" t={t} start={9.9} stagger={0.05} from={{ blur: 8, opacity: 0, y: 12 }} />
          </L>
          <L style={{ left: col, width: 360, top: 86, textAlign: 'center', fontFamily: F.title, fontSize: 25, color: C.primary }}>
            <Chars text="SANG PENGANTEN" t={t} start={10.0} stagger={0.025} mask from={{ yPct: 110 }} style={{ letterSpacing: '0.12em' }} />
          </L>
          <Trim viewBox="0 0 240 2" d="M0 1 H240" len={240} end={k(t, 10.2, 10.8, 0, 1, E.outExpo)} stroke={C.primary} width={1} style={{ left: cx - 120, top: 126, width: 240, height: 2 }} />

          <div style={{ position: 'absolute', left: 0, top: 0, width: W * 2, height: H, transform: `translateX(${panX}px)`, filter: mbFilter('jv-mb-pan', vPan / 160, 0) }}>
            {[
              { who: 'groom', name: d.groomFull, label: 'KAKUNG SAKING', parents: d.groomParents, photo: d.photos.groom, start: 10.3, x: cx },
              { who: 'bride', name: d.brideFull, label: 'PUTRI SAKING', parents: d.brideParents, photo: d.photos.bride, start: 11.65, x: cx + W },
            ].map((p) => {
              const pop = spring(t - p.start, { freq: 1.1, damping: 5.5 });
              const w = 300, h = 360;
              return (
                <L key={p.who} style={{ left: p.x - w / 2, top: 158, width: w, height: h, transform: `translateY(${(1 - clamp01(pop)) * 60}px)` }}>
                  <div style={{ position: 'absolute', inset: 0, background: C.surface, border: `1px solid ${C.secondary}`, borderRadius: 4, boxShadow: '0 6px 20px rgba(73,48,33,0.08)' }} />
                  <Brackets w={w} h={h} p={k(t, p.start + 0.2, p.start + 0.8, 0, 1)} />
                  <div
                    style={{
                      position: 'absolute',
                      left: w / 2 - 62,
                      top: 26,
                      width: 124,
                      height: 124,
                      borderRadius: 999,
                      overflow: 'hidden',
                      border: `4px solid ${C.bg}`,
                      boxShadow: `0 0 0 2px ${C.primary}, 0 0 15px rgba(73,48,33,0.4)`,
                      clipPath: `circle(${k(t, p.start + 0.1, p.start + 0.7, 0, 50, E.snap)}% at 50% 50%)`,
                    }}
                  >
                    <Photo src={p.photo} t={t} a={p.start} b={p.start + 2.5} s0={1.35} s1={1.08} pos="center 30%" style={{ filter: 'sepia(0.3)' }} />
                  </div>
                  <L style={{ left: 10, width: w - 20, top: 170, textAlign: 'center', fontFamily: F.title, fontSize: 24, color: C.text }}>
                    <Chars text={p.name} t={t} start={p.start + 0.35} stagger={0.022} mask from={{ yPct: 110 }} />
                  </L>
                  <L style={{ left: 0, width: w, top: 214, textAlign: 'center', fontFamily: F.modern, fontSize: 9.5, letterSpacing: `${k(t, p.start + 0.5, p.start + 1.3, 0.6, 0.2, E.outQuint)}em`, color: C.primary, opacity: k(t, p.start + 0.5, p.start + 0.8, 0, 1) }}>
                    {p.label}
                  </L>
                  <L style={{ left: 24, width: w - 48, top: 240, textAlign: 'center', fontFamily: F.modern, fontSize: 11.5, lineHeight: 1.75, color: C.text, opacity: k(t, p.start + 0.65, p.start + 1.0, 0, 1) }}>
                    {p.parents}
                  </L>
                </L>
              );
            })}
            {/* & di sambungan pan */}
            <L style={{ left: cx + W / 2 - 30, top: 300, width: 60, textAlign: 'center', fontFamily: F.title, fontSize: 64, color: C.primary }}>&amp;</L>
          </div>
        </div>
      )}

      {/* ================= E ================= */}
      {sceneE && (
        <div style={{ position: 'absolute', inset: 0, opacity: k(t, 13.25, 13.5, 0, 1) * k(t, 16.45, 16.7, 1, 0) }}>
          <Flower x={col - 6} y={150} size={170} t={t} start={13.35} />
          <Flower x={col + 366} y={H - 120} size={220} t={t} start={13.5} spin={-1} />
          <L style={{ left: col, width: 360, top: 40, textAlign: 'center', fontFamily: F.aksara, fontSize: 28, color: C.primary }}>
            <Chars text="ꦥꦲꦂꦒꦾꦤ꧀" t={t} start={13.35} stagger={0.05} from={{ blur: 8, opacity: 0, y: 12 }} />
          </L>
          <L style={{ left: col, width: 360, top: 86, textAlign: 'center', fontFamily: F.title, fontSize: 25, color: C.primary, letterSpacing: '0.12em' }}>
            <Chars text="PAHARGYAN" t={t} start={13.45} stagger={0.03} mask from={{ yPct: 110 }} />
          </L>

          {/* Tanggal raksasa: hari "jatuh" per digit + bulan menyapu */}
          <L style={{ left: col, width: 360, top: 136, textAlign: 'center', fontFamily: F.body, fontStyle: 'italic', fontSize: 18, color: C.text, opacity: k(t, 13.7, 14.0, 0, 1) }}>
            {d.weekday}
          </L>
          <L style={{ left: col, width: 360, top: 150, textAlign: 'center', fontFamily: F.title, fontSize: 140, lineHeight: 1.1, color: C.primary }}>
            <Chars text={d.day} t={t} start={13.75} stagger={0.12} dur={0.9} ease={E.outBack} from={{ y: -120, rot: -12, opacity: 0 }} />
          </L>
          <L style={{ left: col, width: 360, top: 312, textAlign: 'center', fontFamily: F.modern, fontSize: 12, fontWeight: 500, letterSpacing: `${k(t, 14.1, 15.0, 0.9, 0.4, E.outQuint)}em`, color: C.text, opacity: k(t, 14.1, 14.4, 0, 1) }}>
            {`${d.month} ${d.year}`.toUpperCase()}
          </L>

          {/* Kartu acara bertumpuk */}
          {d.events.slice(0, 2).map((ev, i) => {
            const s = 14.45 + i * 0.75;
            const inP = spring(t - s, { freq: 1.2, damping: 5.5 });
            const w = 300;
            return (
              <L
                key={ev.title}
                style={{
                  left: cx - w / 2,
                  top: 352 + i * 14,
                  width: w,
                  height: 150,
                  transform: `translateY(${(1 - clamp01(inP)) * 260}px) rotate(${(1 - clamp01(inP)) * (i ? 6 : -6) + (i === 0 ? -1.5 * seg(t, s + 0.75, s + 1.2) : 0)}deg)`,
                  transformOrigin: '50% 100%',
                  opacity: clamp01(inP * 2),
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: C.surface, border: `1px solid ${C.secondary}`, borderRadius: 4, boxShadow: '0 14px 30px -18px rgba(73,48,33,0.6)' }} />
                <L style={{ left: 22, top: 18, padding: '5px 10px', background: C.primary, color: '#fff', fontFamily: F.body, fontSize: 11 }}>{i === 0 ? 'Ijab Kabul' : 'Pahargyan'}</L>
                <L style={{ left: 22, top: 50, fontFamily: F.title, fontSize: 22, color: C.text }}>{ev.title}</L>
                <L style={{ left: 22, top: 86, fontFamily: F.modern, fontSize: 11, color: C.text, display: 'flex', gap: 14 }}>
                  <span style={{ color: C.primary }}>◷</span> {ev.time}
                </L>
                <L style={{ left: 22, top: 110, right: 18, fontFamily: F.modern, fontSize: 10.5, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>
                  ⌖ {ev.venue}
                </L>
              </L>
            );
          })}
        </div>
      )}

      {/* ================= F ================= */}
      {sceneF && (
        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Galeri dua kolom bergulir berlawanan */}
          <div style={{ position: 'absolute', inset: 0, opacity: k(t, 16.5, 16.75, 0, 1) * k(t, 17.85, 18.1, 1, 0), filter: mbFilter('jv-mb-gal', 0, vGal / 200) }}>
            {[0, 1].map((c) => (
              <div key={c} style={{ position: 'absolute', left: cx - 158 + c * 166, top: 0, width: 150, transform: `translateY(${c ? -galY(t) - 560 : galY(t)}px)` }}>
                {d.photos.gallery.concat(d.photos.gallery).slice(c * 2, c * 2 + 6).map((src, i) => (
                  <div key={i} style={{ position: 'relative', width: 150, height: i % 2 ? 190 : 230, marginBottom: 16, padding: 5, background: C.surface, border: `1px solid ${C.secondary}`, overflow: 'hidden' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                      <Photo src={src} t={t} a={16.5} b={18} s0={1.12} s1={1.0} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <L style={{ left: col, width: 360, top: 280, textAlign: 'center' }}>
              <span style={{ display: 'inline-block', background: C.bg, padding: '10px 22px', fontFamily: F.title, fontSize: 26, color: C.primary, letterSpacing: '0.1em', boxShadow: `0 0 0 1px ${C.secondary}` }}>
                GALERI FOTO
              </span>
            </L>
          </div>

          {/* Tancep kayon: gunungan menancap di tengah = pagelaran usai */}
          {t > 17.75 && (
            <>
              {(() => {
                const drop = kf(t, [[17.85, -420, E.inExpo], [18.15, 0, E.linear]]);
                const shake = t > 18.15 ? Math.sin((t - 18.15) * 60) * 4 * Math.exp(-(t - 18.15) * 9) : 0;
                return (
                  <div
                    style={{
                      position: 'absolute',
                      left: cx - 70 + shake,
                      top: 70 + drop,
                      width: 140,
                      height: 140 * G_RATIO,
                      filter: 'sepia(0.5) saturate(0.7) drop-shadow(0 10px 12px rgba(73,48,33,0.3))',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={GUNUNGAN} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                );
              })()}
              <L style={{ left: col, width: 360, top: 318, textAlign: 'center', fontFamily: F.aksara, fontSize: 28, color: C.primary }}>
                <Chars text="ꦩꦠꦸꦂꦤꦸꦮꦸꦤ꧀" t={t} start={18.2} stagger={0.04} from={{ opacity: 0, blur: 6, y: 8 }} />
              </L>
              <L style={{ left: col, width: 360, top: 366, textAlign: 'center', fontFamily: F.title, fontSize: 30, color: C.text }}>
                <Chars text="Matur Nuwun" t={t} start={18.3} stagger={0.035} mask from={{ yPct: 110 }} />
              </L>
              <L style={{ left: col, width: 360, top: 414, textAlign: 'center', fontFamily: F.modern, fontSize: 11, letterSpacing: '0.12em', color: C.primary, opacity: k(t, 18.6, 18.9, 0, 1) }}>
                {d.slug.toUpperCase()}
              </L>
            </>
          )}
        </div>
      )}
    </div>
  );
}
