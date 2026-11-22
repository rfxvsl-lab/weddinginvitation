import React from 'react';
import { Send, Wallet, QrCode, Images, CalendarDays, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Send,
    title: 'Nama tamu di setiap tautan',
    body: 'Sampul undangan menyapa tamu dengan namanya. Pesan WhatsApp pengantar disiapkan otomatis untuk setiap orang.',
  },
  {
    icon: CalendarDays,
    title: 'Jadwal, peta, dan pengingat',
    body: 'Hitung mundur acara, petunjuk arah Google Maps, dan tombol simpan ke kalender untuk akad maupun resepsi.',
  },
  {
    icon: Wallet,
    title: 'Amplop digital',
    body: 'Tampilkan rekening bank, e-wallet, QRIS, dan alamat kirim kado dengan tombol salin.',
  },
  {
    icon: Images,
    title: 'Galeri, kisah, dan musik',
    body: 'Foto prewedding, linimasa perjalanan berdua, dan lagu latar yang diputar saat undangan dibuka.',
  },
  {
    icon: QrCode,
    title: 'Check-in QR di lokasi',
    body: 'Tamu yang sudah konfirmasi mendapat kode QR. Penerima tamu memindainya dari HP untuk mencatat kehadiran dan jumlah orang.',
  },
  {
    icon: BarChart3,
    title: 'Rekap kehadiran',
    body: 'Lihat siapa yang sudah membuka undangan, siapa yang hadir, dan ucapan yang masuk. Ekspor daftar ke CSV atau PDF.',
  },
];

export function LandingFeatures() {
  return (
    <section id="fitur" className="scroll-mt-20 border-t border-[var(--rh-line)]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-[36px] leading-[1.08] sm:text-[44px]">Semua yang dibutuhkan dari undangan sampai hari H.</h2>
          <p className="mt-4 max-w-[420px] text-[16px] leading-[1.65] text-[var(--rh-ink-2)]">
            Tidak ada fitur yang dikunci. Mempelai mengelola semuanya dari HP; tamu cukup membuka tautan tanpa memasang aplikasi.
          </p>
        </div>

        <dl className="grid gap-x-10 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-t border-[var(--rh-line)] py-7">
              <dt className="flex items-center gap-3">
                <Icon size={20} strokeWidth={1.7} className="shrink-0 text-[var(--rh-wine)]" aria-hidden />
                <span className="text-[16.5px] font-semibold text-[var(--rh-ink)]">{title}</span>
              </dt>
              <dd className="mt-2.5 text-[15px] leading-[1.65] text-[var(--rh-ink-2)]">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
