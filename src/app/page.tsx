import React from 'react';
import Link from 'next/link';
import { Star, Users, Clock, ShieldCheck, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { PiHeartFill, PiSparkleFill, PiStarFill } from 'react-icons/pi';
import Navigation from '../components/Navigation';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans overflow-hidden selection:bg-[var(--color-primary-light)] selection:text-[var(--color-primary-hover)]">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary-lighter)] blur-[100px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent-light)] blur-[120px] pointer-events-none opacity-40" />

      {/* Navigation Bar */}
      <Navigation />

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Text Content */}
          <div className="space-y-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary-lighter)] text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />

            </div>

            <h2 className="text-5xl lg:text-7xl font-display font-bold text-[var(--text-primary)] leading-[1.1]">
              Buat Undangan Pernikahan <span className="text-[var(--color-primary)] italic">Eksklusif</span> Anda.
            </h2>

            <p className="text-lg text-[var(--text-secondary)] font-body-serif leading-relaxed max-w-lg">
              Kreasikan momen bahagia Anda menjadi sebuah mahakarya digital. Dengan puluhan tema premium, manajemen RSVP pintar, dan kemudahan kustomisasi tanpa batas.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2">
              <Link href="/dashboard" className="btn-primary rounded-2xl px-8 py-4 text-base font-semibold shadow-[var(--shadow-glow-rose)] hover:shadow-lg hover:-translate-y-1 transition-all">
                Buat Undangan Sekarang
              </Link>
              <a href="#" className="px-6 py-4 text-[var(--text-secondary)] font-medium hover:text-[var(--color-primary)] transition-colors flex items-center gap-2 group">
                Lihat Demo Tema
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-10 flex items-center gap-4 border-t border-[var(--border-light)]">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--bg-primary)] bg-[var(--bg-surface-alt)] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-[var(--text-primary)]">5,000+ Pasangan</p>
                <p className="text-[var(--text-muted)]">telah mempercayakan momennya</p>
              </div>
            </div>
          </div>

          {/* Right Devices Mockup */}
          <div className="relative w-full h-[400px] lg:h-[600px] flex items-center justify-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>

            {/* Laptop Mockup Image */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10 transform hover:-translate-y-[52%] transition-transform duration-500 w-[90%] flex justify-end">
              <img
                src="/laptop_layout.png"
                alt="Template Desktop View"
                className="max-h-[300px] lg:max-h-[450px] w-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Mobile Phone Mockup Image */}
            <div className="absolute bottom-0 left-0 z-20 transform hover:-translate-y-3 transition-transform duration-500">
              <img
                src="/hp_layout.png"
                alt="Template Mobile View"
                className="max-h-[300px] lg:max-h-[400px] w-auto object-contain drop-shadow-[-20px_20px_40px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-5 left-[15%] w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-[0_10px_25px_-5px_rgba(225,29,72,0.5)] flex items-center justify-center animate-float z-30 border border-white/20 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 bg-white/20" />
              <PiHeartFill className="w-8 h-8 text-white drop-shadow-md relative z-10" />
            </div>
            
            <div className="absolute bottom-16 right-[-2%] w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 shadow-[0_10px_25px_-5px_rgba(196,114,127,0.5)] flex items-center justify-center animate-float border border-white/20 backdrop-blur-md overflow-hidden" style={{ animationDelay: '1s' }}>
              <div className="absolute inset-0 bg-white/20" />
              <PiSparkleFill className="w-8 h-8 text-white drop-shadow-md relative z-10" />
            </div>

            <div className="absolute top-1/2 right-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] flex items-center justify-center animate-float border border-white/20 backdrop-blur-md overflow-hidden" style={{ animationDelay: '2s' }}>
              <div className="absolute inset-0 bg-white/20" />
              <PiStarFill className="w-6 h-6 text-white drop-shadow-md relative z-10" />
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
