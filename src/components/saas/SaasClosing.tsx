"use client";
import React from "react";
import Link from "next/link";
import { Search, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SOCIAL_STATS } from "@/data/socialProof";
import { PACKAGE_LIMITS, PACKAGE_PRICES, formatActiveDays } from "@/lib/packageLimits";
import { SITE, whatsappLink } from "@/lib/site";

export function SaasStrip() {
  // Hanya tampil jika ada statistik nyata (lihat src/data/socialProof.ts).
  if (SOCIAL_STATS.length === 0) return null;

  return (
    <section className="saas-shell pt-14">
      <div className="saas-card grid grid-cols-2 gap-y-8 px-6 py-8 sm:px-10 lg:grid-cols-4">
        {SOCIAL_STATS.map((s, i) => (
          <div key={s.label} className={`text-center ${i > 0 ? "lg:border-l" : ""}`} style={{ borderColor: "var(--saas-line)" }}>
            <p className="saas-statnum text-[34px]" style={{ color: "var(--saas-wine)" }}>{s.value}</p>
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--saas-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const DEMO_THEME_COUNT = Array.isArray(PACKAGE_LIMITS.demo.themes) ? PACKAGE_LIMITS.demo.themes.length : 0;

export function SaasCta() {
  return (
    <>
      <section className="saas-shell pt-24">
        <div className="saas-dark-panel grid gap-10 overflow-hidden rounded-[28px] p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-14">
          <div>
            <h2 className="text-[32px] leading-[1.15] text-white sm:text-[40px] font-serif">
              Coba dulu dengan paket Demo, gratis.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-[#EAD9CE]">
              Editor dan {DEMO_THEME_COUNT} tema bisa dicoba selama {formatActiveDays(PACKAGE_LIMITS.demo.activeDays)} tanpa
              pembayaran. Kalau cocok, pilih paket mulai Rp {PACKAGE_PRICES.reguler.mandiri.toLocaleString("id-ID")} dan
              undangan yang sudah dibuat tetap tersimpan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth?mode=register"
                className="saas-btn-primary !border-transparent"
                style={{ background: "#FFF6F1", color: "var(--saas-wine)" }}
              >
                Mulai paket Demo
              </Link>
              <Link href="/preview" className="saas-btn-outline !bg-transparent !text-[#F6EFE7]" style={{ borderColor: "rgba(246,239,231,.35)" }}>
                Lihat semua tema
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6" style={{ color: "var(--saas-ink)" }}>
            <p className="text-[13px] font-extrabold">Tautan undangan kalian akan seperti ini</p>
            <div className="mt-3 flex gap-2">
              <span className="flex flex-1 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold" style={{ borderColor: "var(--saas-line-strong)" }}>
                <Search size={15} style={{ color: "var(--saas-muted)" }} />
                <span style={{ color: "var(--saas-muted)" }}>ruanghadir.net/</span><span>kharis-lia</span>
              </span>
              <Link href="/auth?mode=register" className="saas-btn-primary !px-5 !py-2.5">Daftar</Link>
            </div>
            <ul className="mt-5 space-y-2.5 text-[12.5px] font-semibold" style={{ color: "var(--saas-ink-2)" }}>
              {[
                "Nama tautan dipilih sendiri saat daftar",
                "Setiap tamu mendapat tautan dengan namanya: …/kharis-lia?to=Nama",
                "Paket Premium bisa ganti tautan 1 kali, Luxury tanpa batas",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--saas-gold)" }} aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export function SaasFooter() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--saas-line-strong)" }}>
        <div className="saas-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-3.5">
              <Logo variant="mark" isLink={false} height="h-12" />
              <span className="saas-statnum text-[22px]" style={{ color: "var(--saas-ink)" }}>RuangHadir<span style={{ color: "var(--saas-wine)" }}>.net</span></span>
            </span>
            <p className="mt-3 max-w-[38ch] text-[13.5px] leading-relaxed" style={{ color: "var(--saas-muted)" }}>
              Undangan pernikahan digital buatan RFX Visual. Dukungan lewat WhatsApp, {SITE.supportHours}.
            </p>
          </div>
          {[
            ["Produk", [["Katalog Tema", "/preview"], ["Fitur", "/#fitur"], ["Harga", "/#harga"]]],
            ["Kontak", [["WhatsApp", whatsappLink("Halo RuangHadir")], ["Instagram", `https://instagram.com/${SITE.instagram}`]]],
            ["Bantuan", [["FAQ", "/#faq"], ["Pengembalian", "/refund-policy"]]],
          ].map(([title, items]) => (
            <div key={title as string}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--saas-faint)" }}>{title}</h4>
              <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium">
                {(items as [string, string][]).map(([l, h]) => (
                  <li key={l}>
                    {h.startsWith("http") ? (
                      <a href={h} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--saas-ink-2)" }}>{l}</a>
                    ) : (
                      <Link href={h} className="hover:underline" style={{ color: "var(--saas-ink-2)" }}>{l}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--saas-line)" }}>
          <div className="saas-shell flex flex-col items-center justify-between gap-3 py-5 text-[11.5px] font-medium sm:flex-row" style={{ color: "var(--saas-faint)" }}>
            <p>© {new Date().getFullYear()} RuangHadir.net — by RFX Visual.</p>
            <p className="flex gap-5">
              <Link href="/privacy-policy" className="hover:underline">Privasi</Link>
              <Link href="/terms-of-service" className="hover:underline">Ketentuan</Link>
              <Link href="/cookie-policy" className="hover:underline">Cookie</Link>
            </p>
          </div>
        </div>
      </footer>
  );
}

export function SaasCtaFooter() {
  return (
    <>
      <SaasCta />
      <SaasFooter />
    </>
  );
}
