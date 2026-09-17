"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, Star, Users, Clock, Send, MessageCircle, CheckCheck, ShieldCheck } from "lucide-react";
import { RATING, VERIFIED, UNVERIFIED_LABEL } from "@/data/socialProof";

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
  ["AR", "var(--saas-wine)"], ["CD", "var(--saas-gold)"], ["SK", "var(--saas-ink)"], ["RB", "var(--saas-wine-2)"],
];
const STATS = [
  { l: "Hadir", v: "92", c: "var(--saas-green)", I: Users },
  { l: "Ragu", v: "23", c: "var(--saas-amber)", I: Clock },
  { l: "Terkirim", v: "315", c: "var(--saas-wine)", I: Send },
];

export function SaasHero() {
  return (
    <section className="saas-shell relative pt-12 sm:pt-16">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10">
          <p className="saas-kicker">Undangan digital premium</p>
          <h1 className="mt-5 text-[44px] leading-[1.04] sm:text-[58px] lg:text-[64px]">
            Hari besar Anda,{" "}
            <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>diundang</span>{" "}
            dengan indah.
          </h1>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.75]" style={{ color: "var(--saas-ink-2)" }}>
            RSVP real-time, amplop QRIS, galeri sinematik, dan QR check-in di bawah satu detik per tamu.
            Dirancang dalam 10 menit — langsung sebar via WhatsApp.
          </p>
          {/* CTA utama memakai jalur tanpa risiko: paket demo sudah terpilih otomatis
              sehingga pendaftar tidak perlu memutuskan paket berbayar lebih dulu. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?mode=register&package=demo" className="saas-btn-primary !px-7 !py-3.5">
              Coba Gratis Sekarang <ArrowRight size={17} />
            </Link>
            <Link href="/preview" className="saas-btn-outline !px-7 !py-3.5"><Play size={16} /> Lihat Contoh Undangan</Link>
          </div>
          <p className="mt-3.5 flex items-center gap-2 text-[12.5px] font-semibold" style={{ color: "var(--saas-ink-2)" }}>
            <ShieldCheck size={15} style={{ color: "var(--saas-gold)" }} />
            Tanpa kartu kredit · Tanpa langganan · Bisa ditingkatkan kapan saja
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {VERIFIED ? (
              <>
                <span className="flex -space-x-2.5">
                  {TRUST.map(([t, c]) => (
                    <span key={t} className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white" style={{ background: c, borderColor: "var(--saas-bg)" }}>{t}</span>
                  ))}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-bold">
                  <Star size={15} fill="var(--saas-gold)" color="var(--saas-gold)" /> {RATING.score}
                  <span className="font-medium" style={{ color: "var(--saas-muted)" }}>· {RATING.reviewCount.toLocaleString("id-ID")} ulasan</span>
                </span>
              </>
            ) : (
              <span className="saas-badge saas-badge-gold">{UNVERIFIED_LABEL}</span>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] pb-12 sm:pb-14 lg:pb-4">
          <div aria-hidden className="pointer-events-none absolute -inset-8" style={{ background: "radial-gradient(420px 320px at 62% 28%, rgba(185,138,68,.25), transparent 65%), radial-gradient(380px 320px at 18% 82%, rgba(126,42,63,.16), transparent 60%)", filter: "blur(4px)" }} />

          <div className="saas-card relative z-10 mx-auto w-[94%]" style={{ borderRadius: 22 }}>
            <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: "var(--saas-line)" }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--saas-line-strong)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--saas-line-strong)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--saas-gold)" }} />
              <span className="ml-2 truncate text-[11px] font-semibold" style={{ color: "var(--saas-muted)" }}>ruanghadir.net/rina-budi</span>
              <span className="saas-badge saas-badge-green ml-auto !py-1">Live</span>
            </div>
            <div className="relative h-44 overflow-hidden" style={{ background: "linear-gradient(135deg,#3A2027,#7E2A3F)" }}>
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=70"
                alt="Rina & Budi" loading="lazy" className="saas-photo opacity-90"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,10,0) 30%, rgba(20,12,10,.74))" }} />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--saas-gold-2)" }}>The Wedding Of</p>
                <p className="saas-statnum mt-0.5 text-[27px] text-white">Rina &amp; Budi</p>
              </div>
            </div>
            <div className="grid grid-cols-3">
              {STATS.map(({ l, v, c, I }) => (
                <div key={l} className="flex items-center justify-center gap-1.5 py-3" style={{ borderColor: "var(--saas-line)" }}>
                  <I size={14} style={{ color: c }} />
                  <span className="text-[10.5px] font-semibold" style={{ color: "var(--saas-muted)" }}>{l}</span>
                  <span className="tabular text-[12.5px] font-extrabold">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderTop: "1px solid var(--saas-line)" }}>
              <div className="saas-progress flex-1"><span style={{ width: "63%" }} /></div>
              <span className="text-[11px] font-bold" style={{ color: "var(--saas-muted)" }}>Persiapan</span>
              <span className="tabular text-[12px] font-extrabold" style={{ color: "var(--saas-wine)" }}>63%</span>
            </div>
          </div>

          <div className="saas-float left-0 top-14 z-20 hidden w-[218px] p-3.5 sm:block">
            <div className="flex items-center gap-2">
              <span className="saas-icon-box !h-9 !w-9 !rounded-xl"><MessageCircle size={16} /></span>
              <div>
                <p className="text-[11.5px] font-extrabold leading-tight">WhatsApp Blast</p>
                <p className="text-[10px] font-semibold" style={{ color: "var(--saas-muted)" }}>Baru saja</p>
              </div>
            </div>
            <p className="mt-2.5 rounded-lg px-2.5 py-2 text-[10.5px] font-semibold leading-snug" style={{ background: "var(--saas-gold-soft)" }}>
              Undangan terkirim ke <b>48 tamu</b>
            </p>
            <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--saas-green)" }}><CheckCheck size={12} /> 98,4% terkirim</p>
          </div>

          <div className="saas-float bottom-0 right-0 z-20 hidden w-[210px] p-3.5 sm:block">
            <div className="flex items-center gap-3">
              <QrMock size={44} />
              <div>
                <p className="text-[11.5px] font-extrabold leading-tight">QR Check-in</p>
                <p className="mt-0.5 text-[10.5px] font-bold" style={{ color: "var(--saas-green)" }}>0,8 detik / tamu</p>
                <p className="text-[9.5px] font-semibold" style={{ color: "var(--saas-muted)" }}>315 terverifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
