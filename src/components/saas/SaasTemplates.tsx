"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";

/** Katalog singkat: screenshot asli tiap tema (dibuat oleh scripts/theme-thumbnails.mjs). */
export function SaasTemplates() {
  const themes = DEFAULT_THEMES.slice(0, 4);
  return (
    <section id="template" className="saas-shell pt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-[560px] text-[32px] sm:text-[40px]">{DEFAULT_THEMES.length} tema yang bisa langsung dicoba</h2>
        <Link href="/preview" className="saas-btn-outline">
          Lihat semua tema <ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {themes.map((t) => (
          <Link key={t.id} href={`/demo/${t.id}`} className="saas-card saas-card-hover block overflow-hidden">
            <img
              src={`/assets/themes/${t.id}.webp`}
              width={400}
              height={866}
              loading="lazy"
              decoding="async"
              alt={`Tampilan sampul tema ${t.name}`}
              className="aspect-[4/5] w-full object-cover object-top"
              style={{ background: t.bgHex }}
            />
            <div className="flex items-center justify-between gap-2 border-t p-4" style={{ borderColor: "var(--saas-line)" }}>
              <h3 className="text-[13.5px] font-extrabold leading-tight">{t.name}</h3>
              <span className="text-[11.5px] font-semibold capitalize" style={{ color: "var(--saas-muted)" }}>{t.pattern}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
