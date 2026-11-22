'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Crown,
  Sparkles,
  Heart,
  Gem,
} from 'lucide-react';
import { VideoThemeId, VideoCoupleProps } from '@/lib/invitationVideoEngine';

export interface MotionPlayerCouple extends VideoCoupleProps {
  heroPhoto?: string;
  groomPhoto?: string;
  bridePhoto?: string;
}

interface EnterpriseMotionPlayerProps {
  themeId: VideoThemeId;
  couple: MotionPlayerCouple;
  /** 0..3 active scene index */
  sceneIdx: number;
  /** 0..1 overall progress */
  progress: number;
  isPlaying: boolean;
  showWatermark?: boolean;
}

const DEFAULT_HERO = '/assets/kharis-lia/hero.jpg';
const DEFAULT_GROOM = '/assets/kharis-lia/groom.jpg';
const DEFAULT_BRIDE = '/assets/kharis-lia/bride.jpg';

/**
 * 60fps Particle & Light-Leak FX Canvas Overlay
 * Renders theme-authentic floating particles on top of the 1:1 DOM composition:
 * - javanese-classic: Rising golden firefly embers & warm dust
 * - grand-ballroom:   Twinkling crystal stardust bokeh & chandelier glints
 * - luxury-pink:      Tumbling rose petals & soft blush bokeh orbs
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

    const particles = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.8 + Math.random() * 4.5,
      vx: (Math.random() - 0.5) * 0.45,
      vy:
        themeId === 'luxury-pink'
          ? 0.35 + Math.random() * 0.75
          : -(0.25 + Math.random() * 0.65),
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.04,
      angle: Math.random() * Math.PI * 2,
      id: i,
    }));

    let raf = 0;
    let tick = 0;

    const render = () => {
      if (isPlaying) tick += 0.03;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        if (isPlaying) {
          p.x += p.vx + Math.sin(tick + p.phase) * 0.35;
          p.y += p.vy;
          p.angle += p.spin;
          if (p.y < -20) {
            p.y = H + 20;
            p.x = Math.random() * W;
          }
          if (p.y > H + 20) {
            p.y = -20;
            p.x = Math.random() * W;
          }
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
        }

        const pulse = 0.45 + 0.55 * Math.sin(tick * 2.2 + p.phase);

        if (themeId === 'javanese-classic') {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(218, 174, 96, ${0.75 * pulse})`);
          g.addColorStop(0.5, `rgba(197, 156, 98, ${0.28 * pulse})`);
          g.addColorStop(1, 'rgba(197, 156, 98, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (themeId === 'grand-ballroom') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = `rgba(143, 168, 194, ${0.55 * pulse})`;
          // 4-point diamond sparkle
          const s = p.r * 1.4;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.28, -s * 0.28);
          ctx.lineTo(s, 0);
          ctx.lineTo(s * 0.28, s * 0.28);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.28, s * 0.28);
          ctx.lineTo(-s, 0);
          ctx.lineTo(-s * 0.28, -s * 0.28);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          // Luxury Pink tumbling rose petals & blush bokeh
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle =
            p.id % 3 === 0
              ? `rgba(168, 61, 104, ${0.24 * pulse})`
              : `rgba(217, 154, 179, ${0.48 * pulse})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r * 1.6, p.r * 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
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
 * Sweeping After Effects Light Leak Flash triggered on every scene change
 */
