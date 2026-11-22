"use client";
import React, { useState } from "react";
import { Plus, Send, ShieldCheck } from "lucide-react";

const FAQS = [
  {
    q: "Apakah benar membuat undangan di RuangHadir gratis?",
    a: "Benar. Kalian bisa mendaftar, memilih tema, mengisi data mempelai, galeri, musik, amplop digital, hingga membagikan link undangan secara gratis tanpa kartu kredit.",
  },
  {
    q: "Apakah tamu atau mempelai harus menginstal aplikasi?",
    a: "Tidak perlu. Semua proses pembuatan undangan maupun tampilan yang dibuka tamu berjalan langsung melalui browser HP atau laptop.",
  },
  {
    q: "Bagaimana cara membuat link dengan nama tamu yang berbeda-beda?",
    a: "Di dalam dashboard, kalian cukup memasukkan daftar nama tamu. Sistem akan membuatkan tautan personal beserta teks pengantar WhatsApp siap kirim untuk masing-masing tamu.",
  },
  {
    q: "Apakah tema dan data acara bisa diedit setelah undangan jadi?",
    a: "Bisa kapan saja. Jika ada perubahan jam acara, foto baru, atau ingin mengganti tema ke gaya lain, kalian tinggal ubah di dashboard dan halaman langsung diperbarui.",
  },
  {
    q: "Metode amplop digital apa saja yang didukung?",
    a: "Kalian dapat menambahkan rekening bank (BCA, Mandiri, BRI, BNI, dan lainnya), e-wallet, gambar QRIS, serta alamat pengiriman kado fisik lengkap dengan tombol salin cepat.",
  },
  {
    q: "Bagaimana jika saya ingin memakai domain sendiri atau dibantu input data?",
    a: "Penggunaan mandiri dengan tautan ruanghadir.net tetap gratis. Jika membutuhkan domain khusus (.com/.id) atau layanan terima beres oleh tim kami, silakan hubungi WhatsApp Support.",
  },
];

export function SaasFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="saas-shell pt-24">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="saas-kicker">Pusat bantuan</p>
          <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
            Pertanyaan yang{" "}
            <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
              sering ditanyakan
            </span>
            .
          </h2>
          <div className="saas-card saas-divide mt-8">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-bold">{f.q}</span>
                  <span
                    className="saas-check shrink-0 transition-all duration-300"
                    style={
                      open === i
                        ? { background: "var(--saas-wine)", color: "#fff" }
                        : undefined
                    }
                  >
                    <Plus
                      size={13}
                      className={`transition-transform duration-300 ${
                        open === i ? "rotate-45" : ""
                      }`}
                    />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    open === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className="px-6 pb-5 text-[14px] leading-relaxed"
                      style={{ color: "var(--saas-ink-2)" }}
                    >
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="saas-card saas-dark-panel h-fit p-7 lg:sticky lg:top-24">
          <span
            className="saas-check"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "var(--saas-gold-2)",
              width: 44,
              height: 44,
            }}
          >
            <ShieldCheck size={20} />
          </span>
          <h3 className="mt-4 text-[19px] font-extrabold">
            Masih ada pertanyaan?
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#EFE0D6]">
            Tim RuangHadir siap membantu kendala teknis maupun konsultasi tema
            setiap hari pukul 08.00–21.00 WIB via WhatsApp.
          </p>
          <a
            href="https://wa.me/6285731021469?text=Halo%20RuangHadir,%20saya%20ingin%20bertanya%20tentang%20undangan%20digital%20gratis"
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-extrabold transition-transform hover:scale-[1.01]"
            style={{ background: "var(--saas-gold)", color: "#241505" }}
          >
            <Send size={15} /> Chat WhatsApp Support
          </a>
        </aside>
      </div>
    </section>
  );
}
