"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Plus, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

const FAQS = [
  {
    q: "Apakah benar seluruh fitur undangan di RuangHadir gratis?",
    a: "Benar. Paket Full Gratis (Rp 0) sudah mencakup seluruh 9 tema, publish langsung, nama tamu personal tanpa batas, RSVP real-time, amplop digital, QR check-in, galeri foto, musik latar, serta export CSV/PDF tanpa watermark.",
  },
  {
    q: "Apa bedanya akun Gratis dengan Enterprise?",
    a: "Akun Gratis ditujukan untuk pasangan dan acara pribadi (hingga 3 proyek undangan). Paket Enterprise dirancang untuk Wedding Organizer, agensi event, dan korporat dengan proyek tanpa batas, multi-seat tim, custom domain, white-label, dan dukungan prioritas.",
  },
  {
    q: "Bagaimana cara mendaftar dan masuk ke akun Enterprise?",
    a: `Hubungi ${ENTERPRISE_CONTACT_EMAIL} untuk pengaktifan. Setelah disetujui, tim kami menerbitkan Kode Akses Khusus yang terikat pada domain email perusahaan Anda. Login dilakukan lewat Portal Enterprise menggunakan email perusahaan resmi (bukan Gmail/Yahoo) dan kode khusus tersebut.`,
  },
  {
    q: "Apakah tamu atau mempelai harus menginstal aplikasi?",
    a: "Tidak perlu. Pengelolaan dashboard maupun pembukaan undangan oleh tamu berjalan 100% langsung di browser HP dan desktop.",
  },
  {
    q: "Apakah tema dan data acara bisa diedit setelah undangan dipublish?",
    a: "Bisa kapan saja dari dashboard. Perubahan jadwal, foto, musik, hingga pergantian tema akan langsung aktif pada tautan undangan Anda.",
  },
  {
    q: "Metode amplop digital apa saja yang didukung?",
    a: "Anda bisa menampilkan rekening multi-bank (BCA, Mandiri, BRI, BNI, dll.), e-wallet, QRIS, serta alamat pengiriman kado fisik lengkap dengan tombol salin cepat.",
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
            Butuh Paket Enterprise?
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#EFE0D6]">
            Kirimkan kebutuhan organisasi, Wedding Organizer, atau acara
            korporat Anda langsung ke tim kami via email resmi.
          </p>
          <a
            href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Konsultasi%20RuangHadir%20Enterprise`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[13px] font-extrabold transition-transform hover:scale-[1.01]"
            style={{ background: "var(--saas-gold)", color: "#241505" }}
          >
            <Mail size={15} /> {ENTERPRISE_CONTACT_EMAIL}
          </a>
          <Link
            href="/auth?mode=enterprise"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-2.5 text-[12.5px] font-bold text-[#F5EBE3] transition-colors hover:bg-white/10"
          >
            <KeyRound size={14} /> Portal Login Enterprise
          </Link>
        </aside>
      </div>
    </section>
  );
}
