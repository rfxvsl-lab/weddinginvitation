'use client';

import React, { useState } from 'react';
import { Check, Palette, Eye, BookOpen } from 'lucide-react';
import { DEFAULT_THEMES } from '../data/defaultData';
import { themeShot } from '../themes/shots';
import { getKitTheme, isNewTheme } from '../themes/catalog';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  packageId?: string;
  /** varian warna tema aktif (Theme Kit) */
  currentVariant?: string;
  onSelectVariant?: (variantId: string) => void;
}


const PATTERN_LABELS: Record<string, string> = {
  all: 'Semua',
  special: 'Spesial 2.5D',
  modern: 'Modern',
  classic: 'Klasik & Adat',
  floral: 'Floral',
  minimalist: 'Minimalis',
  storybook: 'Interaktif',
};

export default function ThemeSelector({
  currentThemeId,
  onSelectTheme,
  currentVariant,
  onSelectVariant,
}: ThemeSelectorProps) {
  const [filter, setFilter] = useState<string>('all');
  const activeKit = getKitTheme(currentThemeId);
  const variants = activeKit?.variants || [];
  const activeVariant = variants.find((v) => v.id === currentVariant)?.id || variants[0]?.id;

  // Tema baru (14 hari) tampil paling depan
  const sorted = [...DEFAULT_THEMES].sort((a, b) => Number(isNewTheme(b.addedAt)) - Number(isNewTheme(a.addedAt)) || (b.addedAt || '').localeCompare(a.addedAt || ''));
  const filteredThemes = filter === 'all' ? sorted : sorted.filter((t) => (filter === 'special' ? t.tier === 'special' : t.pattern === filter));

  return (
    <div className="space-y-6">
      {/* Varian warna tema aktif */}
      {variants.length > 1 && onSelectVariant && (
        <div className="rounded-2xl border border-[#E8DFD4] bg-white p-4">
          <p className="text-[13px] font-semibold text-[var(--rh-ink)]">Warna tema {activeKit?.name}</p>
          <p className="mt-0.5 text-[12px] text-[var(--rh-ink-2)]">Pilih varian warna — tata letak dan animasi tetap sama.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => {
              const pal = { ...activeKit!.palette, ...v.palette };
              const on = v.id === activeVariant;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectVariant(v.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 text-[12px] font-medium transition ${on ? 'border-[var(--rh-primary)] bg-[var(--rh-primary)]/5 text-[var(--rh-primary)]' : 'border-[#E8DFD4] text-[var(--rh-ink-2)] hover:border-[#B8955A]'}`}
                >
                  <span className="flex overflow-hidden rounded-full border border-black/10">
                    {[pal.primary, pal.secondary, pal.bg].map((c, i) => (
                      <span key={i} className="h-5 w-3" style={{ background: c }} />
                    ))}
                  </span>
                  {v.name}
                  {on && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header + Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--rh-primary)]">
            <Palette className="h-3.5 w-3.5" />
            <span>Semua {DEFAULT_THEMES.length} Tema Gratis</span>
          </div>
          <h2 className="mt-1 font-serif text-[24px] leading-tight text-[var(--rh-ink)]">
            Pilih Tema Undangan
          </h2>
          <p className="mt-1 text-[13px] text-[var(--rh-ink-2)]">
            Ganti tema kapan saja tanpa menghapus data mempelai, acara, maupun daftar tamu.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(PATTERN_LABELS).map(([key, label]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition cursor-pointer ${
                  active
                    ? 'border-[var(--rh-ink)] bg-[var(--rh-ink)] text-white'
                    : 'border-[var(--rh-line)] bg-white text-[var(--rh-ink-2)] hover:bg-[var(--rh-ivory)]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredThemes.map((theme) => {
          const isSelected = theme.id === currentThemeId;
          const imgSrc = themeShot(theme.id);
          const fresh = isNewTheme(theme.addedAt);

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[var(--rh-primary)] ring-2 ring-[var(--rh-primary)]/20'
                  : 'border-[var(--rh-line)] hover:border-[#C7B7A1]'
              }`}
            >
              {/* Visual Preview Thumbnail */}
              <div
                className="relative aspect-[16/10] w-full overflow-hidden"
                style={{
                  background: `radial-gradient(130% 100% at 20% 0%, ${theme.bgPatternHex}, ${theme.bgHex} 72%)`,
                }}
              >
                {fresh && (
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-[var(--rh-primary)] px-2 py-0.5 text-[10.5px] font-semibold text-white">Baru</span>
                )}
                {theme.tier === 'special' && (
                  <span className="absolute right-2 top-2 z-10 rounded-full bg-[var(--rh-ink)] px-2 py-0.5 text-[10.5px] font-semibold text-[#E9D3A6]">Spesial</span>
                )}
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={theme.name}
                    loading="lazy"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 py-4">
                    <div
                      className="flex h-full w-[112px] overflow-hidden rounded-r-lg rounded-l-[3px] shadow-lg ring-1 ring-[#8C6B34]/35"
                      style={{
                        background:
                          'linear-gradient(155deg, #35211E 0%, #241715 65%, #1A100F 100%)',
                      }}
                    >
                      <div className="w-2 shrink-0 border-r border-[#8C6B34]/25 bg-black/35" />
                      <div className="m-1.5 flex flex-1 flex-col items-center justify-center rounded border border-[#8C6B34]/30 px-1.5 text-center">
                        <BookOpen className="h-3.5 w-3.5 text-[#DFC086]" />
                        <span className="mt-1 font-serif text-[12px] leading-tight text-[#FAF3E6]">
                          Storybook 3D
                        </span>
                      </div>
                      <div className="w-1 shrink-0 bg-[#E8DEC9]" />
                    </div>
                  </div>
                )}

                {isSelected && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--rh-primary)] px-2.5 py-1 text-[10.5px] font-bold text-white shadow-sm">
                    <Check className="h-3 w-3" />
                    Aktif
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-bold text-[var(--rh-ink)] group-hover:text-[var(--rh-primary)] transition-colors">
                      {theme.name}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] text-[var(--rh-muted)]">
                      {PATTERN_LABELS[theme.pattern] || theme.pattern}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[var(--rh-line)] bg-[var(--rh-ivory)] px-2 py-1 text-[11px] font-semibold text-[var(--rh-ink-2)]">
                    <Eye className="h-3 w-3" />
                    Preview
                  </span>
                </div>

                {/* Color Palette Swatches */}
                <div className="flex items-center justify-between border-t border-[#F2ECE2] pt-3">
                  <div className="flex -space-x-1.5">
                    {[
                      theme.primaryHex,
                      theme.secondaryHex,
                      theme.bgHex,
                      theme.accentHex,
                      theme.textHex,
                    ].map((hex, i) => (
                      <span
                        key={i}
                        className="h-5 w-5 rounded-full border-2 border-white shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#3F7A52]">
                    Gratis
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
