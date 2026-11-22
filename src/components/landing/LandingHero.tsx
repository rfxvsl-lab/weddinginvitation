import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { THEME_SHOTS } from './themeShots';

const FAN = [
  { id: 'royal-arabian', name: 'Royal Arabian Night', cls: 'rh-fan-left' },
  { id: 'javanese-classic', name: 'Javanese Classic', cls: 'rh-fan-right' },
  { id: 'storybook-interactive', name: 'Heirloom Storybook 3D', cls: 'rh-fan-center' },
];

const FACTS = ['Gratis, tanpa watermark', 'Link bernama untuk setiap tamu', 'RSVP & check-in QR di hari H'];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-28 lg:pt-16">
        <div className="max-w-[600px]">
          <h1 className="rh-display text-[44px] leading-[1.02] sm:text-[60px] lg:text-[68px]">
            Undangan digital seindah kartu cetak, semudah mengirim pesan.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.65] text-[var(--rh-ink-2)]">
            Pilih tema, isi data acara, lalu kirim tautan dengan nama setiap tamu lewat WhatsApp.
            Konfirmasi kehadiran, amplop digital, dan check-in di lokasi sudah termasuk.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth?mode=register" className="saas-btn-primary px-6 text-[15px] sm:!min-h-[50px]">
              Buat undangan gratis
            </Link>
            <Link href="/preview" className="saas-btn-outline px-6 text-[15px] sm:!min-h-[50px]">
              Lihat contoh undangan
            </Link>
          </div>

          <ul className="mt-9 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {FACTS.map((f) => (
              <li key={f} className="flex items-center gap-2 text-[14px] text-[var(--rh-ink-2)]">
                <Check size={16} strokeWidth={2.2} className="shrink-0 text-[var(--rh-gold)]" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Kipas kartu undangan — screenshot asli dari tema */}
        <div className="relative mx-auto h-[440px] w-full max-w-[520px] sm:h-[540px]" aria-label="Contoh tampilan tema undangan">
          {FAN.map((t) => (
            <Link
              key={t.id}
              href={`/preview/${t.id}`}
              className={`rh-fan-card ${t.cls} group`}
              aria-label={`Lihat tema ${t.name}`}
            >
              <Image
                src={THEME_SHOTS[t.id]}
                alt={`Tampilan sampul tema ${t.name}`}
                fill
                sizes="(max-width: 640px) 200px, 260px"
                className="object-cover object-top"
                priority
              />
            </Link>
          ))}

          <div className="rh-fan-tag" aria-hidden>
            <span className="block text-[11px] text-[var(--rh-muted)]">Kepada Yth.</span>
            <span className="block font-[family-name:var(--font-display)] text-[17px] leading-tight text-[var(--rh-ink)]">
              Keluarga Bpk. Hendra
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
