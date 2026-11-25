import React from 'react';
import { MarketingSurface } from '@/components/landing/MarketingSurface';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function NotFound() {
  return (
    <MarketingSurface className="flex flex-col">
      <LandingNav />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start justify-center px-5 py-24 sm:px-8">
        <p className="text-[14px] font-medium text-[var(--rh-gold-deep)]">Kesalahan 404</p>
        <h1 className="rh-display mt-4 max-w-[14ch] text-[48px] leading-[1.02] sm:text-[72px]">Halaman ini tidak ditemukan.</h1>
        <p className="mt-6 max-w-[48ch] text-[16px] leading-[1.7] text-[var(--rh-ink-2)]">
          Periksa kembali ejaan tautannya. Jika ini tautan undangan, mungkin undangan belum dipublikasikan oleh mempelai.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="saas-btn-primary px-6">Kembali ke beranda</Link>
          <Link href="/preview" className="saas-btn-outline px-6">Lihat tema undangan</Link>
        </div>
      </main>
      <LandingFooter />
    </MarketingSurface>
  );
}
