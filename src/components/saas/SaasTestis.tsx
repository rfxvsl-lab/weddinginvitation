"use client";
import React from "react";
import { TESTIMONIALS } from "@/data/socialProof";

/**
 * Testimoni pelanggan. Hanya dirender bila ada testimoni nyata berizin
 * (src/data/socialProof.ts). Tanpa data, bagian ini tidak muncul sama sekali.
 */
export function SaasTestis() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <section id="testimoni" className="saas-shell pt-24">
      <h2 className="text-[32px] sm:text-[40px]">Kata pasangan yang sudah memakai</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="saas-card p-7">
            <blockquote className="text-[15px] leading-relaxed" style={{ color: "var(--saas-ink)" }}>
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 text-[13px]">
              <span className="font-bold">{t.name}</span>
              {t.location && <span style={{ color: "var(--saas-muted)" }}> · {t.location}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
