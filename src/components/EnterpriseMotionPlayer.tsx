'use client';

/**
 * EnterpriseMotionPlayer — komposisi motion graphic ala After Effects.
 *
 * Sepenuhnya deterministik: setiap frame adalah fungsi murni dari `progress` (0..1),
 * seperti komposisi Remotion. Tidak ada animasi CSS/RAF internal, sehingga scrub,
 * pause, dan render frame-by-frame selalu konsisten.
 *
 * Bahasa visual AE yang dipakai:
 *   • Text animator per huruf (mask reveal, tracking, blur-in, overshoot)
 *   • Shape layer dengan Trim Paths (garis, cincin, lengkung bingkai)
 *   • Transisi grafis: stripe wipe, iris (circle) wipe, light-leak flash, diagonal wipe
 *   • Kamera 2.5D: Ken Burns, parallax, whip-zoom keluar scene
 *   • Odometer angka tanggal, pin lokasi dengan ripple, typewriter URL
 *   • Grain film, vignette, partikel atmosfer per tema
 *
 * Komposisi dirancang di stage tinggi 640 unit dan diskalakan ke kontainer,
 * jadi rapi untuk 9:16, 1:1, maupun 16:9.
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { VideoThemeId, VideoCoupleProps, VIDEO_DURATION_SEC } from '@/lib/invitationVideoEngine';

export interface MotionPlayerCouple extends VideoCoupleProps {
  heroPhoto?: string;
  groomPhoto?: string;
  bridePhoto?: string;
}

interface EnterpriseMotionPlayerProps {
  themeId: VideoThemeId;
  couple: MotionPlayerCouple;
  /** 0..3 babak aktif (dipakai label UI di luar) */
  sceneIdx?: number;
  /** 0..1 progres timeline */
  progress: number;
  isPlaying?: boolean;
  showWatermark?: boolean;
}

const DEFAULT_HERO = '/assets/kharis-lia/hero.jpg';
const DEFAULT_GROOM = '/assets/kharis-lia/groom.jpg';
const DEFAULT_BRIDE = '/assets/kharis-lia/bride.jpg';

const STAGE_H = 640;
const COL_W = 360;
const DUR = VIDEO_DURATION_SEC;

// ============================================================
// Easing & keyframe helpers (setara graph editor AE)
// ============================================================

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const seg = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(0.0001, b - a));

const ease = {
  linear: (x: number) => x,
  inCubic: (x: number) => x * x * x,
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: (x: number) =>
    x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  outBack: (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  outQuint: (x: number) => 1 - Math.pow(1 - x, 5),
};

/** Nilai animasi antara dua waktu dengan easing (seperti 2 keyframe AE). */
function anim(t: number, a: number, b: number, from: number, to: number, fn: (x: number) => number = ease.outCubic) {
  return lerp(from, to, fn(seg(t, a, b)));
}

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// ============================================================
// Konfigurasi tema
// ============================================================

interface ThemeMotionConfig {
  plates: { gate: string; hall: string; sky: string };
  palette: {
    bg: string;
    paper: string;
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    leak: string;
  };
  fonts: { display: string; script: string; serif: string; sans: string };
  particle: 'ember' | 'sparkle' | 'petal';
  copy: { tag: string; story: string; groomRole: string; brideRole: string; dateTag: string; farewell: string };
}

const THEMES: Record<VideoThemeId, ThemeMotionConfig> = {
  'javanese-classic': {
    plates: {
      gate: '/assets/video-scenes/javanese-gate.webp',
      hall: '/assets/video-scenes/javanese-hall.webp',
      sky: '/assets/video-scenes/javanese-sky.webp',
    },
    palette: {
      bg: '#F6EEDC',
      paper: '#FBF6EA',
      primary: '#7E3E27',
      secondary: '#C59C62',
      text: '#3F2A1D',
      muted: '#6B4E35',
      leak: 'rgba(255, 196, 120, 0.55)',
    },
    fonts: {
      display: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      script: "'Cormorant Garamond', Georgia, serif",
      serif: "'Lora', Georgia, serif",
      sans: "var(--font-ui), 'Plus Jakarta Sans', system-ui, sans-serif",
    },
    particle: 'ember',
    copy: {
      tag: 'Pahargyan Pernikahan',
      story: 'Dengan memohon rahmat dan ridho-Nya, kami mengundang Anda di hari bahagia kami.',
      groomRole: 'Mempelai Pria',
      brideRole: 'Mempelai Wanita',
      dateTag: 'Ijab Kabul & Resepsi',
      farewell: 'Sampai jumpa',
    },
  },
  'grand-ballroom': {
    plates: {
      gate: '/assets/video-scenes/ballroom-gate.webp',
      hall: '/assets/video-scenes/ballroom-hall.webp',
      sky: '/assets/video-scenes/ballroom-sky.webp',
    },
    palette: {
      bg: '#EEF2F7',
      paper: '#F8FAFD',
      primary: '#2C4A6E',
      secondary: '#B39B6B',
      text: '#1C2E44',
      muted: '#4B637E',
      leak: 'rgba(255, 236, 200, 0.55)',
    },
    fonts: {
      display: "'Cinzel', 'Playfair Display', Georgia, serif",
      script: "'Playfair Display', Georgia, serif",
      serif: "'Playfair Display', Georgia, serif",
      sans: "var(--font-ui), 'Plus Jakarta Sans', system-ui, sans-serif",
    },
    particle: 'sparkle',
    copy: {
      tag: 'The Royal Wedding',
      story: 'Di bawah cahaya kristal, kami memulai babak selamanya — dan ingin Anda menjadi saksinya.',
      groomRole: 'The Groom',
      brideRole: 'The Bride',
      dateTag: 'Royal Ceremony & Reception',
      farewell: 'See you there',
    },
  },
  'luxury-pink': {
    plates: {
      gate: '/assets/video-scenes/pink-gate.webp',
      hall: '/assets/video-scenes/pink-hall.webp',
      sky: '/assets/video-scenes/pink-sky.webp',
    },
    palette: {
      bg: '#FBF0F3',
      paper: '#FFF8FA',
      primary: '#9C355E',
      secondary: '#D99AB3',
      text: '#4E2236',
      muted: '#7B465F',
      leak: 'rgba(255, 170, 190, 0.5)',
    },
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      script: "'Great Vibes', 'Playfair Display', cursive",
      serif: "'Playfair Display', Georgia, serif",
      sans: "var(--font-ui), 'Plus Jakarta Sans', system-ui, sans-serif",
    },
    particle: 'petal',
    copy: {
      tag: 'The Wedding of',
      story: 'Semesta mempertemukan langkah kami untuk merangkai kisah selamanya.',
      groomRole: 'Mempelai Pria',
      brideRole: 'Mempelai Wanita',
      dateTag: 'Akad Nikah & Resepsi',
      farewell: 'Sampai jumpa',
    },
  },
};

