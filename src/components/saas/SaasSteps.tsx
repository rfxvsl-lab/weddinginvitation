"use client";
import React from "react";
import { Palette, FilePenLine, Share2 } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Palette,
    tag: "Langkah 1",
    t: "Daftar & Pilih Tema Gratis",
    d: "Buat akun gratis dalam hitungan detik, lalu pilih tema favorit dari katalog modern, klasik, hingga adat Nusantara.",
  },
  {
    n: "02",
    icon: FilePenLine,
    tag: "Langkah 2",
    t: "Isi Data & Foto Mempelai",
    d: "Lengkapi nama mempelai, jadwal akad & resepsi, titik Google Maps, galeri foto, musik latar, serta amplop digital.",
  },
  {
    n: "03",
    icon: Share2,
    tag: "Langkah 3",
    t: "Sebar Link & Pantau RSVP",
    d: "Buat tautan personal untuk setiap tamu, kirim lewat WhatsApp, dan pantau ucapan serta kehadiran secara langsung.",
  },
];

export function SaasSteps() {
  return (
    <section id="cara-kerja" className="saas-shell pt-24">
      <div className="max-w-[620px]">
        <p className="saas-kicker">Alur pembuatan</p>
        <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
          Tiga langkah ringkas, langsung{" "}
          <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
            siap dibagikan
          </span>
          .
        </h2>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.n} className="saas-card saas-card-hover flex flex-col p-6 sm:p-7">
              <div
                className="flex items-center justify-between border-b pb-4"
                style={{ borderColor: "var(--saas-line)" }}
              >
                <span className="saas-icon-box">
                  <Icon size={20} />
                </span>
                <span
                  className="saas-statnum text-[38px]"
                  style={{ color: "var(--saas-gold)" }}
                >
                  {s.n}
                </span>
              </div>
              <p
                className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "var(--saas-muted)" }}
              >
                {s.tag}
              </p>
              <h3 className="mt-1.5 text-[17.5px] font-extrabold">{s.t}</h3>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: "var(--saas-ink-2)" }}
              >
                {s.d}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
