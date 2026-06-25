import React from "react";
import { MarketingNavbar } from "@/components/layout/MarketingNavbar";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { LenisProvider } from "@/components/providers/LenisProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <div className="bg-background text-foreground min-h-screen overflow-x-hidden flex flex-col selection:bg-accent selection:text-background">
        <MarketingNavbar />
        <main className="flex-1">
          {children}
        </main>
        <MarketingFooter />
      </div>
    </LenisProvider>
  );
}
