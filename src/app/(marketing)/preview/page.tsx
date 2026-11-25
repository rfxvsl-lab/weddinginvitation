import React from 'react';
import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingThemes } from '@/components/landing/LandingThemes';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { MarketingSurface } from '@/components/landing/MarketingSurface';

export const metadata: Metadata = {
  title: 'Tema Undangan Pernikahan Digital — RuangHadir',
  description: 'Lihat semua tema undangan pernikahan digital RuangHadir dalam ukuran penuh. Semua tema gratis dipakai.',
};

export default function PreviewGalleryPage() {
  return (
    <MarketingSurface>
      <LandingNav />
      <main>
        <LandingThemes variant="catalog" />
      </main>
      <LandingFooter />
    </MarketingSurface>
  );
}
