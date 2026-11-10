'use client';

/**
 * Tampilan loading dan error yang dipakai bersama oleh loading.tsx / error.tsx.
 * Dua gaya: "app" (landing, dashboard, admin) dan "invitation" (halaman tamu, gelap).
 */

import React from 'react';
import Link from 'next/link';

type Tone = 'app' | 'invitation';

const shell: Record<Tone, string> = {
  app: 'saas-scope min-h-screen flex items-center justify-center px-6 py-16 bg-[#F6F1EA] text-[#2B2018]',
  invitation: 'min-h-screen flex items-center justify-center px-6 py-16 bg-[#050505] text-zinc-100',
};

export function LoadingState({ tone = 'app', label = 'Memuat…' }: { tone?: Tone; label?: string }) {
  return (
    <div className={shell[tone]} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden
          className={`h-8 w-8 rounded-full border-2 animate-spin ${
            tone === 'app' ? 'border-[#E4D8C3] border-t-[#8E2F45]' : 'border-zinc-800 border-t-zinc-300'
          }`}
        />
        <p className={`text-xs font-bold uppercase tracking-[0.25em] ${tone === 'app' ? 'text-[#6B5B4A]' : 'text-zinc-400'}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

/** Kerangka dashboard: sidebar + area konten, supaya transisi tidak berupa layar kosong. */
export function DashboardSkeleton() {
  const bar = 'rounded-xl bg-[#EFE5D4] animate-pulse';
  return (
    <div className="saas-scope flex h-screen w-full bg-[#F6F1EA]" role="status" aria-live="polite">
      <span className="sr-only">Memuat dashboard…</span>
      <aside className="hidden md:flex w-72 flex-col gap-4 border-r border-[#E4D8C3] p-6" aria-hidden>
        <div className={`${bar} h-9 w-36`} />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${bar} h-10 w-full`} />
        ))}
      </aside>
      <main className="flex-1 p-6 md:p-10 space-y-6" aria-hidden>
        <div className={`${bar} h-8 w-64`} />
        <div className={`${bar} h-4 w-96 max-w-full`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${bar} h-56`} />
          ))}
        </div>
      </main>
    </div>
  );
}

export function ErrorState({
  tone = 'app',
  title = 'Terjadi kesalahan',
  message = 'Halaman ini gagal dimuat. Coba lagi sebentar lagi.',
  onRetry,
  digest,
}: {
  tone?: Tone;
  title?: string;
  message?: string;
  onRetry?: () => void;
  digest?: string;
}) {
  const muted = tone === 'app' ? 'text-[#6B5B4A]' : 'text-zinc-400';
  return (
    <div className={shell[tone]} role="alert">
      <div className="max-w-md w-full text-center space-y-5">
        <h1 className={`text-2xl font-bold ${tone === 'app' ? 'font-serif' : ''}`}>{title}</h1>
        <p className={`text-sm leading-relaxed ${muted}`}>{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className={
                tone === 'app'
                  ? 'saas-btn-primary min-h-11 px-6'
                  : 'min-h-11 px-6 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition'
              }
            >
              Coba lagi
            </button>
          )}
          <Link
            href="/"
            className={
              tone === 'app'
                ? 'saas-btn-outline min-h-11 px-6 inline-flex items-center justify-center'
                : 'min-h-11 px-6 rounded-xl border border-zinc-700 text-sm font-semibold inline-flex items-center justify-center hover:border-zinc-500 transition'
            }
          >
            Ke beranda
          </Link>
        </div>
        {digest && <p className={`text-[11px] font-mono ${muted}`}>Kode: {digest}</p>}
      </div>
    </div>
  );
}
