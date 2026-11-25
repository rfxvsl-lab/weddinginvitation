import React from "react";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingThemes } from "@/components/landing/LandingThemes";
import { LandingSteps } from "@/components/landing/LandingSteps";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SaasVideoStudio } from "@/components/saas/SaasVideoStudio";
import { MarketingSurface } from "@/components/landing/MarketingSurface";

export const metadata: Metadata = {
  title: "RuangHadir — Undangan pernikahan untuk cerita kalian",
  description:
    "Buat undangan pernikahan gratis dengan tema pilihan, tautan bernama tamu, RSVP, dan amplop digital. Siapkan undangan, bagikan, lalu sambut tamu di hari bahagia.",
  openGraph: {
    title: "RuangHadir — Undangan pernikahan untuk cerita kalian",
    description:
      "Lihat contoh tema, buat undangan gratis, dan kelola konfirmasi kehadiran dalam satu tempat.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <MarketingSurface>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Lewati ke konten
      </a>
      <LandingNav />
      <div id="konten" tabIndex={-1}>
        <LandingHero />
        <LandingThemes />
        <LandingSteps />
        <LandingFeatures />
        <SaasVideoStudio />
        <LandingPricing />
        <LandingFaq />
      </div>
      <LandingFooter />
    </MarketingSurface>
  );
}
