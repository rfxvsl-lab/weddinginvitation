import React from "react";
import { LenisProvider } from "@/components/providers/LenisProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prototype "Clean SaaS": tiap halaman marketing me-render
  // navbar + footernya sendiri dari komponen saas-*, agar gaya
  // baru tidak tercampur dengan MarketingNavbar/Footer lama.
  return (
    <LenisProvider>
      <div className="min-h-screen overflow-x-hidden flex flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </LenisProvider>
  );
}