function SceneLightLeak({
  sceneIdx,
  color,
}: {
  sceneIdx: number;
  color: string;
}) {
  return (
    <motion.div
      key={`leak-${sceneIdx}`}
      initial={{ opacity: 0.75, x: '-60%' }}
      animate={{ opacity: 0, x: '120%' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        background: `linear-gradient(105deg, transparent 20%, ${color} 50%, transparent 80%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
}

export default function EnterpriseMotionPlayer({
  themeId,
  couple,
  sceneIdx,
  progress,
  isPlaying,
  showWatermark = false,
}: EnterpriseMotionPlayerProps) {
  const heroImg = couple.heroPhoto || DEFAULT_HERO;
  const groomImg = couple.groomPhoto || DEFAULT_GROOM;
  const brideImg = couple.bridePhoto || DEFAULT_BRIDE;

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      {/* Inject authentic Google Fonts used by the 3 real themes */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Gelasio:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Lato:wght@400;700&family=Montserrat:wght@500;700&family=Nunito+Sans:wght@400;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');
      `}</style>

      {/* ================================================================
          THEME 1: JAVANESE CLASSIC (1:1 JavaneseClassicLayout.tsx)
          #F8F0DF · #EBDFC5 · #8A452C · #C59C62 · #493021
         ================================================================ */}
      {themeId === 'javanese-classic' && (
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, #FDF8EC 0%, #F8F0DF 60%, #EBDFC5 100%)',
            color: '#493021',
          }}
        >
          {/* Rotating Real /assets/flower.webp Corners */}
          <motion.img
            src="/assets/flower.webp"
            alt=""
            animate={isPlaying ? { rotate: 360 } : undefined}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -top-12 -left-12 z-10 h-32 w-32 object-contain opacity-65 drop-shadow-[0_4px_12px_rgba(73,48,33,0.28)]"
          />
          <motion.img
            src="/assets/flower.webp"
            alt=""
            animate={isPlaying ? { rotate: -360 } : undefined}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="pointer-events-none absolute -bottom-12 -right-12 z-10 h-32 w-32 object-contain opacity-65 drop-shadow-[0_4px_12px_rgba(73,48,33,0.28)]"
          />

          {/* Subtle Inner Javanese Border Frame (.javanese-border) */}
          <div className="pointer-events-none absolute inset-4 z-10 border border-[#C59C62]/70 rounded-[4px]">
            <span className="absolute -top-1 -left-1 h-6 w-6 border-t-2 border-l-2 border-[#8A452C]" />
            <span className="absolute -top-1 -right-1 h-6 w-6 border-t-2 border-r-2 border-[#8A452C]" />
            <span className="absolute -bottom-1 -left-1 h-6 w-6 border-b-2 border-l-2 border-[#8A452C]" />
            <span className="absolute -bottom-1 -right-1 h-6 w-6 border-b-2 border-r-2 border-[#8A452C]" />
          </div>

          <AnimatePresence mode="wait">
            {sceneIdx === 0 && (
              <motion.div
                key="java-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, filter: 'blur(6px)' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-8 text-center"
              >
                <motion.img
                  src="/assets/wayang/gunungan.png"
                  alt="Gunungan Wayang"
                  initial={{ opacity: 0, y: 36, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="h-44 w-auto object-contain drop-shadow-[0_12px_22px_rgba(73,48,33,0.28)]"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.25, duration: 0.65 }}
                  className="mt-4 h-[1px] w-40 bg-[#8A452C]/45"
                />
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.26em] text-[#8A452C]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Pawiwahan Pernikahan
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="mt-1.5 text-[30px] font-bold leading-tight text-[#493021]"
                  style={{ fontFamily: "'Philosopher', serif" }}
                >
                  {couple.groom} &amp; {couple.bride}
                </motion.h3>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.55, duration: 0.65 }}
                  className="mt-3 h-[1px] w-40 bg-[#8A452C]/45"
                />
              </motion.div>
            )}

            {sceneIdx === 1 && (
              <motion.div
                key="java-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p
                  className="border-b border-[#8A452C] pb-1 text-[15px] font-bold uppercase tracking-[0.2em] text-[#8A452C]"
                  style={{ fontFamily: "'Philosopher', serif" }}
                >
                  Sang Penganten
                </p>

                {/* Real Circular Portraits matching JavaneseClassicLayout */}
                <div className="mt-5 flex items-center justify-center gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30, scale: 0.85 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 120 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#F8F0DF] ring-2 ring-[#8A452C] shadow-[0_8px_20px_rgba(73,48,33,0.3)]">
                      <img
                        src={groomImg}
                        alt={couple.groom}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p
                      className="mt-2.5 text-[18px] font-bold text-[#493021]"
                      style={{ fontFamily: "'Philosopher', serif" }}
                    >
                      {couple.groom}
                    </p>
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="text-[26px] italic text-[#8A452C]"
                    style={{ fontFamily: "'Gelasio', serif" }}
                  >
                    &amp;
                  </motion.span>

                  <motion.div
                    initial={{ opacity: 0, x: 30, scale: 0.85 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 120 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#F8F0DF] ring-2 ring-[#8A452C] shadow-[0_8px_20px_rgba(73,48,33,0.3)]">
                      <img
                        src={brideImg}
                        alt={couple.bride}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p
                      className="mt-2.5 text-[18px] font-bold text-[#493021]"
                      style={{ fontFamily: "'Philosopher', serif" }}
                    >
                      {couple.bride}
                    </p>
                  </motion.div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-4 text-[11px] leading-relaxed text-[#493021]/85"
                  style={{ fontFamily: "'Gelasio', serif" }}
                >
                  {couple.groomFull}
                  <br />
                  &amp; {couple.brideFull}
                </motion.p>
              </motion.div>
            )}

            {sceneIdx === 2 && (
              <motion.div
                key="java-2"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p
                  className="border-b border-[#8A452C] pb-1 text-[16px] font-bold uppercase tracking-[0.2em] text-[#8A452C]"
                  style={{ fontFamily: "'Philosopher', serif" }}
                >
                  Pahargyan
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.6 }}
                  className="mt-5 w-full rounded-[4px] border border-[#C59C62] bg-[#EBDFC5]/90 p-5 shadow-[0_8px_24px_rgba(73,48,33,0.12)]"
                >
                  <span
                    className="inline-block rounded-bl-lg bg-[#8A452C] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F8F0DF]"
                    style={{ fontFamily: "'Philosopher', serif" }}
                  >
                    Ijab Kabul &amp; Resepsi
                  </span>
                  <div className="mt-4 space-y-2.5 text-left text-[12px] text-[#493021]">
                    <p className="flex items-center gap-2.5 font-semibold">
                      <Calendar className="h-4 w-4 shrink-0 text-[#8A452C]" />
                      <span>{couple.dateRaw}</span>
                    </p>
                    <p className="flex items-center gap-2.5 font-semibold">
                      <Clock className="h-4 w-4 shrink-0 text-[#8A452C]" />
                      <span>Pukul {couple.timeRaw}</span>
                    </p>
                    <p className="flex items-start gap-2.5 leading-snug">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8A452C]" />
                      <span>{couple.venue}</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {sceneIdx === 3 && (
              <motion.div
                key="java-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-20 flex h-full w-full flex-col items-center justify-end p-6 text-center"
              >
                <motion.img
                  src={heroImg}
                  alt="Couple"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1.02 }}
                  transition={{ duration: 3.5, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A180D] via-[#493021]/40 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="relative z-10 mb-8 w-full rounded-[6px] border border-[#C59C62]/80 bg-[#F8F0DF]/92 p-4 backdrop-blur-md shadow-xl"
                >
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#8A452C]">
                    Save The Date
                  </p>
                  <p
                    className="mt-1 text-[24px] font-bold text-[#493021]"
                    style={{ fontFamily: "'Philosopher', serif" }}
                  >
                    {couple.groom} &amp; {couple.bride}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#493021]/80">
                    {couple.dateRaw}
                  </p>
                  <div className="mt-3 inline-block rounded bg-[#8A452C] px-4 py-1.5 text-[10.5px] font-bold text-[#F8F0DF]">
                    {couple.slug}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <SceneLightLeak sceneIdx={sceneIdx} color="rgba(218,174,96,0.55)" />
        </div>
      )}

      {/* ================================================================
          THEME 2: GRAND BALLROOM (1:1 GrandBallroomLayout.tsx)
          #F3F6FA · #E1E9F2 · #345579 · #8FA8C2 · #23364D
         ================================================================ */}
      {themeId === 'grand-ballroom' && (
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(160deg, #FFFFFF 0%, #F3F6FA 55%, #E1E9F2 100%)',
            color: '#23364D',
          }}
        >
          {/* Swaying Crystal Chandelier SVG at top */}
          <motion.div
            animate={isPlaying ? { rotate: [-2.5, 2.5, -2.5] } : undefined}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-20"
          >
            <svg width="110" height="68" viewBox="0 0 110 68" fill="none">
              <line x1="55" y1="0" x2="55" y2="26" stroke="#8FA8C2" strokeWidth="2" />
              <path d="M25 32 Q55 48 85 32" stroke="#345579" strokeWidth="1.6" fill="none" />
              <path d="M12 42 Q55 62 98 42" stroke="#8FA8C2" strokeWidth="1.4" fill="none" />
              {[24, 39, 55, 71, 86].map((x, idx) => (
                <circle
                  key={x}
                  cx={x}
                  cy={idx === 2 ? 58 : idx === 1 || idx === 3 ? 52 : 46}
                  r="3"
                  fill="#8FA8C2"
                />
              ))}
            </svg>
          </motion.div>

          {/* Exact .glass-ballroom Double Inset Marble Frame */}
          <div
            className="pointer-events-none absolute inset-4 z-10 rounded-[2px] border border-[#8FA8C2]"
            style={{ boxShadow: 'inset 0 0 0 5px #E1E9F2' }}
          />

          {/* Twin Royal Slate Velvet Curtains Parting Open in Scene 0 */}
          {sceneIdx === 0 && (
            <>
              <motion.div
                initial={{ x: '0%' }}
                animate={{ x: '-92%' }}
                transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                className="pointer-events-none absolute inset-y-0 left-0 z-30 w-1/2 border-r-2 border-[#8FA8C2]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #23364D 0px, #345579 18px, #1D2C40 36px)',
                }}
              />
              <motion.div
                initial={{ x: '0%' }}
                animate={{ x: '92%' }}
                transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                className="pointer-events-none absolute inset-y-0 right-0 z-30 w-1/2 border-l-2 border-[#8FA8C2]"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #1D2C40 0px, #345579 18px, #23364D 36px)',
                }}
              />
            </>
          )}

          <AnimatePresence mode="wait">
            {sceneIdx === 0 && (
              <motion.div
                key="gb-0"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
                transition={{ delay: 0.35, duration: 0.75 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-8 text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8FA8C2] bg-[#E1E9F2]/80 text-[#345579]">
                  <Crown className="h-5 w-5" />
                </div>
                <p
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#345579]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  The Grand Ballroom
                </p>
                <h3
                  className="mt-2 text-[42px] font-semibold leading-none text-[#23364D]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {couple.initials}
                </h3>
                <div className="my-3 flex items-center gap-2 text-[#8FA8C2]">
                  <span className="h-[1px] w-10 bg-[#8FA8C2]" />
                  <Gem className="h-3.5 w-3.5 text-[#345579]" />
                  <span className="h-[1px] w-10 bg-[#8FA8C2]" />
                </div>
                <p
                  className="text-[12px] text-[#345579]"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  {couple.groom} &amp; {couple.bride}
                </p>
              </motion.div>
            )}

            {sceneIdx === 1 && (
              <motion.div
                key="gb-1"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#345579]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  The Royal Couple
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.55 }}
                    className="border border-[#8FA8C2] bg-white p-1.5 shadow-md"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden">
                      <img
                        src={groomImg}
                        alt={couple.groom}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p
                      className="mt-2 text-[14px] font-bold text-[#23364D]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {couple.groom}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.55 }}
                    className="border border-[#8FA8C2] bg-white p-1.5 shadow-md"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden">
                      <img
                        src={brideImg}
                        alt={couple.bride}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p
                      className="mt-2 text-[14px] font-bold text-[#23364D]"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {couple.bride}
                    </p>
                  </motion.div>
                </div>

                <p className="mt-3 text-[10.5px] text-[#345579]">
                  {couple.groomFull} · {couple.brideFull}
                </p>
              </motion.div>
            )}

            {sceneIdx === 2 && (
              <motion.div
                key="gb-2"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p
                  className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#345579]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Grand Reception
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="mt-4 w-full border border-[#8FA8C2] bg-white/95 p-5 shadow-lg"
                  style={{ boxShadow: 'inset 0 0 0 4px #E1E9F2' }}
                >
                  <p
                    className="text-[18px] font-bold text-[#23364D]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {couple.dateRaw}
                  </p>
                  <div className="my-3 h-[1px] w-full bg-[#E1E9F2]" />
                  <div className="space-y-2 text-left text-[12px] text-[#23364D]">
                    <p className="flex items-center gap-2 font-semibold text-[#345579]">
                      <Clock className="h-4 w-4 shrink-0" /> Pukul {couple.timeRaw}
                    </p>
                    <p className="flex items-start gap-2 leading-snug">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#345579]" />
                      <span>{couple.venue}</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {sceneIdx === 3 && (
              <motion.div
                key="gb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-20 flex h-full w-full flex-col items-center justify-end p-6 text-center"
              >
                <motion.img
                  src={heroImg}
                  alt="Couple"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1.02 }}
                  transition={{ duration: 3.5, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#162334] via-[#23364D]/40 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 mb-8 w-full border border-[#8FA8C2] bg-[#F3F6FA]/94 p-4 backdrop-blur-md shadow-xl"
                >
                  <p
                    className="text-[9.5px] font-bold uppercase tracking-[0.26em] text-[#345579]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Save The Date
                  </p>
                  <p
                    className="mt-1 text-[22px] font-bold text-[#23364D]"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {couple.groom} &amp; {couple.bride}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#345579]">
                    {couple.dateRaw}
                  </p>
                  <div className="mt-3 inline-block rounded-full bg-[#345579] px-4 py-1.5 text-[10.5px] font-bold text-[#F3F6FA]">
                    {couple.slug}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <SceneLightLeak sceneIdx={sceneIdx} color="rgba(180,212,245,0.55)" />
        </div>
      )}

      {/* ================================================================
          THEME 3: LUXURY LOVE PINK (1:1 LuxuryPinkLayout.tsx)
          #FCF3F6 · #F2DEE7 · #A83D68 · #D99AB3 · #54243B
         ================================================================ */}
      {themeId === 'luxury-pink' && (
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            background:
              'linear-gradient(160deg, #FCF3F6 0%, #F8E6EE 55%, #F2DEE7 100%)',
            color: '#54243B',
          }}
        >
          {/* Signature Arched Border Frame (rounded-t-full border-2 border-[#D99AB3]) */}
          <div className="pointer-events-none absolute inset-4 z-10 rounded-t-full rounded-b-2xl border-2 border-[#D99AB3]/80" />

          <AnimatePresence mode="wait">
            {sceneIdx === 0 && (
              <motion.div
                key="pink-0"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -24, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center"
              >
                {/* Exact 3D Luxury Pink Envelope Opening Mechanic */}
                <div
                  className="relative mt-12 h-36 w-56"
                  style={{ perspective: '1000px' }}
                >
                  {/* Envelope Back (#A83D68) */}
                  <div className="absolute inset-0 rounded-b-xl bg-[#A83D68] shadow-xl" />

                  {/* Rising Invitation Card (#FCF3F6) */}
                  <motion.div
                    initial={{ y: 4 }}
                    animate={{ y: -74 }}
                    transition={{
                      delay: 0.6,
                      duration: 0.95,
                      type: 'spring',
                      stiffness: 85,
                      damping: 14,
                    }}
                    className="absolute inset-x-2.5 top-2 h-32 rounded-lg border border-[#D99AB3] bg-[#FCF3F6] p-3 shadow-md flex flex-col items-center justify-center z-10"
                  >
                    <Heart className="h-4 w-4 text-[#A83D68] fill-[#A83D68]/20" />
                    <p
                      className="mt-1 text-[24px] leading-none text-[#54243B]"
                      style={{ fontFamily: "'Great Vibes', cursive" }}
                    >
                      {couple.groom} &amp; {couple.bride}
                    </p>
                    <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#A83D68]">
                      The Wedding Invitation
                    </p>
                  </motion.div>

                  {/* Envelope Front Folds */}
                  <div
                    className="absolute inset-0 z-20 rounded-bl-xl bg-[#A83D68]"
                    style={{ clipPath: 'polygon(0 0, 50% 52%, 0 100%)' }}
                  />
                  <div
                    className="absolute inset-0 z-20 rounded-br-xl bg-[#D99AB3]"
                    style={{ clipPath: 'polygon(100% 0, 50% 52%, 100% 100%)' }}
                  />
                  <div
                    className="absolute inset-0 z-20 rounded-b-xl bg-[#8F2E56]"
                    style={{ clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)' }}
                  />

                  {/* Animated 3D Top Flap (#54243B) */}
                  <motion.div
                    initial={{ rotateX: 0 }}
                    animate={{ rotateX: -175 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      transformOrigin: 'top center',
                      clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                    }}
                    className="absolute top-0 left-0 right-0 z-30 h-1/2 rounded-t-xl bg-[#54243B]"
                  />
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-[#A83D68]"
                  style={{ fontFamily: "'Nunito Sans', sans-serif" }}
                >
                  You Are Cordially Invited
                </motion.p>
              </motion.div>
            )}

            {sceneIdx === 1 && (
              <motion.div
                key="pink-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#A83D68]">
                  The Wedding Of
                </p>

                {/* Exact Arched Couple Frame (rounded-t-full border-4 border-[#D99AB3]) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.7 }}
                  className="mt-3 h-44 w-36 overflow-hidden rounded-t-full border-4 border-[#D99AB3] bg-[#FCF3F6] p-1 shadow-xl"
                >
                  <motion.img
                    src={heroImg}
                    alt={`${couple.groom} & ${couple.bride}`}
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 3.2, ease: 'easeOut' }}
                    className="h-full w-full rounded-t-full object-cover"
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-[34px] leading-none text-[#54243B]"
                  style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                  {couple.groom} &amp; {couple.bride}
                </motion.h3>
                <p className="mt-2 text-[10.5px] font-semibold text-[#A83D68]">
                  {couple.groomFull} · {couple.brideFull}
                </p>
              </motion.div>
            )}

            {sceneIdx === 2 && (
              <motion.div
                key="pink-2"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
                transition={{ duration: 0.65 }}
                className="relative z-20 flex h-full flex-col items-center justify-center px-7 text-center"
              >
                <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#A83D68]">
                  Wedding Schedule
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="relative mt-4 w-full overflow-hidden rounded-2xl border border-[#D99AB3] bg-[#F2DEE7]/90 p-5 shadow-lg"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#D99AB3]" />
                  <p
                    className="text-[18px] font-bold text-[#54243B]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {couple.dateRaw}
                  </p>
                  <div className="mt-3 space-y-2 text-left text-[12px] text-[#54243B]">
                    <p className="flex items-center gap-2 font-semibold text-[#A83D68]">
                      <Clock className="h-4 w-4 shrink-0" /> Pukul {couple.timeRaw}
                    </p>
                    <p className="flex items-start gap-2 leading-snug">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A83D68]" />
                      <span>{couple.venue}</span>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {sceneIdx === 3 && (
              <motion.div
                key="pink-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-20 flex h-full w-full flex-col items-center justify-end p-6 text-center"
              >
                <motion.img
                  src={heroImg}
                  alt="Couple"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1.02 }}
                  transition={{ duration: 3.5, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#54243B] via-[#54243B]/35 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 mb-8 w-full rounded-2xl border border-[#D99AB3] bg-[#FCF3F6]/94 p-4 backdrop-blur-md shadow-xl"
                >
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.24em] text-[#A83D68]">
                    Save The Date
                  </p>
                  <p
                    className="mt-1 text-[28px] leading-none text-[#54243B]"
                    style={{ fontFamily: "'Great Vibes', cursive" }}
                  >
                    {couple.groom} &amp; {couple.bride}
                  </p>
                  <p className="mt-1 text-[11px] text-[#54243B]/80">
                    {couple.dateRaw}
                  </p>
                  <div className="mt-3 inline-block rounded-full bg-[#A83D68] px-4 py-1.5 text-[10.5px] font-bold text-[#FCF3F6]">
                    {couple.slug}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <SceneLightLeak sceneIdx={sceneIdx} color="rgba(255,190,218,0.65)" />
        </div>
      )}

      {/* 60fps Particle FX Overlay */}
      <ThemeParticleOverlay themeId={themeId} isPlaying={isPlaying} />

      {/* Progress Bar */}
      <div className="pointer-events-none absolute bottom-12 left-8 right-8 z-40 h-1 overflow-hidden rounded-full bg-black/15">
        <div
          className="h-full rounded-full transition-[width] duration-75"
          style={{
            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
            background:
              themeId === 'javanese-classic'
                ? '#8A452C'
                : themeId === 'grand-ballroom'
                ? '#345579'
                : '#A83D68',
          }}
        />
      </div>

      {/* Optional Enterprise Watermark */}
      {showWatermark && (
        <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-[9.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          <Sparkles className="h-3 w-3" /> Enterprise Preview
        </div>
      )}
    </div>
  );
}
