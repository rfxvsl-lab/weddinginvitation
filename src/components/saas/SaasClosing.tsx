"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Link2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

const PLATFORM_HIGHLIGHTS = [
  { value: "Rp 0", label: "Gratis untuk mulai" },
  { value: `${DEFAULT_THEMES.length} Tema`, label: "Desain kurasi siap pakai" },
  { value: "100%", label: "Bisa diedit dari HP" },
  { value: "Live", label: "RSVP & buku tamu real-time" },
];

export function SaasStrip() {
  return (
    <section className="saas-shell pt-12">
      <div className="saas-card grid grid-cols-2 gap-y-7 px-6 py-7 sm:px-10 lg:grid-cols-4">
        {PLATFORM_HIGHLIGHTS.map((item, i) => (
          <div
            key={item.label}
            className={`text-center ${i > 0 ? "lg:border-l" : ""}`}
            style={{ borderColor: "var(--saas-line-strong)" }}
          >
            <p className="saas-statnum text-[32px] sm:text-[36px] text-[#007AFF]">
              {item.value}
            </p>
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#6E6E73]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SaasCta() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const target = cleanSlug
      ? `/auth?mode=register&slug=${encodeURIComponent(cleanSlug)}`
      : "/auth?mode=register";
    router.push(target);
  };

  return (
    <section className="saas-shell pt-20">
      <div className="saas-dark-panel grid gap-8 sm:gap-10 overflow-hidden rounded-[32px] p-6 sm:p-11 lg:grid-cols-[1.12fr_0.88fr] lg:p-14">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#64D2FF]">
            Mulai gratis sekarang
          </p>
          <h2 className="mt-3.5 text-[30px] sm:text-[40px] font-bold leading-[1.1] tracking-[-0.03em] !text-white">
            Wujudkan undangan pernikahan impian kalian hari ini.
          </h2>
          <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-[#D1D1D6]">
            Tanpa biaya pendaftaran dan tanpa proses rumit. Pilih tema,
            lengkapi detail acara, dan langsung bagikan ke keluarga serta
            sahabat.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !px-7"
            >
              Buat Undangan Gratis <ArrowRight size={16} />
            </Link>
            <Link
              href="/preview"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/22 bg-white/[0.08] px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.15]"
            >
              Lihat Katalog Tema
            </Link>
          </div>
        </div>

        {/* Frosted Dark Glass Form — blends seamlessly inside the dark Titanium panel */}
        <form
          onSubmit={handleClaim}
          className="flex flex-col justify-between rounded-[24px] border border-white/15 bg-white/[0.08] p-5 sm:p-6 backdrop-blur-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
        >
          <div>
            <p className="text-[15px] font-bold text-white">
              Siapkan tautan undangan kalian
            </p>
            <p className="mt-1 text-[12.5px] text-[#A1A1A6]">
              Ketik nama pasangan untuk melihat format tautan unik kalian.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <label className="flex flex-1 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2.5 text-[13px] font-semibold text-white focus-within:border-[#64D2FF] focus-within:bg-white/[0.12] transition">
                <Link2 size={15} className="shrink-0 text-[#64D2FF]" />
                <span className="shrink-0 select-none text-[#A1A1A6]">
                  ruanghadir.net/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kharis-lia"
                  aria-label="Nama tautan undangan"
                  className="w-full min-w-0 bg-transparent text-[13px] font-bold text-white outline-none placeholder:font-normal placeholder:text-white/40"
                />
              </label>
              <button
                type="submit"
                className="saas-btn-primary !px-5 !py-2.5 !min-h-[44px]"
              >
                Buat Gratis
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-white/12 pt-5 text-[12.5px] font-medium text-[#D1D1D6]">
            <p className="flex items-center gap-2.5">
              <CheckCircle2 size={14} className="shrink-0 text-[#64D2FF]" />
              Gratis Rp 0 — langsung bisa dipakai &amp; diedit
            </p>
            <p className="flex items-center gap-2.5">
              <Smartphone size={14} className="shrink-0 text-[#64D2FF]" />
              Siap dibagikan ke WhatsApp dengan sapaan nama tamu
            </p>
            <p className="flex items-center gap-2.5">
              <ShieldCheck size={14} className="shrink-0 text-[#64D2FF]" />
              Data acara tersimpan aman &amp; bisa diubah kapan saja
            </p>
            <p className="flex items-center gap-2.5">
              <Clock size={14} className="shrink-0 text-[#64D2FF]" />
              Proses pembuatan cepat tanpa instal aplikasi
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

export function SaasFooter() {
  return (
    <footer className="mt-20 border-t border-black/[0.06] bg-white/45 backdrop-blur-xl">
      <div className="saas-shell grid gap-10 py-14 md:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-3.5">
            <Logo variant="mark" isLink={false} height="h-11" />
            <span className="saas-statnum text-[22px] text-[#1D1D1F]">
              RuangHadir<span className="text-[#007AFF]">.net</span>
            </span>
          </span>
          <p className="mt-3 max-w-[40ch] text-[13.5px] leading-relaxed text-[#6E6E73]">
            Platform undangan pernikahan digital gratis yang elegan dan mudah
            dikelola dari ponsel — karya RFX Visual.
          </p>
        </div>
        {[
          [
            "Produk",
            [
              ["Katalog Tema", "/preview"],
              ["Fitur Lengkap", "/#fitur"],
              ["Video Studio Enterprise", "/#video-enterprise"],
              ["Akses Gratis & Enterprise", "/#harga"],
            ],
          ],
          [
            "Enterprise",
            [
              ["Portal Login Enterprise", "/auth?mode=enterprise"],
              ["Hubungi Admin", `mailto:${ENTERPRISE_CONTACT_EMAIL}`],
            ],
          ],
          [
            "Bantuan",
            [
              ["Alur Pembuatan", "/#cara-kerja"],
              ["FAQ", "/#faq"],
              ["Kebijakan Layanan", "/terms-of-service"],
            ],
          ],
        ].map(([title, items]) => (
          <div key={title as string}>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E8E93]">
              {title}
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium">
              {(items as [string, string][]).map(([l, h]) => (
                <li key={l}>
                  {h.startsWith("mailto:") ? (
                    <a
                      href={h}
                      className="text-[#48484A] transition-colors hover:text-[#007AFF]"
                    >
                      {l}
                    </a>
                  ) : (
                    <Link
                      href={h}
                      className="text-[#48484A] transition-colors hover:text-[#007AFF]"
                    >
                      {l}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-black/[0.06]">
        <div className="saas-shell flex flex-col items-center justify-between gap-3 py-5 text-[11.5px] font-medium text-[#8E8E93] sm:flex-row">
          <p>© {new Date().getFullYear()} RuangHadir.net — by RFX Visual.</p>
          <p className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-[#1D1D1F] transition-colors">
              Privasi
            </Link>
            <Link href="/terms-of-service" className="hover:text-[#1D1D1F] transition-colors">
              Ketentuan
            </Link>
            <Link href="/cookie-policy" className="hover:text-[#1D1D1F] transition-colors">
              Cookie
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SaasCtaFooter() {
  return (
    <>
      <SaasCta />
      <SaasFooter />
    </>
  );
}
