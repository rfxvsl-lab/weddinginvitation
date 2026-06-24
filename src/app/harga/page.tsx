'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import { PiCheckCircleFill as CheckCircle, PiStarFill as Star } from 'react-icons/pi';
import Link from 'next/link';

export default function HargaPage() {
  const plans = [
    {
      name: "Basic",
      price: "Rp 99.000",
      desc: "Cocok untuk undangan digital sederhana dengan fitur esensial.",
      features: [
        "Akses 5 Tema Dasar",
        "Maksimal 100 Tamu",
        "Galeri 10 Foto",
        "Link Standar",
        "Masa Aktif 3 Bulan"
      ],
      isPopular: false,
      buttonText: "Pilih Basic"
    },
    {
      name: "Premium",
      price: "Rp 249.000",
      desc: "Pilihan terpopuler dengan fitur lengkap dan kustomisasi tanpa batas.",
      features: [
        "Akses Semua Tema Premium",
        "Tamu Tidak Terbatas (Unlimited)",
        "Galeri 50 Foto + Video",
        "Bebas Ganti Slug Undangan (2x)",
        "Live Chat & Buku Tamu",
        "Masa Aktif 1 Tahun"
      ],
      isPopular: true,
      buttonText: "Pilih Premium"
    },
    {
      name: "Custom",
      price: "Rp 599.000",
      desc: "Desain eksklusif yang dibuat khusus dari nol oleh tim desainer kami.",
      features: [
        "Semua Fitur Premium",
        "Desain 100% Custom",
        "Bantuan Setup & Input Data",
        "Revisi Desain (3x)",
        "Domain Pribadi (.com/.id)",
        "Masa Aktif Selamanya"
      ],
      isPopular: false,
      buttonText: "Hubungi Kami"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)] font-sans">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-20 animate-slideUp">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 mb-6 tracking-tight">
            Harga yang <span className="text-[var(--color-primary)] italic">Transparan</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-body-serif max-w-2xl mx-auto">
            Tidak ada biaya tersembunyi. Pilih paket yang sesuai dengan kebutuhan pernikahan impian Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`rounded-3xl p-8 relative transition-transform duration-500 hover:-translate-y-2 ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl scale-105 z-10 border border-slate-700' 
                  : 'bg-white text-slate-900 border border-slate-200 shadow-lg'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" /> Paling Diminati
                </div>
              )}
              
              <h3 className="text-xl font-bold font-display mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">{plan.price}</div>
              <p className={`text-sm mb-8 ${plan.isPopular ? 'text-slate-300' : 'text-slate-500'}`}>
                {plan.desc}
              </p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm font-medium">
                    <CheckCircle className={`w-5 h-5 shrink-0 ${plan.isPopular ? 'text-[var(--color-primary)]' : 'text-emerald-500'}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/dashboard" 
                className={`block w-full py-3 px-6 rounded-xl font-bold text-center transition-all ${
                  plan.isPopular 
                    ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-[var(--shadow-glow-rose)] hover:shadow-lg' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
