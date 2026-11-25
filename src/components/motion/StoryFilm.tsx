'use client';

/**
 * StoryFilm — mesin Video Cerita: adegan ilustrasi AI berlapis (latar + karakter transparan)
 * dipentaskan dengan tata bahasa kamera hasil reverse engineering video cerita:
 * setiap momen = satu gerakan tegas lalu hold yang tetap bernapas; perpindahan momen lewat
 * gerakan kamera (whip, crane, flash), bukan cut; layer bergerak beda kecepatan (parallax).
 *
 * Waktu `t` dalam detik nyata (tanpa time-remap), durasi = storyDuration(jumlah momen).
 */

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Chars, E, k, kf, L, MotionBlurDefs, mbFilter, seg, seeded, lerp, clamp01, GRAIN } from './core';
import { STORY_TIMING, storyDuration } from '@/lib/video/story/model';
import { MOTION_FONT_CSS_URL } from '@/components/EnterpriseMotionPlayer';

export interface StoryFilmMoment {
  id: string;
  title: string;
  narration?: string;
  who: 'groom' | 'bride' | 'both';
  dialogue?: { speaker: 'groom' | 'bride'; text: string } | null;
  chat?: { from: 'groom' | 'bride'; text: string }[];
  stat?: string;
  bg?: string;
  chars?: string;
}

export interface StoryFilmData {
  groom: string;
  bride: string;
  dateLong: string;
  day: string;
  monthNum: string;
  year: string;
  events: { title: string; date: string; time: string; venue: string }[];
  slug: string;
  guest: string;
  closingNarration?: string;
  moments: StoryFilmMoment[];
  finale?: { bg?: string; chars?: string };
  style: 'warm-digital' | 'watercolor' | 'soft-anime';
}

const PAL = {
  'warm-digital': { sky: ['#F6D9C2', '#E9B7A6', '#B9A7C9'], ink: '#2E2420', accent: '#C9895E', card: 'rgba(255,248,240,0.92)' },
  watercolor: { sky: ['#F4EEE3', '#E3D8EA', '#C8DCE4'], ink: '#3A3340', accent: '#B07A9A', card: 'rgba(255,253,248,0.92)' },
  'soft-anime': { sky: ['#CFE6FF', '#F9D9E6', '#FFE9C7'], ink: '#24304A', accent: '#E0708C', card: 'rgba(255,255,255,0.92)' },
} as const;

const F = {
  script: "'Great Vibes', cursive",
  serif: "'Playfair Display', Georgia, serif",
  body: "'Lato', system-ui, sans-serif",
};

/** Keluarga font yang wajib disematkan saat ekspor. */
export const STORY_FONT_FAMILIES = ['Great Vibes', 'Playfair Display', 'Lato'];

type Cam = { x: number; y: number; z: number; rot: number };
/** Preset kamera per momen (bergiliran) — dari tabel tata bahasa kamera. */
const PRESETS: ((p: number, W: number, H: number) => Cam)[] = [
  // rise-reveal: kamera turun sedikit lalu napas
  (p, _W, H) => ({ x: 0, y: kf(p, [[0, H * 0.08], [0.22, 0, E.outCubic], [1, -H * 0.015, E.linear]]), z: kf(p, [[0, 1.12], [0.22, 1.04, E.outCubic], [1, 1.0, E.linear]]), rot: 0 }),
  // pan-travel: geser horizontal pelan
  (p, W) => ({ x: kf(p, [[0, -W * 0.08], [0.25, 0, E.outCubic], [1, W * 0.03, E.linear]]), y: 0, z: 1.06, rot: 0 }),
  // push-intimate: dorong masuk perlahan (ease-in di akhir)
  (p) => ({ x: 0, y: 0, z: kf(p, [[0, 1.0], [0.2, 1.02, E.outCubic], [1, 1.12, E.inCubic]]), rot: 0 }),
  // crane: dari atas turun
  (p, _W, H) => ({ x: 0, y: kf(p, [[0, -H * 0.1], [0.25, 0, E.outCubic], [1, H * 0.015, E.linear]]), z: 1.05, rot: 0 }),
  // pull-back: dari dekat mundur (ease-out)
  (p) => ({ x: 0, y: 0, z: kf(p, [[0, 1.18], [0.3, 1.04, E.outCubic], [1, 1.0, E.linear]]), rot: 0 }),
];

