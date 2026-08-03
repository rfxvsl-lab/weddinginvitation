"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";

// Background decorations per theme to give visual variety
const THEME_DECORATIONS: Record<string, { bgImage?: string; overlayColor: string }> = {
  'rfx-dark': {
    overlayColor: 'rgba(5,5,5,0.15)',
  },
  'cremy-rose': {
    overlayColor: 'rgba(255,228,230,0.3)',
  },
  'grand-ballroom': {
    overlayColor: 'rgba(254,243,199,0.3)',
  },
  'netflix-luxury': {
    overlayColor: 'rgba(10,10,10,0.2)',
  },
  'royal-arabian': {
    overlayColor: 'rgba(12,18,34,0.2)',
  },
  'spotilove': {
    overlayColor: 'rgba(18,18,18,0.15)',
  },
  'javanese-classic': {
    overlayColor: 'rgba(253,246,236,0.3)',
  },
};

export default function PreviewPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-4">
              Koleksi Tema
            </span>
            <h1 className="text-4xl md:text-6xl font-serif mb-8">
              Pilihan Desain
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pilih dan gunakan tema undangan pernikahan yang menarik serta unik.
              Setiap desain dirancang dengan estetika premium untuk momen spesial Anda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Themes Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEFAULT_THEMES.map((theme, i) => {
              const deco = THEME_DECORATIONS[theme.id] || { overlayColor: 'rgba(0,0,0,0.1)' };
              return (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group relative"
                >
                  {/* Card */}
                  <div
                    className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2"
                    style={{
                      background: `linear-gradient(160deg, ${theme.bgHex}22 0%, ${theme.primaryHex}11 100%)`,
                    }}
                  >
                    {/* Card Inner with theme background tint */}
                    <div className="relative p-8 pb-6 flex items-center gap-6">
                      {/* Phone Mockup */}
                      <div className="shrink-0 relative">
                        {/* Phone Frame */}
                        <div
                          className="relative w-[140px] h-[280px] rounded-[24px] border-[3px] shadow-2xl overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
                          style={{
                            borderColor: theme.primaryHex + '40',
                            backgroundColor: theme.bgHex,
                          }}
                        >
                          {/* Phone Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-b-xl z-20" />

                          {/* Phone Screen Content */}
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center p-4"
                            style={{
                              background: `linear-gradient(180deg, ${theme.bgHex} 0%, ${theme.bgPatternHex} 100%)`,
                            }}
                          >
                            {/* Decorative dots */}
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage: `radial-gradient(circle at 2px 2px, ${theme.accentHex} 0.5px, transparent 0)`,
                                backgroundSize: '16px 16px',
                              }}
                            />

                            {/* Preview Content */}
                            <div className="relative z-10 text-center space-y-2">
                              <p
                                className="text-[8px] uppercase tracking-[0.25em] font-medium"
                                style={{ color: theme.accentHex }}
                              >
                                Pernikahan
                              </p>
                              <p
                                className="text-[15px] font-serif italic leading-tight"
                                style={{ color: theme.textHex }}
                              >
                                Rian & Salsa
                              </p>
                              <div
                                className="w-8 h-[1px] mx-auto"
                                style={{ backgroundColor: theme.accentHex + '60' }}
                              />
                              <p
                                className="text-[7px] tracking-wider"
                                style={{ color: theme.textHex + 'aa' }}
                              >
                                08 Agustus 2026
                              </p>
                            </div>

                            {/* Bottom decorative bar */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-1"
                              style={{
                                background: `linear-gradient(90deg, transparent, ${theme.primaryHex}, transparent)`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Phone shadow */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[100px] h-6 bg-black/10 rounded-full blur-xl" />
                      </div>

                      {/* Theme Info */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-1"
                          style={{ color: theme.primaryHex }}
                        >
                          Tema Undangan
                        </span>
                        <h3 className="text-lg font-serif mb-3 text-foreground leading-tight">
                          {theme.name}
                        </h3>

                        {/* Color Palette */}
                        <div className="flex -space-x-1 mb-4">
                          {[theme.primaryHex, theme.secondaryHex, theme.bgHex, theme.accentHex, theme.textHex].map(
                            (hex, ci) => (
                              <div
                                key={ci}
                                className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: hex, zIndex: 5 - ci }}
                              />
                            )
                          )}
                        </div>

                        {/* Pattern Badge */}
                        <span className="inline-block text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-full border border-border text-muted-foreground bg-secondary/50">
                          {theme.pattern}
                        </span>
                      </div>
                    </div>

                    {/* Hover overlay with "Lihat Demo" */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-end justify-center opacity-0 group-hover:opacity-100 rounded-2xl">
                      <Link
                        href={`/demo/${theme.id}`}
                        className="mb-8 bg-white text-black px-6 py-3 text-xs tracking-widest uppercase font-bold rounded-full flex items-center gap-2 shadow-xl hover:bg-primary hover:text-primary-foreground transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500"
                      >
                        Lihat Demo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Theme Name Below Card */}
                  <p className="mt-4 text-sm font-medium text-foreground">{theme.name}</p>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-20">
            <Link
              href="/auth"
              className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
            >
              Mulai Buat Undangan <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Gratis untuk paket Demo — tanpa perlu kartu kredit.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
