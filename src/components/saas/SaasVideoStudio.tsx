"use client";

import React, { useState, useEffect } from "react";
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
import EnterpriseMotionPlayer, {
  MotionPlayerCouple,
} from "@/components/EnterpriseMotionPlayer";
import {
  VIDEO_THEMES,
  VIDEO_SCENES,
  VIDEO_FPS,
  VIDEO_TOTAL_FRAMES,
  VideoThemeId,
  formatTimecode,
} from "@/lib/invitationVideoEngine";

const DEMO_SAMPLES: Record<VideoThemeId, MotionPlayerCouple> = {
  "javanese-classic": {
    groom: "Kharis",
    bride: "Lia",
    groomFull: "Kharis Pratama, S.T.",
    brideFull: "Lia Ayu Lestari, S.Ars.",
    dateRaw: "Minggu, 18 Oktober 2026",
    timeRaw: "09:00 WIB",
    venue: "Pendopo Agung Royal Ambarrukmo, Yogyakarta",
    slug: "ruanghadir.net/kharis-lia",
    initials: "K & L",
    heroPhoto: "/assets/kharis-lia/hero.jpg",
    groomPhoto: "/assets/kharis-lia/groom.jpg",
    bridePhoto: "/assets/kharis-lia/bride.jpg",
  },
  "grand-ballroom": {
    groom: "Kharis",
    bride: "Lia",
    groomFull: "Kharis Pratama, M.B.A.",
    brideFull: "Lia Ayu Lestari, S.E.",
    dateRaw: "Sabtu, 24 Oktober 2026",
    timeRaw: "19:00 WIB",
    venue: "Grand Ballroom Hotel Mulia, Jakarta",
    slug: "ruanghadir.net/kharis-lia",
    initials: "K & L",
    heroPhoto: "/assets/kharis-lia/hero.jpg",
    groomPhoto: "/assets/kharis-lia/groom.jpg",
    bridePhoto: "/assets/kharis-lia/bride.jpg",
  },
  "luxury-pink": {
    groom: "Kharis",
    bride: "Lia",
    groomFull: "Kharis Pratama, S.Kom.",
    brideFull: "Lia Ayu Lestari, S.Psi.",
    dateRaw: "Sabtu, 7 November 2026",
    timeRaw: "11:00 WIB",
    venue: "The Glasshouse Rose Garden, Bandung",
    slug: "ruanghadir.net/kharis-lia",
    initials: "K & L",
    heroPhoto: "/assets/kharis-lia/hero.jpg",
    groomPhoto: "/assets/kharis-lia/groom.jpg",
    bridePhoto: "/assets/kharis-lia/bride.jpg",
  },
};

const HIGHLIGHTS = [
  "1:1 persis sesuai tema undangan asli — mulai dari aset Gunungan & Flower Javanese, tirai & chandelier Grand Ballroom, hingga amplop 3D & bingkai lengkung Luxury Pink",
  "Foto mempelai asli, tipografi tema, ikon acara, efek partikel 60fps, dan sapuan light-leak otomatis tersinkronisasi dari data undangan",
  "Format siap sebar 9:16 (Reels, TikTok, WhatsApp Status), 1:1 Feed, hingga 16:9 layar venue",
  "Ekspor video HD bebas watermark + Remotion Render Spec (JSON) eksklusif untuk akun Enterprise",
];

export function SaasVideoStudio() {
  const [themeId, setThemeId] = useState<VideoThemeId>("javanese-classic");
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeTheme =
    VIDEO_THEMES.find((t) => t.id === themeId) || VIDEO_THEMES[0];
  const sampleCouple = DEMO_SAMPLES[themeId];
  const currentSceneIdx = Math.min(3, Math.floor((frame / VIDEO_TOTAL_FRAMES) * 4));

  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dtSec = Math.min(0.1, (now - last) / 1000);
      last = now;
      setFrame((prev) => (prev + dtSec * VIDEO_FPS) % VIDEO_TOTAL_FRAMES);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  return (
    <section id="video-enterprise" className="py-16 md:py-24">
      <div className="saas-shell">
        <div className="glx-strong rounded-[34px] p-6 sm:p-10 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy & Technical Specs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8C6B34]/12 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8C6B34]">
                  <Film size={13} /> Eksklusif Enterprise
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-white/90 px-3 py-1 text-[11px] font-semibold text-[#54464A]">
                  1:1 Theme Motion Graphic · 60fps FX
                </span>
              </div>

              <h2 className="text-[30px] sm:text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-[#2A1E21]">
                Make Your Invitation Video — 1:1 sesuai tema undangan asli.
              </h2>

              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#54464A] max-w-xl">
                Lihat sampel langsung 3 tema unggulan Enterprise:{" "}
                <strong>Javanese Classic</strong>,{" "}
                <strong>Grand Ballroom</strong>, dan{" "}
                <strong>Luxury Pink</strong>. Seluruh tata letak, ornamen asli,
                foto mempelai, ikon, dan animasi pembuka disusun identik dengan
                undangan webnya lalu ditingkatkan dengan partikel &amp; transisi
                sinematik.
              </p>

              {/* Technical Layer Badges */}
              <div className="rounded-2xl bg-white/60 border border-white/85 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#2A1E21]">
                    <SlidersHorizontal size={13} className="text-[#7A2E3B]" />
                    Sampel Aktif: {activeTheme.name}
                  </span>
                  <span className="font-mono text-[11.5px] font-semibold text-[#7A2E3B] tabular">
                    TC {formatTimecode(Math.floor(frame))} · 30fps
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTheme.techniques.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-[#7A2E3B]/10 px-2.5 py-1 text-[11px] font-semibold text-[#7A2E3B]"
                    >
                      {tech}
                    </span>
                  ))}
                  <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] font-semibold text-[#54464A]">
                    {VIDEO_SCENES[currentSceneIdx]?.label}
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 pt-1">
                {HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[14px] text-[#2A1E21]"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7A2E3B]/12 text-[#7A2E3B]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed text-[#54464A]">
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

            {/* Right: Live 9:16 1:1 Theme Motion Graphic Player */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4">
              <div className="relative w-full max-w-[304px] aspect-[9/16] rounded-[42px] p-2.5 bg-[#2A1E21] shadow-[0_32px_70px_-20px_rgba(15,23,42,0.48)] border border-white/25">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 h-5 w-24 rounded-full bg-black/90" />

                <div className="relative h-full w-full rounded-[33px] overflow-hidden bg-black">
                  <EnterpriseMotionPlayer
                    themeId={themeId}
                    couple={sampleCouple}
                    sceneIdx={currentSceneIdx}
                    progress={frame / VIDEO_TOTAL_FRAMES}
                    isPlaying={isPlaying}
                  />

                  {/* Floating Transport Controls */}
                  <div className="absolute bottom-3 left-3 right-3 z-50 flex items-center justify-between gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 text-white">
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
                      {formatTimecode(Math.floor(frame))} / 00:12:00
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Theme Switcher */}
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
                          ? "bg-[#7A2E3B] text-white shadow-sm"
                          : "text-[#54464A] hover:text-[#2A1E21]"
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

              <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#7D6F71]">
                <Layers size={13} className="text-[#7A2E3B]" /> Ganti tema untuk
                melihat sampel video 1:1 sesuai desain asli
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
