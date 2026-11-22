'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const LINKS: [string, string][] = [
  ['Tema', '/#tema'],
  ['Cara kerja', '/#cara-kerja'],
  ['Fitur', '/#fitur'],
  ['Harga', '/#harga'],
  ['Tanya jawab', '/#faq'],
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? 'border-[var(--rh-line)] bg-[var(--rh-ivory)]/95 backdrop-blur' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" aria-label="RuangHadir — beranda" className="shrink-0">
          <Logo variant="lockup" isLink={false} height="h-8" />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 lg:flex">
          {LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-[14px] font-medium text-[var(--rh-ink-2)] transition-colors hover:text-[var(--rh-wine)]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth"
            className="rounded-[10px] px-4 py-2 text-[14px] font-semibold text-[var(--rh-ink)] transition-colors hover:bg-[var(--rh-linen)]"
          >
            Masuk
          </Link>
          <Link href="/auth?mode=register" className="saas-btn-primary !min-h-[40px] !py-2 px-4 text-[14px]">
            Buat undangan gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--rh-line)] bg-white text-[var(--rh-ink)] md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-[var(--rh-ivory)] px-5 pb-10 md:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col divide-y divide-[var(--rh-line)] border-y border-[var(--rh-line)]">
            {LINKS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="py-4 font-[family-name:var(--font-display)] text-[24px] text-[var(--rh-ink)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/auth?mode=register" className="saas-btn-primary w-full text-[15px]" onClick={() => setOpen(false)}>
              Buat undangan gratis
            </Link>
            <Link href="/auth" className="saas-btn-outline w-full text-[15px]" onClick={() => setOpen(false)}>
              Masuk
            </Link>
            <Link
              href="/auth?mode=enterprise"
              className="mt-2 text-center text-[14px] font-medium text-[var(--rh-gold-deep)]"
              onClick={() => setOpen(false)}
            >
              Masuk sebagai Enterprise
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
