"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  Camera,
  Mic,
  QrCode,
  ShieldCheck,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import { RATING } from "@/data/socialProof";

export function QrMock({ size = 46 }: { size?: number }) {
  const n = 11, s = size / n;
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const finder = (r < 3 && c < 3) || (r < 3 && c > n - 4) || (r > n - 4 && c < 3);
      if (finder) continue;
      if ((r * 5 + c * 3 + ((r * c) % 5)) % 4 < 2) {
        cells.push(<rect key={`${r}-${c}`} x={c * s} y={r * s} width={s * 0.9} height={s * 0.9} rx={s * 0.22} fill="currentColor" />);
      }
    }
  }
  const f = 3 * s;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ color: "var(--saas-ink)" }} aria-hidden>
      {[[0, 0], [size - f, 0], [0, size - f]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width={f} height={f} rx={s * 0.6} fill="none" stroke="currentColor" strokeWidth={s * 0.66} />
          <rect x={x + s} y={y + s} width={s} height={s} rx={s * 0.3} fill="currentColor" />
        </g>
      ))}
      {cells}
    </svg>
  );
}

const TRUST: [string, string][] = [
  ["RS", "var(--saas-wine)"],
  ["AW", "var(--saas-gold)"],
  ["BL", "var(--saas-ink)"],
  ["DS", "var(--saas-wine-2)"],
];

export function SaasHero() {
  return (
    <section className="saas-shell relative pt-12 sm:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest mb-4" style={{ borderColor: "var(--saas-line-strong)", background: "var(--saas-gold-soft)", color: "var(--saas-wine)" }}>
            <Sparkles size={13} /> Platform Undangan Digital Eksklusif
          </div>

          <h1 className="text-[42px] leading-[1.08] sm:text-[54px] lg:text-[60px] tracking-tight text-balance">
            Abadikan hari bahagia, undang mereka secara{" "}
            <span className="saas-serif-i italic" style={{ color: "var(--saas-wine)" }}>istimewa</span>.
          </h1>

          <p className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.75]" style={{ color: "var(--saas-ink-2)" }}>
            Bukan sekadar link biasa. Hadirkan pengalaman sinematik dengan musik latar, dinding foto tamu, rekaman ucapan suara, dan tiket QR check-in instan di meja resepsionis.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?mode=register&package=demo" className="saas-btn-primary !px-7 !py-3.5 shadow-lg shadow-rose-950/20">
              Buat Undangan Sekarang <ArrowRight size={17} />
            </Link>
            <Link href="/rian-salsa?to=Andi%20Wijaya&code=W-ANDIW" target="_blank" className="saas-btn-outline !px-6 !py-3.5 flex items-center justify-center gap-2">
              <Play size={15} fill="currentColor" /> Lihat Contoh Nyata
            </Link>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[12px] font-semibold" style={{ color: "var(--saas-muted)" }}>
            <ShieldCheck size={15} style={{ color: "var(--saas-gold)" }} />
            Gratis uji coba · Siap dalam 5 menit · Tanpa instal aplikasi
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <span className="flex -space-x-2.5">
              {TRUST.map(([t, c]) => (
                <span key={t} className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white" style={{ background: c, borderColor: "var(--saas-bg)" }}>{t}</span>
              ))}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] font-bold">
              <Star size={15} fill="var(--saas-gold)" color="var(--saas-gold)" /> {RATING.score}
              <span className="font-medium" style={{ color: "var(--saas-muted)" }}>· dari 1.200+ pasangan bahagia</span>
            </span>
          </div>
        </div>

        {/* MOCKUP HP FISIK ELEGANT — BUKAN DASHBOARD TELEMETRI */}
        <div className="relative mx-auto w-full max-w-[420px] pb-6 sm:pb-8 flex justify-center">
          <div aria-hidden className="pointer-events-none absolute -inset-6" style={{ background: "radial-gradient(380px 320px at 50% 40%, rgba(185,138,68,.25), transparent 70%)", filter: "blur(20px)" }} />

          {/* Smartphone Frame */}
          <div className="relative z-10 w-[290px] sm:w-[320px] rounded-[44px] p-3 shadow-2xl border-4 border-zinc-900 bg-zinc-950 ring-1 ring-zinc-700/50">
            {/* Notch */}
            <div className="absolute top-4 inset-x-0 h-4 bg-zinc-900 rounded-b-xl w-28 mx-auto z-30" />

            {/* Screen Content */}
            <div className="relative aspect-[9/19] rounded-[34px] overflow-hidden bg-[#0d0d12] text-white flex flex-col justify-between p-5 text-center shadow-inner">
              {/* Background Photo with Gradient */}
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75"
                  alt="Wedding Preview"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/40 to-black/60" />
              </div>

              {/* Cover Top */}
              <div className="relative z-10 pt-4">
                <p className="text-[8px] font-mono tracking-[0.3em] uppercase text-amber-300/80">THE WEDDING OF</p>
                <h3 className="mt-1 font-serif text-2xl text-amber-100 font-bold">Rian &amp; Salsa</h3>
                <p className="text-[10px] text-zinc-300/80 mt-1">Sabtu, 08 Agustus 2026</p>
              </div>

              {/* Guest Card Inside Phone */}
              <div className="relative z-10 my-auto rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-4 text-center space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-amber-200">Kepada Yth.</p>
                <p className="text-sm font-bold text-white">Andi Wijaya &amp; Partner</p>
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-md">
                  Buka Undangan
                </div>
              </div>

              {/* Mini Features Dock on Screen */}
              <div className="relative z-10 flex items-center justify-around rounded-full border border-white/15 bg-black/60 px-3 py-2 backdrop-blur-md text-[9px] font-bold">
                <span className="flex items-center gap-1 text-amber-300"><Camera size={11} /> Momen</span>
                <span className="flex items-center gap-1 text-amber-300"><Mic size={11} /> Suara</span>
                <span className="flex items-center gap-1 text-amber-300"><QrCode size={11} /> Tiket</span>
              </div>
            </div>
          </div>

          {/* Floating Feature Bubble: Tiket QR Check-in */}
          <div className="absolute -bottom-2 -left-4 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
            <QrMock size={42} />
            <div className="text-left">
              <p className="text-[11px] font-extrabold text-zinc-900 leading-tight">Tiket QR &amp; Denah Meja</p>
              <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                <CheckCheck size={12} /> Check-in 0,8 detik
              </p>
            </div>
          </div>

          {/* Floating Feature Bubble: Dinding Foto Tamu */}
          <div className="absolute top-12 -right-4 z-20 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Camera size={17} />
            </div>
            <div className="text-left pr-1">
              <p className="text-[11px] font-extrabold text-zinc-900 leading-tight">Dinding Foto Tamu</p>
              <p className="text-[10px] font-medium text-zinc-500">Live share dari smartphone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
