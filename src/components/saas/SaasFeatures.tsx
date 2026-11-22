"use client";
import React from "react";
import {
  MessageCircle,
  Wallet,
  Timer,
  CalendarPlus,
  CheckCheck,
  QrCode,
  Camera,
  Music2,
  Copy,
} from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { QrMock } from "@/components/saas/SaasHero";

export function SaasFeatures() {
  return (
    <section id="fitur" className="saas-shell pt-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-[600px]">
          <p className="saas-kicker">Fitur lengkap &amp; modern</p>
          <h2 className="mt-3.5 text-[32px] leading-[1.08] sm:text-[42px]">
            Semua kebutuhan hari bahagia, dalam{" "}
            <span className="saas-serif-i" style={{ color: "var(--saas-wine)" }}>
              satu tautan elegan
            </span>
            .
          </h2>
        </div>
        <p
          className="max-w-[38ch] text-[14px] leading-relaxed"
          style={{ color: "var(--saas-muted)" }}
        >
          Dirancang agar mudah dikelola dari ponsel mempelai dan nyaman dibuka
          oleh tamu lintas usia.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Link Personal & WhatsApp Share */}
        <div className="saas-card saas-card-hover p-6 sm:p-7 lg:col-span-2">
          <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <span className="saas-icon-box">
                <MessageCircle size={20} />
              </span>
              <h3 className="mt-4 text-[18px] font-extrabold">
                Nama Tamu Personal &amp; Kirim WhatsApp
              </h3>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: "var(--saas-ink-2)" }}
              >
                Setiap tamu menerima tautan dengan sapaan nama khusus di sampul
                undangan. Salin pesan pengantar otomatis dan kirim lewat WhatsApp
                dalam sekali tap.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Sapaan Otomatis", "Template Pesan WA", "Kelola Daftar Tamu"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold"
                      style={{
                        borderColor: "var(--saas-line)",
                        background: "var(--saas-bg)",
                        color: "var(--saas-ink-2)",
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="w-full shrink-0 sm:w-[254px]">
              <div
                className="rounded-2xl border p-4 shadow-sm"
                style={{
                  borderColor: "var(--saas-line)",
                  background: "var(--saas-bg)",
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--saas-muted)" }}
                  >
                    Pratinjau Pesan
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9.5px] font-bold"
                    style={{
                      background: "var(--saas-success-soft)",
                      color: "var(--saas-success)",
                    }}
                  >
                    Siap Kirim
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] font-extrabold">
                  Kepada Yth. Bpk. Ahmad Fauzi
                </p>
                <p
                  className="mt-1.5 text-[12px] leading-relaxed"
                  style={{ color: "var(--saas-ink-2)" }}
                >
                  Dengan memohon rahmat Tuhan, kami mengundang Bapak/Ibu hadir
                  di hari bahagia kami…
                </p>
                <div
                  className="mt-3 flex items-center justify-between rounded-xl border bg-white px-2.5 py-1.5 text-[10.5px] font-mono"
                  style={{
                    borderColor: "var(--saas-line)",
                    color: "var(--saas-wine)",
                  }}
                >
                  <span className="truncate">ruanghadir.net/kharis-lia?to=Ahmad</span>
                  <CheckCheck
                    size={13}
                    className="shrink-0"
                    style={{ color: "var(--saas-success)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Amplop Digital */}
        <div className="saas-card saas-card-hover flex flex-col justify-between p-6 sm:p-7">
          <div>
            <span className="saas-icon-box">
              <Wallet size={20} />
            </span>
            <h3 className="mt-4 text-[18px] font-extrabold">
              Amplop Digital &amp; Alamat Kado
            </h3>
            <p
              className="mt-2 text-[14px] leading-relaxed"
              style={{ color: "var(--saas-ink-2)" }}
            >
              Cantumkan rekening bank, e-wallet, QRIS, maupun alamat pengiriman
              kado fisik dengan tombol salin nomor otomatis.
            </p>
          </div>
          <div className="mt-5 space-y-2.5">
            <div
              className="flex items-center justify-between rounded-xl border px-3.5 py-2.5"
              style={{
                borderColor: "var(--saas-line)",
                background: "var(--saas-bg)",
              }}
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--saas-muted)" }}
                >
                  Bank BCA
                </p>
                <p className="font-mono text-[12.5px] font-bold">
                  8415 •••• 6420
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                style={{
                  background: "var(--saas-primary-soft)",
                  color: "var(--saas-primary)",
                }}
              >
                <Copy size={11} /> Salin
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["BCA", "Mandiri", "BRI", "E-Wallet", "QRIS"].map((bank) => (
                <span
                  key={bank}
                  className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold"
                  style={{
                    borderColor: "var(--saas-line-strong)",
                    color: "var(--saas-ink-2)",
                  }}
                >
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: QR Check-in */}
        <div className="saas-card saas-card-hover flex flex-col justify-between p-6 sm:p-7">
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="saas-icon-box">
                <QrCode size={20} />
              </span>
              <div
                className="rounded-2xl border p-2"
                style={{
                  borderColor: "var(--saas-line)",
                  background: "var(--saas-bg)",
                }}
              >
                <QrMock size={48} />
              </div>
            </div>
            <h3 className="mt-4 text-[18px] font-extrabold">
              Buku Tamu &amp; QR Check-in
            </h3>
            <p
              className="mt-2 text-[14px] leading-relaxed"
              style={{ color: "var(--saas-ink-2)" }}
            >
              Setiap tamu memiliki kode QR unik. Panitia cukup pindai dari
              kamera HP untuk mencatat kehadiran tanpa antre panjang.
            </p>
          </div>
          <p
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold"
            style={{ color: "var(--saas-success)" }}
          >
            <CheckCheck size={14} /> Rekap kehadiran langsung tersimpan
          </p>
        </div>

        {/* Card 4: Musik, Galeri & Kisah Cinta */}
        <div className="saas-card saas-card-hover p-6 sm:p-7 lg:col-span-2">
          <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[44ch]">
              <div className="flex items-center gap-2">
                <span className="saas-icon-box">
                  <Camera size={20} />
                </span>
                <span className="saas-icon-box">
                  <Music2 size={18} />
                </span>
              </div>
              <h3 className="mt-4 text-[18px] font-extrabold">
                Galeri Prewedding, Kisah Cinta &amp; Musik Latar
              </h3>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: "var(--saas-ink-2)" }}
              >
                Tampilkan foto terbaik, linimasa perjalanan cinta, dinding foto
                tamu, dan iringi halaman undangan dengan lagu pilihan kalian.
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex -space-x-2">
                {DEFAULT_THEMES.slice(0, 6).map((t) => (
                  <span
                    key={t.id}
                    title={t.name}
                    className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${t.bgPatternHex}, ${t.accentHex})`,
                    }}
                  />
                ))}
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10.5px] font-extrabold text-white shadow-sm"
                  style={{ background: "var(--saas-ink)" }}
                >
                  {DEFAULT_THEMES.length}
                </span>
              </div>
              <p
                className="mt-2.5 text-[12px] font-semibold"
                style={{ color: "var(--saas-muted)" }}
              >
                {DEFAULT_THEMES.length} palet tema kurasi siap pakai
              </p>
            </div>
          </div>
        </div>

        {/* Card 5: Hitung Mundur */}
        <div className="saas-card saas-card-hover p-6 sm:p-7">
          <span className="saas-icon-box">
            <Timer size={20} />
          </span>
          <h3 className="mt-4 text-[18px] font-extrabold">
            Hitung Mundur Acara
          </h3>
          <p
            className="mt-2 text-[14px] leading-relaxed"
            style={{ color: "var(--saas-ink-2)" }}
          >
            Countdown otomatis menuju waktu akad nikah dan resepsi secara
            presisi.
          </p>
          <div className="mt-5 flex items-center gap-2 tabular">
            {[
              ["14", "Hari"],
              ["08", "Jam"],
              ["30", "Mnt"],
            ].map(([val, lbl]) => (
              <div
                key={lbl}
                className="flex flex-1 flex-col items-center rounded-xl py-2 text-white"
                style={{ background: "var(--saas-ink)" }}
              >
                <span className="text-[16px] font-extrabold leading-tight">
                  {val}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-stone-300">
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Google Maps & Pengingat Kalender */}
        <div className="saas-card saas-card-hover p-6 sm:p-7 lg:col-span-2">
          <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[44ch]">
              <span className="saas-icon-box">
                <CalendarPlus size={20} />
              </span>
              <h3 className="mt-4 text-[18px] font-extrabold">
                Navigasi Google Maps &amp; Simpan Tanggal
              </h3>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: "var(--saas-ink-2)" }}
              >
                Tamu langsung diarahkan ke lokasi acara lewat Google Maps dan
                bisa menyimpan jadwal akad serta resepsi ke kalender ponselnya.
              </p>
            </div>
            <div
              className="shrink-0 rounded-2xl border p-4"
              style={{
                borderColor: "var(--saas-line)",
                background: "var(--saas-bg)",
              }}
            >
              <p
                className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ color: "var(--saas-muted)" }}
              >
                Agustus 2026
              </p>
              <div className="grid w-[182px] grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <span
                    key={d}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9.5px] font-bold"
                    style={
                      d === 8
                        ? { background: "var(--saas-wine)", color: "#fff" }
                        : {
                            background: "var(--saas-gold-soft)",
                            color: "var(--saas-muted)",
                          }
                    }
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
