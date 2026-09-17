"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS: [string, string][] = [
  ["Fitur", "/#fitur"], ["Template", "/#template"], ["Cara Kerja", "/#cara-kerja"],
  ["Harga", "/#harga"], ["Testimoni", "/#testimoni"], ["FAQ", "/#faq"],
];

export function SaasNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-0 z-50">
      <div className="saas-glass border-b" style={{ borderColor: "var(--saas-line)" }}>
        <header className="saas-shell flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <Logo variant="lockup" isLink={false} height="h-9" />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map(([l, h]) => (<a key={h} href={h} className="saas-navlink">{l}</a>))}
          </nav>
          <div className="hidden items-center gap-5 md:flex">
            <Link href="/auth" className="saas-navlink">Masuk</Link>
            <Link href="/auth?mode=register" className="saas-btn-primary !px-5 !py-2.5">Buat Undangan</Link>
          </div>
          <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
      </div>
      {open && (
        <div className="saas-glass border-b px-4 pb-4 pt-2 lg:hidden" style={{ borderColor: "var(--saas-line)" }}>
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-[14px] font-semibold" style={{ color: "var(--saas-ink)" }}>
              {l}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link href="/auth" className="saas-btn-outline !py-2.5">Masuk</Link>
            <Link href="/auth?mode=register" className="saas-btn-primary !py-2.5">Buat</Link>
          </div>
        </div>
      )}
    </div>
  );
}
