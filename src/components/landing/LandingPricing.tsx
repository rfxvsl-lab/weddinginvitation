import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ENTERPRISE_CONTACT_EMAIL, PACKAGE_LIMITS } from "@/lib/packageLimits";
import { DEFAULT_THEMES } from "@/data/defaultData";

const FREE = [
  `Semua ${DEFAULT_THEMES.length} tema undangan`,
  "Tamu dan tautan bernama tanpa batas",
  "RSVP, ucapan, galeri, musik, dan amplop digital",
  "Check in QR serta ekspor CSV/PDF",
  `Hingga ${PACKAGE_LIMITS.free.maxProjects} undangan aktif, tanpa watermark`,
];

export function LandingPricing() {
  return (
    <section
      id="harga"
      className="rh-pricing-section"
      aria-labelledby="pricing-heading"
    >
      <div className="rh-marketing-container">
        <div className="rh-marketing-section-heading">
          <div>
            <p className="rh-eyebrow">MULAI DARI KEBUTUHAN KALIAN</p>
            <h2 id="pricing-heading">Hari bahagia, pilihan yang jelas.</h2>
          </div>
          <p>
            Akses Awal gratis untuk pasangan. Enterprise untuk wedding
            organizer, agensi, dan kebutuhan perusahaan.
          </p>
        </div>
        <div className="rh-pricing-grid">
          <article className="rh-price-free">
            <div className="rh-price-label">
              <h3>Akses Awal</h3>
              <span>Untuk pasangan</span>
            </div>
            <p className="rh-price-amount">Rp0</p>
            <p className="rh-price-description">
              Daftar terlebih dahulu. Akun dapat digunakan setelah pendaftaran
              disetujui tim RuangHadir.
            </p>
            <ul>
              {FREE.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="rh-price-note">
              Masa aktif {PACKAGE_LIMITS.free.activeDays} hari sejak undangan
              diaktifkan. Tanpa pembayaran saat mendaftar.
            </p>
            <Link
              href="/auth?mode=register"
              className="rh-action rh-action-primary"
            >
              Daftar Akses Awal <ArrowRight size={17} aria-hidden />
            </Link>
          </article>
          <article className="rh-price-enterprise">
            <div className="rh-price-label">
              <h3>Enterprise</h3>
              <span>Untuk vendor & perusahaan</span>
            </div>
            <p className="rh-price-amount">Custom</p>
            <p className="rh-price-description">
              Ceritakan skala acara dan kebutuhan tim. Diskusikan akses serta
              penawaran bersama kami.
            </p>
            <ul>
              <li>Proyek undangan tanpa batas untuk klien</li>
              <li>Video undangan dalam format 9:16, 1:1, dan 16:9</li>
              <li>Kebutuhan domain, branding, dan akses perusahaan</li>
              <li>Pendampingan teknis prioritas</li>
            </ul>
            <p className="rh-price-note">
              Akses perusahaan menggunakan email dan kode yang diterbitkan tim
              RuangHadir.
            </p>
            <a
              href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=${encodeURIComponent("Paket Enterprise RuangHadir")}`}
              className="rh-action"
            >
              Bicarakan kebutuhan tim <ArrowRight size={17} aria-hidden />
            </a>
            <Link href="/auth?mode=enterprise" className="rh-enterprise-login">
              Sudah punya kode? Masuk Enterprise
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
