"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Fitur", href: "/#features" },
  { label: "Galeri", href: "/#gallery" },
  { label: "Testimoni", href: "/#testimonials" },
  { label: "Harga", href: "/#pricing" },
];

export const MarketingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 mix-blend-difference text-white px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo isLink className="brightness-0 invert hover:scale-105" />

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-opacity">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/auth" className="text-sm font-medium tracking-wide uppercase hover:opacity-70 transition-opacity">Masuk</Link>
            <Link href="/auth" className="text-sm font-medium tracking-wide uppercase border border-white px-5 py-2 hover:bg-white hover:text-black transition-colors">
              Coba Gratis
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8"
          >
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="text-2xl font-serif">
                {l.label}
              </a>
            ))}
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="mt-8 text-sm font-medium tracking-wide uppercase border border-foreground px-8 py-3">
              Masuk / Daftar
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
