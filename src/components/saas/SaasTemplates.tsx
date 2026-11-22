"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";

const THEME_PREVIEW_IMAGES: Record<string, string> = {
  "rfx-dark": "/assets/themes/rfx-dark.png",
  "cremy-rose": "/assets/themes/cremy-rose.png",
  "grand-ballroom": "/assets/themes/grand-ballroom.png",
  "netflix-luxury": "/assets/themes/netflix-luxury.png",
  "royal-arabian": "/assets/themes/royal-arabian.png",
  spotilove: "/assets/themes/spotilove.png",
  "javanese-classic": "/assets/themes/javanese-classic.png",
  "parallax-cinematic": "/assets/themes/parallax-cinematic.png",
};

const PATTERN_LABELS: Record<string, string> = {
  all: "Semua Tema",
  modern: "Modern",
  classic: "Klasik & Adat",
  floral: "Floral",
  storybook: "Interaktif",
};

export function SaasTemplates() {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? DEFAULT_THEMES
      : DEFAULT_THEMES.filter((t) => t.pattern === filter);

  return (
    <section id="template" className="saas-shell pt-24">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-[580px]">
          <p className="saas-kicker">Koleksi tema gratis</p>
          <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
            Pilih{" "}
            <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
              karakter tema
            </span>{" "}
            yang paling mewakili kalian.
          </h2>
          <p
            className="mt-3 text-[14.5px] leading-relaxed"
            style={{ color: "var(--saas-ink-2)" }}
          >
            Semua {DEFAULT_THEMES.length} tema bisa langsung dipratinjau secara
            penuh dan diganti kapan saja tanpa kehilangan data acara.
          </p>
        </div>

        <Link href="/preview" className="saas-btn-outline self-start md:self-auto">
          Buka Galeri Lengkap <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Category filter pills */}
      <div className="mt-7 flex flex-wrap gap-2">
        {Object.entries(PATTERN_LABELS).map(([key, label]) => {
          const active = filter === key;
          const count =
            key === "all"
              ? DEFAULT_THEMES.length
              : DEFAULT_THEMES.filter((t) => t.pattern === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12.5px] font-bold transition-all cursor-pointer"
              style={
                active
                  ? {
                      background: "var(--saas-ink)",
                      color: "#FFF7F0",
                      borderColor: "var(--saas-ink)",
                    }
                  : {
                      background: "rgba(255,255,255,0.75)",
                      color: "var(--saas-ink-2)",
                      borderColor: "var(--saas-line)",
                    }
              }
            >
              {label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px]"
                style={
                  active
                    ? { background: "rgba(255,255,255,0.16)", color: "#FFF7F0" }
                    : { background: "var(--saas-bg)", color: "var(--saas-muted)" }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const imgSrc = THEME_PREVIEW_IMAGES[t.id];
          return (
            <Link
              key={t.id}
              href={`/preview/${t.id}`}
              className="saas-card saas-card-hover group flex flex-col overflow-hidden"
            >
              <div
                className="relative aspect-[16/11] w-full overflow-hidden"
                style={{
                  background: `radial-gradient(130% 100% at 20% 0%, ${t.bgPatternHex}, ${t.bgHex} 72%)`,
                }}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={`Pratinjau tema ${t.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 py-5">
                    <div
                      className="relative flex h-full w-[136px] overflow-hidden rounded-r-xl rounded-l-[4px] shadow-[0_18px_36px_-10px_rgba(0,0,0,0.65)] ring-1 ring-[#C6A15B]/35 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105"
                      style={{ background: "linear-gradient(155deg, #35211E 0%, #241715 65%, #1A100F 100%)" }}
                    >
                      <div className="w-2.5 shrink-0 bg-black/35 border-r border-[#C6A15B]/25" />
                      <div className="flex flex-1 flex-col items-center justify-center border border-[#C6A15B]/30 m-2 rounded-md px-2 text-center">
                        <p className="font-mono text-[6.5px] uppercase tracking-[0.26em] text-[#D8BA7D]">The Story Of</p>
                        <p className="mt-1 font-serif text-[16px] leading-tight text-[#FAF3E6]">Rian &amp; Salsa</p>
                        <span className="mt-2 rounded-full bg-[#C6A15B] px-2.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wider text-[#1E1308]">Buka Buku</span>
                      </div>
                      <div className="w-1.5 shrink-0 bg-[#E8DEC9]" />
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15 opacity-75 transition-opacity duration-300 group-hover:opacity-90" />

                <span
                  className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] backdrop-blur-md"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    color: "var(--saas-success)",
                  }}
                >
                  Gratis
                </span>

                <span
                  className="absolute inset-x-4 bottom-3.5 flex translate-y-2 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ background: "var(--saas-ink)" }}
                >
                  Coba Preview Live <ArrowUpRight size={14} />
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-extrabold leading-tight">
                    {t.name}
                  </h3>
                  <p
                    className="mt-1 text-[12px] font-medium"
                    style={{ color: "var(--saas-muted)" }}
                  >
                    {PATTERN_LABELS[t.pattern] || t.pattern} · Responsif HP &amp; Desktop
                  </p>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:border-transparent"
                  style={{
                    borderColor: "var(--saas-line)",
                    color: "var(--saas-ink)",
                    background: "var(--saas-bg)",
                  }}
                >
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
