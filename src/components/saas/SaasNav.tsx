"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Building2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS: [string, string][] = [
  ["Fitur", "/#fitur"],
  ["Tema", "/#template"],
  ["Video Studio", "/#video-enterprise"],
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
    <div className="sticky top-0 z-50 px-3 sm:px-5 pt-3">
      <header
        className={`saas-shell flex h-[64px] items-center justify-between gap-4 rounded-full transition-all duration-300 ${
          scrolled
            ? "glx-strong shadow-[0_14px_40px_-18px_rgba(15,23,42,0.18)]"
            : "glx"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group pl-1">
          <Logo variant="lockup" isLink={false} height="h-8" />
          <span className="hidden sm:inline-flex items-center rounded-full bg-[#34C759]/14 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E7E34]">
            Gratis
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 rounded-full bg-white/55 border border-white/80 px-1.5 py-1 lg:flex"
        >
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#48484A] transition-all hover:bg-white/85 hover:text-[#1D1D1F]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex pr-1">
          <Link
            href="/auth?mode=enterprise"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-[#5856D6] transition hover:bg-[#5856D6]/10"
            title="Portal Login Enterprise"
          >
            <Building2 size={14} /> Enterprise
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-semibold text-[#1D1D1F] transition hover:bg-black/5"
          >
            Masuk
          </Link>
          <Link
            href="/auth?mode=register"
            className="saas-btn-primary !px-5 !py-2 !min-h-[40px] !text-[13px]"
          >
            Buat Gratis <ArrowRight size={14} />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/70 border border-white/85 text-[#1D1D1F] lg:hidden cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {open && (
        <div className="saas-shell mt-2 lg:hidden">
          <div className="glx-strong rounded-[28px] p-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)]">
            <div className="space-y-1">
              {LINKS.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-[14.5px] font-semibold text-[#1D1D1F] transition-colors hover:bg-white/80"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-black/[0.06] pt-3">
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
                className="col-span-2 flex items-center justify-center gap-1.5 rounded-full bg-[#5856D6]/10 border border-[#5856D6]/20 py-2.5 text-[12.5px] font-bold text-[#5856D6]"
              >
                <Building2 size={14} /> Masuk Portal Enterprise
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
