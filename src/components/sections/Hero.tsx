'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { IconArrowRight } from '@/components/Icons';
import { cn } from '@/lib/utils';

/* ─── Animation Variants ─── */
const container: any = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* ─── iPhone Screen Content ─── */
function IPhoneScreen() {
  return (
    <div className="flex flex-col items-center pt-8">
      {/* Rose gradient header */}
      <div className="w-full h-28 bg-gradient-to-br from-rose-200/80 via-rose-100 to-amber-50/60 flex flex-col items-center justify-end pb-3">
        <p className="text-[7px] sm:text-[8px] tracking-[0.15em] uppercase text-rose-400/80">
          Bismillahirrahmanirrahim
        </p>
      </div>

      {/* Names */}
      <div className="flex flex-col items-center mt-3">
        <p className="font-serif text-base text-foreground leading-tight">Rina</p>
        <p className="text-rose-400 text-[10px] my-0.5 font-light">&amp;</p>
        <p className="font-serif text-base text-foreground leading-tight">Budi</p>
      </div>

      {/* Decorative line + heart */}
      <div className="flex items-center gap-2 mt-2 w-[80%]">
        <div className="flex-1 h-px bg-rose-200" />
        <svg className="w-3 h-3 text-rose-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <div className="flex-1 h-px bg-rose-200" />
      </div>

      {/* Date */}
      <p className="mt-2 text-[10px] text-foreground/60 tracking-[0.15em] font-medium">
        28 . 12 . 2025
      </p>

      {/* Decorative dots */}
      <div className="flex items-center gap-1 mt-3">
        <div className="w-1 h-1 rounded-full bg-rose-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <div className="w-1 h-1 rounded-full bg-rose-300" />
      </div>
    </div>
  );
}

/* ─── MacBook Screen Content ─── */
function MacBookScreen() {
  return (
    <div className="h-full">
      {/* Header gradient */}
      <div className="h-16 bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 flex flex-col items-center justify-center px-4">
        <p className="text-[8px] tracking-[0.2em] uppercase text-rose-400 font-medium">
          The Wedding of
        </p>
        <p className="font-serif text-sm text-foreground mt-0.5">Rina &amp; Budi</p>
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="text-[7px] text-muted-foreground text-center mb-2">
          Kepada Yth. Bapak/Ibu/Saudara/i
        </p>
        <div className="w-12 h-px bg-rose-200 mx-auto mb-2" />
        <p className="text-[8px] text-center text-foreground/70 font-medium">
          28 . 12 . 2025
        </p>
        <p className="text-[7px] text-center text-muted-foreground mt-1">
          The Grand Ballroom, Jakarta
        </p>
        {/* Mini RSVP mockup */}
        <div className="mt-3 space-y-1.5">
          <div className="h-4 bg-rose-50 rounded border border-rose-100" />
          <div className="h-4 bg-rose-50 rounded border border-rose-100" />
          <div className="h-5 bg-gradient-rose rounded text-white text-[7px] flex items-center justify-center">
            Konfirmasi Kehadiran
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Device Mockups Container (with 360° rotation) ─── */
function DeviceMockups() {
  const [rotateY, setRotateY] = useState(-15);
  const [isDragging, setIsDragging] = useState(false);
  const [isFloating, setIsFloating] = useState(true);
  const startXRef = useRef(0);
  const startRotateRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setIsFloating(false);
      startXRef.current = e.clientX;
      startRotateRef.current = rotateY;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [rotateY]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startXRef.current;
      const sensitivity = 0.3;
      const newRotate = clamp(startRotateRef.current + deltaX * sensitivity, -45, 45);
      setRotateY(newRotate);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Resume floating after a brief delay
    setTimeout(() => setIsFloating(true), 400);
  }, [isDragging]);

  // Auto-reset to -15 when not dragging for a while
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isDragging && !isFloating) {
      resetTimerRef.current = setTimeout(() => {
        setRotateY(-15);
        setTimeout(() => setIsFloating(true), 400);
      }, 2000);
    }
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [isDragging, isFloating]);

  const transform3D = `perspective(1200px) rotateY(${rotateY}deg)`;
  const transitionStyle = isDragging ? 'none' : 'transform 0.3s ease-out';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center flex-shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ minHeight: 380, perspective: '1200px' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* MacBook (behind) */}
      <div
        className={cn(
          'relative z-0 hidden sm:block',
          isFloating && 'animate-float-mockup'
        )}
        style={{
          transform: transform3D,
          transition: transitionStyle,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Screen */}
        <div className="w-[300px] md:w-[380px] rounded-xl bg-[#1a1a1a] p-[6px] shadow-xl shadow-black/20">
          <div className="rounded-lg bg-white overflow-hidden h-[200px] md:h-[240px]">
            <MacBookScreen />
          </div>
        </div>

        {/* Hinge */}
        <div className="mx-8 h-[6px] bg-[#2a2a2a] rounded-b-sm" />

        {/* Base / Keyboard */}
        <div className="relative mx-auto w-[340px] md:w-[420px]">
          <div className="h-[14px] bg-[#2a2a2a] rounded-b-2xl" />
          {/* Trackpad */}
          <div className="w-[80px] h-[8px] rounded-sm bg-[#333] mx-auto mt-[3px]" />
        </div>
      </div>

      {/* iPhone (front, higher z, overlapping) */}
      <div
        className={cn(
          'relative z-10 -ml-8 md:ml-0 lg:ml-[-2rem] mt-4 sm:mt-[-1.5rem]',
          isFloating && 'animate-float-mockup'
        )}
        style={{
          transform: transform3D,
          transition: transitionStyle,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* iPhone body */}
        <div className="relative w-[160px] h-[320px] sm:w-[200px] sm:h-[400px] rounded-[2.8rem] bg-[#1a1a1a] p-[5px] shadow-2xl shadow-black/25">
          {/* Side buttons — right side */}
          <div className="absolute top-20 -right-[2px] w-[3px] h-8 bg-[#333] rounded-r-sm" />
          <div className="absolute top-[6.5rem] -right-[2px] w-[3px] h-5 bg-[#333] rounded-r-sm" />
          <div className="absolute top-[8.5rem] -right-[2px] w-[3px] h-5 bg-[#333] rounded-r-sm" />
          {/* Left side — silent switch + volume */}
          <div className="absolute top-[5.5rem] -left-[2px] w-[3px] h-4 bg-[#333] rounded-l-sm" />
          <div className="absolute top-[6.5rem] -left-[2px] w-[3px] h-5 bg-[#333] rounded-l-sm" />
          <div className="absolute top-[8rem] -left-[2px] w-[3px] h-5 bg-[#333] rounded-l-sm" />

          {/* Screen area */}
          <div className="relative w-full h-full rounded-[2.4rem] bg-white overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[22px] bg-[#1a1a1a] rounded-b-xl z-20" />

            <IPhoneScreen />
          </div>
        </div>
      </div>

      {/* Drag hint (mobile) */}
      <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 sm:hidden whitespace-nowrap">
        Geser untuk memutar →
      </p>
    </div>
  );
}