// ============================================================
// Timeline (detik). Overlap = durasi transisi.
// ============================================================

const T = {
  open: [0, 3.9],
  names: [3.6, 7.85],
  couple: [7.7, 11.9],
  date: [11.55, 15.7],
  close: [15.35, DUR],
} as const;

function parseDate(raw: string) {
  const m = raw.match(/(?:([A-Za-z]+),\s*)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return null;
  return { weekday: m[1] || '', day: m[2].padStart(2, '0'), month: m[3], year: m[4] };
}

// ============================================================
// Primitif layer
// ============================================================

/** Text animator per huruf: mask reveal dari bawah + blur, opsional keluar ke atas. */
function SplitText({
  text,
  t,
  start,
  stagger = 0.035,
  dur = 0.55,
  exitAt,
  exitStagger = 0.02,
  style,
  mode = 'rise',
}: {
  text: string;
  t: number;
  start: number;
  stagger?: number;
  dur?: number;
  exitAt?: number;
  exitStagger?: number;
  style?: React.CSSProperties;
  mode?: 'rise' | 'fade' | 'scale';
}) {
  const chars = Array.from(text);
  return (
    <span style={{ display: 'inline-block', whiteSpace: 'pre', ...style }} aria-label={text}>
      {chars.map((ch, i) => {
        const inP = ease.outExpo(seg(t, start + i * stagger, start + i * stagger + dur));
        const outP = exitAt !== undefined ? ease.inCubic(seg(t, exitAt + i * exitStagger, exitAt + i * exitStagger + 0.35)) : 0;
        let transform = '';
        let opacity = 1;
        let filter: string | undefined;
        if (mode === 'rise') {
          const y = (1 - inP) * 105 - outP * 105;
          transform = `translate3d(0, ${y}%, 0)`;
          opacity = 1;
        } else if (mode === 'fade') {
          opacity = inP * (1 - outP);
          transform = `translate3d(0, ${(1 - inP) * 30 - outP * 30}%, 0)`;
          const b = (1 - inP) * 6 + outP * 6;
          filter = b > 0.1 ? `blur(${b}px)` : undefined;
        } else {
          const s = lerp(0.2, 1, ease.outBack(seg(t, start + i * stagger, start + i * stagger + dur)));
          opacity = inP * (1 - outP);
          transform = `scale(${s * (1 - outP * 0.4)})`;
        }
        const inner = (
          <span
            aria-hidden
            style={{ display: 'inline-block', transform, opacity, filter, willChange: 'transform' }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        );
        return mode === 'rise' ? (
          <span key={i} aria-hidden style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
            {inner}
          </span>
        ) : (
          <React.Fragment key={i}>{inner}</React.Fragment>
        );
      })}
    </span>
  );
}

/** Garis dengan Trim Paths (0..1 → panjang terlihat). */
function TrimPath({
  d,
  length,
  trim,
  stroke,
  width = 1.5,
  dash,
  style,
  viewBox,
  className,
}: {
  d: string;
  length: number;
  trim: number;
  stroke: string;
  width?: number;
  dash?: string;
  style?: React.CSSProperties;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg viewBox={viewBox} className={className} style={{ position: 'absolute', overflow: 'visible', ...style }} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dash ?? `${length} ${length}`}
        strokeDashoffset={dash ? undefined : length * (1 - clamp01(trim))}
        style={dash ? { opacity: clamp01(trim) } : undefined}
      />
    </svg>
  );
}

/** Plate latar dengan Ken Burns + parallax. */
function Plate({
  src,
  t,
  range,
  scaleFrom,
  scaleTo,
  xFrom = 0,
  xTo = 0,
  yFrom = 0,
  yTo = 0,
  blur = 0,
  style,
}: {
  src: string;
  t: number;
  range: readonly [number, number];
  scaleFrom: number;
  scaleTo: number;
  xFrom?: number;
  xTo?: number;
  yFrom?: number;
  yTo?: number;
  blur?: number;
  style?: React.CSSProperties;
}) {
  const p = ease.inOutCubic(seg(t, range[0], range[1]));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `translate3d(${lerp(xFrom, xTo, p)}%, ${lerp(yFrom, yTo, p)}%, 0) scale(${lerp(scaleFrom, scaleTo, p)})`,
        filter: blur > 0.15 ? `blur(${blur}px)` : undefined,
        willChange: 'transform',
        ...style,
      }}
    />
  );
}

