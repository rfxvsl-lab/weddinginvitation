'use client';

import React, { useState } from 'react';
import { Check, Palette, Eye, BookOpen } from 'lucide-react';
import { DEFAULT_THEMES } from '../data/defaultData';

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  packageId?: string;
}

const THEME_PREVIEW_IMAGES: Record<string, string> = {
  'rfx-dark': '/assets/themes/rfx-dark.png',
  'cremy-rose': '/assets/themes/cremy-rose.png',
  'grand-ballroom': '/assets/themes/grand-ballroom.png',
  'netflix-luxury': '/assets/themes/netflix-luxury.png',
  'royal-arabian': '/assets/themes/royal-arabian.png',
  spotilove: '/assets/themes/spotilove.png',
  'javanese-classic': '/assets/themes/javanese-classic.png',
  'parallax-cinematic': '/assets/themes/parallax-cinematic.png',
};

const PATTERN_LABELS: Record<string, string> = {
  all: 'Semua',
  modern: 'Modern',
  classic: 'Klasik & Adat',
  floral: 'Floral',
  storybook: 'Interaktif',
};

export default function ThemeSelector({
  currentThemeId,
  onSelectTheme,
}: ThemeSelectorProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredThemes =
    filter === 'all'
      ? DEFAULT_THEMES
      : DEFAULT_THEMES.filter((t) => t.pattern === filter);

  return (
    <div className="space-y-6">
      {/* Header + Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8E2F45]">
            <Palette className="h-3.5 w-3.5" />
            <span>Semua {DEFAULT_THEMES.length} Tema Gratis</span>
          </div>
          <h2 className="mt-1 font-serif text-[24px] leading-tight text-[#1C1614]">
            Pilih Tema Undangan
          </h2>
          <p className="mt-1 text-[13px] text-[#6B5D54]">
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
                    ? 'border-[#1C1614] bg-[#1C1614] text-white'
                    : 'border-[#E6DFD3] bg-white text-[#5C4E45] hover:bg-[#FAF6F0]'
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
          const imgSrc = THEME_PREVIEW_IMAGES[theme.id];

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#8E2F45] ring-2 ring-[#8E2F45]/20'
                  : 'border-[#E6DFD3] hover:border-[#C7B7A1]'
              }`}
            >
              {/* Visual Preview Thumbnail */}
              <div
                className="relative aspect-[16/10] w-full overflow-hidden"
                style={{
                  background: `radial-gradient(130% 100% at 20% 0%, ${theme.bgPatternHex}, ${theme.bgHex} 72%)`,
                }}
              >
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={theme.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 py-4">
                    <div
                      className="flex h-full w-[112px] overflow-hidden rounded-r-lg rounded-l-[3px] shadow-lg ring-1 ring-[#C6A15B]/35"
                      style={{
                        background:
                          'linear-gradient(155deg, #35211E 0%, #241715 65%, #1A100F 100%)',
                      }}
                    >
                      <div className="w-2 shrink-0 border-r border-[#C6A15B]/25 bg-black/35" />
                      <div className="m-1.5 flex flex-1 flex-col items-center justify-center rounded border border-[#C6A15B]/30 px-1.5 text-center">
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
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#8E2F45] px-2.5 py-1 text-[10.5px] font-bold text-white shadow-sm">
                    <Check className="h-3 w-3" />
                    Aktif
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-bold text-[#1C1614] group-hover:text-[#8E2F45] transition-colors">
                      {theme.name}
                    </h3>
                    <p className="mt-0.5 text-[11.5px] text-[#8B7D74]">
                      {PATTERN_LABELS[theme.pattern] || theme.pattern}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#EAE3D8] bg-[#FAF7F2] px-2 py-1 text-[11px] font-semibold text-[#5C4E45]">
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
                  <span className="text-[11px] font-semibold text-[#2D7A4F]">
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
