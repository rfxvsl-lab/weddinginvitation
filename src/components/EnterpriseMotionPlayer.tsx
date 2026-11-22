'use client';

import React, { useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { VideoThemeId, VideoCoupleProps } from '@/lib/invitationVideoEngine';

export interface MotionPlayerCouple extends VideoCoupleProps {
  heroPhoto?: string;
  groomPhoto?: string;
  bridePhoto?: string;
}

interface EnterpriseMotionPlayerProps {
  themeId: VideoThemeId;
  couple: MotionPlayerCouple;
  /** 0..3 active act index */
  sceneIdx: number;
  /** 0..1 continuous timeline progress (Remotion-style frame-driven) */
  progress: number;
  isPlaying: boolean;
  showWatermark?: boolean;
}

const DEFAULT_HERO = '/assets/kharis-lia/hero.jpg';
const DEFAULT_GROOM = '/assets/kharis-lia/groom.jpg';
const DEFAULT_BRIDE = '/assets/kharis-lia/bride.jpg';

// ---- Remotion-style Deterministic Interpolation Helpers ----
function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutCubic(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutExpo(t: number) {
  const x = clamp01(t);
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

function easeInCubic(t: number) {
  const x = clamp01(t);
  return x * x * x;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

function seg(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

/** Smooth bell-curve (0 -> 1 -> 0) around a cut point for volumetric sun-flare transitions */
function flareBell(progress: number, center: number, halfWidth: number) {
  const dist = Math.abs(progress - center);
  if (dist >= halfWidth) return 0;
  return Math.cos((dist / halfWidth) * (Math.PI / 2));
}

interface ThemeCinemaConfig {
  scenes: {
    gate: string;
    hall: string;
    sky: string;
  };
  palette: {
    bg: string;
    cardBg: string;
    cardBorder: string;
    primary: string;
    secondary: string;
    text: string;
    muted: string;
    flareInner: string;
    flareOuter: string;
    skyTextColor: string;
    skyShadow: string;
  };
  fonts: {
    display: string;
    serif: string;
    sans: string;
  };
  copy: {
    openingTag: string;
    openingStory: string;
    coupleStory: string;
    eventTag: string;
    eventHeading: string;
    farewell: string;
  };
}

const THEME_CINEMA: Record<VideoThemeId, ThemeCinemaConfig> = {
  'javanese-classic': {
    scenes: {
      gate: '/assets/video-scenes/javanese-gate.webp',
      hall: '/assets/video-scenes/javanese-hall.webp',
      sky: '/assets/video-scenes/javanese-sky.webp',
    },
    palette: {
      bg: '#F8F0DF',
      cardBg: 'rgba(250, 243, 229, 0.94)',
      cardBorder: '#C59C62',
      primary: '#8A452C',
      secondary: '#C59C62',
      text: '#493021',
      muted: '#6B4E35',
      flareInner: 'rgba(255, 243, 210, 0.92)',
      flareOuter: 'rgba(197, 156, 98, 0.38)',
      skyTextColor: '#493021',
      skyShadow: '0 2px 24px rgba(248, 240, 223, 0.95), 0 1px 2px rgba(255,255,255,0.9)',
    },
    fonts: {
      display: "'Philosopher', 'Playfair Display', Georgia, serif",
      serif: "'Gelasio', Georgia, serif",
      sans: "'Montserrat', sans-serif",
    },
    copy: {
      openingTag: 'PAHARGYAN PERNIKAHAN',
      openingStory:
        'Dengan memohon rahmat dan ridho-Nya, perjalanan baru kami dimulai.',
      coupleStory: 'Dua hati yang dipertemukan untuk melangkah bersama.',
      eventTag: 'IJAB KABUL & RESEPSI',
      eventHeading: 'Pahargyan',
      farewell: 'Sampai Jumpa',
    },
  },
  'grand-ballroom': {
    scenes: {
      gate: '/assets/video-scenes/ballroom-gate.webp',
      hall: '/assets/video-scenes/ballroom-hall.webp',
      sky: '/assets/video-scenes/ballroom-sky.webp',
    },
    palette: {
      bg: '#F3F6FA',
      cardBg: 'rgba(246, 249, 253, 0.92)',
      cardBorder: '#8FA8C2',
      primary: '#345579',
      secondary: '#8FA8C2',
      text: '#23364D',
      muted: '#4B637E',
      flareInner: 'rgba(255, 255, 255, 0.94)',
      flareOuter: 'rgba(143, 168, 194, 0.42)',
      skyTextColor: '#1E3147',
      skyShadow: '0 2px 24px rgba(243, 246, 250, 0.96), 0 1px 2px rgba(255,255,255,0.95)',
    },
    fonts: {
      display: "'Cinzel', 'Playfair Display', Georgia, serif",
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Lato', sans-serif",
    },
    copy: {
      openingTag: 'THE ROYAL WEDDING',
      openingStory:
        'Under crystal light and timeless grace, our forever begins tonight.',
      coupleStory: 'Two souls united in a celebration of enduring love.',
      eventTag: 'ROYAL CEREMONY & RECEPTION',
      eventHeading: 'Grand Reception',
      farewell: 'See You There',
    },
  },
  'luxury-pink': {
    scenes: {
      gate: '/assets/video-scenes/pink-gate.webp',
      hall: '/assets/video-scenes/pink-hall.webp',
      sky: '/assets/video-scenes/pink-sky.webp',
    },
    palette: {
      bg: '#FCF3F6',
      cardBg: 'rgba(253, 246, 249, 0.94)',
      cardBorder: '#D99AB3',
      primary: '#A83D68',
      secondary: '#D99AB3',
      text: '#54243B',
      muted: '#7B465F',
      flareInner: 'rgba(255, 244, 248, 0.95)',
      flareOuter: 'rgba(217, 154, 179, 0.44)',
      skyTextColor: '#54243B',
      skyShadow: '0 2px 24px rgba(252, 243, 246, 0.96), 0 1px 2px rgba(255,255,255,0.95)',
    },
    fonts: {
      display: "'Great Vibes', 'Playfair Display', cursive",
      serif: "'Playfair Display', Georgia, serif",
      sans: "'Nunito Sans', sans-serif",
    },
    copy: {
      openingTag: 'THE WEDDING OF',
      openingStory:
        'Semesta mempertemukan langkah kami untuk merangkai kisah selamanya.',
      coupleStory: 'Kisah cinta yang mekar hangat di setiap langkah kami.',
      eventTag: 'AKAD NIKAH & RESEPSI',
      eventHeading: 'Wedding Schedule',
      farewell: 'Sampai Jumpa',
    },
  },
};

/**
 * 60fps Atmospheric Particle Canvas
 * - javanese-classic: Rising golden firefly embers & drifting white melati petals
 * - grand-ballroom:   Twinkling 4-point crystal stardust & luminous bokeh orbs
 * - luxury-pink:      3D fluttering blush rose petals & warm rose-gold sparkles
 */
function ThemeParticleOverlay({
  themeId,
  isPlaying,
}: {
  themeId: VideoThemeId;
  isPlaying: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = (canvas.width = 360);
    const H = (canvas.height = 640);

    const particles = Array.from({ length: 42 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.6 + Math.random() * 4.4,
      vx: (Math.random() - 0.5) * 0.48,
      vy:
        themeId === 'luxury-pink'
          ? 0.42 + Math.random() * 0.85
          : -(0.22 + Math.random() * 0.65),
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.045,
      angle: Math.random() * Math.PI * 2,
      kind: i % 4 === 0 ? 'petal' : 'orb',
    }));

    let raf = 0;
    let tick = 0;

    const render = () => {
      if (isPlaying) tick += 0.028;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        if (isPlaying) {
          p.x += p.vx + Math.sin(tick + p.phase) * 0.42;
          p.y += p.vy;
          p.angle += p.spin;
          if (p.y < -22) {
            p.y = H + 22;
            p.x = Math.random() * W;
          }
          if (p.y > H + 22) {
            p.y = -22;
            p.x = Math.random() * W;
          }
          if (p.x < -22) p.x = W + 22;
          if (p.x > W + 22) p.x = -22;
        }

        const pulse = 0.45 + 0.55 * Math.sin(tick * 2.1 + p.phase);

        if (themeId === 'javanese-classic') {
          if (p.kind === 'petal') {
            // Drifting white jasmine petal
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.scale(1, 0.55 + 0.45 * Math.sin(tick * 2.5 + p.phase));
            ctx.fillStyle = `rgba(255, 251, 240, ${0.72 * pulse})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            // Warm golden firefly ember
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
            g.addColorStop(0, `rgba(255, 232, 165, ${0.88 * pulse})`);
            g.addColorStop(0.45, `rgba(218, 174, 96, ${0.38 * pulse})`);
            g.addColorStop(1, 'rgba(197, 156, 98, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (themeId === 'grand-ballroom') {
          if (p.kind === 'petal') {
            // Soft luminous bokeh orb
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.4);
            g.addColorStop(0, `rgba(255, 255, 255, ${0.75 * pulse})`);
            g.addColorStop(0.5, `rgba(210, 226, 245, ${0.3 * pulse})`);
            g.addColorStop(1, 'rgba(143, 168, 194, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // 4-point crystal diamond sparkle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * 0.4);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.82 * pulse})`;
            const s = p.r * 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(0, 0, s, 0);
            ctx.quadraticCurveTo(0, 0, 0, s);
            ctx.quadraticCurveTo(0, 0, -s, 0);
            ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.fill();
            ctx.restore();
          }
        } else {
          // Luxury Pink: fluttering rose petals & golden-blush sparkles
          if (p.kind === 'orb') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.scale(1, 0.45 + 0.55 * Math.abs(Math.sin(tick * 2.2 + p.phase)));
            ctx.fillStyle =
              p.r > 3.6
                ? `rgba(225, 145, 178, ${0.65 * pulse})`
                : `rgba(252, 224, 236, ${0.82 * pulse})`;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.r * 1.85, p.r * 0.95, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.8);
            g.addColorStop(0, `rgba(255, 245, 248, ${0.88 * pulse})`);
            g.addColorStop(0.5, `rgba(217, 154, 179, ${0.32 * pulse})`);
            g.addColorStop(1, 'rgba(217, 154, 179, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [themeId, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    />
  );
}

/**
 * Volumetric God Rays Overlay (Sweeping sunlight shafts inspired by anime/cinematic wedding films)
 */
function VolumetricGodRays({
  progress,
  themeId,
}: {
  progress: number;
  themeId: VideoThemeId;
}) {
  const sway = Math.sin(progress * Math.PI * 4) * 8;
  const breath = 0.24 + 0.14 * Math.sin(progress * Math.PI * 6);
  const tint =
    themeId === 'javanese-classic'
      ? 'rgba(255, 236, 185, 0.55)'
      : themeId === 'grand-ballroom'
      ? 'rgba(235, 244, 255, 0.58)'
      : 'rgba(255, 228, 239, 0.58)';

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      style={{ mixBlendMode: 'screen', opacity: breath }}
    >
      <div
        className="absolute -top-[25%] -left-[35%] h-[155%] w-[170%]"
        style={{
          transform: `rotate(${-24 + sway * 0.35}deg) translateX(${sway}px)`,
          background: `repeating-linear-gradient(
            90deg,
            transparent 0%,
            transparent 11%,
            ${tint} 16%,
            transparent 23%,
            transparent 35%,
            ${tint} 41%,
            transparent 49%
          )`,
          filter: 'blur(18px)',
        }}
      />
    </div>
  );
}

/**
 * EnterpriseMotionPlayer — 2.5D Continuous One-Take Cinematic Wedding Film Engine
 * Modeled after bespoke studio animated wedding invitations:
 * - Act 1 (0.00–0.25): Painterly Gateway + Signature Opener + Sky Calligraphy + Camera Push-Through
 * - Act 2 (0.25–0.50): Sunlit Venue Interior + Tactile Polaroid Keepsake Cards (Real Couple Photos) + Dolly Dive
 * - Act 3 (0.50–0.75): Couple Hero Frame + Diegetic Tilted-to-Flat Paper Invitation Note
 * - Act 4 (0.75–1.00): Golden-Hour Sky Tilt-Up -> "Sampai Jumpa" -> Radiant Monogram Finale
 */
export default function EnterpriseMotionPlayer({
  themeId,
  couple,
  progress,
  isPlaying,
  showWatermark = true,
}: EnterpriseMotionPlayerProps) {
  const cfg = THEME_CINEMA[themeId];
  const heroPhoto = couple.heroPhoto || DEFAULT_HERO;
  const groomPhoto = couple.groomPhoto || DEFAULT_GROOM;
  const bridePhoto = couple.bridePhoto || DEFAULT_BRIDE;

  // Continuous normalized progress (0..1)
  const p = clamp01(progress);

  // ---- ACT 1: GATEWAY JOURNEY (0.00 -> 0.27 with overlap fade) ----
  const act1Local = seg(p, 0, 0.25);
  const act1Dive = easeInCubic(seg(p, 0.205, 0.265));
  const act1Opacity = 1 - easeInOutCubic(seg(p, 0.225, 0.27));
  const act1CamScale = lerp(1.02, 1.15, easeOutCubic(act1Local)) + act1Dive * 0.45;
  const act1CamY = lerp(1.5, -1.5, act1Local) - act1Dive * 4;
  const act1Blur = act1Dive * 4.5;
  const act1TitleIn = easeOutExpo(seg(p, 0.025, 0.11));
  const act1StoryIn = easeOutCubic(seg(p, 0.09, 0.17));
  const curtainOpen = easeInOutCubic(seg(p, 0.015, 0.11));

  // ---- ACT 2: VENUE INTERIOR & POLAROID KEEPSAKES (0.23 -> 0.52) ----
  const act2In = easeOutCubic(seg(p, 0.23, 0.275));
  const act2Dive = easeInCubic(seg(p, 0.46, 0.52));
  const act2Out = 1 - easeInOutCubic(seg(p, 0.48, 0.525));
  const act2Opacity = act2In * act2Out;
  const act2Local = seg(p, 0.24, 0.50);
  const act2CamScale = lerp(1.24, 1.06, easeOutCubic(act2Local)) + act2Dive * 0.36;
  const act2CamX = lerp(-2.2, 2.2, easeInOutCubic(act2Local));
  const act2Blur = (1 - act2In) * 3.5 + act2Dive * 4;
  const groomCardIn = easeOutExpo(seg(p, 0.27, 0.355));
  const brideCardIn = easeOutExpo(seg(p, 0.32, 0.405));
  const act2CaptionIn = easeOutCubic(seg(p, 0.265, 0.33));

  // ---- ACT 3: COUPLE HERO + DIEGETIC INVITATION NOTE (0.48 -> 0.77) ----
  const act3In = easeOutCubic(seg(p, 0.48, 0.525));
  const act3Out = 1 - easeInOutCubic(seg(p, 0.73, 0.775));
  const act3Opacity = act3In * act3Out;
  const act3Local = seg(p, 0.49, 0.75);
  const act3CamScale = lerp(1.18, 1.04, easeOutCubic(act3Local));
  const act3TiltUp = easeInCubic(seg(p, 0.71, 0.77)) * 18;
  const heroFrameIn = easeOutExpo(seg(p, 0.51, 0.60));
  const noteCardIn = easeOutExpo(seg(p, 0.55, 0.64));
  // Diegetic paper tilts straight as camera pushes in
  const noteTiltX = lerp(14, 0, noteCardIn);
  const noteTiltZ = lerp(-3.5, 0, noteCardIn);

  // ---- ACT 4: GOLDEN-HOUR SKY TILT-UP -> "SAMPAI JUMPA" -> MONOGRAM FINALE (0.73 -> 1.00) ----
  const act4In = easeOutCubic(seg(p, 0.73, 0.78));
  const act4Local = seg(p, 0.74, 1.0);
  const act4CamScale = lerp(1.12, 1.01, easeOutCubic(act4Local));
  const act4CamY = lerp(5, -2, easeOutCubic(act4Local));
  // Phase 4A: "Sampai Jumpa" (0.76 -> 0.87)
  const farewellIn = easeOutCubic(seg(p, 0.755, 0.805));
  const farewellOut = 1 - easeInOutCubic(seg(p, 0.84, 0.885));
  const farewellOpacity = farewellIn * farewellOut;
  // Phase 4B: Radiant Monogram Finale (0.86 -> 1.00)
  const finaleIn = easeOutExpo(seg(p, 0.865, 0.945));
  const finaleHalo = easeOutCubic(seg(p, 0.85, 0.96));

  // ---- SEAMLESS VOLUMETRIC SUN-FLARE TRANSITIONS OVER CUT POINTS ----
  const cutFlare = Math.max(
    flareBell(p, 0.25, 0.048),
    flareBell(p, 0.5, 0.048),
    flareBell(p, 0.75, 0.052)
  );

  // Envelope flap opening physics for Luxury Pink in Act 1
  const pinkFlapDeg = lerp(0, -172, easeInOutCubic(seg(p, 0.02, 0.11)));

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ backgroundColor: cfg.palette.bg }}
    >
      {/* ================================================================ */}
      {/* ACT 1: PAINTERLY GATEWAY + SIGNATURE OPENER + SKY CALLIGRAPHY   */}
      {/* ================================================================ */}
      {act1Opacity > 0.005 && (
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: act1Opacity }}
        >
          {/* 2.5D Camera Layer — Full-Bleed Painterly Gateway */}
          <img
            src={cfg.scenes.gate}
            alt=""
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{
              transform: `scale(${act1CamScale}) translate3d(0, ${act1CamY}%, 0)`,
              filter: act1Blur > 0.2 ? `blur(${act1Blur}px)` : undefined,
            }}
          />

          {/* Soft upper atmospheric veil so sky calligraphy reads like painted ink */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[44%]"
            style={{
              background: `linear-gradient(to bottom, ${cfg.palette.bg}CC 0%, ${cfg.palette.bg}55 55%, transparent 100%)`,
            }}
          />

          {/* Bottom warm gradient feather for story subtitle */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]"
            style={{
              background:
                'linear-gradient(to top, rgba(16, 12, 10, 0.68) 0%, rgba(16, 12, 10, 0.28) 55%, transparent 100%)',
            }}
          />

          {/* 1:1 Theme Foreground Signature Accent Layer (1.3x Parallax) */}
          {themeId === 'javanese-classic' && (
            <>
              <img
                src="/assets/flower.webp"
                alt=""
                className="pointer-events-none absolute -top-4 -left-4 h-16 w-16 object-contain opacity-85 drop-shadow"
                style={{
                  transform: `rotate(${p * 90}deg) scale(${1 + act1Dive * 0.4})`,
                }}
              />
              <img
                src="/assets/flower.webp"
                alt=""
                className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 object-contain opacity-85 drop-shadow"
                style={{
                  transform: `rotate(${-p * 90}deg) scale(${1 + act1Dive * 0.4})`,
                }}
              />
              {/* Subtle authentic Gunungan watermark emblem above title */}
              <img
                src="/assets/wayang/gunungan.png"
                alt=""
                className="pointer-events-none absolute left-1/2 top-5 h-11 w-11 -translate-x-1/2 object-contain drop-shadow-sm"
                style={{
                  opacity: act1TitleIn * 0.92,
                  transform: `translate(-50%, ${lerp(12, 0, act1TitleIn)}px) scale(${lerp(0.85, 1, act1TitleIn)})`,
                }}
              />
            </>
          )}

          {themeId === 'grand-ballroom' && (
            <>
              {/* Parting Royal Slate Velvet Curtains — Signature Ballroom Reveal */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 w-[52%] z-20"
                style={{
                  transform: `translateX(${lerp(0, -104, curtainOpen)}%)`,
                  background:
                    'repeating-linear-gradient(90deg, #1F354D 0px, #345579 16px, #253D58 32px)',
                  boxShadow: '10px 0 28px rgba(15, 25, 38, 0.55)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[52%] z-20"
                style={{
                  transform: `translateX(${lerp(0, 104, curtainOpen)}%)`,
                  background:
                    'repeating-linear-gradient(90deg, #253D58 0px, #345579 16px, #1F354D 32px)',
                  boxShadow: '-10px 0 28px rgba(15, 25, 38, 0.55)',
                }}
              />
            </>
          )}

          {themeId === 'luxury-pink' && (
            /* Miniature 3D Wax-Seal Envelope Accent Floating Gently at Upper Center */
            <div
              className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2"
              style={{
                perspective: '600px',
                opacity: act1TitleIn * 0.95,
                transform: `translate(-50%, ${lerp(10, 0, act1TitleIn)}px)`,
              }}
            >
              <div
                className="relative h-8 w-12 rounded-[4px] border shadow-sm"
                style={{
                  backgroundColor: '#FCF3F6',
                  borderColor: '#D99AB3',
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-4 origin-top"
                  style={{
                    backgroundColor: '#F2DEE7',
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                    transform: `rotateX(${pinkFlapDeg}deg)`,
                  }}
                />
                <div
                  className="absolute left-1/2 top-2.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: '#A83D68' }}
                />
              </div>
            </div>
          )}

          {/* Sky Calligraphic Title Composition */}
          <div
            className="absolute inset-x-5 top-[13%] flex flex-col items-center text-center"
            style={{
              opacity: act1TitleIn,
              transform: `translate3d(0, ${lerp(16, 0, act1TitleIn) - act1Dive * 18}px, 0) scale(${lerp(0.94, 1, act1TitleIn) + act1Dive * 0.14})`,
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.26em]"
              style={{
                color: cfg.palette.primary,
                fontFamily: cfg.fonts.sans,
                textShadow: cfg.palette.skyShadow,
              }}
            >
              {cfg.copy.openingTag}
            </p>
            <h2
              className={
                themeId === 'luxury-pink'
                  ? 'mt-1 text-[40px] leading-[1.05]'
                  : 'mt-1.5 text-[30px] font-bold leading-[1.08] tracking-[0.02em]'
              }
              style={{
                color: cfg.palette.skyTextColor,
                fontFamily: cfg.fonts.display,
                textShadow: cfg.palette.skyShadow,
              }}
            >
              {couple.groom} &amp; {couple.bride}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-[1px] w-7"
                style={{ backgroundColor: cfg.palette.secondary }}
              />
              <span
                className="text-[9.5px] font-semibold tracking-[0.14em]"
                style={{
                  color: cfg.palette.primary,
                  fontFamily: cfg.fonts.sans,
                  textShadow: cfg.palette.skyShadow,
                }}
              >
                {couple.dateRaw}
              </span>
              <span
                className="h-[1px] w-7"
                style={{ backgroundColor: cfg.palette.secondary }}
              />
            </div>
          </div>

          {/* Poetic Cinematic Story Subtitle at Bottom (like @emootehaya opening caption) */}
          <div
            className="absolute inset-x-6 bottom-[11%] text-center"
            style={{
              opacity: act1StoryIn * (1 - act1Dive),
              transform: `translateY(${lerp(10, 0, act1StoryIn)}px)`,
            }}
          >
            <p
              className="text-[11.5px] italic leading-[1.55] text-white/95"
              style={{
                fontFamily: cfg.fonts.serif,
                textShadow: '0 2px 10px rgba(0,0,0,0.65)',
              }}
            >
              {cfg.copy.openingStory}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ACT 2: INSIDE THE VENUE · POLAROID KEEPSAKE COUPLE MOMENTS      */}
      {/* ================================================================ */}
      {act2Opacity > 0.005 && (
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: act2Opacity }}
        >
          {/* Full-Bleed Painterly Venue Interior with 2.5D Pan & Zoom */}
          <img
            src={cfg.scenes.hall}
            alt=""
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{
              transform: `scale(${act2CamScale}) translate3d(${act2CamX}%, 0, 0)`,
              filter: act2Blur > 0.2 ? `blur(${act2Blur}px)` : undefined,
            }}
          />

          {/* Subtle warm atmospheric scrim to make physical Polaroids pop */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.12) 0%, rgba(18,14,12,0.34) 100%)',
            }}
          />

          {/* Top Narrative Story Line */}
          <div
            className="absolute inset-x-6 top-[9%] text-center"
            style={{
              opacity: act2CaptionIn,
              transform: `translateY(${lerp(-10, 0, act2CaptionIn)}px)`,
            }}
          >
            <p
              className="inline-block rounded-full px-3.5 py-1 text-[9px] font-bold uppercase tracking-[0.22em] backdrop-blur-md"
              style={{
                backgroundColor: cfg.palette.cardBg,
                color: cfg.palette.primary,
                border: `1px solid ${cfg.palette.cardBorder}88`,
                fontFamily: cfg.fonts.sans,
              }}
            >
              {themeId === 'javanese-classic'
                ? 'SANG PENGANTEN'
                : themeId === 'grand-ballroom'
                ? 'THE ROYAL COUPLE'
                : 'THE BRIDE & GROOM'}
            </p>
            <p
              className="mt-2 text-[11px] italic leading-[1.45] text-white"
              style={{
                fontFamily: cfg.fonts.serif,
                textShadow: '0 2px 12px rgba(0,0,0,0.65)',
              }}
            >
              {cfg.copy.coupleStory}
            </p>
          </div>

          {/* Tactile Physical Polaroid / Keepsake Cards (Real Couple Photos) */}
          <div
            className="absolute inset-x-4 top-[24%] bottom-[13%] flex flex-col items-center justify-center gap-3.5"
            style={{ perspective: '1000px' }}
          >
            {/* Groom Polaroid Keepsake */}
            <div
              className="w-[78%] max-w-[238px] rounded-[8px] p-2 pb-3 shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
              style={{
                backgroundColor: '#FFFDF9',
                border: `1px solid ${cfg.palette.cardBorder}66`,
                opacity: groomCardIn,
                transform: `translate3d(${lerp(-28, -8, groomCardIn)}px, ${lerp(24, 0, groomCardIn)}px, 0) rotate(${lerp(-9, -3.5, groomCardIn)}deg) scale(${lerp(0.88, 1, groomCardIn) + act2Dive * 0.14})`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-[78px] w-[70px] shrink-0 overflow-hidden border ${
                    themeId === 'luxury-pink'
                      ? 'rounded-t-full rounded-b-md'
                      : 'rounded-[4px]'
                  }`}
                  style={{ borderColor: `${cfg.palette.cardBorder}88` }}
                >
                  <img
                    src={groomPhoto}
                    alt={couple.groom}
                    className="h-full w-full object-cover"
                    style={{
                      transform: `scale(${lerp(1.12, 1.02, act2Local)})`,
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p
                    className="text-[8px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      color: cfg.palette.secondary,
                      fontFamily: cfg.fonts.sans,
                    }}
                  >
                    MEMPELAI PRIA
                  </p>
                  <p
                    className={
                      themeId === 'luxury-pink'
                        ? 'mt-0.5 text-[22px] leading-tight'
                        : 'mt-0.5 text-[15px] font-bold leading-tight'
                    }
                    style={{
                      color: cfg.palette.primary,
                      fontFamily: cfg.fonts.display,
                    }}
                  >
                    {couple.groom}
                  </p>
                  <p
                    className="mt-0.5 text-[9.5px] leading-snug line-clamp-2"
                    style={{
                      color: cfg.palette.muted,
                      fontFamily: cfg.fonts.serif,
                    }}
                  >
                    {couple.groomFull}
                  </p>
                </div>
              </div>
            </div>

            {/* Ampersand Connector */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full shadow-md"
              style={{
                backgroundColor: cfg.palette.cardBg,
                border: `1px solid ${cfg.palette.cardBorder}`,
                color: cfg.palette.primary,
                fontFamily: cfg.fonts.display,
                opacity: brideCardIn,
                transform: `scale(${lerp(0.6, 1, brideCardIn)})`,
              }}
            >
              <span className="text-[14px] font-bold">&amp;</span>
            </div>

            {/* Bride Polaroid Keepsake */}
            <div
              className="w-[78%] max-w-[238px] rounded-[8px] p-2 pb-3 shadow-[0_18px_40px_rgba(0,0,0,0.34)]"
              style={{
                backgroundColor: '#FFFDF9',
                border: `1px solid ${cfg.palette.cardBorder}66`,
                opacity: brideCardIn,
                transform: `translate3d(${lerp(28, 8, brideCardIn)}px, ${lerp(24, 0, brideCardIn)}px, 0) rotate(${lerp(9, 3.2, brideCardIn)}deg) scale(${lerp(0.88, 1, brideCardIn) + act2Dive * 0.14})`,
              }}
            >
              <div className="flex flex-row-reverse items-center gap-2.5">
                <div
                  className={`h-[78px] w-[70px] shrink-0 overflow-hidden border ${
                    themeId === 'luxury-pink'
                      ? 'rounded-t-full rounded-b-md'
                      : 'rounded-[4px]'
                  }`}
                  style={{ borderColor: `${cfg.palette.cardBorder}88` }}
                >
                  <img
                    src={bridePhoto}
                    alt={couple.bride}
                    className="h-full w-full object-cover"
                    style={{
                      transform: `scale(${lerp(1.12, 1.02, act2Local)})`,
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p
                    className="text-[8px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      color: cfg.palette.secondary,
                      fontFamily: cfg.fonts.sans,
                    }}
                  >
                    MEMPELAI WANITA
                  </p>
                  <p
                    className={
                      themeId === 'luxury-pink'
                        ? 'mt-0.5 text-[22px] leading-tight'
                        : 'mt-0.5 text-[15px] font-bold leading-tight'
                    }
                    style={{
                      color: cfg.palette.primary,
                      fontFamily: cfg.fonts.display,
                    }}
                  >
                    {couple.bride}
                  </p>
                  <p
                    className="mt-0.5 text-[9.5px] leading-snug line-clamp-2"
                    style={{
                      color: cfg.palette.muted,
                      fontFamily: cfg.fonts.serif,
                    }}
                  >
                    {couple.brideFull}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ACT 3: COUPLE HERO FRAME + DIEGETIC PAPER INVITATION NOTE       */}
      {/* ================================================================ */}
      {act3Opacity > 0.005 && (
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{
            opacity: act3Opacity,
            transform: `translateY(${-act3TiltUp}px)`,
          }}
        >
          {/* Full-Bleed Softly Blurred Venue Backdrop */}
          <img
            src={cfg.scenes.hall}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: `scale(${act3CamScale + 0.08})`,
              filter: 'blur(6px) brightness(0.76)',
            }}
          />

          <div
            className="relative flex h-full w-full flex-col items-center justify-center gap-3.5 px-4 py-8"
            style={{ perspective: '1000px' }}
          >
            {/* Architectural Couple Hero Photo Frame (Ken Burns) */}
            <div
              className={`relative w-[82%] max-w-[244px] h-[146px] overflow-hidden shadow-[0_18px_36px_rgba(0,0,0,0.36)] ${
                themeId === 'luxury-pink'
                  ? 'rounded-t-[120px] rounded-b-[14px]'
                  : themeId === 'grand-ballroom'
                  ? 'rounded-[12px]'
                  : 'rounded-[6px]'
              }`}
              style={{
                border: `2px solid ${cfg.palette.cardBorder}`,
                opacity: heroFrameIn,
                transform: `translateY(${lerp(20, 0, heroFrameIn)}px) scale(${lerp(0.92, 1, heroFrameIn)})`,
              }}
            >
              <img
                src={heroPhoto}
                alt={`${couple.groom} & ${couple.bride}`}
                className="h-full w-full object-cover"
                style={{
                  transform: `scale(${lerp(1.16, 1.03, act3Local)})`,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute inset-x-3 bottom-2 text-center">
                <p
                  className="text-[11px] font-semibold tracking-[0.14em] text-white/95"
                  style={{ fontFamily: cfg.fonts.display }}
                >
                  {couple.groom} &amp; {couple.bride}
                </p>
              </div>
            </div>

            {/* Diegetic Physical Paper Invitation Note (Tilts straight as camera pushes in) */}
            <div
              className={`relative w-[88%] max-w-[260px] p-4 shadow-[0_22px_45px_rgba(0,0,0,0.34)] ${
                themeId === 'luxury-pink'
                  ? 'rounded-[22px]'
                  : themeId === 'grand-ballroom'
                  ? 'rounded-[14px]'
                  : 'rounded-[8px]'
              }`}
              style={{
                backgroundColor: cfg.palette.cardBg,
                border: `1.5px solid ${cfg.palette.cardBorder}`,
                opacity: noteCardIn,
                transform: `rotateX(${noteTiltX}deg) rotateZ(${noteTiltZ}deg) translateY(${lerp(24, 0, noteCardIn)}px) scale(${lerp(0.92, 1.02, noteCardIn)})`,
              }}
            >
              {/* Javanese Authentic Corner L-Brackets */}
              {themeId === 'javanese-classic' && (
                <>
                  <span
                    className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 border-l-2 border-t-2"
                    style={{ borderColor: cfg.palette.primary }}
                  />
                  <span
                    className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 border-r-2 border-t-2"
                    style={{ borderColor: cfg.palette.primary }}
                  />
                  <span
                    className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2"
                    style={{ borderColor: cfg.palette.primary }}
                  />
                  <span
                    className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2"
                    style={{ borderColor: cfg.palette.primary }}
                  />
                </>
              )}

              {/* Ballroom Double Inset Hairline */}
              {themeId === 'grand-ballroom' && (
                <div
                  className="pointer-events-none absolute inset-1.5 rounded-[10px] border"
                  style={{ borderColor: `${cfg.palette.cardBorder}66` }}
                />
              )}

              <div className="relative text-center">
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: `${cfg.palette.primary}18`,
                    color: cfg.palette.primary,
                    fontFamily: cfg.fonts.sans,
                  }}
                >
                  {cfg.copy.eventTag}
                </span>

                <h3
                  className={
                    themeId === 'luxury-pink'
                      ? 'mt-1 text-[24px] leading-tight'
                      : 'mt-1 text-[17px] font-bold leading-tight'
                  }
                  style={{
                    color: cfg.palette.text,
                    fontFamily: cfg.fonts.display,
                  }}
                >
                  {cfg.copy.eventHeading}
                </h3>

                <div
                  className="mx-auto my-2 h-[1px] w-14"
                  style={{ backgroundColor: `${cfg.palette.cardBorder}99` }}
                />

                <div
                  className="space-y-1.5 text-left text-[10px]"
                  style={{
                    color: cfg.palette.text,
                    fontFamily: cfg.fonts.sans,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={12}
                      className="shrink-0"
                      style={{ color: cfg.palette.primary }}
                    />
                    <span className="font-semibold">{couple.dateRaw}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      size={12}
                      className="shrink-0"
                      style={{ color: cfg.palette.primary }}
                    />
                    <span>{couple.timeRaw} – Selesai</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={12}
                      className="mt-0.5 shrink-0"
                      style={{ color: cfg.palette.primary }}
                    />
                    <span className="leading-snug line-clamp-2">
                      {couple.venue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ACT 4: GOLDEN-HOUR SKY TILT-UP -> "SAMPAI JUMPA" -> MONOGRAM    */}
      {/* ================================================================ */}
      {act4In > 0.005 && (
        <div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: act4In }}
        >
          {/* Full-Bleed Painterly Sunset / Twilight Sky */}
          <img
            src={cfg.scenes.sky}
            alt=""
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{
              transform: `scale(${act4CamScale}) translate3d(0, ${act4CamY}%, 0)`,
            }}
          />

          {/* Phase 4A: "Sampai Jumpa" Floating in Luminous Sky */}
          {farewellOpacity > 0.01 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{
                opacity: farewellOpacity,
                transform: `translateY(${lerp(12, -8, seg(p, 0.755, 0.885))}px) scale(${lerp(0.94, 1.05, seg(p, 0.755, 0.885))})`,
              }}
            >
              <p
                className={
                  themeId === 'luxury-pink'
                    ? 'text-[38px] leading-none'
                    : 'text-[26px] italic font-medium tracking-[0.08em]'
                }
                style={{
                  color: cfg.palette.skyTextColor,
                  fontFamily:
                    themeId === 'luxury-pink'
                      ? cfg.fonts.display
                      : cfg.fonts.serif,
                  textShadow: cfg.palette.skyShadow,
                }}
              >
                {cfg.copy.farewell}
              </p>
            </div>
          )}

          {/* Phase 4B: Radiant Sunburst Halo + Couple Monogram Finale */}
          {finaleIn > 0.01 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              {/* Soft radiant sunlight bloom behind monogram */}
              <div
                className="pointer-events-none absolute h-56 w-56 rounded-full"
                style={{
                  opacity: finaleHalo * 0.72,
                  background: `radial-gradient(circle, ${cfg.palette.flareInner} 0%, ${cfg.palette.flareOuter} 45%, transparent 72%)`,
                  filter: 'blur(12px)',
                }}
              />

              <div
                className="relative flex flex-col items-center"
                style={{
                  opacity: finaleIn,
                  transform: `scale(${lerp(0.86, 1, finaleIn)}) translateY(${lerp(14, 0, finaleIn)}px)`,
                }}
              >
                {themeId === 'javanese-classic' && (
                  <img
                    src="/assets/wayang/gunungan.png"
                    alt=""
                    className="mb-2 h-11 w-11 object-contain opacity-90 drop-shadow-sm"
                  />
                )}

                <p
                  className="text-[46px] font-bold leading-none tracking-[0.06em]"
                  style={{
                    color: cfg.palette.skyTextColor,
                    fontFamily: cfg.fonts.display,
                    textShadow: cfg.palette.skyShadow,
                  }}
                >
                  {couple.initials}
                </p>

                <p
                  className={
                    themeId === 'luxury-pink'
                      ? 'mt-1 text-[30px] leading-none'
                      : 'mt-1.5 text-[18px] font-semibold tracking-[0.06em]'
                  }
                  style={{
                    color: cfg.palette.primary,
                    fontFamily: cfg.fonts.display,
                    textShadow: cfg.palette.skyShadow,
                  }}
                >
                  {couple.groom} &amp; {couple.bride}
                </p>

                <div
                  className="mt-3 rounded-full px-3.5 py-1 text-[9.5px] font-semibold tracking-[0.12em] backdrop-blur-md"
                  style={{
                    backgroundColor: cfg.palette.cardBg,
                    color: cfg.palette.text,
                    border: `1px solid ${cfg.palette.cardBorder}99`,
                    fontFamily: cfg.fonts.sans,
                  }}
                >
                  {couple.dateRaw}
                </div>

                <p
                  className="mt-2.5 text-[9.5px] font-medium tracking-[0.08em]"
                  style={{
                    color: cfg.palette.skyTextColor,
                    fontFamily: cfg.fonts.sans,
                    textShadow: cfg.palette.skyShadow,
                  }}
                >
                  {couple.slug}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* PERSISTENT CINEMA OVERLAYS: GOD RAYS, PARTICLES & SUN FLARES    */}
      {/* ================================================================ */}
      <VolumetricGodRays progress={p} themeId={themeId} />
      <ThemeParticleOverlay themeId={themeId} isPlaying={isPlaying} />

      {/* Seamless Volumetric Sunbeam Light-Leak Transition over Cut Points */}
      {cutFlare > 0.01 && (
        <div
          className="pointer-events-none absolute inset-0 z-40"
          style={{
            mixBlendMode: 'screen',
            opacity: cutFlare * 0.85,
            background: `radial-gradient(circle at 65% 28%, ${cfg.palette.flareInner} 0%, ${cfg.palette.flareOuter} 48%, transparent 82%)`,
          }}
        />
      )}

      {/* Subtle Cinema Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          boxShadow: 'inset 0 0 42px rgba(15, 12, 10, 0.24)',
        }}
      />

      {/* Subtle Preview Watermark (Removed in Enterprise Export) */}
      {showWatermark && (
        <div className="pointer-events-none absolute bottom-3 inset-x-0 z-40 flex justify-center">
          <span className="rounded-full bg-black/28 px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
            RuangHadir Enterprise Preview
          </span>
        </div>
      )}
    </div>
  );
}
