'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEFAULT_THEMES } from '@/data/defaultData';
import { THEME_SHOTS, THEME_CATEGORY_LABEL } from './themeShots';

const FILTERS: [string, string][] = [
  ['all', 'Semua'],
  ['classic', 'Klasik & adat'],
  ['modern', 'Modern'],
  ['floral', 'Floral'],
  ['storybook', 'Interaktif'],
];

export function LandingThemes() {
  const [filter, setFilter] = useState('all');
  const themes = useMemo(
    () => (filter === 'all' ? DEFAULT_THEMES : DEFAULT_THEMES.filter((t) => t.pattern === filter)),
    [filter]
  );

  return (
    <section id="tema" className="scroll-mt-20 border-t border-[var(--rh-line)] bg-[var(--rh-paper)]">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-[560px]">
            <h2 className="text-[36px] leading-[1.08] sm:text-[44px]">
              {DEFAULT_THEMES.length} tema, semuanya gratis dipakai.
            </h2>
            <p className="mt-4 text-[16px] leading-[1.65] text-[var(--rh-ink-2)]">
              Buka setiap tema dalam ukuran penuh sebelum memilih. Tema bisa diganti kapan saja tanpa mengetik ulang data acara.
            </p>
          </div>

          <div role="tablist" aria-label="Filter kategori tema" className="flex flex-wrap gap-2">
            {FILTERS.map(([key, label]) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(key)}
                  className={`rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
                    active
                      ? 'border-[var(--rh-ink)] bg-[var(--rh-ink)] text-white'
                      : 'border-[var(--rh-line-strong)] bg-white text-[var(--rh-ink-2)] hover:border-[var(--rh-ink)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-8">
          {themes.map((t) => (
            <li key={t.id}>
              <Link href={`/preview/${t.id}`} className="group block focus-visible:outline-offset-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-[var(--rh-line)] bg-[var(--rh-linen)]">
                  {THEME_SHOTS[t.id] && (
                    <Image
                      src={THEME_SHOTS[t.id]}
                      alt={`Pratinjau tema ${t.name}`}
                      fill
                      sizes="(max-width: 768px) 45vw, 380px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-[var(--rh-ink)] group-hover:text-[var(--rh-wine)]">{t.name}</h3>
                  <span className="shrink-0 text-[12.5px] text-[var(--rh-muted)]">{THEME_CATEGORY_LABEL[t.pattern] || 'Tema'}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
