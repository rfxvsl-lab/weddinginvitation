"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  MapPin,
  BookOpen,
  QrCode,
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

type ShowcaseTab = "cover" | "schedule" | "rsvp";

interface HeroEdition {
  id: string;
  label: string;
  category: string;
  couple: string;
  monogram: string;
  date: string;
  akadTime: string;
  resepsiTime: string;
  venue: string;
  city: string;
  guestName: string;
  previewHref: string;
  image: string;
  surfaceBg: string;
  accentHex: string;
  textLight: boolean;
}

const EDITIONS: HeroEdition[] = [
  {
    id: "grand-ballroom",
    label: "Grand Ballroom",
    category: "Editorial Klasik",
    couple: "Kharis & Lia",
    monogram: "K · L",
    date: "Sabtu, 08 Agustus 2026",
    akadTime: "08.00 — 10.00 WIB",
    resepsiTime: "11.00 — 14.00 WIB",
    venue: "Pendopo Agung Heritage",
    city: "Yogyakarta",
    guestName: "Andi Wijaya & Partner",
    previewHref: "/preview/grand-ballroom",
    image: "/assets/kharis-lia/hero.jpg",
    surfaceBg: "#171211",
    accentHex: "#D4B47B",
    textLight: true,
  },
  {
    id: "storybook-interactive",
    label: "Storybook 3D",
    category: "Buku Interaktif",
    couple: "Rian & Salsa",
    monogram: "R · S",
    date: "Sabtu, 18 Oktober 2026",
    akadTime: "08.30 — 10.00 WIB",
    resepsiTime: "11.30 — 15.00 WIB",
    venue: "Plataran Dharmawangsa",
    city: "Jakarta Selatan",
    guestName: "Nadia Pratama",
    previewHref: "/preview/storybook-interactive",
    image: "/assets/kharis-lia/bride.jpg",
    surfaceBg: "#261816",
    accentHex: "#DFC086",
    textLight: true,
  },
  {
    id: "javanese-classic",
    label: "Javanese Classic",
    category: "Adat Nusantara",
    couple: "Bagas & Sekar",
    monogram: "B · S",
    date: "Minggu, 22 November 2026",
    akadTime: "07.30 — 09.30 WIB",
    resepsiTime: "11.00 — 14.30 WIB",
    venue: "Dalem Pujokusuman",
    city: "Surakarta",
    guestName: "Keluarga Bpk. Hendra",
    previewHref: "/preview/javanese-classic",
    image: "/assets/themes/javanese-classic.png",
    surfaceBg: "#1C140F",
    accentHex: "#D8B372",
    textLight: true,
  },
];

const HIGHLIGHTS = [
  "Full Gratis Rp 0",
  "9 Tema Siap Pakai",
  "Edit Langsung dari HP",
  "Tanpa Watermark",
];

