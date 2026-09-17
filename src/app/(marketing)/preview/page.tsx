import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { SaasPageShell } from "@/components/saas/SaasLegal";

export const metadata: Metadata = {
  title: "Katalog Tema — RuangHadir.net",
  description: "Jelajahi koleksi tema undangan pernikahan digital premium: minimalis, adat nusantara, hingga luxury cinematic.",
};

export default function PreviewPage() {
  return (
    <SaasPageShell>
      <section className="saas-shell pb-14 pt-16 text-center sm:pt-20">
        <p className="saas-kicker">Koleksi tema</p>
        <h1 className="mx-auto mt-5 max-w-[16ch] text-[40px] leading-[1.05] sm:text-[56px]">
          Pilihan <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>desain</span> premium.
        </h1>
        <p className="mx-auto mt-6 max-w-[58ch] text-[16px] leading-[1.75]" style={{ color: "var(--saas-ink-2)" }}>
          Pilih dan gunakan tema undangan pernikahan yang menarik serta unik. Setiap desain dirancang dengan estetika
          premium untuk momen spesial Anda.
        </p>
      </section>

      <section className="saas-shell pb-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_THEMES.map((theme) => (
            <div key={theme.id} className="saas-card saas-card-hover group p-6">
              <div className="flex items-start gap-5">
                <Link href={`/demo/${theme.id}`} className="group/phone relative shrink-0" aria-label={`Preview tema ${theme.name}`}>
                  <div
                    className="w-[132px] rounded-[24px] p-1.5 transition-transform duration-500 group-hover/phone:-rotate-2 group-hover/phone:scale-[1.04]"
                    style={{ background: "var(--saas-ink)", boxShadow: "0 24px 40px -18px rgba(36,20,24,.45)" }}
                  >
                    <div className="relative aspect-[9/19] overflow-hidden rounded-[19px]" style={{ background: theme.bgHex }}>
                      <img
                        src={`/assets/themes/${theme.id}.png`}
                        alt={`Mockup tema ${theme.name}`}
                        loading="lazy"
                        className="saas-photo opacity-90 transition-opacity duration-500 group-hover/phone:opacity-100"
                      />
                    </div>
                  </div>
                  <span
                    className="absolute inset-x-2 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-full py-2 text-[10.5px] font-extrabold text-white opacity-0 transition-all duration-300 group-hover/phone:translate-y-0 group-hover/phone:opacity-100"
                    style={{ background: theme.accentHex }}
                  >
                    Lihat Demo <ArrowUpRight size={11} />
                  </span>
                </Link>

                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryHex }}>
                    Tema undangan
                  </p>
                  <h3 className="mt-1.5 text-[18px] font-extrabold leading-tight">{theme.name}</h3>
                  <div className="mt-3.5 flex -space-x-1.5">
                    {[theme.primaryHex, theme.secondaryHex, theme.bgHex, theme.accentHex, theme.textHex].map((hex, ci) => (
                      <span
                        key={ci}
                        className="h-5 w-5 rounded-full border-2 border-white"
                        style={{ background: hex, zIndex: 5 - ci }}
                      />
                    ))}
                  </div>
                  <span className="saas-badge saas-badge-gold mt-4 inline-block !px-2.5 !py-1">{theme.pattern}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="saas-shell pb-24">
        <div className="saas-dark-panel flex flex-col items-center gap-6 rounded-[28px] p-10 text-center sm:p-14">
          <h2 className="max-w-[22ch] text-[30px] text-white sm:text-[38px]">
            Sudah menemukan <span className="saas-serif-i" style={{ color: "var(--saas-gold-2)" }}>the one</span>?
          </h2>
          <p className="max-w-[46ch] text-[14.5px] leading-relaxed text-[#EAD9CE]">
            Mulai kustomisasi tema pilihanmu sekarang — gratis untuk paket Demo, tanpa kartu kredit.
          </p>
          <Link href="/auth?mode=register" className="saas-btn-primary" style={{ background: "#FFF6F1", color: "var(--saas-wine)" }}>
            Mulai Buat Undangan <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SaasPageShell>
  );
}