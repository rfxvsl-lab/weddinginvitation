import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { THEME_SHOTS } from "./themeShots";

export function LandingHero() {
  return (
    <section className="rh-marketing-hero" aria-labelledby="marketing-title">
      <div className="rh-hero-copy">
        <p className="rh-eyebrow">UNDANGAN PERNIKAHAN DIGITAL</p>
        <h1 id="marketing-title">
          Hari bahagia kalian,
          <br />
          <span>dimulai dari sini.</span>
        </h1>
        <p>
          Daftar Akses Awal yang terasa seperti kalian. Pilih tema, lengkapi
          cerita dan acara, lalu bagikan tautan dengan nama setiap tamu.
        </p>
        <div className="rh-hero-actions">
          <Link
            href="/auth?mode=register"
            className="rh-action rh-action-primary"
          >
            Daftar Akses Awal
            <ArrowRight size={17} aria-hidden />
          </Link>
          <a href="#tema" className="rh-text-link">
            Lihat pilihan tema
          </a>
        </div>
        <p className="rh-hero-footnote">
          Rp0 · Pendaftaran ditinjau sebelum akun diaktifkan
        </p>
      </div>
      <div className="rh-hero-showcase">
        <div className="rh-showcase-caption">
          <span>Sepotong cerita kalian</span>
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
            sizes="240px"
            priority
            className="object-cover object-top"
          />
        </Link>
        <div className="rh-showcase-note">
          <span>Dari koleksi RuangHadir</span>
          <strong>Sage Garden</strong>
          <p>Nuansa taman untuk kabar bahagia.</p>
        </div>
        <Link href="/preview/sage-garden" className="rh-showcase-link">
          Buka contoh undangan
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
