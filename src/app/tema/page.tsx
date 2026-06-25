'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import { DEFAULT_THEMES } from '../../data/defaultData';
import { PiCaretRightDuotone as ChevronRight, PiSparkleDuotone as Sparkles } from 'react-icons/pi';
import Link from 'next/link';

export default function TemaPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-20 animate-slideUp">
          <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
            Koleksi Desain Premium
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-6 tracking-tight">
            Pilih Tema Undangan Anda
          </h1>
          <p className="text-lg text-[var(--text-secondary)] font-body-serif max-w-2xl mx-auto">
            Jelajahi galeri tema elegan kami. Setiap tema dirancang dengan cermat dan dapat dikustomisasi penuh di dalam editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-fadeIn" style={{ animationDelay: '100ms' }}>
          {DEFAULT_THEMES.map((theme) => {
            const isRecommended = theme.id === 'rfx-light' || theme.id === 'rfx-gold';
            return (
              <div
                key={theme.id}
                className={`card-interactive p-0 flex flex-col justify-between h-[300px] transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-1 ${
                  isRecommended
                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]'
                    : 'bg-white'
                }`}
              >
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{
                    backgroundColor: theme.bgHex,
                    backgroundImage: `radial-gradient(${theme.primaryHex} 1.5px, transparent 0)`,
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="relative z-10 p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-display text-slate-800 uppercase tracking-wide leading-tight">
                        {theme.name}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-2 inline-block">
                        {theme.pattern} design
                      </span>
                    </div>
                    {isRecommended && (
                      <span className="bg-[var(--color-primary)] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Terpopuler
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-[var(--text-secondary)] mt-4 leading-relaxed font-body-serif">
                    Estetika visual dengan kombinasi font pilihan serta palet warna lembut {theme.primaryHex}.
                  </p>
                </div>

                <div className="relative z-10 p-5 border-t border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-surface-alt)] backdrop-blur-md">
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.primaryHex }} title="Warna Utama" />
                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bgHex }} title="Warna Latar" />
                    <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.textHex }} title="Warna Teks" />
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider">
                    GUNAKAN TEMA INI <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-20 text-center animate-fadeIn" style={{ animationDelay: '500ms' }}>
          <p className="text-slate-500 mb-6 font-medium">Masih banyak tema lainnya di dalam Dashboard!</p>
          <Link href="/dashboard" className="btn-primary rounded-full px-8 py-4 text-base font-bold shadow-[var(--shadow-glow-rose)] hover:-translate-y-1 inline-flex items-center gap-2">
            Masuk ke Editor <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
