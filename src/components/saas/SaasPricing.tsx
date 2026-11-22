"use client";
import React from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Globe,
} from "lucide-react";

const FREE_FEATURES = [
  "Akses penuh ke katalog 9 tema modern, klasik & adat",
  "Link undangan personal dengan nama setiap tamu",
  "Formulir RSVP, ucapan doa & rekap kehadiran real-time",
  "Amplop digital multi-bank, e-wallet, QRIS & alamat kado",
  "Galeri foto prewedding, kisah cinta & musik latar",
  "Hitung mundur acara, Google Maps & simpan ke kalender",
  "Edit teks, jadwal, dan tema kapan saja langsung dari HP",
  "Tanpa kartu kredit & tanpa biaya tersembunyi",
];

const CUSTOM_SERVICES = [
  "Bantuan input data, foto, dan susun daftar tamu oleh tim",
  "Setup domain khusus milik sendiri (mis. nama-kalian.com)",
  "Penyesuaian warna, tipografi, atau layout khusus acara",
  "Dukungan koordinasi QR check-in untuk panitia resepsi",
];

export function SaasPricing() {
  return (
    <section id="harga" className="saas-shell pt-24">
      <div className="max-w-[660px]">
        <p className="saas-kicker">100% platform gratis</p>
        <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
          Undangan digital berkelas studio,{" "}
          <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
            tanpa biaya awal
          </span>
          .
        </h2>
        <p
          className="mt-3.5 text-[14.5px] leading-relaxed"
          style={{ color: "var(--saas-ink-2)" }}
        >
          Kami merancang RuangHadir agar setiap pasangan bisa memiliki undangan
          online yang rapi, modern, dan layak dibagikan ke keluarga besar secara
          gratis.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.28fr_0.72fr]">
        {/* Hero Free Plan Card */}
        <div
          className="saas-card saas-dark-panel flex flex-col justify-between p-7 sm:p-9"
          style={{ borderColor: "rgba(198,161,91,0.42)" }}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="saas-badge"
                style={{
                  background: "var(--saas-gold)",
                  color: "#221406",
                }}
              >
                <Sparkles size={12} /> Akses Gratis Mandiri
              </span>
              <span className="text-[12px] font-semibold text-[#DEC9BC]">
                Langsung aktif setelah daftar
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-2">
              <span className="text-[18px] font-bold text-[#DEC9BC]">Rp</span>
              <span className="tabular font-serif text-[56px] leading-none font-semibold text-white">
                0
              </span>
              <span className="ml-1 text-[14px] font-medium text-[#DEC9BC]">
                / gratis digunakan untuk undangan kalian
              </span>
            </div>

            <p className="mt-3 max-w-[54ch] text-[14px] leading-relaxed text-[#EAD9CE]">
              Semua fitur inti undangan digital modern sudah terbuka sejak awal.
              Cukup buat akun, pilih tema, lengkapi data, lalu bagikan tautan ke
              seluruh tamu.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {FREE_FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-2.5 text-[13.5px] font-medium text-[#F5EBE3]"
                >
                  <span
                    className="saas-check mt-0.5"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "var(--saas-gold-2)",
                    }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !border-transparent !px-7 !py-3.5"
              style={{
                background: "#FFF6F1",
                color: "var(--saas-wine)",
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.5)",
              }}
            >
              Mulai Buat Gratis <ArrowRight size={16} />
            </Link>
            <Link
              href="/preview"
              className="saas-btn-outline !bg-transparent !text-[#F6EFE7] !px-6 !py-3.5"
              style={{ borderColor: "rgba(246,239,231,0.32)" }}
            >
              Coba Preview Tema
            </Link>
          </div>
        </div>

        {/* Optional Custom / Assisted Card */}
        <div className="saas-card flex flex-col justify-between p-7 sm:p-8">
          <div>
            <span className="saas-icon-box">
              <Globe size={20} />
            </span>
            <p
              className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--saas-muted)" }}
            >
              Opsional · Layanan Tambahan
            </p>
            <h3 className="mt-1.5 text-[21px] font-extrabold leading-snug">
              Butuh Domain Khusus atau Terima Beres?
            </h3>
            <p
              className="mt-2.5 text-[14px] leading-relaxed"
              style={{ color: "var(--saas-ink-2)" }}
            >
              Kalau kalian sibuk mempersiapkan acara dan ingin dibantu penuh
              oleh tim RFX Visual atau memakai domain pribadi, kami siap bantu.
            </p>

            <ul className="mt-6 space-y-3">
              {CUSTOM_SERVICES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13.5px] font-medium"
                  style={{ color: "var(--saas-ink-2)" }}
                >
                  <span className="saas-check mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-5 border-t" style={{ borderColor: "var(--saas-line)" }}>
            <a
              href="https://wa.me/6285731021469?text=Halo%20RuangHadir,%20saya%20ingin%20tanya%20tentang%20domain%20khusus%20atau%20bantuan%20custom%20undangan"
              target="_blank"
              rel="noreferrer"
              className="saas-btn-outline w-full !py-3"
            >
              <MessageCircle size={15} /> Konsultasi via WhatsApp
            </a>
            <p
              className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] font-medium"
              style={{ color: "var(--saas-muted)" }}
            >
              <ShieldCheck size={14} style={{ color: "var(--saas-gold)" }} />
              Tidak wajib — platform mandiri tetap gratis
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
