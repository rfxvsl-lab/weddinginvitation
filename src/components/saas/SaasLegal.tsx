import React from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { SaasNav } from "@/components/saas/SaasNav";
import { SITE, whatsappLink } from "@/lib/site";
import { SaasFooter } from "@/components/saas/SaasClosing";

export function SaasPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="saas-scope flex min-h-screen flex-col">
      <SaasNav />
      <div className="flex-1">{children}</div>
      <SaasFooter />
    </div>
  );
}

export function SaasLegalShell({
  title,
  accent,
  updated,
  children,
}: {
  title: string;
  accent: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="saas-scope flex min-h-screen flex-col">
      <SaasNav />
      <main className="saas-shell w-full flex-1 pb-20 pt-12">
        <div className="mx-auto max-w-[800px]">
          <nav className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "var(--saas-faint)" }}>
            <Link href="/" className="transition-colors hover:font-bold" style={{ color: "var(--saas-muted)" }}>
              Beranda
            </Link>
            <span>/</span>
            <span>Legal</span>
          </nav>
          <h1 className="mt-6 text-[34px] leading-[1.06] sm:text-[44px]">
            {title} {accent}
          </h1>
          <p className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--saas-muted)" }}>
            {updated}
          </p>
          <article className="saas-card saas-doc mt-9 px-6 py-8 sm:px-10 sm:py-10">{children}</article>
          <div className="saas-card mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[15.5px] font-extrabold">Ada pertanyaan soal dokumen ini?</h3>
              <p className="mt-1 text-[13.5px]" style={{ color: "var(--saas-ink-2)" }}>
                Hubungi kami lewat WhatsApp, {SITE.supportHours}.
              </p>
            </div>
            <a
              href={whatsappLink("Halo RuangHadir")}
              target="_blank"
              rel="noreferrer"
              className="saas-btn-primary shrink-0"
            >
              <Send size={15} /> Chat WhatsApp
            </a>
          </div>
        </div>
      </main>
      <SaasFooter />
    </div>
  );
}