/** Jenis transisi ke momen berikutnya (bergiliran). */
const TRANSITIONS = ['whip', 'crane', 'whip-left', 'flash'] as const;
const TR = 0.6; // durasi transisi (dtk)

function Plate({ src, cam, depth, W, H, fallback }: { src?: string; cam: Cam; depth: number; W: number; H: number; fallback: readonly string[] }) {
  const s = 1 + (cam.z - 1) * depth;
  return (
    <L
      style={{
        inset: -Math.round(H * 0.12),
        transform: `translate3d(${-cam.x * depth}px, ${-cam.y * depth}px, 0) scale(${s * 1.06}) rotate(${cam.rot}deg)`,
        transformOrigin: '50% 55%',
        background: `linear-gradient(180deg, ${fallback[0]}, ${fallback[1]} 55%, ${fallback[2]})`,
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 55%' }} />
      )}
    </L>
  );
}

function Motes({ W, H, t, cam, color, n, seed }: { W: number; H: number; t: number; cam: Cam; color: string; n: number; seed: number }) {
  return (
    <L style={{ inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const r = seeded(seed + i * 3.7), r2 = seeded(seed + i * 9.1);
        const depth = 1.7 + r2;
        const x = (((r * (W + 120) - cam.x * depth + Math.sin(t * 0.8 + i) * 10) % (W + 120)) + W + 120) % (W + 120) - 60;
        const y = (((r2 * (H + 120) - cam.y * depth - t * 8 * (0.4 + r)) % (H + 120)) + H + 120) % (H + 120) - 60;
        const s = 2 + r * 4;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: color, opacity: 0.5 + 0.4 * Math.sin(t * 2.4 + i), boxShadow: `0 0 ${s * 3}px ${color}` }} />;
      })}
    </L>
  );
}

