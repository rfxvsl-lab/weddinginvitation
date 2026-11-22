"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Camera,
  Mic,
  QrCode,
  CheckCircle2,
  Music2,
  HeartHandshake,
  Smartphone,
} from "lucide-react";

export function QrMock({ size = 46 }: { size?: number }) {
  const n = 11,
    s = size / n;
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const finder =
        (r < 3 && c < 3) || (r < 3 && c > n - 4) || (r > n - 4 && c < 3);
      if (finder) continue;
      if ((r * 5 + c * 3 + ((r * c) % 5)) % 4 < 2) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * s}
            y={r * s}
            width={s * 0.9}
            height={s * 0.9}
            rx={s * 0.22}
            fill="currentColor"
          />
        );
      }
    }
  }
  const f = 3 * s;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      style={{ color: "var(--saas-ink)" }}
      aria-hidden
    >
      {[
        [0, 0],
        [size - f, 0],
        [0, size - f],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect
            x={x}
            y={y}
            width={f}
            height={f}
            rx={s * 0.6}
            fill="none"
            stroke="currentColor"
            strokeWidth={s * 0.66}
          />
          <rect
            x={x + s}
            y={y + s}
            width={s}
            height={s}
            rx={s * 0.3}
            fill="currentColor"
          />
        </g>
      ))}
      {cells}
    </svg>
  );
}

const HIGHLIGHTS = [
  "100% Gratis untuk mulai",
  "9 tema siap pakai",
  "Edit langsung dari HP",
  "Tanpa kartu kredit",
];

