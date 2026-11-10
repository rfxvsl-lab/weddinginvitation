"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, Camera, Mic, QrCode } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { PACKAGE_LIMITS, formatActiveDays } from "@/lib/packageLimits";

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

export function SaasHero() {
  return (
    <section className="saas-shell relative pt-12 sm:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <h1 className="text-[42px] leading-[1.08] sm:text-[54px] lg:text-[60px] tracking-tight text-balance">
            Undangan pernikahan yang menyapa tiap tamu dengan{" "}
            <span className="saas-serif-i italic" style={{ color: "var(--saas-wine)" }}>namanya</span>.
          </h1>

          <p className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.75]" style={{ color: "var(--saas-ink-2)" }}>
            Satu tautan untuk setiap tamu, lengkap dengan namanya. Tamu bisa konfirmasi hadir, mengirim foto dan ucapan suara, lalu menunjukkan tiket QR di meja penerima tamu.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?mode=register&package=demo" className="saas-btn-primary !px-7 !py-3.5">
              Coba gratis <ArrowRight size={17} aria-hidden />
            </Link>
            <Link href="/kharis-lia" className="saas-btn-outline !px-6 !py-3.5 flex items-center justify-center gap-2">
              <Play size={15} fill="currentColor" aria-hidden /> Lihat undangan Kharis &amp; Lia
            </Link>
          </div>

          <p className="mt-4 text-[13px]" style={{ color: "var(--saas-muted)" }}>
            Paket Demo gratis {formatActiveDays(PACKAGE_LIMITS.demo.activeDays)} · {DEFAULT_THEMES.length} tema · bayar sekali, tanpa langganan
          </p>
        </div>

        {/* MOCKUP HP FISIK ELEGANT — BUKAN DASHBOARD TELEMETRI */}
        <div className="relative mx-auto w-full max-w-[420px] py-2 flex flex-col items-center">
          {/* Smartphone Frame */}
          <div className="relative z-10 w-[272px] sm:w-[296px] rounded-[44px] p-3 shadow-2xl border-4 border-zinc-900 bg-zinc-950 ring-1 ring-zinc-700/50">
            {/* Notch */}
            <div className="absolute top-4 inset-x-0 h-4 bg-zinc-900 rounded-b-xl w-28 mx-auto z-30" />

            {/* Screen Content */}
            <div className="relative aspect-[9/19] rounded-[34px] overflow-hidden bg-[#0d0d12] text-white flex flex-col justify-between px-5 pb-5 pt-12 text-center shadow-inner">
              {/* Background Photo with Gradient */}
              <div className="absolute inset-0 z-0">
                <img
                  src="/assets/kharis-lia/hero.jpg"
                  alt="Undangan pernikahan Kharis dan Lia"
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/40 to-black/70" />
              </div>

              {/* Cover Top */}
              <div className="relative z-10">
                <p className="text-[8px] font-mono tracking-[0.3em] uppercase text-amber-300/80">THE WEDDING OF</p>
                <h3 className="mt-1 font-serif text-2xl text-amber-100 font-bold">Kharis &amp; Lia</h3>
                <p className="text-[10px] text-zinc-300/80 mt-1">Sabtu, 08 Agustus 2026</p>
              </div>

              {/* Guest Card Inside Phone */}
              <div className="relative z-10 my-auto rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md p-4 text-center space-y-2 shadow-2xl">
                <p className="text-[9px] uppercase tracking-widest text-amber-200">Kepada Yth.</p>
                <p className="text-sm font-bold text-white">Andi Wijaya &amp; Partner</p>
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-700 px-5 py-1.5 text-[10px] font-bold text-white">
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

          <p className="relative z-10 mt-4 text-center text-[12px]" style={{ color: "var(--saas-muted)" }}>
            Contoh undangan: Kharis &amp; Lia
          </p>
        </div>
      </div>
    </section>
  );
}
