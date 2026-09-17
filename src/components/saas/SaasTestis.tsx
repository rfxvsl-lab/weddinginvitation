"use client";
import React from "react";
import { Star, MapPin, Quote } from "lucide-react";
import { TESTIMONIALS, VERIFIED, UNVERIFIED_LABEL } from "@/data/socialProof";

export function SaasTestis() {
  return (
    <section id="testimoni" className="saas-shell pt-24">
      <div className="max-w-[620px]">
        <p className="saas-kicker">Cerita mereka</p>
        <h2 className="mt-4 text-[32px] sm:text-[40px]">
          {VERIFIED ? (
            <>
              Dipercaya <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>12.400</span> pasangan.
            </>
          ) : (
            <>
              Apa kata <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>pengguna</span> kami.
            </>
          )}
        </h2>
        {!VERIFIED && (
          <p className="mt-3 text-[13px] font-semibold" style={{ color: "var(--saas-muted)" }}>
            {UNVERIFIED_LABEL} — kutipan di bawah adalah contoh tampilan.
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className={`saas-card saas-card-hover flex flex-col p-6 ${t.wide ? "md:col-span-2" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="flex gap-0.5" aria-label="Rating 5 dari 5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={14} fill="var(--saas-gold)" color="var(--saas-gold)" aria-hidden />
                ))}
              </span>
              <Quote aria-hidden size={26} style={{ color: "var(--saas-line-strong)" }} />
            </div>
            <blockquote
              className={`mt-3 flex-1 ${t.wide ? "saas-serif-i text-[21px] leading-snug sm:text-[23px]" : "text-[14.5px] leading-relaxed"}`}
              style={{ color: "var(--saas-ink)" }}
            >
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 pt-4" style={{ borderTop: "1px solid var(--saas-line)" }}>
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                style={{ background: t.color }}
              >
                {t.initials}
              </span>
              <span>
                <span className="block text-[13.5px] font-extrabold">{t.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "var(--saas-muted)" }}>
                  <MapPin size={11} aria-hidden /> {t.venue}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
