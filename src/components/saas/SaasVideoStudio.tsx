"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Film,
  Building2,
  ArrowRight,
  Mail,
  Check,
  Play,
  Pause,
  RotateCcw,
  Layers,
  SlidersHorizontal,
} from "lucide-react";
import {
  VIDEO_THEMES,
  VIDEO_SCENES,
  VIDEO_FPS,
  VIDEO_TOTAL_FRAMES,
  VideoThemeId,
  VideoCoupleProps,
  renderInvitationVideoFrame,
  formatTimecode,
} from "@/lib/invitationVideoEngine";

const DEMO_SAMPLES: Record<VideoThemeId, VideoCoupleProps> = {
  "javanese-classic": {
    groom: "Bagas",
    bride: "Sekar",
    groomFull: "R. Bagas Pratama, S.T.",
    brideFull: "R.A. Sekar Ayu, S.Ars.",
    dateRaw: "Minggu, 18 Oktober 2026",
    timeRaw: "09:00 WIB",
    venue: "Pendopo Agung Royal Ambarrukmo, Yogyakarta",
    slug: "ruanghadir.net/bagas-sekar",
    initials: "B & S",
  },
  "grand-ballroom": {
    groom: "Rian",
    bride: "Salsa",
    groomFull: "Rian Mahendra, M.B.A.",
    brideFull: "Salsa Kirana, S.E.",
    dateRaw: "Sabtu, 24 Oktober 2026",
    timeRaw: "19:00 WIB",
    venue: "Grand Ballroom Hotel Mulia, Jakarta",
    slug: "ruanghadir.net/rian-salsa",
    initials: "R & S",
  },
  "luxury-pink": {
    groom: "Dimas",
    bride: "Nadia",
    groomFull: "Dimas Aditya, S.Kom.",
    brideFull: "Nadia Putri, S.Psi.",
    dateRaw: "Sabtu, 7 November 2026",
    timeRaw: "11:00 WIB",
    venue: "The Glasshouse Rose Garden, Bandung",
    slug: "ruanghadir.net/dimas-nadia",
    initials: "D & N",
  },
};

const HIGHLIGHTS = [
  "Engine motion graphic ala After Effects: Trim Paths, Track Matte kinetic text, volumetric light leak, dan partikel berlapis",
  "3 contoh preset resmi siap pakai: Javanese Classic, Grand Ballroom, dan Luxury Love Pink",
  "Sinkronisasi otomatis nama mempelai, jadwal, dan venue dari data undangan — siap ekspor 9:16 Reels/TikTok/WA Status hingga 16:9",
  "Ekspor video HD bebas watermark + Remotion Render Spec (JSON) eksklusif untuk akun Enterprise",
];