/** Odometer: setiap digit berputar ke angka target. */
function Odometer({ value, t, start, dur, style }: { value: string; t: number; start: number; dur: number; style: React.CSSProperties }) {
  return (
    <span style={{ display: 'inline-flex', ...style }} aria-label={value}>
      {Array.from(value).map((d, i) => {
        const target = Number(d);
        const spins = 1 + i; // digit kanan berputar lebih banyak
        const p = ease.outExpo(seg(t, start + i * 0.08, start + i * 0.08 + dur));
        const pos = p * (spins * 10 + target);
        return (
          <span key={i} aria-hidden style={{ display: 'inline-block', height: '1.2em', width: '0.58em', overflow: 'hidden', lineHeight: '1.2em', textAlign: 'center' }}>
            <span style={{ display: 'block', transform: `translate3d(0, ${-(pos % 10) * 1.2}em, 0)` }}>
              {Array.from({ length: 11 }, (_, n) => (
                <span key={n} style={{ display: 'block', height: '1.2em' }}>
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

/** Partikel deterministik per tema. */
function Particles({ kind, t, color, accent, width }: { kind: ThemeMotionConfig['particle']; t: number; color: string; accent: string; width: number }) {
  const count = kind === 'petal' ? 16 : 22;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40 }} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const r1 = seeded(i + 1);
        const r2 = seeded(i + 41);
        const r3 = seeded(i + 97);
        const speed = 0.25 + r3 * 0.6;
        const x = r1 * width + Math.sin(t * (0.6 + r2) + i) * 14;
        const rise = kind === 'petal' ? -1 : 1; // kelopak jatuh, bara naik
        const yRaw = r2 * STAGE_H - rise * t * speed * 38;
        const y = ((yRaw % STAGE_H) + STAGE_H) % STAGE_H;
        const flicker = 0.35 + 0.65 * Math.abs(Math.sin(t * (1.4 + r1 * 2) + i * 1.7));
        if (kind === 'petal') {
          const size = 7 + r3 * 7;
          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size * 0.62,
                borderRadius: '80% 10% 80% 10%',
                background: `linear-gradient(135deg, ${accent}, ${color})`,
                opacity: 0.55 * flicker + 0.2,
                transform: `rotate(${t * 60 * (r1 - 0.5) * 3 + i * 40}deg)`,
              }}
            />
          );
        }
        const size = kind === 'ember' ? 2 + r3 * 3.5 : 1.5 + r3 * 3;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: 999,
              background: kind === 'ember' ? accent : '#FFFFFF',
              boxShadow: `0 0 ${size * 3}px ${size}px ${kind === 'ember' ? accent : 'rgba(255,255,255,0.8)'}`,
              opacity: flicker * 0.75,
            }}
          />
        );
      })}
    </div>
  );
}

// Grain film (SVG noise statis, digeser per frame)
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

// ============================================================
// Komposisi utama
// ============================================================

