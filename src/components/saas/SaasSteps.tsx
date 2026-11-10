"use client";
import React from "react";

const STEPS = [
  { t: "Pilih tema", d: "Buka contoh tiap tema, lalu pilih satu. Tema bisa diganti kapan saja tanpa mengisi ulang data." },
  { t: "Isi data acara", d: "Nama mempelai, jadwal akad dan resepsi, tautan peta, galeri, musik, dan rekening amplop digital." },
  { t: "Kirim ke tamu", d: "Masukkan daftar tamu, kirim tautan personal lewat WhatsApp, lalu pantau konfirmasi kehadirannya." },
];

export function SaasSteps() {
  return (
    <section id="cara-kerja" className="saas-shell pt-24">
      <h2 className="max-w-[620px] text-[32px] sm:text-[40px]">Cara kerjanya</h2>
      <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="border-t pt-5" style={{ borderColor: "var(--saas-line-strong)" }}>
            <span className="saas-statnum text-[28px]" style={{ color: "var(--saas-gold)" }} aria-hidden>{i + 1}</span>
            <h3 className="mt-2 text-[16.5px] font-extrabold">{s.t}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
