"use client";

import React from "react";
import Link from "next/link";

export const MarketingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
          {/* Column 1 — Produk */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 opacity-50 font-medium">Produk</h4>
            <ul className="space-y-3.5">
              <li><Link href="/#features" className="text-sm hover:opacity-70 transition-opacity">Fitur</Link></li>
              <li><Link href="/#gallery" className="text-sm hover:opacity-70 transition-opacity">Katalog Tema</Link></li>
              <li><Link href="/#pricing" className="text-sm hover:opacity-70 transition-opacity">Harga</Link></li>
              <li><Link href="/auth" className="text-sm hover:opacity-70 transition-opacity">Demo Gratis</Link></li>
            </ul>
          </div>

          {/* Column 2 — Perusahaan */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 opacity-50 font-medium">Perusahaan</h4>
            <ul className="space-y-3.5">
              <li><Link href="/about" className="text-sm hover:opacity-70 transition-opacity">Tentang Kami</Link></li>
              <li><Link href="/contact" className="text-sm hover:opacity-70 transition-opacity">Hubungi Kami</Link></li>
              <li><Link href="/#testimonials" className="text-sm hover:opacity-70 transition-opacity">Testimoni</Link></li>
            </ul>
          </div>

          {/* Column 3 — Bantuan */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 opacity-50 font-medium">Bantuan</h4>
            <ul className="space-y-3.5">
              <li><Link href="/#faq" className="text-sm hover:opacity-70 transition-opacity">FAQ</Link></li>
              <li>
                <a href="https://wa.me/6285731021469?text=Halo%20RuangHadir%2C%20saya%20butuh%20bantuan" target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70 transition-opacity">
                  WhatsApp Support
                </a>
              </li>
              <li><Link href="/refund-policy" className="text-sm hover:opacity-70 transition-opacity">Kebijakan Pengembalian</Link></li>
            </ul>
          </div>

          {/* Column 4 — Sosial */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 opacity-50 font-medium">Sosial</h4>
            <ul className="space-y-3.5">
              <li>
                <a href="https://instagram.com/ruanghadir_net" target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70 transition-opacity">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://tiktok.com/@rfxvisual" target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70 transition-opacity">
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://wa.me/6285731021469" target="_blank" rel="noopener noreferrer" className="text-sm hover:opacity-70 transition-opacity">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5 — Layanan */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 opacity-50 font-medium">Layanan</h4>
            <ul className="space-y-3.5">
              <li className="text-sm opacity-80">Undangan Digital</li>
              <li className="text-sm opacity-80">Manajemen Tamu</li>
              <li className="text-sm opacity-80">Desain Custom</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Large Logo Section (SSA-style) ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
          {/* Large logo icon */}
          <div className="flex items-end gap-6">
            <img
              src="/logo tunggal transparan (tanpa tipografi).png"
              alt="RuangHadir Logo"
              className="w-28 h-28 md:w-40 md:h-40 object-contain brightness-0 invert opacity-80"
            />
            <div className="pb-2">
              <p className="text-sm opacity-60 leading-relaxed">Undangan Digital</p>
              <p className="text-sm opacity-60 leading-relaxed">Manajemen Tamu</p>
              <p className="text-sm opacity-60 leading-relaxed">Desain Premium</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-serif italic opacity-60 lg:text-right">
            The New Standard<br className="hidden md:block" /> in Digital Wedding
          </p>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-primary-foreground/15">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-primary-foreground/40 tracking-wider">
            © {currentYear} RuangHadir.net — by RFX Visual. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="text-[11px] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors tracking-wider">
              Kebijakan Privasi
            </Link>
            <Link href="/terms-of-service" className="text-[11px] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors tracking-wider">
              Ketentuan Layanan
            </Link>
            <Link href="/cookie-policy" className="text-[11px] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors tracking-wider">
              Kebijakan Cookie
            </Link>
            <Link href="/refund-policy" className="text-[11px] text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors tracking-wider">
              Kebijakan Pengembalian
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
