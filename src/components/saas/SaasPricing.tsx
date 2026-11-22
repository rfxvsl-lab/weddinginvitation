"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  Copy,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

const FREE_FEATURES = [
  "Akses penuh ke seluruh 9 tema (termasuk Heirloom Storybook 3D)",
  "Langsung bisa publish & aktif penuh tanpa batas demo",
  "Link undangan personal dengan nama tamu tak terbatas",
  "RSVP real-time, buku tamu, ucapan & analitik kunjungan",
  "Amplop digital multi-bank, e-wallet, QRIS & alamat kado",
  "Galeri foto prewedding, kisah cinta & musik latar",
  "QR Check-in tamu & export daftar tamu CSV/PDF",
  "Hingga 3 proyek undangan aktif, tanpa watermark",
];

const ENTERPRISE_FEATURES = [
  "Akses tim multi-seat melalui email perusahaan resmi",
  "Proyek undangan, galeri & penyimpanan tanpa batas",
  "Custom domain sendiri (mis. event.perusahaan.co.id)",
  "White-label branding & kustomisasi tema khusus klien",
  "Portal login khusus dengan Kode Akses Enterprise",
  "Onboarding & dukungan teknis prioritas dari tim inti",
];

export function SaasPricing() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(ENTERPRISE_CONTACT_EMAIL);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="harga" className="saas-shell pt-24">
      <div className="max-w-[680px]">
        <p className="saas-kicker">Model akses transparan</p>
        <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
          <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
            Full Gratis
          </span>{" "}
          untuk semua pasangan,{" "}
          <span className="saas-serif-i" style={{ color: "var(--saas-ink)" }}>
            Enterprise
          </span>{" "}
          untuk skala organisasi.
        </h2>
        <p
          className="mt-3.5 text-[14.5px] leading-relaxed"
          style={{ color: "var(--saas-ink-2)" }}
        >
          Tidak ada lagi tier berbelit atau paywall tersembunyi. Pakai seluruh
          fitur inti secara gratis, atau hubungi tim kami untuk kebutuhan
          Wedding Organizer, agensi, dan korporat.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {/* Card 1: FULL GRATIS */}
        <div
          className="saas-card flex flex-col justify-between p-7 sm:p-9"
          style={{ borderColor: "var(--saas-line-strong)" }}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="saas-badge"
                style={{
                  background: "var(--saas-success-soft)",
                  color: "var(--saas-success)",
                }}
              >
                <CheckCircle2 size={12} /> Full Gratis
              </span>
              <span
                className="text-[12px] font-semibold"
                style={{ color: "var(--saas-muted)" }}
              >
                Untuk pasangan &amp; acara pribadi
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span
                className="text-[18px] font-bold"
                style={{ color: "var(--saas-muted)" }}
              >
                Rp
              </span>
              <span className="tabular font-serif text-[56px] leading-none font-semibold">
                0
              </span>
              <span
                className="ml-1 text-[13.5px] font-medium"
                style={{ color: "var(--saas-muted)" }}
              >
                / gratis penuh, tanpa kartu kredit
              </span>
            </div>

            <p
              className="mt-3 text-[14px] leading-relaxed"
              style={{ color: "var(--saas-ink-2)" }}
            >
              Daftar, desain undangan, dan langsung publish ke tamu tanpa biaya
              langganan atau watermark.
            </p>

            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2.5 text-[13.5px] font-medium"
                  style={{ color: "var(--saas-ink-2)" }}
                >
                  <span className="saas-check mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="mt-8 flex flex-col gap-2.5 border-t pt-6 sm:flex-row"
            style={{ borderColor: "var(--saas-line)" }}
          >
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary flex-1 !py-3.5"
            >
              Daftar Gratis Sekarang <ArrowRight size={16} />
            </Link>
            <Link href="/preview" className="saas-btn-outline !py-3.5">
              Lihat Tema
            </Link>
          </div>
        </div>

        {/* Card 2: ENTERPRISE */}
        <div
          className="saas-card saas-dark-panel flex flex-col justify-between p-7 sm:p-9"
          style={{ borderColor: "rgba(255,255,255,0.16)" }}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className="saas-badge"
                style={{
                  background: "#5856D6",
                  color: "#FFFFFF",
                }}
              >
                <Building2 size={12} /> Enterprise
              </span>
              <span className="text-[12px] font-semibold text-[#A1A1A6]">
                WO · Event Agency · Korporat
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-serif text-[46px] leading-none font-semibold text-white">
                Custom
              </span>
              <span className="ml-1 text-[13.5px] font-medium text-[#A1A1A6]">
                / sesuai skala &amp; kebutuhan tim
              </span>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-[#D1D1D6]">
              Dirancang untuk organisasi yang mengelola banyak klien atau acara
              resmi. Akses masuk diamankan dengan{" "}
              <strong className="text-white">email perusahaan</strong> dan{" "}
              <strong className="text-white">kode akses khusus</strong>.
            </p>

            <ul className="mt-6 space-y-3">
              {ENTERPRISE_FEATURES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13.5px] font-medium text-[#F5F5F7]"
                >
                  <span
                    className="saas-check mt-0.5"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "#64D2FF",
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 space-y-3 border-t border-white/15 pt-6">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <a
                href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Permintaan%20Akses%20RuangHadir%20Enterprise`}
                className="saas-btn-primary flex-1 !border-transparent !py-3.5"
                
              >
                <Mail size={15} /> Hubungi {ENTERPRISE_CONTACT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="saas-btn-outline !bg-transparent !text-white !px-4 !py-3.5"
                style={{ borderColor: "rgba(255,255,255,0.22)" }}
                title="Salin email admin Enterprise"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px] text-[#A1A1A6]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} style={{ color: "#64D2FF" }} />
                Sudah punya kode akses perusahaan?
              </span>
              <Link
                href="/auth?mode=enterprise"
                className="inline-flex items-center gap-1 font-bold text-[#64D2FF] underline-offset-4 hover:underline"
              >
                <KeyRound size={13} /> Masuk Portal Enterprise
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