export function SaasHero() {
  const [editionIdx, setEditionIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("cover");
  const [rsvpChoice, setRsvpChoice] = useState<"hadir" | "doa">("hadir");

  const active = EDITIONS[editionIdx];

  const handleSelectEdition = (idx: number) => {
    setEditionIdx(idx);
    setActiveTab("cover");
  };

  return (
    <section className="saas-shell relative pt-10 pb-8 sm:pt-14 lg:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
        {/* ── LEFT EDITORIAL COPY ── */}
        <div className="relative z-10">
          <p
            className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.26em]"
            style={{ color: "var(--saas-wine)" }}
          >
            <span className="h-px w-6 bg-current opacity-60" aria-hidden />
            Studio Undangan Digital Gratis
          </p>

          <h1 className="text-[40px] leading-[1.06] tracking-tight text-balance sm:text-[52px] lg:text-[60px]">
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
            className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.78] sm:text-[16.5px]"
            style={{ color: "var(--saas-ink-2)" }}
          >
            Rancang undangan digital rasa editorial studio tanpa biaya awal.
            Tersedia tautan nama tamu personal, musik latar, galeri momen,
            amplop digital, buku ucapan RSVP, hingga tiket QR check-in.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth?mode=register"
              className="saas-btn-primary !px-7 !py-3.5 !text-[14.5px]"
            >
              Buat Undangan Gratis <ArrowRight size={17} />
            </Link>
            <Link
              href={active.previewHref}
              target="_blank"
              className="saas-btn-outline !px-6 !py-3.5 !text-[14.5px]"
            >
              Buka Demo {active.label} <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6">
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

        {/* ── RIGHT TACTILE INTERACTIVE PHONE STAGE ── */}
        <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center">
          {/* Edition Switcher Pills above stage */}
          <div
            role="tablist"
            aria-label="Pilih contoh tema undangan"
            className="mb-4 inline-flex flex-wrap items-center justify-center gap-1 rounded-full border bg-white/90 p-1 shadow-[0_2px_10px_-4px_rgba(36,20,24,0.1)]"
            style={{ borderColor: "var(--saas-line)" }}
          >
            {EDITIONS.map((ed, idx) => {
              const isSelected = idx === editionIdx;
              return (
                <button
                  key={ed.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectEdition(idx)}
                  className="rounded-full px-3.5 py-1.5 text-[11.5px] font-bold transition-all cursor-pointer"
                  style={
                    isSelected
                      ? { background: "var(--saas-ink)", color: "#FAF5EE" }
                      : { color: "var(--saas-muted)" }
                  }
                >
                  {ed.label}
                </button>
              );
            })}
          </div>

          {/* Architectural Paper Backdrop behind device (crisp, zero neon blur) */}
          <div
            className="relative flex w-full flex-col items-center rounded-[32px] border px-5 pt-7 pb-6"
            style={{
              borderColor: "var(--saas-line)",
              background:
                "linear-gradient(180deg, #FBF8F3 0%, #F3ECE2 100%)",
            }}
          >
            {/* Subtle top hairline metadata */}
            <div className="mb-4 flex w-full items-center justify-between px-1 text-[10.5px] font-semibold">
              <span
                className="uppercase tracking-[0.18em]"
                style={{ color: "var(--saas-muted)" }}
              >
                {active.category}
              </span>
              <Link
                href={active.previewHref}
                target="_blank"
                className="inline-flex items-center gap-1 font-bold hover:underline"
                style={{ color: "var(--saas-wine)" }}
              >
                Pratinjau Penuh <ArrowUpRight size={12} />
              </Link>
            </div>

            {/* Precision Smartphone Chassis */}
            <div className="relative w-[274px] sm:w-[292px]">
              {/* Side physical hardware accents */}
              <div
                aria-hidden
                className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l bg-[#2B2523]"
              />
              <div
                aria-hidden
                className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l bg-[#2B2523]"
              />
              <div
                aria-hidden
                className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r bg-[#2B2523]"
              />

              <div className="relative overflow-hidden rounded-[44px] border-[6px] border-[#1A1615] bg-[#120F0E] p-[5px] shadow-[0_28px_56px_-22px_rgba(28,18,16,0.48)] ring-1 ring-black/15">
                {/* Speaker / Dynamic Island */}
                <div className="pointer-events-none absolute inset-x-0 top-3.5 z-30 mx-auto flex h-[18px] w-[76px] items-center justify-end rounded-full bg-black px-2">
                  <span className="h-2 w-2 rounded-full bg-[#1F242D] ring-1 ring-white/10" />
                </div>

                {/* Inner Screen */}
                <div
                  className="relative flex aspect-[9/18.6] flex-col overflow-hidden rounded-[34px] text-white"
                  style={{ background: active.surfaceBg }}
                >
                  {/* Background editorial photography */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={active.image}
                      alt={`Pratinjau tema ${active.label} untuk ${active.couple}`}
                      className={`h-full w-full object-cover object-top transition-all duration-500 ${
                        activeTab === "cover"
                          ? "scale-100 opacity-75"
                          : "scale-105 opacity-25 blur-[2px]"
                      }`}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          activeTab === "cover"
                            ? "linear-gradient(180deg, rgba(16,12,11,0.58) 0%, rgba(16,12,11,0.22) 42%, rgba(16,12,11,0.88) 100%)"
                            : "linear-gradient(180deg, rgba(16,12,11,0.86) 0%, rgba(16,12,11,0.92) 100%)",
                      }}
                    />
                  </div>

                  {/* Delicate inner hairline frame — feels like printed stationery */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-2.5 z-10 rounded-[26px] border"
                    style={{ borderColor: "rgba(223,192,134,0.22)" }}
                  />

                  {/* Main Screen Content Area */}
                  <div className="relative z-20 flex flex-1 flex-col justify-between px-5 pt-11 pb-3">
                    {activeTab === "cover" && (
                      <>
                        {/* Top editorial header */}
                        <div className="text-center">
                          <span
                            className="inline-block font-mono text-[8px] uppercase tracking-[0.34em]"
                            style={{ color: active.accentHex }}
                          >
                            {active.monogram}
                          </span>
                          <p className="mt-2 text-[8.5px] uppercase tracking-[0.28em] text-white/75">
                            The Wedding Of
                          </p>
                          <h3 className="mt-1 font-serif text-[29px] leading-[1.08] text-[#FAF4EB]">
                            {active.couple}
                          </h3>
                          <p className="mt-1.5 text-[10.5px] tracking-wide text-white/80">
                            {active.date}
                          </p>
                        </div>

                        {/* Bottom invitation salutation & REAL CTA */}
                        <div className="mb-1 text-center">
                          <div className="mx-auto mb-3 h-px w-10 bg-[#DFC086]/45" />
                          <p className="text-[8.5px] uppercase tracking-[0.24em] text-[#DFC086]">
                            Kepada Yth.
                          </p>
                          <p className="mt-0.5 text-[13.5px] font-semibold tracking-tight text-white">
                            {active.guestName}
                          </p>

                          <div className="mt-3.5 flex flex-col gap-2">
                            <Link
                              href={active.previewHref}
                              target="_blank"
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-2.5 text-[11px] font-bold tracking-wide text-[#1B1412] shadow-md transition hover:bg-white"
                            >
                              <BookOpen size={12} />
                              Buka Undangan Penuh
                            </Link>
                            <button
                              type="button"
                              onClick={() => setActiveTab("schedule")}
                              className="text-[10px] font-medium text-white/75 underline-offset-4 hover:text-white hover:underline cursor-pointer"
                            >
                              Atau intip detail acara di sini →
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "schedule" && (
                      <div className="flex flex-1 flex-col justify-between py-2 text-left">
                        <div className="text-center">
                          <p
                            className="font-mono text-[8px] uppercase tracking-[0.3em]"
                            style={{ color: active.accentHex }}
                          >
                            Rangkaian Acara
                          </p>
                          <h3 className="mt-1 font-serif text-[22px] text-[#FAF4EB]">
                            {active.couple}
                          </h3>
                          <p className="text-[10px] text-white/70">{active.date}</p>
                        </div>

                        <div className="space-y-2.5 my-auto">
                          <div className="rounded-xl border border-white/12 bg-white/[0.06] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DFC086]">
                              Akad Nikah
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-white">
                              <Calendar size={11} className="text-[#DFC086]" />
                              {active.akadTime}
                            </p>
                          </div>

                          <div className="rounded-xl border border-white/12 bg-white/[0.06] p-3">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DFC086]">
                              Resepsi
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-white">
                              <Calendar size={11} className="text-[#DFC086]" />
                              {active.resepsiTime}
                            </p>
                            <p className="mt-1.5 flex items-start gap-1.5 text-[10.5px] text-white/75">
                              <MapPin size={11} className="mt-0.5 shrink-0 text-[#DFC086]" />
                              <span>
                                {active.venue}, {active.city}
                              </span>
                            </p>
                          </div>
                        </div>

                        <Link
                          href={active.previewHref}
                          target="_blank"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-2 text-[10.5px] font-bold text-[#1B1412] transition hover:bg-white"
                        >
                          Buka Tema {active.label} <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}

                    {activeTab === "rsvp" && (
                      <div className="flex flex-1 flex-col justify-between py-2 text-center">
                        <div>
                          <p
                            className="font-mono text-[8px] uppercase tracking-[0.3em]"
                            style={{ color: active.accentHex }}
                          >
                            Tiket Tamu &amp; RSVP
                          </p>
                          <h3 className="mt-1 font-serif text-[21px] text-[#FAF4EB]">
                            {active.guestName}
                          </h3>
                        </div>

                        <div className="my-auto space-y-3">
                          <div className="mx-auto inline-flex flex-col items-center rounded-2xl bg-[#F3F6FB] p-3 text-[#1D1D1F] shadow-md">
                            <QrMock size={76} />
                            <span className="mt-1.5 font-mono text-[8.5px] font-bold tracking-[0.16em] text-[#6B5D54]">
                              VIP · CHECK-IN PASS
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setRsvpChoice("hadir")}
                              className={`rounded-lg py-1.5 text-[10px] font-bold transition cursor-pointer ${
                                rsvpChoice === "hadir"
                                  ? "bg-[#DFC086] text-[#1A1208]"
                                  : "border border-white/15 text-white/75 hover:text-white"
                              }`}
                            >
                              ✓ Saya Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => setRsvpChoice("doa")}
                              className={`rounded-lg py-1.5 text-[10px] font-bold transition cursor-pointer ${
                                rsvpChoice === "doa"
                                  ? "bg-[#DFC086] text-[#1A1208]"
                                  : "border border-white/15 text-white/75 hover:text-white"
                              }`}
                            >
                              Kirim Doa
                            </button>
                          </div>
                          <p className="text-[9.5px] text-white/70">
                            {rsvpChoice === "hadir"
                              ? "Tercatat hadir — tampil live di dashboard mempelai."
                              : "Ucapan & doa tersimpan di buku tamu digital."}
                          </p>
                        </div>

                        <Link
                          href={active.previewHref}
                          target="_blank"
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-2 text-[10.5px] font-bold text-[#1B1412] transition hover:bg-white"
                        >
                          Coba RSVP Langsung <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Interactive Bottom Segmented Bar inside Phone */}
                  <div className="relative z-20 px-4 pb-3.5 pt-1">
                    <div className="grid grid-cols-3 gap-1 rounded-full border border-white/15 bg-black/55 p-1 backdrop-blur-md">
                      {[
                        { id: "cover" as const, label: "Sampul", icon: BookOpen },
                        { id: "schedule" as const, label: "Acara", icon: Calendar },
                        { id: "rsvp" as const, label: "QR & RSVP", icon: QrCode },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isOn = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-1 rounded-full py-1.5 text-[9.5px] font-bold transition cursor-pointer ${
                              isOn
                                ? "bg-white text-[#1A1412]"
                                : "text-white/75 hover:text-white"
                            }`}
                          >
                            <Icon size={10} />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle interactive hint below phone */}
            <p
              className="mt-4 text-center text-[11.5px]"
              style={{ color: "var(--saas-muted)" }}
            >
              Klik tab di layar HP untuk simulasi, atau tekan{" "}
              <Link
                href={active.previewHref}
                target="_blank"
                className="font-bold underline-offset-4 hover:underline"
                style={{ color: "var(--saas-ink)" }}
              >
                Buka Undangan Penuh
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