export default function EnterpriseMotionPlayer({
  themeId,
  couple,
  progress,
  showWatermark = true,
}: EnterpriseMotionPlayerProps) {
  const cfg = THEMES[themeId] || THEMES['javanese-classic'];
  const pal = cfg.palette;
  const t = clamp01(progress) * DUR;

  // ---- Stage scaling (desain 640 unit tinggi) ----
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
  const scale = box.h / STAGE_H;
  const stageW = Math.max(COL_W, box.w / scale);
  const cx = stageW / 2; // pusat horizontal
  const colL = cx - COL_W / 2;

  const heroPhoto = couple.heroPhoto || DEFAULT_HERO;
  const groomPhoto = couple.groomPhoto || DEFAULT_GROOM;
  const bridePhoto = couple.bridePhoto || DEFAULT_BRIDE;
  const date = parseDate(couple.dateRaw || '');
  const initials = couple.initials || `${couple.groom?.[0] || ''} & ${couple.bride?.[0] || ''}`;
  const [iniA, iniB] = initials.split('&').map((s) => s.trim());

  const on = (r: readonly [number, number]) => t >= r[0] && t <= r[1];

  // ======== Transisi ========
  // A→B: stripe wipe (3 bar naik)
  const stripe = (i: number) => {
    const a = 3.2 + i * 0.07;
    const inY = anim(t, a, a + 0.42, 100, 0, ease.inOutExpo);
    const outY = anim(t, a + 0.5, a + 0.92, 0, -100, ease.inOutExpo);
    return t < a + 0.5 ? inY : outY;
  };
  const stripeVisible = t > 3.2 && t < 4.35;

  // B→C: iris wipe
  const irisCover = ease.inOutExpo(seg(t, 7.25, 7.75)); // lingkaran warna menutup
  const irisReveal = ease.inOutExpo(seg(t, 7.75, 8.35)); // scene C terbuka dalam lingkaran
  const irisVisible = t > 7.25 && t < 8.4;

  // C→D: light-leak flash
  const flash = Math.max(0, 1 - Math.abs(t - 11.7) / 0.4);

  // D→E: diagonal wipe
  const diag = t < 15.55 ? anim(t, 15.1, 15.55, -130, 0, ease.inOutExpo) : anim(t, 15.6, 16.05, 0, 130, ease.inOutExpo);
  const diagVisible = t > 15.1 && t < 16.05;

  // Kamera global (napas halus)
  const camBreath = 1 + Math.sin(t * 0.5) * 0.004;

  const sans: React.CSSProperties = { fontFamily: cfg.fonts.sans };
  const display: React.CSSProperties = { fontFamily: cfg.fonts.display };

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden select-none" style={{ background: pal.bg }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: stageW,
          height: STAGE_H,
          transform: `scale(${scale * camBreath})`,
          transformOrigin: '0 0',
          color: pal.text,
          ...sans,
        }}
      >
        {/* ============================================================
            SCENE A — PEMBUKA: cincin trim-path + monogram
           ============================================================ */}
        {on(T.open) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              transform: `scale(${anim(t, 3.05, 3.6, 1, 1.22, ease.inExpo)})`,
              filter: t > 3.05 ? `blur(${anim(t, 3.05, 3.6, 0, 6, ease.inCubic)}px)` : undefined,
            }}
          >
            <Plate src={cfg.plates.gate} t={t} range={T.open} scaleFrom={1.32} scaleTo={1.08} yFrom={2} yTo={-1} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse 90% 46% at 50% 50%, ${pal.paper}F5 0%, ${pal.paper}E0 50%, ${pal.paper}33 100%)`,
                opacity: anim(t, 0, 0.9, 0, 1),
              }}
            />

            {/* Tag dengan animasi tracking */}
            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 168,
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: pal.primary,
                letterSpacing: `${anim(t, 0.4, 1.8, 0.7, 0.32, ease.outQuint)}em`,
                opacity: anim(t, 0.4, 1.1, 0, 1) * anim(t, 2.9, 3.2, 1, 0),
              }}
            >
              {cfg.copy.tag}
            </div>

            {/* Cincin ganda (trim path + putaran) */}
            <TrimPath
              viewBox="0 0 200 200"
              d="M100 10 A90 90 0 1 1 99.99 10"
              length={566}
              trim={anim(t, 0.15, 1.35, 0, 1, ease.inOutCubic)}
              stroke={pal.secondary}
              width={1.4}
              style={{ left: cx - 100, top: 200, width: 200, height: 200, transform: `rotate(${-90 + t * 8}deg)` }}
            />
            <TrimPath
              viewBox="0 0 200 200"
              d="M100 20 A80 80 0 1 1 99.99 20"
              length={503}
              trim={anim(t, 0.35, 1.55, 0, 1, ease.inOutCubic)}
              stroke={pal.primary}
              width={0.8}
              dash="2 6"
              style={{ left: cx - 100, top: 200, width: 200, height: 200, transform: `rotate(${-t * 14}deg)` }}
            />

            {/* Monogram */}
            <div
              style={{
                position: 'absolute',
                left: cx - 100,
                top: 200,
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                ...display,
                color: pal.text,
              }}
            >
              <span
                style={{
                  fontSize: 64,
                  lineHeight: 1,
                  display: 'inline-block',
                  transform: `translateX(${anim(t, 0.9, 1.7, -26, 0, ease.outExpo)}px)`,
                  opacity: anim(t, 0.9, 1.4, 0, 1),
                  filter: `blur(${anim(t, 0.9, 1.5, 8, 0)}px)`,
                }}
              >
                {iniA}
              </span>
              <span
                style={{
                  fontFamily: cfg.fonts.script,
                  fontStyle: 'italic',
                  fontSize: 34,
                  color: pal.secondary,
                  display: 'inline-block',
                  transform: `scale(${anim(t, 1.15, 1.75, 0, 1, ease.outBack)}) rotate(${anim(t, 1.15, 1.75, -40, 0, ease.outBack)}deg)`,
                }}
              >
                &amp;
              </span>
              <span
                style={{
                  fontSize: 64,
                  lineHeight: 1,
                  display: 'inline-block',
                  transform: `translateX(${anim(t, 0.9, 1.7, 26, 0, ease.outExpo)}px)`,
                  opacity: anim(t, 0.9, 1.4, 0, 1),
                  filter: `blur(${anim(t, 0.9, 1.5, 8, 0)}px)`,
                }}
              >
                {iniB}
              </span>
            </div>

            {/* Garis kiri-kanan + belah ketupat */}
            <TrimPath
              viewBox="0 0 120 2"
              d="M120 1 L0 1"
              length={120}
              trim={anim(t, 1.3, 2.0, 0, 1, ease.outExpo)}
              stroke={pal.secondary}
              width={1}
              style={{ left: cx - 132, top: 436, width: 120, height: 2 }}
            />
            <TrimPath
              viewBox="0 0 120 2"
              d="M0 1 L120 1"
              length={120}
              trim={anim(t, 1.3, 2.0, 0, 1, ease.outExpo)}
              stroke={pal.secondary}
              width={1}
              style={{ left: cx + 12, top: 436, width: 120, height: 2 }}
            />
            <span
              style={{
                position: 'absolute',
                left: cx - 4,
                top: 433,
                width: 8,
                height: 8,
                background: pal.secondary,
                transform: `rotate(45deg) scale(${anim(t, 1.5, 1.9, 0, 1, ease.outBack)})`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 456,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 500,
                color: pal.muted,
                letterSpacing: '0.04em',
              }}
            >
              <SplitText text={couple.dateRaw} t={t} start={1.7} stagger={0.018} mode="fade" />
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE B — KINETIC TYPOGRAPHY NAMA
           ============================================================ */}
        {on(T.names) && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: pal.bg }}>
            <Plate
              src={cfg.plates.hall}
              t={t}
              range={T.names}
              scaleFrom={1.22}
              scaleTo={1.12}
              xFrom={-3}
              xTo={3}
              blur={3}
            />
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 60% at 50% 48%, ${pal.paper}F0 0%, ${pal.paper}C4 70%, ${pal.paper}99 100%)` }} />
            {/* garis bingkai tipis yang ter-trim mengelilingi */}
            <TrimPath
              viewBox={`0 0 ${COL_W - 40} 500`}
              d={`M${(COL_W - 40) / 2} 0 H${COL_W - 40} V500 H0 V0 Z`}
              length={2 * (COL_W - 40) + 1000}
              trim={anim(t, 3.9, 5.4, 0, 1, ease.inOutCubic) * anim(t, 7.0, 7.5, 1, 0, ease.inCubic)}
              stroke={pal.secondary}
              width={0.9}
              style={{ left: colL + 20, top: 70, width: COL_W - 40, height: 500 }}
            />

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 150,
                textAlign: 'center',
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.34em',
                textTransform: 'uppercase',
                color: pal.primary,
              }}
            >
              <SplitText text={cfg.copy.tag} t={t} start={4.0} stagger={0.02} mode="fade" exitAt={6.95} />
            </div>

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 196,
                textAlign: 'center',
                fontSize: couple.groom.length > 8 ? 52 : 64,
                lineHeight: 1,
                ...display,
                color: pal.text,
              }}
            >
              <SplitText text={couple.groom} t={t} start={4.15} stagger={0.045} dur={0.7} exitAt={7.0} />
            </div>

            <div
              style={{
                position: 'absolute',
                left: cx - 40,
                top: 278,
                width: 80,
                textAlign: 'center',
                fontFamily: cfg.fonts.script,
                fontStyle: 'italic',
                fontSize: 52,
                lineHeight: 1,
                color: pal.secondary,
                transform: `scale(${anim(t, 4.65, 5.3, 0, 1, ease.outBack) * anim(t, 7.05, 7.35, 1, 0, ease.inCubic)}) rotate(${anim(t, 4.65, 5.3, -60, 0, ease.outBack)}deg)`,
              }}
            >
              &amp;
            </div>

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 340,
                textAlign: 'center',
                fontSize: couple.bride.length > 8 ? 52 : 64,
                lineHeight: 1,
                ...display,
                color: pal.text,
              }}
            >
              <SplitText text={couple.bride} t={t} start={4.95} stagger={0.045} dur={0.7} exitAt={7.05} />
            </div>

            <TrimPath
              viewBox="0 0 140 12"
              d="M2 6 C 35 0, 105 12, 138 6"
              length={142}
              trim={anim(t, 5.5, 6.2, 0, 1, ease.outExpo) * anim(t, 7.0, 7.3, 1, 0)}
              stroke={pal.primary}
              width={1.4}
              style={{ left: cx - 70, top: 424, width: 140, height: 12 }}
            />

            <div
              style={{
                position: 'absolute',
                left: colL + 40,
                width: COL_W - 80,
                top: 456,
                textAlign: 'center',
                fontFamily: cfg.fonts.serif,
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.6,
                color: pal.muted,
                opacity: anim(t, 5.9, 6.6, 0, 1) * anim(t, 6.9, 7.2, 1, 0),
                filter: `blur(${anim(t, 5.9, 6.6, 6, 0)}px)`,
                transform: `translateY(${anim(t, 5.9, 6.6, 10, 0, ease.outExpo)}px)`,
              }}
            >
              {cfg.copy.story}
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE C — POTRET MEMPELAI (masuk lewat iris wipe)
           ============================================================ */}
        {on(T.couple) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              background: pal.paper,
              clipPath: t < 8.35 ? `circle(${irisReveal * 120}% at 50% 50%)` : undefined,
              zIndex: 5,
            }}
          >
            <Plate src={cfg.plates.sky} t={t} range={T.couple} scaleFrom={1.25} scaleTo={1.1} blur={10} style={{ opacity: 0.35 }} />
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${pal.paper}E6, ${pal.bg}D9)` }} />

            {(
              [
                { who: 'groom', photo: groomPhoto, name: couple.groom, full: couple.groomFull, role: cfg.copy.groomRole, x: cx - 72, y: 176, start: 8.05, side: 'right' },
                { who: 'bride', photo: bridePhoto, name: couple.bride, full: couple.brideFull, role: cfg.copy.brideRole, x: cx + 72, y: 400, start: 8.5, side: 'left' },
              ] as const
            ).map((pp) => {
              const reveal = ease.inOutExpo(seg(t, pp.start, pp.start + 0.75));
              const out = ease.inCubic(seg(t, 11.0, 11.5));
              const R = 72;
              const textLeft = pp.side === 'right' ? pp.x + R + 18 : colL + 8;
              const textWidth = pp.side === 'right' ? colL + COL_W - (pp.x + R + 18) - 6 : pp.x - R - 18 - colL - 8;
              return (
                <React.Fragment key={pp.who}>
                  <div
                    style={{
                      position: 'absolute',
                      left: pp.x - R,
                      top: pp.y - R,
                      width: R * 2,
                      height: R * 2,
                      borderRadius: 999,
                      overflow: 'hidden',
                      clipPath: `circle(${reveal * 50}% at 50% 50%)`,
                      transform: `scale(${1 - out * 0.25})`,
                      opacity: 1 - out,
                      boxShadow: '0 18px 40px -18px rgba(0,0,0,0.45)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pp.photo}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${anim(t, pp.start, 11.5, 1.35, 1.05, ease.outCubic)})`,
                      }}
                    />
                  </div>
                  <TrimPath
                    viewBox="0 0 172 172"
                    d="M86 2 A84 84 0 1 1 85.99 2"
                    length={528}
                    trim={anim(t, pp.start + 0.3, pp.start + 1.2, 0, 1, ease.inOutCubic) * (1 - out)}
                    stroke={pal.secondary}
                    width={1.2}
                    style={{ left: pp.x - 86, top: pp.y - 86, width: 172, height: 172, transform: `rotate(${pp.who === 'groom' ? -90 : 90}deg)` }}
                  />

                  <div
                    style={{
                      position: 'absolute',
                      left: textLeft,
                      width: textWidth,
                      top: pp.y - 40,
                      textAlign: pp.side === 'right' ? 'left' : 'right',
                      opacity: 1 - out,
                    }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: pal.primary }}>
                      <SplitText text={pp.role} t={t} start={pp.start + 0.45} stagger={0.015} mode="fade" />
                    </div>
                    <div style={{ marginTop: 6, fontSize: 34, lineHeight: 1.05, ...display, color: pal.text }}>
                      <SplitText text={pp.name} t={t} start={pp.start + 0.55} stagger={0.04} dur={0.6} />
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 11.5,
                        lineHeight: 1.45,
                        color: pal.muted,
                        opacity: anim(t, pp.start + 1.0, pp.start + 1.5, 0, 1),
                        transform: `translateX(${anim(t, pp.start + 1.0, pp.start + 1.6, pp.side === 'right' ? -12 : 12, 0, ease.outExpo)}px)`,
                      }}
                    >
                      {pp.full}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Garis penghubung + lencana & */}
            <TrimPath
              viewBox="0 0 160 240"
              d="M20 0 C 20 120, 140 120, 140 240"
              length={300}
              trim={anim(t, 9.3, 10.1, 0, 1, ease.inOutCubic) * anim(t, 11.0, 11.4, 1, 0)}
              stroke={pal.primary}
              width={1}
              dash={undefined}
              style={{ left: cx - 92, top: 250, width: 160, height: 240, opacity: 0.6 }}
            />
            <div
              style={{
                position: 'absolute',
                left: cx - 22,
                top: 288 - 22 + 60 - 60,
                width: 44,
                height: 44,
                borderRadius: 999,
                background: pal.primary,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: cfg.fonts.script,
                fontStyle: 'italic',
                fontSize: 22,
                transform: `scale(${anim(t, 9.8, 10.3, 0, 1, ease.outBack) * anim(t, 11.0, 11.3, 1, 0)})`,
                boxShadow: `0 0 0 ${anim(t, 9.9, 10.7, 0, 14)}px ${pal.secondary}${Math.round(anim(t, 9.9, 10.7, 90, 0)).toString(16).padStart(2, '0')}`,
              }}
            >
              &amp;
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE D — SAVE THE DATE: odometer + detail acara
           ============================================================ */}
        {on(T.date) && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: pal.bg, zIndex: 6 }}>
            <Plate src={cfg.plates.sky} t={t} range={T.date} scaleFrom={1.3} scaleTo={1.08} yFrom={3} yTo={-2} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(180deg, ${pal.paper}E0 0%, ${pal.paper}B8 45%, ${pal.paper}F0 100%)`,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 120,
                textAlign: 'center',
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.34em',
                textTransform: 'uppercase',
                color: pal.primary,
              }}
            >
              <SplitText text={cfg.copy.dateTag} t={t} start={11.85} stagger={0.018} mode="fade" exitAt={15.0} />
            </div>

            {date ? (
              <>
                <div
                  style={{
                    position: 'absolute',
                    left: colL,
                    width: COL_W,
                    top: 160,
                    textAlign: 'center',
                    fontSize: 15,
                    ...display,
                    fontStyle: 'italic',
                    color: pal.muted,
                    opacity: anim(t, 12.0, 12.5, 0, 1) * anim(t, 15.0, 15.3, 1, 0),
                  }}
                >
                  {date.weekday}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: colL,
                    width: COL_W,
                    top: 172,
                    display: 'flex',
                    justifyContent: 'center',
                    ...display,
                    fontSize: 132,
                    fontVariantNumeric: 'lining-nums',
                    lineHeight: 1,
                    color: pal.primary,
                    opacity: anim(t, 11.9, 12.2, 0, 1) * anim(t, 15.0, 15.3, 1, 0),
                    transform: `translateY(${anim(t, 15.0, 15.35, 0, -24, ease.inCubic)}px)`,
                  }}
                >
                  <Odometer value={date.day} t={t} start={11.95} dur={1.1} style={{}} />
                </div>
                {/* Bulan & tahun bertemu dari dua sisi */}
                <div
                  style={{
                    position: 'absolute',
                    left: colL,
                    width: COL_W,
                    top: 340,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 14,
                    fontSize: 22,
                    ...display,
                    color: pal.text,
                    opacity: anim(t, 15.0, 15.3, 1, 0),
                  }}
                >
                  <span style={{ display: 'inline-block', transform: `translateX(${anim(t, 12.55, 13.2, -60, 0, ease.outExpo)}px)`, opacity: anim(t, 12.55, 12.9, 0, 1) }}>
                    {date.month}
                  </span>
                  <span style={{ width: 1, height: 22, background: pal.secondary, transform: `scaleY(${anim(t, 12.8, 13.2, 0, 1, ease.outBack)})` }} />
                  <span style={{ display: 'inline-block', transform: `translateX(${anim(t, 12.55, 13.2, 60, 0, ease.outExpo)}px)`, opacity: anim(t, 12.55, 12.9, 0, 1) }}>
                    {date.year}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ position: 'absolute', left: colL, width: COL_W, top: 220, textAlign: 'center', fontSize: 30, ...display }}>
                <SplitText text={couple.dateRaw} t={t} start={12.0} stagger={0.03} />
              </div>
            )}

            {/* Detail acara */}
            {[
              { icon: 'clock', text: couple.timeRaw, start: 13.25 },
              { icon: 'pin', text: couple.venue, start: 13.6 },
            ].map((row, i) => {
              const y = 404 + i * 58;
              const out = anim(t, 15.0 + i * 0.06, 15.35 + i * 0.06, 0, 1, ease.inCubic);
              return (
                <div key={row.icon} style={{ position: 'absolute', left: colL + 34, width: COL_W - 68, top: y, opacity: 1 - out, transform: `translateX(${-out * 30}px)` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span
                      style={{
                        position: 'relative',
                        flexShrink: 0,
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        background: pal.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `scale(${anim(t, row.start, row.start + 0.45, 0, 1, ease.outBack)})`,
                      }}
                    >
                      {row.icon === 'pin' &&
                        [0, 1].map((k) => {
                          const cyc = ((t - 14.1 - k * 0.6) % 1.2 + 1.2) % 1.2;
                          const rp = t > 14.1 ? cyc / 1.2 : 0;
                          return (
                            <span
                              key={k}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 999,
                                border: `1.5px solid ${pal.primary}`,
                                transform: `scale(${1 + rp * 1.4})`,
                                opacity: t > 14.1 ? (1 - rp) * 0.7 : 0,
                              }}
                            />
                          );
                        })}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        {row.icon === 'clock' ? (
                          <>
                            <circle cx="12" cy="12" r="9" />
                            <path d={`M12 7 V12 L${12 + 3.5 * Math.sin(anim(t, row.start, row.start + 1.2, 0, Math.PI * 2, ease.outCubic))} ${12 - 3.5 * Math.cos(anim(t, row.start, row.start + 1.2, 0, Math.PI * 2, ease.outCubic))}`} />
                          </>
                        ) : (
                          <>
                            <path d="M12 21s-6-5.5-6-11a6 6 0 1 1 12 0c0 5.5-6 11-6 11z" />
                            <circle cx="12" cy="10" r="2.2" />
                          </>
                        )}
                      </svg>
                    </span>
                    <div style={{ fontSize: 13, lineHeight: 1.45, fontWeight: 500, color: pal.text, paddingTop: 5, overflow: 'hidden' }}>
                      <div style={{ transform: `translateY(${anim(t, row.start + 0.15, row.start + 0.75, 110, 0, ease.outExpo)}%)` }}>{row.text}</div>
                    </div>
                  </div>
                  <TrimPath
                    viewBox={`0 0 ${COL_W - 68} 2`}
                    d={`M0 1 L${COL_W - 68} 1`}
                    length={COL_W - 68}
                    trim={anim(t, row.start + 0.3, row.start + 1.0, 0, 1, ease.outExpo)}
                    stroke={pal.secondary}
                    width={0.8}
                    style={{ left: 0, top: i === 1 ? 50 : 42, width: COL_W - 68, height: 2 }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================
            SCENE E — PENUTUP: foto dalam bingkai lengkung + URL
           ============================================================ */}
        {on(T.close) && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: pal.paper, zIndex: 7 }}>
            <Plate src={cfg.plates.gate} t={t} range={T.close} scaleFrom={1.2} scaleTo={1.1} blur={12} style={{ opacity: 0.25 }} />
            {(() => {
              const W = 232;
              const H = 300;
              const top = 74;
              const rev = ease.inOutExpo(seg(t, 15.75, 16.6));
              return (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      left: cx - W / 2,
                      top,
                      width: W,
                      height: H,
                      borderRadius: `${W / 2}px ${W / 2}px 10px 10px`,
                      overflow: 'hidden',
                      clipPath: `inset(${(1 - rev) * 100}% 0 0 0)`,
                      boxShadow: '0 30px 50px -30px rgba(0,0,0,0.55)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroPhoto}
                      alt=""
                      draggable={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${anim(t, 15.75, DUR, 1.35, 1.08, ease.outCubic)}) translateY(${anim(t, 15.75, DUR, 4, 0)}%)`,
                      }}
                    />
                  </div>
                  <TrimPath
                    viewBox={`0 0 ${W + 20} ${H + 20}`}
                    d={`M10 ${H + 10} V${W / 2 + 10} A${W / 2} ${W / 2} 0 0 1 ${W + 10} ${W / 2 + 10} V${H + 10} Z`}
                    length={2 * (H - W / 2) + Math.PI * (W / 2) + W}
                    trim={anim(t, 16.2, 17.1, 0, 1, ease.inOutCubic)}
                    stroke={pal.secondary}
                    width={1.2}
                    style={{ left: cx - W / 2 - 10, top: top - 10, width: W + 20, height: H + 20 }}
                  />
                </>
              );
            })()}

            <div
              style={{
                position: 'absolute',
                left: colL,
                width: COL_W,
                top: 398,
                textAlign: 'center',
                fontFamily: cfg.fonts.script,
                fontStyle: themeId === 'luxury-pink' ? 'normal' : 'italic',
                fontSize: themeId === 'luxury-pink' ? 50 : 42,
                lineHeight: 1.1,
                color: pal.primary,
              }}
            >
              <SplitText text={cfg.copy.farewell} t={t} start={16.45} stagger={0.04} dur={0.6} mode="fade" />
            </div>

            <div style={{ position: 'absolute', left: colL, width: COL_W, top: 466, textAlign: 'center', fontSize: 13, ...display, color: pal.text, opacity: anim(t, 16.7, 17.1, 0, 1) }}>
              {couple.groom} &amp; {couple.bride}
            </div>

            {(() => {
              const url = couple.slug || 'ruanghadir.net';
              const n = Math.floor(anim(t, 17.0, 17.75, 0, url.length, ease.linear));
              const caret = t > 16.95 && Math.floor(t * 2.5) % 2 === 0;
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: cx - 130,
                    width: 260,
                    top: 500,
                    textAlign: 'center',
                    opacity: anim(t, 16.9, 17.1, 0, 1),
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 2,
                      padding: '7px 14px',
                      borderRadius: 999,
                      border: `1px solid ${pal.secondary}`,
                      background: '#ffffffB3',
                      fontSize: 12,
                      fontWeight: 600,
                      color: pal.primary,
                      transform: `scale(${anim(t, 16.9, 17.3, 0.8, 1, ease.outBack)})`,
                    }}
                  >
                    {url.slice(0, n)}
                    <span style={{ width: 1.5, height: 13, background: pal.primary, opacity: caret ? 1 : 0 }} />
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TRANSISI
           ============================================================ */}
        {stripeVisible && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
            {[pal.secondary, pal.primary, pal.paper].map((c, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${(i * 100) / 3}%`,
                  width: `${100 / 3 + 0.5}%`,
                  top: 0,
                  bottom: 0,
                  background: c,
                  transform: `translate3d(0, ${stripe(i)}%, 0)`,
                }}
              />
            ))}
          </div>
        )}

        {irisVisible && t < 7.75 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              pointerEvents: 'none',
              background: pal.primary,
              clipPath: `circle(${irisCover * 120}% at 50% 50%)`,
            }}
          />
        )}
        {irisVisible && t >= 7.75 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, background: pal.primary }} />
        )}

        {diagVisible && (
          <div
            style={{
              position: 'absolute',
              left: '-60%',
              top: '-20%',
              width: '220%',
              height: '140%',
              zIndex: 30,
              pointerEvents: 'none',
              transform: `translate3d(${diag}%, 0, 0) rotate(-18deg)`,
              background: `linear-gradient(90deg, transparent 0%, ${pal.secondary} 6%, ${pal.primary} 18%, ${pal.primary} 82%, ${pal.secondary} 94%, transparent 100%)`,
            }}
          />
        )}

        {/* Light leak: menyapu pelan + flash di titik potong */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 35,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            background: `radial-gradient(ellipse 60% 45% at ${30 + Math.sin(t * 0.45) * 40}% ${20 + Math.cos(t * 0.35) * 15}%, ${pal.leak} 0%, transparent 70%)`,
            opacity: 0.55 + flash * 0.45,
          }}
        />
        {flash > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 36, pointerEvents: 'none', background: '#FFFFFF', opacity: flash * 0.95 }} />
        )}

        <Particles kind={cfg.particle} t={t} color={pal.secondary} accent={cfg.particle === 'ember' ? '#F3C97A' : pal.primary} width={stageW} />

        {/* Vignette + grain film */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 41, pointerEvents: 'none', boxShadow: 'inset 0 0 120px rgba(0,0,0,0.22)' }} />
        <div
          style={{
            position: 'absolute',
            inset: '-40px',
            zIndex: 42,
            pointerEvents: 'none',
            backgroundImage: GRAIN,
            opacity: 0.09,
            mixBlendMode: 'multiply',
            transform: `translate(${(Math.floor(t * 24) * 37) % 40}px, ${(Math.floor(t * 24) * 53) % 40}px)`,
          }}
        />

        {/* Fade in/out loop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 45,
            pointerEvents: 'none',
            background: pal.paper,
            opacity: Math.max(1 - seg(t, 0, 0.45), seg(t, DUR - 0.45, DUR)),
          }}
        />

        {showWatermark && (
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              zIndex: 50,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: pal.text,
              opacity: 0.55,
            }}
          >
            RuangHadir · Preview
          </div>
        )}
      </div>
    </div>
  );
}