export function SaasVideoStudio() {
  const [themeId, setThemeId] = useState<VideoThemeId>("javanese-classic");
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTheme =
    VIDEO_THEMES.find((t) => t.id === themeId) || VIDEO_THEMES[0];
  const sampleCouple = DEMO_SAMPLES[themeId];
  const currentSceneIdx = Math.min(3, Math.floor(frame / 90));

  // 30fps live motion playback
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let last = performance.now();
    const stepMs = 1000 / VIDEO_FPS;

    const tick = (now: number) => {
      if (now - last >= stepMs) {
        last = now;
        setFrame((prev) => (prev + 1) % VIDEO_TOTAL_FRAMES);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Draw live motion frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderInvitationVideoFrame(
      ctx,
      frame,
      canvas.width,
      canvas.height,
      themeId,
      sampleCouple,
      false
    );
  }, [frame, themeId, sampleCouple]);

  return (
    <section id="video-enterprise" className="py-16 md:py-24">
      <div className="saas-shell">
        <div className="glx-strong rounded-[34px] p-6 sm:p-10 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy & Technical Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5856D6]/12 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5856D6]">
                  <Film size={13} /> Eksklusif Enterprise
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-white/90 px-3 py-1 text-[11px] font-semibold text-[#48484A]">
                  After Effects Motion Engine · 30fps
                </span>
              </div>

              <h2 className="text-[30px] sm:text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-[#1D1D1F]">
                Make Your Invitation Video — motion graphic kelas studio.
              </h2>

              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#48484A] max-w-xl">
                Coba langsung 3 contoh motion graphic Enterprise di samping (
                <strong>Javanese Classic</strong>,{" "}
                <strong>Grand Ballroom</strong>, dan{" "}
                <strong>Luxury Love Pink</strong>). Semua animasi dijalankan
                secara prosedural lengkap dengan trim-path ornamen, track-matte
                tipografi, dan light-leak transisi.
              </p>

              {/* Technical Layer Badges for Active Theme */}
              <div className="rounded-2xl bg-white/60 border border-white/85 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#1D1D1F]">
                    <SlidersHorizontal size={13} className="text-[#007AFF]" />
                    Komposisi Aktif: {activeTheme.name}
                  </span>
                  <span className="font-mono text-[11.5px] font-semibold text-[#007AFF] tabular">
                    TC {formatTimecode(frame)} · 30fps
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTheme.techniques.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-[#007AFF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#007AFF]"
                    >
                      {tech}
                    </span>
                  ))}
                  <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[#48484A]">
                    {VIDEO_SCENES[currentSceneIdx]?.label}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 pt-1">
                {HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[14px] text-[#1D1D1F]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/12 text-[#007AFF]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed text-[#48484A]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="mailto:admin@ruanghadir.net?subject=Aktivasi%20Enterprise%20-%20Make%20Your%20Invitation%20Video"
                  className="saas-btn-primary"
                >
                  <Mail size={16} /> Hubungi admin@ruanghadir.net
                </a>
                <Link href="/auth?mode=enterprise" className="saas-btn-outline">
                  <Building2 size={16} /> Portal Enterprise{" "}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right: Live 9:16 After Effects Motion Graphic Player */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4">
              {/* iOS Phone Frame */}
              <div className="relative w-full max-w-[300px] aspect-[9/16] rounded-[42px] p-2.5 bg-[#1D1D1F] shadow-[0_32px_70px_-20px_rgba(15,23,42,0.48)] border border-white/25">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 h-5 w-24 rounded-full bg-black/90" />

                <div className="relative h-full w-full rounded-[33px] overflow-hidden bg-black">
                  <canvas
                    ref={canvasRef}
                    width={540}
                    height={960}
                    className="h-full w-full object-cover"
                  />

                  {/* Subtle Floating Transport Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-black/55 backdrop-blur-md border border-white/15 px-3 py-1.5 text-white">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsPlaying((p) => !p)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer"
                        aria-label={isPlaying ? "Jeda motion" : "Putar motion"}
                      >
                        {isPlaying ? (
                          <Pause size={12} />
                        ) : (
                          <Play size={12} className="ml-0.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFrame(0);
                          setIsPlaying(true);
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                        aria-label="Ulangi animasi"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                    <span className="font-mono text-[10.5px] font-semibold tracking-wider text-white/90 tabular">
                      {formatTimecode(frame)} / 00:12:00
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Theme Segmented Pill Switcher */}
              <div className="glx-pill p-1.5 inline-flex flex-wrap items-center justify-center gap-1">
                {VIDEO_THEMES.map((t) => {
                  const active = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemeId(t.id);
                        setFrame(0);
                        setIsPlaying(true);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition cursor-pointer ${
                        active
                          ? "bg-[#007AFF] text-white shadow-sm"
                          : "text-[#48484A] hover:text-[#1D1D1F]"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/15"
                        style={{ background: t.accent }}
                      />
                      {t.shortName}
                    </button>
                  );
                })}
              </div>

              <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#6E6E73]">
                <Layers size={13} className="text-[#007AFF]" /> Pilih tema di
                atas untuk preview live motion graphic 9:16
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
