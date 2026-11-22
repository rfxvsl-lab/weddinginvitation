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
            style={{ borderColor: "var(--saas-line)" }}
          >
            <p
              className="saas-statnum text-[32px] sm:text-[36px]"
              style={{ color: "var(--saas-wine)" }}
            >
              {item.value}
            </p>
            <p
              className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "var(--saas-muted)" }}
            >
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
    <section className="saas-shell pt-24">
      <div className="saas-dark-panel grid gap-10 overflow-hidden rounded-[28px] p-8 sm:p-12 lg:grid-cols-[1.12fr_0.88fr] lg:p-14">
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "var(--saas-gold-2)" }}
          >
            Mulai gratis sekarang
          </p>
          <h2 className="mt-4 font-serif text-[32px] leading-[1.12] text-white sm:text-[42px]">
            Wujudkan undangan pernikahan impian kalian hari ini.
          </h2>
          <p className="mt-4 max-w-[48ch] text-[14.5px] leading-relaxed text-[#EAD9CE]">
            Tanpa biaya pendaftaran dan tanpa proses rumit. Pilih tema,
            lengkapi detail acara, dan langsung bagikan ke keluarga serta
            sahabat.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !border-transparent !px-7"
              style={{
                background: "#FFF6F1",
                color: "var(--saas-wine)",
                boxShadow: "0 12px 28px -12px rgba(0,0,0,0.55)",
              }}
            >
              Buat Undangan Gratis <ArrowRight size={16} />
            </Link>
            <Link
              href="/preview"
              className="saas-btn-outline !bg-transparent !text-[#F6EFE7]"
              style={{ borderColor: "rgba(246,239,231,0.35)" }}
            >
              Lihat Katalog Tema
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleClaim}
          className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-xl"
          style={{ color: "var(--saas-ink)" }}
        >
          <div>
            <p className="text-[14px] font-extrabold">
              Siapkan tautan undangan kalian
            </p>
            <p
              className="mt-1 text-[12.5px]"
              style={{ color: "var(--saas-muted)" }}
            >
              Ketik nama pasangan untuk melihat format tautan unik kalian.
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <label
                className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold focus-within:border-[#8E2F45]"
                style={{
                  borderColor: "var(--saas-line-strong)",
                  background: "var(--saas-bg)",
                }}
              >
                <Link2
                  size={15}
                  className="shrink-0"
                  style={{ color: "var(--saas-muted)" }}
                />
                <span
                  className="shrink-0 select-none"
                  style={{ color: "var(--saas-muted)" }}
                >
                  ruanghadir.net/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="kharis-lia"
                  aria-label="Nama tautan undangan"
                  className="w-full min-w-0 bg-transparent text-[13px] font-bold outline-none placeholder:font-normal placeholder:text-[#B4A49D]"
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

          <div
            className="mt-6 space-y-2.5 border-t pt-5 text-[12.5px] font-semibold"
            style={{
              borderColor: "var(--saas-line)",
              color: "var(--saas-ink-2)",
            }}
          >
            <p className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "var(--saas-gold)" }} />
              Gratis Rp 0 — langsung bisa dipakai &amp; diedit
            </p>
            <p className="flex items-center gap-2">
              <Smartphone size={14} style={{ color: "var(--saas-gold)" }} />
              Siap dibagikan ke WhatsApp dengan sapaan nama tamu
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={14} style={{ color: "var(--saas-gold)" }} />
              Data acara tersimpan aman &amp; bisa diubah kapan saja
            </p>
            <p className="flex items-center gap-2">
              <Clock size={14} style={{ color: "var(--saas-gold)" }} />
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
    <footer
      className="mt-24 border-t"
      style={{
        borderColor: "var(--saas-line-strong)",
        background:
          "linear-gradient(180deg, rgba(198,161,91,0.06), transparent 35%)",
      }}
    >
      <div className="saas-shell grid gap-10 py-14 md:grid-cols-[1.45fr_1fr_1fr_1fr]">
        <div>
          <span className="flex items-center gap-3.5">
            <Logo variant="mark" isLink={false} height="h-11" />
            <span
              className="saas-statnum text-[22px]"
              style={{ color: "var(--saas-ink)" }}
            >
              RuangHadir
              <span style={{ color: "var(--saas-wine)" }}>.net</span>
            </span>
          </span>
          <p
            className="mt-3 max-w-[40ch] text-[13.5px] leading-relaxed"
            style={{ color: "var(--saas-muted)" }}
          >
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
            <h4
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "var(--saas-faint)" }}
            >
              {title}
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13.5px] font-medium">
              {(items as [string, string][]).map(([l, h]) => (
                <li key={l}>
                  {h.startsWith("mailto:") ? (
                    <a
                      href={h}
                      className="transition-colors hover:font-bold"
                      style={{ color: "var(--saas-ink-2)" }}
                    >
                      {l}
                    </a>
                  ) : (
                    <Link
                      href={h}
                      className="transition-colors hover:font-bold"
                      style={{ color: "var(--saas-ink-2)" }}
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
      <div style={{ borderTop: "1px solid var(--saas-line)" }}>
        <div
          className="saas-shell flex flex-col items-center justify-between gap-3 py-5 text-[11.5px] font-medium sm:flex-row"
          style={{ color: "var(--saas-faint)" }}
        >
          <p>© {new Date().getFullYear()} RuangHadir.net — by RFX Visual.</p>
          <p className="flex gap-5">
            <Link href="/privacy-policy" className="hover:underline">
              Privasi
            </Link>
            <Link href="/terms-of-service" className="hover:underline">
              Ketentuan
            </Link>
            <Link href="/cookie-policy" className="hover:underline">
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
