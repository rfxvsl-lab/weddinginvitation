"use client";

import React from "react";
import { SaasNav } from "@/components/saas/SaasNav";
import { SaasHero } from "@/components/saas/SaasHero";
import { SaasFeatures } from "@/components/saas/SaasFeatures";
import { SaasTemplates } from "@/components/saas/SaasTemplates";
import { SaasSteps } from "@/components/saas/SaasSteps";
import { SaasPricing } from "@/components/saas/SaasPricing";
import { SaasTestis } from "@/components/saas/SaasTestis";
import { SaasFaq } from "@/components/saas/SaasFaq";
import { SaasStrip, SaasCtaFooter } from "@/components/saas/SaasClosing";

export default function LandingPage() {
  return (
    <div className="saas-scope min-h-screen pb-0">
      <SaasNav />
      <SaasHero />
      <SaasStrip />
      <SaasFeatures />
      <SaasTemplates />
      <SaasSteps />
      <SaasPricing />
      <SaasTestis />
      <SaasFaq />
      <SaasCtaFooter />
    </div>
  );
}
