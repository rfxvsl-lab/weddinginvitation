"use client";
import React from "react";
import { CheckCheck } from "lucide-react";
import { DEFAULT_THEMES } from "@/data/defaultData";
import { QrMock } from "@/components/saas/SaasHero";

/**
 * Fitur di halaman depan. Setiap kalimat di sini harus cocok dengan perilaku
 * aplikasi (lihat komentar di tiap kartu). Tanpa angka hiasan.
 */

const SHOWCASE_THEMES = ["rfx-dark", "royal-arabian", "javanese-classic"]
  .map((id) => DEFAULT_THEMES.find((t) => t.id === id))
  .filter((t): t is (typeof DEFAULT_THEMES)[number] => Boolean(t));

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[17px] font-extrabold">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--saas-ink-2)" }}>
        {children}
      </p>
    </div>
  );
}

export function SaasFeatures() {
  return (
    <section id="fitur" className="saas-shell pt-24">
      <h2 className="max-w-[620px] text-[32px] leading-[1.1] sm:text-[40px]">Yang didapat tamu, dan yang didapat kalian</h2>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {/* PublishModal / GuestManager: tautan ?to=Nama&code=…, kirim via api.whatsapp.com, status Draft → Terkirim */}
        <div className="saas-card p-6 lg:col-span-2">
          <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Feature title="Tautan personal untuk setiap tamu">
                Sampul undangan menyapa tamu dengan namanya. Dari daftar tamu, kirim lewat WhatsApp dengan satu ketuk per
                tamu; statusnya tercatat sebagai Terkirim, dan berubah lagi saat tamu mengisi konfirmasi kehadiran.
              </Feature>
            </div>
            <figure className="w-full shrink-0 sm:w-[240px]">
              <div className="rounded-2xl border p-3.5" style={{ borderColor: "var(--saas-line)", background: "var(--saas-bg)" }}>
                <p className="text-[12px] leading-snug" style={{ color: "var(--saas-ink-2)" }}>
                  Kepada Yth. Bapak Ahmad Fauzi, perkenankan kami mengundang Bapak untuk hadir dan memberikan doa restu…
                </p>
                <p className="mt-2 truncate text-[11px] font-semibold" style={{ color: "var(--saas-wine)" }}>
                  ruanghadir.net/kharis-lia?to=Ahmad+Fauzi
                </p>
                <p className="mt-2 flex items-center justify-end gap-1 text-[11px] font-bold" style={{ color: "var(--saas-green)" }}>
                  <CheckCheck size={13} aria-hidden /> Terkirim
                </p>
              </div>
              <figcaption className="mt-2 text-[11.5px]" style={{ color: "var(--saas-muted)" }}>
                Contoh pesan dari templat formal
              </figcaption>
            </figure>
          </div>
        </div>

        {/* GuestPassSection + QrCheckInScanner; PACKAGE_LIMITS.canQR hanya premium & luxury */}
        <div className="saas-card p-6">
          <QrMock size={52} />
          <div className="mt-4">
            <Feature title="Tiket QR di meja penerima tamu">
              Tamu memasukkan kode undangannya, konfirmasi hadir dan jumlah orang, lalu mendapat QR. Panitia memindainya
              dengan kamera HP. Tersedia di paket Premium dan Luxury.
            </Feature>
          </div>
        </div>

        {/* LiveMomentsDock: foto (dikompres di HP) dan ucapan suara MAX_VOICE_SEC = 60 */}
        <div className="saas-card p-6">
          <Feature title="Foto dan ucapan suara dari tamu">
            Tamu mengunggah foto langsung dari HP ke dinding momen, atau merekam ucapan suara hingga 60 detik.
          </Feature>
        </div>

        {/* DigitalGift.type: bank | e-wallet | address */}
        <div className="saas-card p-6">
          <Feature title="Amplop digital">
            Cantumkan rekening bank, e-wallet, dan alamat kirim kado. Tamu menyalin nomornya dengan satu ketuk.
          </Feature>
        </div>

        {/* countdownDate + /api/calendar/[slug] (file .ics) */}
        <div className="saas-card p-6">
          <Feature title="Hitung mundur dan pengingat kalender">
            Undangan menampilkan hitung mundur ke hari acara. Tamu bisa menyimpan jadwalnya sebagai file kalender
            untuk Google Calendar, Apple, atau Outlook.
          </Feature>
        </div>

        {/* DEFAULT_THEMES + screenshot di public/assets/themes */}
        <div className="saas-card p-6 lg:col-span-3">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[44ch]">
              <Feature title={`${DEFAULT_THEMES.length} tema, termasuk adat Jawa dan nuansa Arab`}>
                Teks, foto, dan musik bisa diganti dari editor. Pilihan tema dan sumber musik mengikuti paket.
              </Feature>
            </div>
            <div className="flex gap-3" aria-hidden>
              {SHOWCASE_THEMES.map((t) => (
                <img
                  key={t.id}
                  src={`/assets/themes/${t.id}.webp`}
                  width={400}
                  height={866}
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="h-[148px] w-[72px] rounded-xl border object-cover object-top"
                  style={{ borderColor: "var(--saas-line)" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
