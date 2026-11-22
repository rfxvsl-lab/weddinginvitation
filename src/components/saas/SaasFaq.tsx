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
    a: "Akun Gratis ditujukan untuk pasangan dan acara pribadi (hingga 3 proyek undangan). Paket Enterprise dirancang untuk Wedding Organizer, agensi event, dan korporat dengan proyek tanpa batas, Make Your Invitation Video (HD 9:16/16:9), multi-seat tim, custom domain, dan dukungan prioritas.",
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
    <section id="faq" className="saas-shell pt-20">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="saas-kicker">Pusat bantuan</p>
          <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
            Pertanyaan yang{" "}
            <span className="saas-serif-i">sering ditanyakan</span>.
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
                  <span className="text-[15px] font-semibold text-[#1D1D1F]">
                    {f.q}
                  </span>
                  <span
                    className="saas-check shrink-0 transition-all duration-300"
                    style={
                      open === i
                        ? { background: "#007AFF", color: "#FFFFFF" }
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
                    <p className="px-6 pb-5 text-[14px] leading-relaxed text-[#48484A]">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Light iOS Liquid Glass Enterprise Card — cohesive with FAQ & avoids double dark box */}
        <aside className="glx-strong h-fit rounded-[28px] p-7 lg:sticky lg:top-24">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/15">
            <ShieldCheck size={20} />
          </span>
          <h3 className="mt-4 text-[19px] font-bold text-[#1D1D1F]">
            Butuh Paket Enterprise?
          </h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#48484A]">
            Kirimkan kebutuhan organisasi, Wedding Organizer, atau acara
            korporat Anda langsung ke tim kami via email resmi.
          </p>
          <a
            href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Konsultasi%20RuangHadir%20Enterprise`}
            className="saas-btn-primary mt-6 w-full !py-3 !text-[13px]"
          >
            <Mail size={15} /> {ENTERPRISE_CONTACT_EMAIL}
          </a>
          <Link
            href="/auth?mode=enterprise"
            className="saas-btn-outline mt-3 w-full !py-2.5 !text-[12.5px]"
          >
            <KeyRound size={14} className="text-[#007AFF]" /> Portal Login Enterprise
          </Link>
        </aside>
      </div>
    </section>
  );
}