function Phone({ chat, t0, t, ink, accent, W }: { chat: { from: 'groom' | 'bride'; text: string }[]; t0: number; t: number; ink: string; accent: string; W: number }) {
  const inP = E.outCubic(seg(t, t0, t0 + 0.55));
  return (
    <div
      style={{
        position: 'absolute',
        right: 14,
        bottom: lerp(-260, 150, inP),
        width: Math.min(150, W * 0.42),
        padding: '30px 10px 16px',
        borderRadius: 26,
        background: '#111',
        boxShadow: '0 24px 40px -16px rgba(0,0,0,0.6)',
        transform: `rotate(${lerp(8, -4, inP)}deg)`,
      }}
    >
      <div style={{ borderRadius: 16, background: '#F3F1EE', padding: '10px 8px', minHeight: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chat.map((c, i) => {
          const p = E.outBack(seg(t, t0 + 0.6 + i * 0.45, t0 + 0.95 + i * 0.45));
          const mine = c.from === 'groom';
          return (
            <div
              key={i}
              style={{
                alignSelf: mine ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                padding: '6px 9px',
                borderRadius: 12,
                background: mine ? accent : '#fff',
                color: mine ? '#fff' : ink,
                fontFamily: F.body,
                fontSize: 10.5,
                lineHeight: 1.3,
                opacity: clamp01(p * 1.4),
                transform: `scale(${lerp(0.6, 1, clamp01(p))})`,
                transformOrigin: mine ? '100% 100%' : '0% 100%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {c.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Satu momen pada waktu lokal `lt` (0..moment), dengan offset kamera tambahan dari transisi. */
function MomentScene({ m, idx, lt, W, H, t, pal, extra }: { m: StoryFilmMoment; idx: number; lt: number; W: number; H: number; t: number; pal: (typeof PAL)[keyof typeof PAL]; extra: Cam }) {
  const D = STORY_TIMING.moment;
  const base = PRESETS[idx % PRESETS.length](clamp01(lt / D), W, H);
  const cam = { x: base.x + extra.x, y: base.y + extra.y, z: base.z * extra.z, rot: base.rot + extra.rot };
  const fromLeft = idx % 2 === 0;
  const charIn = E.outCubic(seg(lt, 0.05, 0.75));
  const narr = m.narration?.trim();
  const hasChat = !!m.chat?.length;
  const charScale = 1 + (cam.z - 1) * 1.0;
  return (
    <L style={{ inset: 0, overflow: 'hidden' }}>
      <Plate src={m.bg} cam={cam} depth={0.4} W={W} H={H} fallback={pal.sky} />
      {/* bayangan lantai */}
      <L style={{ left: W * 0.15, right: W * 0.15, bottom: 24 - cam.y * 0.9, height: 40, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,0.28), transparent)', opacity: charIn }} />
      {m.chars && (
        <L
          style={{
            left: 0,
            right: 0,
            bottom: 0,
            height: H,
            transform: `translate3d(${-cam.x + lerp(fromLeft ? -W * 0.35 : W * 0.35, 0, charIn)}px, ${-cam.y + lerp(30, 0, charIn)}px, 0) scale(${charScale})`,
            transformOrigin: '50% 100%',
            opacity: clamp01(charIn * 1.6),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.chars}
            alt=""
            draggable={false}
            style={{ position: 'absolute', bottom: 0, left: '50%', height: H * (m.who === 'both' ? 0.66 : 0.6), width: 'auto', maxWidth: W * 1.1, transform: 'translateX(-50%)', objectFit: 'contain', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.25))' }}
          />
        </L>
      )}
      <Motes W={W} H={H} t={t} cam={cam} color="rgba(255,240,210,0.9)" n={8} seed={idx * 13 + 5} />

      {/* narasi */}
      {narr && (
        <L style={{ left: 20, right: 20, top: 54 - cam.y * 0.15, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '12px 14px',
              borderRadius: 14,
              background: pal.card,
              color: pal.ink,
              fontFamily: F.serif,
              fontSize: 14.5,
              lineHeight: 1.45,
              maxWidth: W - 40,
              boxShadow: '0 14px 30px -18px rgba(0,0,0,0.45)',
              opacity: k(lt, 1.0, 1.5, 0, 1) * k(lt, D - 0.45, D - 0.1, 1, 0),
              filter: `blur(${k(lt, 1.0, 1.5, 6, 0).toFixed(2)}px)`,
              transform: `translateY(${k(lt, 1.0, 1.6, 10, 0)}px)`,
            }}
          >
            {m.title && <div style={{ fontFamily: F.body, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: pal.accent, marginBottom: 4 }}>{m.title}</div>}
            {narr}
          </div>
        </L>
      )}

      {/* balon dialog (blur-pop) */}
      {m.dialogue?.text && (
        <L
          style={{
            left: m.dialogue.speaker === 'groom' ? 22 : undefined,
            right: m.dialogue.speaker === 'bride' ? 22 : undefined,
            top: H * 0.36 - cam.y * 0.9,
            maxWidth: W * 0.62,
            padding: '10px 14px',
            borderRadius: 18,
            background: '#fff',
            color: pal.ink,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 13,
            boxShadow: '0 10px 24px -12px rgba(0,0,0,0.45)',
            opacity: k(lt, 0.8, 1.05, 0, 1) * k(lt, D - 0.5, D - 0.2, 1, 0),
            transform: `scale(${k(lt, 0.8, 1.1, 1.25, 1, E.outBack)})`,
            filter: `blur(${k(lt, 0.8, 1.05, 5, 0).toFixed(2)}px)`,
          }}
        >
          {m.dialogue.text}
        </L>
      )}

      {hasChat && <Phone chat={m.chat!} t0={0.7} t={lt} ink={pal.ink} accent={pal.accent} W={W} />}

      {m.stat && (
        <L style={{ left: 0, right: 0, top: narr ? H * 0.25 : H * 0.14, textAlign: 'center', opacity: k(lt, 1.1, 1.5, 0, 1) * k(lt, D - 0.5, D - 0.2, 1, 0) }}>
          <div style={{ display: 'inline-block', padding: '16px 26px', background: '#fff', color: '#111', fontFamily: F.serif, fontSize: 30, letterSpacing: '0.04em', boxShadow: '0 20px 40px -18px rgba(0,0,0,0.6)', transform: `scale(${k(lt, 1.1, 1.5, 0.85, 1, E.outBack)})` }}>
            {m.stat}
          </div>
        </L>
      )}
    </L>
  );
}

export function StoryFilm({ t, W, H, d }: { t: number; W: number; H: number; d: StoryFilmData }) {
  const pal = PAL[d.style] || PAL['warm-digital'];
  const n = d.moments.length;
  const T = STORY_TIMING;
  const momentStart = (i: number) => T.intro + i * T.moment;
  const finaleStart = T.intro + n * T.moment;
  const closingStart = finaleStart + T.finale;

  // ----- intro → momen pertama: crane turun
  const introOut = E.inOutCubic(seg(t, T.intro - TR, T.intro));

  // momen aktif + transisi
  const scenes: React.ReactNode[] = [];
  let blurX = 0, blurY = 0;
  for (let i = 0; i < n; i++) {
    const s0 = momentStart(i), s1 = s0 + T.moment;
    if (t < s0 - TR || t > s1 + TR) continue;
    const lt = t - s0;
    // keluar (ke momen berikut / finale)
    const outP = E.inOutCubic(seg(t, s1 - TR, s1));
    // momen terakhir selalu crane agar menyambung ke finale yang naik dari bawah
    const outKind = i === n - 1 ? 'crane' : TRANSITIONS[i % TRANSITIONS.length];
    // masuk (dari momen sebelumnya / intro)
    const inP = 1 - E.inOutCubic(seg(t, s0 - TR, s0));
    const inKind = i === 0 ? 'crane' : TRANSITIONS[(i - 1) % TRANSITIONS.length];
    const off = (kind: string, p: number, dir: 1 | -1): Cam => {
      if (kind === 'whip') return { x: dir * W * 1.1 * p, y: 0, z: 1, rot: dir * 2 * p };
      if (kind === 'whip-left') return { x: -dir * W * 1.1 * p, y: 0, z: 1, rot: -dir * 2 * p };
      if (kind === 'crane') return { x: 0, y: dir * H * 1.05 * p, z: 1, rot: 0 };
      return { x: 0, y: 0, z: 1 + 0.08 * p, rot: 0 }; // flash: dorong sedikit, ditutup cahaya
    };
    const o1 = off(outKind, outP, 1);
    const o2 = off(inKind, inP, -1);
    const extra = { x: o1.x + o2.x, y: o1.y + o2.y, z: o1.z * o2.z, rot: o1.rot + o2.rot };
    if (outP > 0 && outP < 1 && outKind !== 'flash') {
      blurX = Math.max(blurX, outKind.startsWith('whip') ? Math.sin(outP * Math.PI) * 14 : 0);
      blurY = Math.max(blurY, outKind === 'crane' ? Math.sin(outP * Math.PI) * 14 : 0);
    }
    if (inP > 0 && inP < 1 && inKind !== 'flash') {
      blurX = Math.max(blurX, inKind.startsWith('whip') ? Math.sin(inP * Math.PI) * 14 : 0);
      blurY = Math.max(blurY, inKind === 'crane' ? Math.sin(inP * Math.PI) * 14 : 0);
    }
    const hidden = (inKind === 'flash' && inP > 0.5) || (outKind === 'flash' && outP > 0.5);
    scenes.push(
      <L key={d.moments[i].id} style={{ inset: 0, opacity: hidden ? 0 : 1 }}>
        <MomentScene m={d.moments[i]} idx={i} lt={lt} W={W} H={H} t={t} pal={pal} extra={extra} />
      </L>
    );
  }
  // flash putih hangat di transisi 'flash'
  let flash = 0;
  for (let i = 0; i < n - 1; i++) {
    if (TRANSITIONS[i % TRANSITIONS.length] !== 'flash') continue;
    const s1 = momentStart(i) + T.moment;
    flash = Math.max(flash, Math.max(0, 1 - Math.abs(t - (s1 - TR / 2)) / (TR / 2)));
  }

  // ----- finale (pernikahan) masuk dengan crane dari bawah
  const finIn = 1 - E.outCubic(seg(t, finaleStart - TR, finaleStart + 0.2));
  const fl = t - finaleStart;
  const finCam: Cam = { x: 0, y: kf(fl, [[0, 0], [T.finale, -H * 0.02]]), z: kf(fl, [[0, 1.08], [1.2, 1.02, E.outCubic], [T.finale + T.closing, 1.0]]), rot: 0 };
  const showFinale = t > finaleStart - TR;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: pal.sky[2] }}>
      <MotionBlurDefs id="st-mb" x={blurX} y={blurY} />

      {/* INTRO */}
      {t < T.intro + 0.05 && (
        <L style={{ inset: 0, transform: `translateY(${-introOut * H * 1.05}px)` }}>
          <Plate src={d.moments[0]?.bg} cam={{ x: 0, y: 0, z: k(t, 0, T.intro, 1.12, 1.18), rot: 0 }} depth={1} W={W} H={H} fallback={pal.sky} />
          <L style={{ inset: 0, background: `linear-gradient(180deg, ${pal.sky[0]}EE, ${pal.sky[1]}CC 60%, ${pal.sky[2]}AA)` }} />
          <L style={{ left: 0, right: 0, top: H * 0.3, textAlign: 'center', color: pal.ink }}>
            <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.34em' }}>
              <Chars text="THE JOURNEY OF" t={t} start={0.25} stagger={0.03} from={{ y: 8, opacity: 0, blur: 4 }} />
            </div>
            <div style={{ fontFamily: F.script, fontSize: 64, lineHeight: 1.15, marginTop: 8 }}>
              <Chars text={`${d.groom} & ${d.bride}`} t={t} start={0.55} stagger={0.045} dur={0.8} from={{ y: 14, opacity: 0, blur: 8 }} />
            </div>
          </L>
        </L>
      )}

      {/* MOMEN */}
      <L style={{ inset: 0, filter: mbFilter('st-mb', blurX, blurY) }}>{scenes}</L>

      {/* FINALE + PENUTUP */}
      {showFinale && (
        <L style={{ inset: 0, transform: `translateY(${finIn * H * 1.05}px)`, filter: finIn > 0.02 ? `blur(${(Math.sin(finIn * Math.PI) * 6).toFixed(1)}px)` : undefined }}>
          <Plate src={d.finale?.bg} cam={finCam} depth={0.45} W={W} H={H} fallback={pal.sky} />
          {d.finale?.chars && (
            <L style={{ left: 0, right: 0, bottom: 0, height: H, transform: `translateY(${lerp(40, 0, E.outCubic(seg(fl, 0.1, 1.0)))}px) scale(${finCam.z})`, transformOrigin: '50% 100%', opacity: clamp01(seg(fl, 0.05, 0.6) * 1.5) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.finale.chars} alt="" draggable={false} style={{ position: 'absolute', bottom: 0, left: '50%', height: H * 0.64, width: 'auto', maxWidth: W * 1.1, transform: 'translateX(-50%)', objectFit: 'contain', filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.3))' }} />
            </L>
          )}
          <Motes W={W} H={H} t={t} cam={finCam} color="rgba(255,236,200,0.95)" n={12} seed={99} />
          {/* save the date */}
          <L style={{ left: 18, right: 18, top: 40, textAlign: 'center', opacity: k(fl, 0.9, 1.4, 0, 1) * k(t, closingStart - 0.3, closingStart + 0.1, 1, 0) }}>
            <div style={{ display: 'inline-block', padding: '14px 16px', borderRadius: 16, background: pal.card, color: pal.ink, boxShadow: '0 16px 34px -18px rgba(0,0,0,0.5)', maxWidth: W - 36 }}>
              <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', color: pal.accent }}>SAVE THE DATE</div>
              <div style={{ fontFamily: F.serif, fontSize: 26, marginTop: 4 }}>{d.dateLong}</div>
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                {d.events.slice(0, 2).map((e, i) => (
                  <div key={i} style={{ opacity: k(fl, 1.5 + i * 0.35, 2.0 + i * 0.35, 0, 1), fontFamily: F.body, fontSize: 12, lineHeight: 1.35 }}>
                    <strong style={{ fontFamily: F.serif, fontSize: 14 }}>{e.title}</strong> · {e.time}
                    <div style={{ opacity: 0.8 }}>{e.venue}</div>
                  </div>
                ))}
              </div>
              {d.closingNarration && <div style={{ fontFamily: F.serif, fontStyle: 'italic', fontSize: 13, marginTop: 10, opacity: k(fl, 2.4, 2.9, 0, 1) }}>{d.closingNarration}</div>}
            </div>
          </L>
          {/* penutup */}
          {t > closingStart - 0.3 && (
            <L style={{ left: 0, right: 0, top: H * 0.1, textAlign: 'center', color: '#fff', textShadow: '0 2px 14px rgba(0,0,0,0.55)', opacity: k(t, closingStart - 0.2, closingStart + 0.4, 0, 1) }}>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.32em' }}>THE WEDDING OF</div>
              <div style={{ fontFamily: F.script, fontSize: 58, lineHeight: 1.1, marginTop: 6 }}>
                <Chars text={`${d.groom} & ${d.bride}`} t={t} start={closingStart} stagger={0.04} dur={0.7} from={{ y: 12, opacity: 0, blur: 8 }} />
              </div>
              <div style={{ fontFamily: F.body, fontSize: 10.5, letterSpacing: '0.24em', marginTop: 10, opacity: k(t, closingStart + 0.8, closingStart + 1.3, 0, 1) }}>KEPADA YTH.</div>
              <div style={{ fontFamily: F.serif, fontSize: 20, marginTop: 4, opacity: k(t, closingStart + 0.9, closingStart + 1.4, 0, 1) }}>{d.guest}</div>
              <div style={{ fontFamily: F.body, fontSize: 10.5, letterSpacing: '0.12em', marginTop: 12, opacity: k(t, closingStart + 1.4, closingStart + 1.9, 0, 1) }}>{d.slug}</div>
            </L>
          )}
        </L>
      )}

      {/* flash hangat */}
      {flash > 0.01 && <L style={{ inset: 0, background: 'radial-gradient(circle at 50% 45%, #FFF6E4, #FFE2B8 60%, #FFD39A)', opacity: flash, pointerEvents: 'none' }} />}
    </div>
  );
}

/** Pemutar: panggung 640 unit diskalakan ke kotak, plus finishing (vignette, grain, fade). */
function StoryPlayerInner({ data, time, showWatermark = true }: { data: StoryFilmData; time: number; showWatermark?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 360, h: 640 });
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth || 360, h: el.clientHeight || 640 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const STAGE_H = 640, MIN_W = 360;
  const scale = Math.min(box.h / STAGE_H, box.w / MIN_W);
  const W = Math.max(MIN_W, box.w / scale);
  const H = Math.max(STAGE_H, box.h / scale);
  const offY = (H - STAGE_H) / 2;
  const dur = storyDuration(data.moments.length);
  const t = Math.max(0, Math.min(dur, time));
  const fadeEdge = Math.max(1 - t / 0.35, (t - (dur - 0.5)) / 0.5, 0);
  return (
    <div ref={hostRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      <style>{`@import url('${MOTION_FONT_CSS_URL}');`}</style>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: offY, width: W, height: STAGE_H }}>
          <StoryFilm t={t} W={W} H={STAGE_H} d={data} />
        </div>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 140px rgba(0,0,0,0.22)' }} />
        <div style={{ position: 'absolute', inset: -60, pointerEvents: 'none', backgroundImage: GRAIN, opacity: 0.08, mixBlendMode: 'multiply', transform: `translate(${(Math.floor(t * 24) * 37) % 60}px, ${(Math.floor(t * 24) * 53) % 60}px)` }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#000', opacity: Math.min(1, fadeEdge) }} />
        {showWatermark && (
          <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#fff', mixBlendMode: 'difference', opacity: 0.6 }}>RuangHadir · Preview</div>
        )}
      </div>
    </div>
  );
}

export const StoryPlayer = React.memo(StoryPlayerInner);

/** Membantu induk membangun data film dengan memo. */
export function useStoryFilmData(build: () => StoryFilmData, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(build, deps);
}
