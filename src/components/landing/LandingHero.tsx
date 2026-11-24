import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { THEME_SHOTS } from "./themeShots";

export function LandingHero() {
  return (
    <section className="rh-marketing-hero">
      <div className="rh-hero-copy">
        <p className="rh-eyebrow">Ada hari baik yang ingin dibagikan.</p>
        <h1>
          Undang orang tersayang.
          <br />
          <span>Rayakan cerita kalian.</span>
        </h1>
        <p>
          Pilih tema yang terasa seperti kalian, tulis cerita dan jadwalnya,
          lalu kirim undangan dengan nama setiap tamu. Dari kabar bahagia sampai
          hari H, siapkan di RuangHadir.
        </p>
        <div className="rh-hero-actions">
          <Link
            href="/auth?mode=register"
            className="rh-action rh-action-primary"
          >
            Buat undangan gratis
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link href="/preview" className="rh-text-link">
            Lihat semua tema
          </Link>
        </div>
        <p className="rh-hero-footnote">
          Rp0 untuk pasangan · Semua tema · Tanpa watermark
        </p>
      </div>
      <div className="rh-hero-showcase">
        <div className="rh-showcase-caption">
          <span>Koleksi undangan</span>
          <span>01 / Sage Garden</span>
        </div>
        <Link
          href="/preview/sage-garden"
          className="rh-hero-invitation"
          aria-label="Lihat undangan Sage Garden"
        >
          <Image
            src={THEME_SHOTS["sage-garden"]}
            alt="Tampilan asli tema Sage Garden dari RuangHadir"
            fill
            sizes="(max-width: 640px) 260px, 300px"
            priority
            className="object-cover object-top"
          />
        </Link>
        <div className="rh-showcase-note">
          <span>Untuk setiap tamu,</span>
          <strong>sapaan yang lebih personal.</strong>
          <p>Satu tautan, lengkap dengan nama mereka.</p>
        </div>
        <Link href="/preview" className="rh-showcase-link">
          Temukan tema kalian
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