export function SaasHero() {
  return (
    <section className="saas-shell relative pt-10 pb-6 sm:pt-14 lg:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
        <div className="relative z-10">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.26em] mb-4"
            style={{ color: "var(--saas-wine)" }}
          >
            Platform Undangan Digital Gratis
          </p>

          <h1 className="text-[42px] leading-[1.06] sm:text-[54px] lg:text-[62px] tracking-tight text-balance">
            Undangan pernikahan elegan,{" "}
            <span
              className="saas-serif-i italic"
              style={{ color: "var(--saas-wine)" }}
            >
              gratis
            </span>{" "}
            untuk setiap pasangan.
          </h1>

          <p
            className="mt-5 max-w-[54ch] text-[15.5px] leading-[1.78] sm:text-[16.5px]"
            style={{ color: "var(--saas-ink-2)" }}
          >
            Rancang undangan digital berkelas studio tanpa biaya awal. Dilengkapi
            link nama tamu personal, musik latar, galeri momen, amplop digital,
            RSVP real-time, hingga tiket QR check-in di lokasi acara.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !px-7 !py-3.5 !text-[14.5px]"
            >
              Buat Undangan Gratis <ArrowRight size={17} />
            </Link>
            <Link
              href="/rian-salsa?to=Andi%20Wijaya&code=W-ANDIW"
              target="_blank"
              className="saas-btn-outline !px-6 !py-3.5 !text-[14.5px]"
            >
              <Play size={14} fill="currentColor" /> Lihat Contoh Langsung
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6">
            {HIGHLIGHTS.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 text-[12.5px] font-semibold"
                style={{ color: "var(--saas-ink-2)" }}
              >
                <CheckCircle2
                  size={15}
                  style={{ color: "var(--saas-success)" }}
                  aria-hidden
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* MOCKUP SMARTPHONE EDITORIAL */}
        <div className="relative mx-auto flex w-full max-w-[430px] flex-col items-center py-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-full opacity-75"
            style={{
              background:
                "radial-gradient(360px 300px at 50% 42%, rgba(198,161,91,0.24), rgba(142,47,69,0.08) 55%, transparent 75%)",
              filter: "blur(22px)",
            }}
          />

          <div className="relative z-10 w-[276px] sm:w-[300px] rounded-[46px] border-[5px] border-[#1F1A18] bg-[#141110] p-2.5 shadow-[0_32px_70px_-24px_rgba(36,20,24,0.45)] ring-1 ring-white/15">
            {/* Dynamic Island */}
            <div className="absolute top-4 inset-x-0 z-30 mx-auto h-5 w-24 rounded-full bg-black/95 ring-1 ring-white/10" />

            {/* Screen */}
            <div className="relative flex aspect-[9/19] flex-col justify-between overflow-hidden rounded-[36px] bg-[#0e0c0d] px-5 pb-5 pt-14 text-center text-white">
              <div className="absolute inset-0 z-0">
                <img
                  src="/assets/kharis-lia/hero.jpg"
                  alt="Contoh tampilan undangan digital Kharis & Lia di RuangHadir"
                  className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a0b] via-[#0d0a0b]/35 to-black/65" />
              </div>

              <div className="relative z-10">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.32em] text-amber-200/90">
                  The Wedding Of
                </p>
                <h3 className="mt-1.5 font-serif text-[28px] leading-none text-amber-50">
                  Kharis &amp; Lia
                </h3>
                <p className="mt-1.5 text-[10.5px] font-medium tracking-wide text-stone-200/85">
                  Sabtu, 08 Agustus 2026
                </p>
              </div>

              <div className="relative z-10 my-auto space-y-2.5 rounded-2xl border border-white/20 bg-black/45 p-4 backdrop-blur-md shadow-xl">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-200/90">
                  Kepada Yth.
                </p>
                <p className="text-[14px] font-bold text-white">
                  Andi Wijaya &amp; Partner
                </p>
                <Link
                  href="/rian-salsa?to=Andi%20Wijaya&code=W-ANDIW"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#C6A15B] to-[#A67C37] px-5 py-2 text-[10.5px] font-bold text-[#1A1208] shadow-md transition-transform hover:scale-[1.03]"
                >
                  Buka Undangan
                </Link>
              </div>

              <div className="relative z-10 flex items-center justify-around rounded-full border border-white/15 bg-black/65 px-3 py-2 text-[9.5px] font-semibold backdrop-blur-md">
                <span className="flex items-center gap-1 text-amber-200">
                  <Camera size={11} /> Momen
                </span>
                <span className="flex items-center gap-1 text-amber-200">
                  <Mic size={11} /> Ucapan
                </span>
                <span className="flex items-center gap-1 text-amber-200">
                  <QrCode size={11} /> QR Tamu
                </span>
              </div>
            </div>
          </div>

          {/* Clean feature strip below phone */}
          <div className="relative z-10 mt-5 grid w-full max-w-[380px] grid-cols-2 gap-2.5">
            <div
              className="flex items-center gap-2.5 rounded-2xl border bg-white/95 p-3 shadow-sm"
              style={{ borderColor: "var(--saas-line)" }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "var(--saas-primary-soft)",
                  color: "var(--saas-primary)",
                }}
              >
                <Music2 size={16} />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-[11.5px] font-bold leading-tight">
                  Musik &amp; Galeri
                </p>
                <p
                  className="truncate text-[10.5px]"
                  style={{ color: "var(--saas-muted)" }}
                >
                  Atur lagu &amp; foto prewed
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2.5 rounded-2xl border bg-white/95 p-3 shadow-sm"
              style={{ borderColor: "var(--saas-line)" }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "var(--saas-success-soft)",
                  color: "var(--saas-success)",
                }}
              >
                <HeartHandshake size={16} />
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-[11.5px] font-bold leading-tight">
                  RSVP &amp; Amplop
                </p>
                <p
                  className="truncate text-[10.5px]"
                  style={{ color: "var(--saas-muted)" }}
                >
                  Pantau live di dashboard
                </p>
              </div>
            </div>
          </div>

          <p
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium"
            style={{ color: "var(--saas-muted)" }}
          >
            <Smartphone size={12} aria-hidden /> Responsif di semua ukuran layar HP &amp; desktop
          </p>
        </div>
      </div>
    </section>
  );
}
