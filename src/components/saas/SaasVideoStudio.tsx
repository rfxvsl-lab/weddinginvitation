"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Smartphone,
  Layers,
  Building2,
  ArrowRight,
  Mail,
  Check,
  Play,
} from "lucide-react";

const PRESETS = [
  {
    id: "liquid",
    name: "Liquid Glass",
    ratio: "9:16 Reels",
    bg: "linear-gradient(155deg, #DCEEFF 0%, #ECE7FF 52%, #FBE9F4 100%)",
    cardBg: "rgba(255,255,255,0.62)",
    ink: "#1D1D1F",
    accent: "#007AFF",
  },
  {
    id: "noir",
    name: "Midnight Titanium",
    ratio: "9:16 TikTok",
    bg: "linear-gradient(155deg, #0B0D14 0%, #171D32 55%, #0F1320 100%)",
    cardBg: "rgba(255,255,255,0.09)",
    ink: "#F5F5F7",
    accent: "#64D2FF",
  },
  {
    id: "botanical",
    name: "Botanical Mist",
    ratio: "9:16 WA Status",
    bg: "linear-gradient(155deg, #E3F3EC 0%, #EDF6F7 55%, #F2F5FA 100%)",
    cardBg: "rgba(255,255,255,0.68)",
    ink: "#16241E",
    accent: "#248A3D",
  },
];

const HIGHLIGHTS = [
  "Sinkronisasi otomatis nama mempelai, jadwal akad/resepsi, dan lokasi dari undangan digital",
  "Format siap sebar 9:16 (Reels, TikTok, WhatsApp Status), 1:1 Feed, hingga 16:9 layar venue",
  "Dibangun di atas arsitektur komposisi Remotion 30fps yang presisi tanpa perlu software edit video",
  "Ekspor video HD bebas watermark eksklusif untuk akun perusahaan (Enterprise)",
];

export function SaasVideoStudio() {
  const [active, setActive] = useState(0);
  const current = PRESETS[active];

  return (
    <section id="video-enterprise" className="py-16 md:py-24">
      <div className="saas-shell">
        <div className="glx-strong rounded-[34px] p-6 sm:p-10 lg:p-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5856D6]/12 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5856D6]">
                  <Film size={13} /> Eksklusif Enterprise
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/75 border border-white/90 px-3 py-1 text-[11px] font-semibold text-[#48484A]">
                  Remotion Motion Engine
                </span>
              </div>

              <h2 className="text-[32px] sm:text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-[#1D1D1F]">
                Make Your Invitation Video — langsung dari data undangan.
              </h2>

              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#48484A] max-w-xl">
                Dirancang khusus untuk wedding organizer, agensi kreatif, dan tim korporasi. Cukup pilih gaya motion dan rasio layar, lalu render video undangan vertikal siap tayang dalam hitungan detik.
              </p>

              <ul className="space-y-3 pt-1">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-[#1D1D1F]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/12 text-[#007AFF]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="leading-relaxed text-[#48484A]">{item}</span>
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
                  <Building2 size={16} /> Portal Enterprise <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Interactive 9:16 iOS Glass Video Preview */}
            <div className="lg:col-span-5 flex flex-col items-center gap-5">
              {/* iOS Phone Bezel */}
              <div className="relative w-full max-w-[290px] aspect-[9/16] rounded-[42px] p-2.5 bg-[#1D1D1F] shadow-[0_32px_70px_-20px_rgba(15,23,42,0.45)] border border-white/25">
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 h-5 w-24 rounded-full bg-black/90" />

                <div
                  className="relative h-full w-full rounded-[33px] overflow-hidden flex flex-col items-center justify-between p-5 text-center transition-all duration-500"
                  style={{ background: current.bg }}
                >
                  <div className="pt-6">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        background: current.cardBg,
                        color: current.accent,
                        backdropFilter: "blur(14px)",
                      }}
                    >
                      <Smartphone size={11} /> {current.ratio}
                    </span>
                  </div>

                  {/* Translucent Inner Glass Card */}
                  <div
                    className="w-full rounded-[24px] p-5 border space-y-3"
                    style={{
                      background: current.cardBg,
                      borderColor: "rgba(255,255,255,0.45)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: current.accent }}
                    >
                      Save The Date
                    </p>
                    <p
                      className="font-serif text-[32px] leading-none"
                      style={{ color: current.ink }}
                    >
                      Rian &amp; Salsa
                    </p>
                    <p
                      className="text-[12px] font-medium opacity-80"
                      style={{ color: current.ink }}
                    >
                      Sabtu, 24 Oktober 2026
                      <br />
                      The Glasshouse, Jakarta
                    </p>
                    <div className="pt-1 flex items-center justify-center">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white"
                        style={{ background: current.accent }}
                      >
                        <Play size={11} className="fill-current" /> 12s · 30fps HD
                      </span>
                    </div>
                  </div>

                  {/* Mini Timeline Pill */}
                  <div className="w-full space-y-1.5 pb-1">
                    <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full w-2/3 rounded-full transition-all duration-500"
                        style={{ background: current.accent }}
                      />
                    </div>
                    <p
                      className="text-[10px] font-semibold opacity-70"
                      style={{ color: current.ink }}
                    >
                      ruanghadir.net/rian-salsa
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmented Preset Switcher */}
              <div className="glx-pill p-1.5 inline-flex items-center gap-1">
                {PRESETS.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition cursor-pointer ${
                      active === idx
                        ? "bg-[#007AFF] text-white shadow-sm"
                        : "text-[#48484A] hover:text-[#1D1D1F]"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <p className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#6E6E73]">
                <Layers size={13} className="text-[#007AFF]" /> Ganti preset untuk melihat gaya motion video
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
