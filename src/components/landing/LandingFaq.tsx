import React from 'react';
import { Plus } from 'lucide-react';
import { ENTERPRISE_CONTACT_EMAIL } from '@/lib/packageLimits';

const FAQS = [
  {
    q: 'Benarkah semua fitur gratis?',
    a: 'Ya. Akun gratis mencakup seluruh tema, tamu tanpa batas, RSVP, amplop digital, check-in QR, galeri, musik, serta ekspor CSV/PDF tanpa watermark, untuk hingga 3 undangan aktif.',
  },
  {
    q: 'Apakah tamu perlu memasang aplikasi?',
    a: 'Tidak. Tamu cukup membuka tautan dari WhatsApp di browser HP atau komputer.',
  },
  {
    q: 'Bisakah data diubah setelah undangan dibagikan?',
    a: 'Bisa kapan saja dari dashboard. Jadwal, foto, musik, bahkan tema bisa diganti dan langsung tampil di tautan yang sama.',
  },
  {
    q: 'Siapa yang bisa melihat daftar tamu dan nomor HP?',
    a: 'Hanya Anda sebagai pemilik undangan. Tamu hanya melihat nama mereka sendiri, dan undangan yang belum dipublikasikan tidak bisa dibuka orang lain.',
  },
  {
    q: 'Amplop digital mendukung metode apa saja?',
    a: 'Rekening bank (BCA, Mandiri, BRI, BNI, dan lainnya), e-wallet, QRIS, serta alamat pengiriman kado fisik.',
  },
  {
    q: 'Bagaimana cara mendapatkan akses Enterprise?',
    a: `Kirim email ke ${ENTERPRISE_CONTACT_EMAIL}. Setelah disetujui, kami menerbitkan kode akses yang terikat pada domain email perusahaan Anda untuk masuk lewat portal Enterprise.`,
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-[var(--rh-line)]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
        <h2 className="text-[36px] leading-[1.08] sm:text-[44px]">Pertanyaan yang sering diajukan</h2>
        <div className="border-b border-[var(--rh-line)]">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group border-t border-[var(--rh-line)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] font-semibold text-[var(--rh-ink)] [&::-webkit-details-marker]:hidden">
                {q}
                <Plus
                  size={18}
                  className="shrink-0 text-[var(--rh-wine)] transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="max-w-[640px] pb-6 text-[15px] leading-[1.7] text-[var(--rh-ink-2)]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
