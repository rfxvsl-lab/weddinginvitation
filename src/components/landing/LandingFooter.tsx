import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ENTERPRISE_CONTACT_EMAIL } from "@/lib/packageLimits";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Produk",
    links: [
      ["Tema undangan", "/preview"],
      ["Cara kerja", "/#cara-kerja"],
      ["Harga", "/#harga"],
      ["Portal Enterprise", "/auth?mode=enterprise"],
    ],
  },
  {
    title: "Akun",
    links: [
      ["Daftar Akses Awal", "/auth?mode=register"],
      ["Masuk", "/auth"],
      ["Tanya jawab", "/#faq"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Kebijakan privasi", "/privacy-policy"],
      ["Syarat layanan", "/terms-of-service"],
      ["Kebijakan cookie", "/cookie-policy"],
      ["Kebijakan pengembalian dana", "/refund-policy"],
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="rh-landing-footer">
      <section className="bg-[var(--rh-wine)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center lg:py-20">
          <h2 className="max-w-[620px] text-[34px] leading-[1.1] !text-white sm:text-[42px]">
            Ada kabar bahagia yang ingin kalian bagikan?
          </h2>
          <p className="rh-footer-access-note">
            Daftar Akses Awal Rp0. Tim kami meninjau pendaftaran sebelum akun
            diaktifkan.
          </p>
          <Link
            href="/auth?mode=register"
            className="inline-flex min-h-[50px] shrink-0 items-center justify-center rounded-[10px] bg-white px-7 text-[15px] font-semibold text-[var(--rh-wine)] transition-colors hover:bg-[var(--rh-ivory)]"
          >
            Daftar Akses Awal
          </Link>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo variant="lockup" isLink={false} height="h-8" />
          <p className="mt-4 max-w-[300px] text-[14px] leading-[1.6] text-[var(--rh-muted)]">
            Platform undangan pernikahan digital dari Indonesia.
          </p>
          <a
            href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`}
            className="mt-3 inline-block text-[14px] font-medium text-[var(--rh-wine)] hover:underline"
          >
            {ENTERPRISE_CONTACT_EMAIL}
          </a>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-[14px] font-semibold">{col.title}</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[14px] text-[var(--rh-ink-2)] hover:text-[var(--rh-wine)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-[var(--rh-line)]">
        <p className="mx-auto max-w-[1200px] px-5 py-6 text-[13px] text-[var(--rh-muted)] sm:px-8">
          © {new Date().getFullYear()} RuangHadir. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
