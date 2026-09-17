"use client";
import React, { useState } from "react";
import { Plus, Send, ShieldCheck } from "lucide-react";

const FAQS = [
  { q: "Bagaimana cara membuat undangan?", a: "Daftar gratis, pilih tema, isi data mempelai, jadwal, galeri, dan rekening. Siap disebar via WhatsApp sekitar 10 menit." },
  { q: "Berapa lama masa aktif?", a: "Demo 3 hari, Reguler 20 hari, Premium 60 hari, Luxury 90 hari. Activation dihitung sejak kamu publish undangan." },
  { q: "Bisa custom domain?", a: "Bisa. Luxury mendukung ganti slug tanpa batas; domain penuh dibantu tim kami." },
  { q: "Metode amplop digital apa saja?", a: "QRIS, transfer multi-bank (BCA, Mandiri, BRI, BNI), e-wallet, plus alamat kado fisik." },
  { q: "Bagaimana QR check-in bekerja?", a: "Setiap link tamu berisi QR unik. Panitia scan dari HP — kehadiran tercatat otomatis di dashboard." },
  { q: "Ada garansi uang kembali?", a: "Ya, 100% jika kendala teknis tak terselesaikan 2x24 jam setelah aktivasi." },
];

export function SaasFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="saas-shell pt-24">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="saas-kicker">Pusat bantuan</p>
          <h2 className="mt-4 text-[32px] sm:text-[40px]">
            Pertanyaan yang <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>sering diajukan</span>.
          </h2>
          <div className="saas-card saas-divide mt-8">
            {FAQS.map((f, i) => (
              <div key={i}>
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="text-[15px] font-bold">{f.q}</span>
                  <span
                    className="saas-check shrink-0 transition-all duration-300"
                    style={open === i ? { background: "var(--saas-wine)", color: "#fff" } : undefined}
                  >
                    <Plus size={13} className={`transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[13.5px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="saas-card saas-dark-panel h-fit p-7 lg:sticky lg:top-24">
          <span className="saas-check" style={{ background: "rgba(255,255,255,.12)", color: "var(--saas-gold-2)", width: 44, height: 44 }}>
            <ShieldCheck size={20} />
          </span>
          <h3 className="mt-4 text-[19px] font-extrabold">Masih ada pertanyaan?</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#EFE0D6]">
            Tim support kami siap setiap hari pukul 08.00–21.00 WIB via WhatsApp.
          </p>
          <a
            href="https://wa.me/6285731021469?text=Halo%20RuangHadir"
            target="_blank" rel="noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-extrabold"
            style={{ background: "var(--saas-gold)", color: "#241505" }}
          >
            <Send size={15} /> WhatsApp Support
          </a>
          <p className="mt-3 text-center text-[11px] font-semibold text-[#C9B4A8]">Respons rata-rata &lt; 5 menit</p>
        </aside>
      </div>
    </section>
  );
}
