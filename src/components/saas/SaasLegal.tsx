"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, FileText, ShieldCheck, Cookie } from "lucide-react";
import { SaasNav } from "@/components/saas/SaasNav";
import { SaasFooter } from "@/components/saas/SaasClosing";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

export function SaasPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="saas-scope flex min-h-screen flex-col">
      <SaasNav />
      <div className="flex-1">{children}</div>
      <SaasFooter />
    </div>
  );
}

const LEGAL_LINKS = [
  { href: "/terms-of-service", label: "Ketentuan Layanan", icon: FileText },
  { href: "/privacy-policy", label: "Kebijakan Privasi", icon: ShieldCheck },
  { href: "/cookie-policy", label: "Kebijakan Cookie", icon: Cookie },
];

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
  const pathname = usePathname();

  return (
    <div className="saas-scope flex min-h-screen flex-col">
      <SaasNav />
      <main className="saas-shell w-full flex-1 pb-20 pt-10 sm:pt-14">
        <div className="mx-auto max-w-[820px]">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: "var(--saas-faint)" }}
          >
            <Link
              href="/"
              className="transition-colors hover:underline"
              style={{ color: "var(--saas-muted)" }}
            >
              Beranda
            </Link>
            <span>/</span>
            <span>Dokumen Legal</span>
          </nav>

          <header className="mt-5">
            <p className="saas-kicker">Dokumen Resmi RuangHadir</p>
            <h1 className="mt-3 text-[34px] leading-[1.08] sm:text-[44px]">
              {title}{" "}
              <span className="saas-serif-i italic" style={{ color: "var(--saas-wine)" }}>
                {accent}
              </span>
            </h1>
            <p
              className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--saas-muted)" }}
            >
              {updated}
            </p>
          </header>

          {/* Sibling Legal Docs Navigation */}
          <div className="mt-7 flex flex-wrap gap-2">
            {LEGAL_LINKS.map((doc) => {
              const Icon = doc.icon;
              const isCurrent = pathname === doc.href;
              return (
                <Link
                  key={doc.href}
                  href={doc.href}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition"
                  style={
                    isCurrent
                      ? {
                          background: "var(--saas-ink)",
                          color: "#FAF5EE",
                          borderColor: "var(--saas-ink)",
                        }
                      : {
                          background: "#FFFFFF",
                          color: "var(--saas-ink-2)",
                          borderColor: "var(--saas-line)",
                        }
                  }
                >
                  <Icon size={13} />
                  {doc.label}
                </Link>
              );
            })}
          </div>

          <article className="saas-card saas-doc mt-7 px-6 py-8 sm:px-10 sm:py-10">
            {children}
          </article>

          <div className="saas-card mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-[15.5px] font-bold">Ada pertanyaan mengenai dokumen ini?</h3>
              <p className="mt-1 text-[13.5px]" style={{ color: "var(--saas-ink-2)" }}>
                Hubungi tim administrasi dan legal RuangHadir melalui email resmi kami.
              </p>
            </div>
            <a
              href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Pertanyaan%20Dokumen%20Legal%20RuangHadir`}
              className="saas-btn-primary shrink-0"
            >
              <Mail size={15} /> {ENTERPRISE_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </main>
      <SaasFooter />
    </div>
  );
}