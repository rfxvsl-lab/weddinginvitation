"use client";
import React from "react";
import { MessageCircle, Wallet, Timer, CalendarPlus, CheckCheck, LayoutGrid, QrCode } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { QrMock } from "@/components/saas/SaasHero";

export function SaasFeatures() {
  return (
    <section id="fitur" className="saas-shell pt-24">
      <div className="max-w-[620px]">
        <p className="saas-kicker">Fitur unggulan</p>
        <h2 className="mt-4 text-[32px] leading-[1.1] sm:text-[40px]">
          Semua yang dibutuhkan, dalam{" "}
          <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>satu undangan</span>.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="saas-card saas-card-hover p-6 lg:col-span-2">
          <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <span className="saas-icon-box"><MessageCircle size={20} /></span>
              <h3 className="mt-4 text-[17px] font-extrabold">WhatsApp Blast Otomatis</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
                Undangan personal per tamu lengkap dengan sapaan nama. Pantau status terkirim &amp; dibuka real-time.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="saas-progress w-36"><span style={{ width: "98.4%" }} /></div>
                <span className="tabular text-[12.5px] font-extrabold" style={{ color: "var(--saas-wine)" }}>98,4% terkirim</span>
              </div>
            </div>
            <div className="w-full shrink-0 sm:w-[236px]">
              <div className="rounded-2xl border p-3.5" style={{ borderColor: "var(--saas-line)", background: "var(--saas-bg)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--saas-muted)" }}>Kepada Yth.</p>
                <p className="mt-0.5 text-[13px] font-extrabold">Bpk. Ahmad Fauzi &amp; Keluarga</p>
                <p className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--saas-ink-2)" }}>
                  Dengan hormat, kami mengundang Bapak/Ibu hadir di acara pernikahan kami…
                </p>
                <p className="mt-2 flex items-center justify-end gap-1 text-[10.5px] font-bold" style={{ color: "var(--saas-green)" }}>
                  <CheckCheck size={13} /> Terkirim 10.02
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="saas-card saas-card-hover p-6">
          <span className="saas-icon-box"><Wallet size={20} /></span>
          <h3 className="mt-4 text-[17px] font-extrabold">Amplop Digital &amp; QRIS</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
            QRIS dinamis, transfer multi-bank, e-wallet, plus alamat kado fisik.
          </p>
          <p className="saas-statnum mt-4 text-[28px]" style={{ color: "var(--saas-wine)" }}>Rp 38,4 jt</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["BCA", "Mandiri", "BRI", "QRIS"].map((b) => (
              <span key={b} className="rounded-full border px-2.5 py-1 text-[10.5px] font-bold" style={{ borderColor: "var(--saas-line-strong)", color: "var(--saas-ink-2)" }}>{b}</span>
            ))}
          </div>
        </div>

        <div className="saas-card saas-card-hover p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="saas-icon-box"><QrCode size={20} /></span>
            <QrMock size={52} />
          </div>
          <h3 className="mt-4 text-[17px] font-extrabold">QR Check-in</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
            Tiap tamu punya QR unik. Panitia cukup scan pakai HP di meja resepsionis.
          </p>
          <p className="mt-3 flex items-center gap-2 text-[12.5px] font-extrabold" style={{ color: "var(--saas-green)" }}>
            <CheckCheck size={14} /> 0,8 detik / tamu · 315 terverifikasi
          </p>
        </div>

        <div className="saas-card saas-card-hover p-6 lg:col-span-2">
          <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="saas-icon-box"><LayoutGrid size={20} /></span>
              <h3 className="mt-4 text-[17px] font-extrabold">Katalog Tema Eksklusif</h3>
              <p className="mt-1.5 max-w-[40ch] text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
                Kurasi tema mewah RFX Visual — minimalis, adat nusantara, hingga luxury cinematic.
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex -space-x-2">
                {DEFAULT_THEMES.slice(0, 5).map((t) => (
                  <span key={t.id} className="h-9 w-9 rounded-full border-2 border-white" style={{ background: `linear-gradient(135deg, ${t.bgPatternHex}, ${t.accentHex})` }} />
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-extrabold text-white" style={{ background: "var(--saas-ink)" }}>40+</span>
              </div>
              <p className="mt-2 text-[11.5px] font-semibold" style={{ color: "var(--saas-muted)" }}>tema eksklusif siap pakai</p>
            </div>
          </div>
        </div>

        <div className="saas-card saas-card-hover p-6">
          <span className="saas-icon-box"><Timer size={20} /></span>
          <h3 className="mt-4 text-[17px] font-extrabold">Countdown H-12</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
            Hitung mundur presisi hingga detik akad &amp; resepsi.
          </p>
          <div className="mt-4 flex items-center gap-1.5 tabular">
            {["12", "04", "33"].map((v, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="font-extrabold" style={{ color: "var(--saas-faint)" }}>:</span>}
                <span className="rounded-xl px-2.5 py-1.5 text-[15px] font-extrabold text-white" style={{ background: "var(--saas-ink)" }}>{v}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="saas-card saas-card-hover p-6 lg:col-span-2">
          <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="saas-icon-box"><CalendarPlus size={20} /></span>
              <h3 className="mt-4 text-[17px] font-extrabold">Pengingat Kalender</h3>
              <p className="mt-1.5 max-w-[40ch] text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
                Tamu simpan tanggal dengan satu klik ke Google &amp; Apple Calendar.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border p-3.5" style={{ borderColor: "var(--saas-line)" }}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--saas-muted)" }}>Desember 2025</p>
              <div className="grid w-[176px] grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <span
                    key={d}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold"
                    style={d === 28 ? { background: "var(--saas-wine)", color: "#fff" } : { background: "var(--saas-gold-soft)", color: "var(--saas-muted)" }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
