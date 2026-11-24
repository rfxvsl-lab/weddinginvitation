import React from 'react';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingThemes } from '@/components/landing/LandingThemes';
import { LandingSteps } from '@/components/landing/LandingSteps';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFaq } from '@/components/landing/LandingFaq';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingTagline } from '@/components/landing/LandingTagline';
import { SaasVideoStudio } from '@/components/saas/SaasVideoStudio';

export default function LandingPage() {
  return (
    <div className="saas-scope min-h-screen">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Lewati ke konten
      </a>
      <LandingNav />
      <main id="konten">
        <LandingHero />
        <LandingThemes />
        <LandingSteps />
        <LandingFeatures />
        <LandingTagline />
        <SaasVideoStudio />
        <LandingPricing />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
