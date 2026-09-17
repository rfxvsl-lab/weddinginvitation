"use client";
import React from "react";
import Link from "next/link";
import { Clock, Search, Users, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SOCIAL_STATS, CTA_FACTS, VERIFIED, UNVERIFIED_LABEL } from "@/data/socialProof";

export function SaasStrip() {
  // Selama angka belum diverifikasi, tampilkan label netral alih-alih klaim kosong.
  if (!VERIFIED) {
    return (
      <section className="saas-shell pt-14">
        <div
          className="saas-card flex flex-col items-center justify-center gap-2 px-6 py-7 text-center sm:flex-row"
        >
          <ShieldCheck size={18} style={{ color: "var(--saas-gold)" }} aria-hidden />
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--saas-muted)" }}
          >
            {UNVERIFIED_LABEL}
          </p>
        </div>
      </section>
    );
  }

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

export function SaasCta() {
  return (
    <>
      <section className="saas-shell pt-24">
        <div className="saas-dark-panel grid gap-10 overflow-hidden rounded-[28px] p-8 sm:p-12 lg:grid-cols-[1.1fr_1fr] lg:p-14">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: "var(--saas-gold-2)" }}>Mulai sekarang</p>
            <h2 className="mt-4 text-[32px] leading-[1.08] text-white sm:text-[42px]">
              Hari spesialmu layak{" "}
              <span className="saas-serif-i" style={{ color: "var(--saas-gold-2)" }}>diundang</span>{" "}
              dengan indah.
            </h2>
            <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-[#EAD9CE]">
              Setup 10 menit, langsung sebar via WhatsApp. Coba tema Demo gratis — tanpa kartu kredit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth?mode=register"
                className="saas-btn-primary !border-transparent"
                style={{ background: "#FFF6F1", color: "var(--saas-wine)", boxShadow: "0 12px 28px -12px rgba(0,0,0,.55)" }}
              >
                Buat Undangan Gratis
              </Link>
              <Link href="/preview" className="saas-btn-outline !bg-transparent !text-[#F6EFE7]" style={{ borderColor: "rgba(246,239,231,.35)" }}>
                Lihat Contoh
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6" style={{ color: "var(--saas-ink)" }}>
            <p className="text-[13px] font-extrabold">Cek ketersediaan link undanganmu</p>
            <div className="mt-3 flex gap-2">
              <span className="flex flex-1 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold" style={{ borderColor: "var(--saas-line-strong)" }}>
                <Search size={15} style={{ color: "var(--saas-muted)" }} />
                <span style={{ color: "var(--saas-muted)" }}>ruanghadir.net/</span><span>rina-budi</span>
              </span>
              <Link href="/auth?mode=register" className="saas-btn-primary !px-5 !py-2.5">Klaim</Link>
            </div>
            <div className="mt-5 space-y-2.5 text-[12.5px] font-semibold" style={{ color: "var(--saas-ink-2)" }}>
              <p className="flex items-center gap-2">
                <ShieldCheck size={14} style={{ color: "var(--saas-gold)" }} /> Gratis dicoba dulu — tanpa kartu kredit
              </p>
              {VERIFIED && (
                <>
                  <p className="flex items-center gap-2"><Clock size={14} style={{ color: "var(--saas-gold)" }} /> Rata-rata selesai {CTA_FACTS.setupDuration}</p>
                  <p className="flex items-center gap-2"><Users size={14} style={{ color: "var(--saas-gold)" }} /> {CTA_FACTS.newCouplesThisMonth.toLocaleString("id-ID")} pasangan daftar bulan ini</p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function SaasFooter() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: "var(--saas-line-strong)", background: "linear-gradient(180deg, rgba(185,138,68,.05), transparent 30%)" }}>
        <div className="saas-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="flex items-center gap-3.5">
              <Logo variant="mark" isLink={false} height="h-12" />
              <span className="saas-statnum text-[22px]" style={{ color: "var(--saas-ink)" }}>RuangHadir<span style={{ color: "var(--saas-wine)" }}>.net</span></span>
            </span>
            <p className="mt-3 max-w-[38ch] text-[13.5px] leading-relaxed" style={{ color: "var(--saas-muted)" }}>
              Platform undangan pernikahan digital premium — karya RFX Visual.
            </p>
          </div>
          {[
            ["Produk", [["Katalog Tema", "/preview"], ["Fitur", "/#fitur"], ["Harga", "/#harga"]]],
            ["Perusahaan", [["Tentang", "/about"], ["Kontak", "/contact"]]],
            ["Bantuan", [["FAQ", "/#faq"], ["Pengembalian", "/refund-policy"]]],
          ].map(([title, items]) => (
            <div key={title as string}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--saas-faint)" }}>{title}</h4>
              <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium">
                {(items as [string, string][]).map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="transition-colors hover:font-bold" style={{ color: "var(--saas-ink-2)" }}>{l}</Link>
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
