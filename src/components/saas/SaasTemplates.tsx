"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";

export function SaasTemplates() {
  const themes = DEFAULT_THEMES.slice(0, 4);
  return (
    <section id="template" className="saas-shell pt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[560px]">
          <p className="saas-kicker">Koleksi tema</p>
          <h2 className="mt-4 text-[32px] sm:text-[40px]">
            Temukan <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>gaya</span> impianmu.
          </h2>
        </div>
        <Link href="/preview" className="saas-btn-outline">Lihat semua tema <ArrowUpRight size={15} /></Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {themes.map((t) => (
          <Link key={t.id} href={`/preview/${t.id}`} className="saas-card saas-card-hover group block overflow-hidden">
            <div
              className="relative flex aspect-[4/5] flex-col items-center justify-center gap-1.5 overflow-hidden px-6 text-center"
              style={{ background: `radial-gradient(130% 100% at 20% 0%, ${t.bgPatternHex}, ${t.bgHex} 72%)` }}
            >
              <span aria-hidden className="absolute -right-10 -top-10 h-32 w-32 rounded-full border" style={{ borderColor: `${t.accentHex}25` }} />
              <span aria-hidden className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full border" style={{ borderColor: `${t.accentHex}25` }} />
              <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: t.accentHex }}>The Wedding of</p>
              <p className="saas-statnum text-[24px]" style={{ color: t.textHex }}>Rina &amp; Budi</p>
              <span className="mt-1 h-px w-10" style={{ background: t.accentHex }} />
              <p className="text-[10.5px] font-semibold" style={{ color: t.textHex, opacity: 0.75 }}>28 · 12 · 2025</p>
              <span
                className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-extrabold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                style={{ background: t.accentHex }}
              >
                Preview Tema <ArrowUpRight size={13} />
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <h3 className="text-[13.5px] font-extrabold leading-tight">{t.name}</h3>
              <span className="saas-badge saas-badge-gold shrink-0 !px-2 !py-1">{t.pattern}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
