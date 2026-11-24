"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  ["Tema", "/#tema"],
  ["Cara kerja", "/#cara-kerja"],
  ["Fitur", "/#fitur"],
  ["Harga", "/#harga"],
  ["Tanya jawab", "/#faq"],
] as const;

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="rh-landing-nav"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggleRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <div className="rh-nav-inner">
        <Link href="/" aria-label="RuangHadir — beranda" className="shrink-0">
          <Logo variant="lockup" isLink={false} height="h-8" />
        </Link>
        <nav aria-label="Navigasi utama" className="rh-nav-links">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="rh-nav-account">
          <Link href="/auth" className="rh-nav-signin">
            Masuk
          </Link>
          <Link
            href="/auth?mode=register"
            className="rh-action rh-action-primary rh-nav-register"
          >
            Daftar Akses Awal
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="marketing-mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="rh-nav-toggle"
          >
            {open ? (
              <X size={20} aria-hidden />
            ) : (
              <Menu size={20} aria-hidden />
            )}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="marketing-mobile-menu"
          aria-label="Navigasi seluler"
          className="rh-nav-disclosure"
        >
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <Link
            href="/auth?mode=register"
            className="rh-action rh-action-primary"
            onClick={() => setOpen(false)}
          >
            Daftar Akses Awal
          </Link>
          <Link href="/auth?mode=enterprise" onClick={() => setOpen(false)}>
            Portal Enterprise
          </Link>
        </nav>
      )}
    </header>
  );
}
