"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AVAILABLE_THEMES, hasAvailableThemeCategory } from "@/lib/availableThemes";
import { THEME_CATEGORY_LABEL } from "./themeShots";
import { themeShot } from "@/themes/shots";
import { isNewTheme } from "@/themes/catalog";

const FILTERS = [
  ["all", "Pilihan awal"],
  ["special", "Spesial 2.5D"],
  ["classic", "Klasik & adat"],
  ["modern", "Modern"],
  ["floral", "Floral"],
  ["minimalist", "Minimalis"],
  ["storybook", "Interaktif"],
] as const;
const FEATURED = ["sunda-kujang", "storybook-interactive"];

type LandingThemesProps = {
  /** teaser: beranda, 6 pilihan + tautan ke katalog. catalog: halaman /preview, semua tema. */
  variant?: "teaser" | "catalog";
};

export function LandingThemes({ variant = "teaser" }: LandingThemesProps) {
  const isCatalog = variant === "catalog";
  const [filter, setFilter] = useState<string>("all");
  const matching = useMemo(() => {
    const sorted = [...AVAILABLE_THEMES].sort(
      (a, b) =>
        Number(isNewTheme(b.addedAt)) - Number(isNewTheme(a.addedAt)) ||
        (b.addedAt || "").localeCompare(a.addedAt || ""),
    );
    if (filter !== "all")
      return sorted.filter((theme) =>
        filter === "special"
          ? theme.tier === "special"
          : theme.pattern === filter,
      );
    const picks = FEATURED.flatMap(
      (id) => AVAILABLE_THEMES.find((theme) => theme.id === id) || [],
    );
    return [
      ...picks,
      ...sorted.filter((theme) => !FEATURED.includes(theme.id)),
    ];
  }, [filter]);
  const shown = isCatalog ? matching : matching.slice(0, 6);
  const HeadingTag = isCatalog ? "h1" : "h2";

  return (
    <section
      id="tema"
      className="rh-theme-section"
      aria-labelledby="themes-heading"
    >
      <div className="rh-marketing-container">
        <div className="rh-marketing-section-heading">
          <div>
            <p className="rh-eyebrow">TEMA UNTUK CERITA KALIAN</p>
            <HeadingTag id="themes-heading">
              {isCatalog
                ? `${AVAILABLE_THEMES.length} tema undangan`
                : "Temukan yang terasa pas."}
            </HeadingTag>
          </div>
          <p>
            Pasundan dan Heirloom Storybook. Buka contoh undangannya,
            rasakan setiap detailnya.
          </p>
        </div>
        <div
          role="group"
          aria-label="Filter kategori tema"
          className="rh-theme-filters"
        >
          {FILTERS.filter(([key]) => hasAvailableThemeCategory(key)).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              aria-controls="marketing-theme-list"
              onClick={() => setFilter(key)}
            >
              {isCatalog && key === "all" ? "Semua" : label}
            </button>
          ))}
        </div>
        <p className="rh-theme-count" role="status">
          {filter === "all"
            ? isCatalog
              ? `${shown.length} tema`
              : `${shown.length} pilihan dari ${AVAILABLE_THEMES.length} tema`
            : `${shown.length} dari ${matching.length} tema ${FILTERS.find(([key]) => key === filter)?.[1]}`}
          {" · Semua tersedia dalam Akses Awal"}
        </p>
        <ul id="marketing-theme-list" className="rh-theme-grid">
          {shown.map((theme) => (
            <li key={theme.id}>
              <Link href={`/preview/${theme.id}`} className="rh-theme-card">
                <div className="rh-theme-image">
                  <Image
                    src={themeShot(theme.id)}
                    alt={`Contoh tema ${theme.name}`}
                    fill
                    sizes="(max-width: 599px) 85vw, (max-width: 899px) 44vw, 350px"
                    className="object-cover object-top"
                  />
                  <span className="rh-theme-open">
                    Buka contoh <ArrowRight size={15} aria-hidden />
                  </span>
                </div>
                <div className="rh-theme-caption">
                  <h3>{theme.name}</h3>
                  <span>{THEME_CATEGORY_LABEL[theme.pattern] || "Tema"}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="rh-theme-empty">
            Belum ada tema di kategori ini. Coba kategori lainnya.
          </p>
        )}
        <div className="rh-theme-footer">
          <p>Data acara tetap tersimpan saat kalian mengganti tema.</p>
          {isCatalog ? (
            <Link href="/auth?mode=register" className="rh-action">
              Daftar Akses Awal <ArrowRight size={16} aria-hidden />
            </Link>
          ) : (
            <Link href="/preview" className="rh-action">
              Jelajahi semua {AVAILABLE_THEMES.length} tema{" "}
              <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
