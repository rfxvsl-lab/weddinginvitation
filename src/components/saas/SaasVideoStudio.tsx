"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Pause, Play } from "lucide-react";
import EnterpriseMotionPlayer, { MotionPlayerCouple } from "@/components/EnterpriseMotionPlayer";
import { VIDEO_THEMES, VIDEO_FPS, VIDEO_TOTAL_FRAMES, VideoThemeId } from "@/lib/invitationVideoEngine";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

// Data sampel = data demo template undangan (Rian & Salsa), foto asli.
const SAMPLE: MotionPlayerCouple = {
  groom: "Rian",
  bride: "Salsa",
  groomFull: "Rian Aditama, S.Kom",
  brideFull: "Salsabila Putri, S.Ds",
  groomParents: "Bapak Ir. H. Bambang Aditama & Ibu Hj. Endang Rahayu",
  brideParents: "Bapak Dr. H. Ahmad Fauzi & Ibu Hj. Siti Aminah",
  dateRaw: "2026-08-08",
  timeRaw: "08.00 – 10.00 WIB",
  venue: "Masjid Agung Al-Azhar, Kebayoran Baru",
  events: [
    { title: "Akad Nikah", date: "Sabtu, 8 Agustus 2026", time: "08.00 – 10.00 WIB", venue: "Masjid Agung Al-Azhar, Kebayoran Baru" },
    { title: "Resepsi Pernikahan", date: "Sabtu, 8 Agustus 2026", time: "11.00 – 14.00 WIB", venue: "The Royal Ballroom, Hotel Mulia Senayan" },
  ],
  slug: "ruanghadir.net/rian-salsa",
  initials: "R & S",
};

const SAMPLES: Record<VideoThemeId, MotionPlayerCouple> = {
  "javanese-classic": SAMPLE,
  "grand-ballroom": SAMPLE,
  "luxury-pink": SAMPLE,
};

const POINTS = [
  "Dibuat otomatis dari data undangan: nama, foto, tanggal, dan lokasi",
  "Format 9:16 untuk Reels & WhatsApp, 1:1 untuk feed, 16:9 untuk layar venue",
  "Ekspor HD tanpa watermark",
];

export function SaasVideoStudio() {
  const [themeId, setThemeId] = useState<VideoThemeId>("javanese-classic");
  const [frame, setFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Hanya diputar saat terlihat di layar (hemat baterai di HP)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying || !inView) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      setFrame((f) => (f + dt * VIDEO_FPS) % VIDEO_TOTAL_FRAMES);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, inView]);

  const progress = frame / VIDEO_TOTAL_FRAMES;

  return (
    <section id="video-enterprise" className="scroll-mt-20 bg-[var(--rh-ink)] text-[var(--rh-paper)]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_auto] lg:gap-24 lg:py-28">
        <div className="max-w-[520px]">
          <p className="text-[14px] font-medium text-[var(--rh-gold-soft)]">Khusus Enterprise</p>
          <h2 className="mt-4 text-[36px] leading-[1.08] !text-[var(--rh-paper)] sm:text-[46px]">
            Video undangan yang bergerak seperti film pendek.
          </h2>
          <p className="mt-5 text-[16px] leading-[1.7] text-[var(--rh-line-strong)]">
            Setiap video disusun dari elemen undangannya sendiri: tirai Grand Ballroom, gunungan Javanese,
            amplop Luxury Pink. Lengkap dengan nama, foto, jadwal, dan lokasi acara Anda.
          </p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-[15px] leading-[1.55]">
                <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--rh-gold-soft)]" aria-hidden />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=${encodeURIComponent("Video undangan Enterprise")}`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] bg-[var(--rh-gold-soft)] px-6 text-[15px] font-semibold text-[var(--rh-ink)] transition-colors hover:bg-[var(--rh-paper)]"
            >
              Hubungi tim Enterprise
            </a>
            <Link
              href="/auth?mode=enterprise"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[10px] border border-[var(--rh-line-strong)] px-6 text-[15px] font-semibold text-[var(--rh-paper)] transition-colors hover:border-[var(--rh-paper)]"
            >
              Masuk dengan kode akses
            </Link>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[320px] flex-col items-center">
          {/* Perangkat */}
          <div
            ref={stageRef}
            className="relative aspect-[9/16] w-full rounded-[38px] border border-[var(--rh-ink-2)] bg-[var(--rh-ink)] p-[9px]"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[30px]">
              <EnterpriseMotionPlayer
                themeId={themeId}
                couple={SAMPLES[themeId]}
                progress={progress}
                isPlaying={isPlaying && inView}
                showWatermark={false}
              />
            </div>
          </div>

          {/* Kontrol */}
          <div className="mt-6 flex w-full items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((v) => !v)}
              aria-label={isPlaying ? "Jeda video" : "Putar video"}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rh-paper)] text-[var(--rh-ink)] transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={VIDEO_TOTAL_FRAMES - 1}
              step={1}
              value={Math.floor(frame)}
              onChange={(e) => setFrame(Number(e.target.value))}
              aria-label="Posisi video"
              className="rh-scrub h-1 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(90deg, var(--rh-gold-soft) ${progress * 100}%, var(--rh-ink-2) ${progress * 100}%)`,
              }}
            />
          </div>

          <div role="tablist" aria-label="Pilih tema video" className="mt-5 grid w-full grid-cols-3 gap-1 rounded-[12px] bg-[var(--rh-ink-2)] p-1">
            {VIDEO_THEMES.map((t) => {
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => {
                    setThemeId(t.id);
                    setFrame(0);
                    setIsPlaying(true);
                  }}
                  className={`rounded-[9px] px-2 py-2 text-[12.5px] font-medium transition-colors ${
                    active ? "bg-[var(--rh-paper)] text-[var(--rh-ink)]" : "text-[var(--rh-paper)] hover:bg-[var(--rh-ink)]"
                  }`}
                >
                  {t.shortName.replace("Classic", "").replace("Grand ", "").trim()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
