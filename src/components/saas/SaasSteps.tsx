"use client";
import React from "react";

const STEPS = [
  { n: "01", time: "2 mnt", t: "Pilih Tema", d: "Eksplorasi katalog, sesuaikan warna, musik, dan font sesuai karakter kalian." },
  { n: "02", time: "5 mnt", t: "Isi Data", d: "Lengkapi jadwal akad & resepsi, Maps, galeri, hingga rekening amplop digital." },
  { n: "03", time: "3 mnt", t: "Sebar & Pantau", d: "Kirim link personal via WA blast, pantau RSVP dan check-in tamu secara live." },
];

export function SaasSteps() {
  return (
    <section id="cara-kerja" className="saas-shell pt-24">
      <div className="max-w-[620px]">
        <p className="saas-kicker">Cara kerja</p>
        <h2 className="mt-4 text-[32px] sm:text-[40px]">
          Tiga langkah, total <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>10 menit</span>.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="saas-card saas-card-hover p-6">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--saas-line)" }}>
              <span className="saas-statnum text-[40px]" style={{ color: "var(--saas-gold)" }}>{s.n}</span>
              <span className="saas-badge saas-badge-gold tabular">{s.time}</span>
            </div>
            <h3 className="mt-4 text-[16.5px] font-extrabold">{s.t}</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
