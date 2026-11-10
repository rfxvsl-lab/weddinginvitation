"use client";
import React, { useState } from "react";
import { Plus, Send } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";
import { PACKAGE_LIMITS, formatActiveDays } from "@/lib/packageLimits";

const FAQS = [
  { q: "Bagaimana cara membuat undangan?", a: "Daftar, pilih tema, lalu isi data mempelai, jadwal, galeri, dan rekening di editor. Setelah dipublikasikan, kirim tautannya ke tamu lewat WhatsApp dari menu daftar tamu." },
  {
    q: "Berapa lama undangan aktif?",
    a: `Demo ${formatActiveDays(PACKAGE_LIMITS.demo.activeDays)}, Reguler ${PACKAGE_LIMITS.reguler.activeDays} hari, Premium ${PACKAGE_LIMITS.premium.activeDays} hari, Luxury ${PACKAGE_LIMITS.luxury.activeDays} hari. Masa aktif dihitung sejak pembayaran dikonfirmasi dan bisa diperpanjang dari dashboard.`,
  },
  { q: "Bisa ganti alamat tautan undangan?", a: "Alamat dipilih saat daftar, misalnya ruanghadir.net/nama-kalian. Paket Premium bisa menggantinya 1 kali dan Luxury tanpa batas. Domain sendiri belum didukung." },
  { q: "Amplop digital mendukung apa saja?", a: "Kalian mencantumkan nomor rekening bank, e-wallet, atau alamat kirim kado. Tamu menyalin nomornya dan mentransfer langsung; RuangHadir tidak menampung dana." },
  { q: "Bagaimana QR check-in bekerja?", a: "Setiap tamu punya kode undangan. Setelah konfirmasi hadir, tamu mendapat tiket QR. Panitia memindainya dengan kamera HP dari dashboard dan kehadiran langsung tercatat. Tersedia di paket Premium dan Luxury." },
  { q: "Ada garansi uang kembali?", a: `Ada, ${SITE.refundDays} hari sejak pembayaran dikonfirmasi untuk semua paket berbayar, dengan syarat yang tertulis di halaman Kebijakan Pengembalian.` },
];

export function SaasFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="saas-shell pt-24">
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-[32px] sm:text-[40px]">Pertanyaan yang sering diajukan</h2>
          <div className="saas-card saas-divide mt-8">
            {FAQS.map((f, i) => (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-bold">{f.q}</span>
                  <span
                    className="saas-check shrink-0 transition-all duration-300"
                    style={open === i ? { background: "var(--saas-wine)", color: "#fff" } : undefined}
                  >
                    <Plus size={13} className={`transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
                  </span>
                </button>
                <div id={`faq-panel-${i}`} className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[13.5px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="saas-card saas-dark-panel h-fit p-7 lg:sticky lg:top-24">
          <h3 className="text-[19px] font-extrabold">Masih ada pertanyaan?</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#EFE0D6]">
            Tanya langsung lewat WhatsApp. Kami membalas {SITE.supportHours}.
          </p>
          <a
            href={whatsappLink("Halo RuangHadir, saya mau bertanya")}
            target="_blank" rel="noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-extrabold"
            style={{ background: "var(--saas-gold)", color: "#241505" }}
          >
            <Send size={15} aria-hidden /> Chat WhatsApp
          </a>
        </aside>
      </div>
    </section>
  );
}