/* ─── Hero Component ─── */
export function Hero() {
  const typedText = useTypingAnimation([
    'Undangan Digital Elegan',
    'RSVP Online Tanpa Ribet',
    'Template Premium Pernikahan',
    'Momen Bahagia yang Abadi',
  ]);

  return (
    <section className="relative py-16 md:py-20 lg:py-24 overflow-hidden">
      {/* Background organic blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-rose-light/30 blur-3xl organic-blob" />
        <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-gold-light/20 blur-3xl organic-blob-2" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-rose-light/20 blur-3xl organic-blob" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
      >
        {/* LEFT: Text Content */}
        <div className="flex-1 max-w-lg text-center lg:text-left">
          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Buat
          </motion.h1>
          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gradient-rose typing-cursor"
          >
            {typedText}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed"
          >
            Platform undangan pernikahan digital #1 Indonesia. Didesain untuk
            pasangan modern yang ingin merayakan cinta dengan cara yang lebih
            personal dan berkesan.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center"
          >
            <Link href="/auth?mode=register">
              <Button
                size="lg"
                className="bg-gradient-rose hover:opacity-90 text-white shadow-lg shadow-rose/20 px-7 py-5 text-base font-semibold w-full sm:w-auto"
              >
                Mulai Gratis
              </Button>
            </Link>
            <Link href="/fitur">
              <Button
                variant="outline"
                size="lg"
                className="px-7 py-5 text-base border-2 hover:bg-accent/50 w-full sm:w-auto group"
              >
                Lihat Demo
                <IconArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Stat Badges */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2"
          >
            {[
              { label: '50K+ Pasangan' },
              { label: '2M+ Undangan' },
              { label: '4.9 Rating' },
            ].map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border border-border bg-white/60 text-muted-foreground backdrop-blur-sm"
              >
                {stat.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT: Device Mockups */}
        <motion.div
          variants={fadeUp}
          className="relative flex items-center justify-center flex-shrink-0"
        >
          <DeviceMockups />
        </motion.div>
      </motion.div>
    </section>
  );
}
