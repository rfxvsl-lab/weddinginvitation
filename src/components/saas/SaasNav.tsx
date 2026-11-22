"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Building2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS: [string, string][] = [
  ["Fitur", "/#fitur"],
  ["Tema", "/#template"],
  ["Cara Kerja", "/#cara-kerja"],
  ["Gratis & Enterprise", "/#harga"],
  ["FAQ", "/#faq"],
];

export function SaasNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "saas-glass border-b shadow-[0_10px_30px_-20px_rgba(36,20,24,0.22)]"
            : "bg-transparent border-b border-transparent"
        }`}
        style={scrolled ? { borderColor: "var(--saas-line)" } : undefined}
      >
        <header className="saas-shell flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo variant="lockup" isLink={false} height="h-9" />
            <span
              className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{
                background: "var(--saas-success-soft)",
                color: "var(--saas-success)",
              }}
            >
              Gratis
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-1 rounded-full border px-2 py-1.5 lg:flex"
            style={{
              background: "rgba(255,255,255,0.72)",
              borderColor: "var(--saas-line)",
              backdropFilter: "blur(10px)",
            }}
          >
            {LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-[#F5ECE2]"
                style={{ color: "var(--saas-ink-2)" }}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/auth?mode=enterprise"
              className="saas-btn-ghost !text-[13px] !px-3.5"
              title="Portal Login Enterprise"
            >
              <Building2 size={14} /> Enterprise
            </Link>
            <Link
              href="/auth"
              className="saas-btn-ghost !text-[13.5px] !px-3.5"
            >
              Masuk
            </Link>
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !px-5 !py-2.5 !min-h-[42px] !text-[13.5px]"
            >
              Buat Gratis <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border lg:hidden"
            style={{
              borderColor: "var(--saas-line)",
              background: "rgba(255,255,255,0.75)",
              color: "var(--saas-ink)",
            }}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </header>
      </div>

      {open && (
        <div
          className="saas-glass border-b px-4 pb-5 pt-3 shadow-lg lg:hidden"
          style={{ borderColor: "var(--saas-line)" }}
        >
          <div className="space-y-1">
            {LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-3 text-[14.5px] font-semibold transition-colors hover:bg-white/70"
                style={{ color: "var(--saas-ink)" }}
              >
                {label}
              </a>
            ))}
          </div>
          <div
            className="mt-4 grid grid-cols-2 gap-2.5 border-t pt-4"
            style={{ borderColor: "var(--saas-line)" }}
          >
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="saas-btn-outline !py-2.5 !text-[13px]"
            >
              Masuk
            </Link>
            <Link
              href="/auth?mode=register"
              onClick={() => setOpen(false)}
              className="saas-btn-primary !py-2.5 !text-[13px]"
            >
              Buat Gratis
            </Link>
            <Link
              href="/auth?mode=enterprise"
              onClick={() => setOpen(false)}
              className="col-span-2 flex items-center justify-center gap-1.5 rounded-full border py-2.5 text-[12.5px] font-bold"
              style={{
                borderColor: "var(--saas-line-strong)",
                color: "var(--saas-ink-2)",
                background: "rgba(255,255,255,0.7)",
              }}
            >
              <Building2 size={14} /> Masuk Portal Enterprise
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
