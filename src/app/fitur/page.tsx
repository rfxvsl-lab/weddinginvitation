'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import { PiCheckCircleDuotone as CheckCircle, PiSparkleDuotone as Sparkles, PiDeviceMobileDuotone as Mobile, PiUsersDuotone as Users, PiPaintBrushDuotone as Brush, PiClockDuotone as Clock } from 'react-icons/pi';

export default function FiturPage() {
  const features = [
    {
      icon: <Brush className="w-8 h-8 text-[var(--color-primary)]" />,
      title: "Desain Premium & Eksklusif",
      desc: "Pilih dari puluhan tema elegan yang dirancang oleh desainer profesional, dengan animasi halus dan layout responsif."
    },
    {
      icon: <Mobile className="w-8 h-8 text-blue-500" />,
      title: "Ramah Semua Perangkat",
      desc: "Tampilan undangan Anda akan secara otomatis beradaptasi dengan sempurna di HP, Tablet, maupun Desktop."
    },
    {
      icon: <Users className="w-8 h-8 text-amber-500" />,
      title: "Manajemen Tamu Pintar",
      desc: "Kelola daftar tamu, pantau status kehadiran (RSVP), dan kirim undangan personalisasi via WhatsApp hanya dengan satu klik."
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-500" />,
      title: "Real-time Editor",
      desc: "Ubah teks, foto, dan warna secara langsung. Lihat hasilnya detik itu juga tanpa perlu memuat ulang halaman."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-20 animate-slideUp">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 tracking-tight">
            Fitur <span className="text-[var(--color-primary)] italic">Unggulan</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-body-serif max-w-2xl mx-auto">
            Segala yang Anda butuhkan untuk membuat undangan pernikahan digital yang tak terlupakan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feat, i) => (
            <div key={i} className="glass-panel p-8 rounded-3xl animate-fadeIn hover:-translate-y-2 transition-transform duration-500 group border border-white/50 relative overflow-hidden" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--color-primary-light)] to-transparent opacity-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 relative z-10 border border-slate-100 group-hover:rotate-6 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold font-display text-slate-800 mb-3 relative z-10">{feat.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed relative z-10">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center animate-fadeIn" style={{ animationDelay: '800ms' }}>
          <a href="/dashboard" className="btn-primary rounded-full px-8 py-4 text-base font-bold shadow-[var(--shadow-glow-rose)] hover:-translate-y-1 inline-flex items-center gap-2">
            Coba Semua Fitur <Sparkles className="w-5 h-5" />
          </a>
        </div>
      </main>
    </div>
  );
}
