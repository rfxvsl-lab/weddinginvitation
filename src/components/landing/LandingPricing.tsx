import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { ENTERPRISE_CONTACT_EMAIL } from '@/lib/packageLimits';

const FREE = [
  'Semua 9 tema, termasuk Storybook 3D',
  'Tamu dan nama personal tanpa batas',
  'RSVP, buku ucapan, dan amplop digital',
  'Check-in QR serta ekspor CSV/PDF',
  'Hingga 3 undangan aktif, tanpa watermark',
];

const ENTERPRISE = [
  'Proyek undangan tanpa batas untuk klien',
  'Video undangan HD 9:16, 1:1, dan 16:9',
  'Akun tim dengan email perusahaan',
  'Domain sendiri dan branding khusus',
  'Pendampingan teknis prioritas',
];

export function LandingPricing() {
  return (
    <section id="harga" className="scroll-mt-20 border-t border-[var(--rh-line)] bg-[var(--rh-paper)]">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <div className="max-w-[640px]">
          <h2 className="text-[36px] leading-[1.08] sm:text-[44px]">Gratis untuk pasangan. Enterprise untuk vendor.</h2>
          <p className="mt-4 text-[16px] leading-[1.65] text-[var(--rh-ink-2)]">
            Tidak ada uji coba yang berakhir atau fitur yang tiba-tiba berbayar. Wedding organizer dan agensi acara bisa memakai paket Enterprise.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="flex flex-col rounded-[16px] border border-[var(--rh-line)] bg-[var(--rh-ivory)] p-7 sm:p-9">
            <h3 className="text-[18px]">Gratis</h3>
            <p className="mt-1 text-[14px] text-[var(--rh-muted)]">Untuk pasangan dan acara pribadi</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="rh-display text-[56px] leading-none">Rp0</span>
              <span className="text-[14px] text-[var(--rh-muted)]">selamanya</span>
            </p>
            <ul className="mt-7 flex flex-1 flex-col gap-3">
              {FREE.map((f) => (
                <li key={f} className="flex gap-3 text-[15px] text-[var(--rh-ink-2)]">
                  <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--rh-gold)]" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth?mode=register" className="saas-btn-primary mt-9 w-full text-[15px]">
              Buat undangan gratis
            </Link>
          </article>

          <article className="flex flex-col rounded-[16px] bg-[var(--rh-ink)] p-7 text-[#EFE6DC] sm:p-9">
            <h3 className="text-[18px] !text-white">Enterprise</h3>
            <p className="mt-1 text-[14px] text-[#BFAFA8]">Untuk wedding organizer, agensi, dan korporat</p>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="rh-display text-[56px] leading-none text-white">Custom</span>
              <span className="text-[14px] text-[#BFAFA8]">sesuai skala</span>
            </p>
            <ul className="mt-7 flex flex-1 flex-col gap-3">
              {ENTERPRISE.map((f) => (
                <li key={f} className="flex gap-3 text-[15px]">
                  <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-[var(--rh-gold)]" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=${encodeURIComponent('Paket Enterprise RuangHadir')}`}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] bg-[var(--rh-gold)] px-5 text-[15px] font-semibold text-[var(--rh-ink)] transition-colors hover:bg-[#C9AC77]"
              >
                Hubungi tim Enterprise
              </a>
              <Link
                href="/auth?mode=enterprise"
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border border-[#5A464B] px-5 text-[15px] font-semibold text-white transition-colors hover:border-white"
              >
                Masuk dengan kode akses
              </Link>
            </div>
            <p className="mt-4 text-[13px] text-[#BFAFA8]">{ENTERPRISE_CONTACT_EMAIL}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
