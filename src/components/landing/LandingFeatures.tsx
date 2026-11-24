import React from 'react';

const FEATURES = [
  {
    title: 'Nama tamu di setiap tautan',
    body: 'Sampul undangan menyapa tamu dengan namanya. Pesan WhatsApp pengantar disiapkan otomatis untuk setiap orang.',
  },
  {
    title: 'Jadwal, peta, dan pengingat',
    body: 'Hitung mundur acara, petunjuk arah Google Maps, dan tombol simpan ke kalender untuk akad maupun resepsi.',
  },
  {
    title: 'Amplop digital',
    body: 'Tampilkan rekening bank, dompet digital, QRIS, dan alamat kirim kado dengan tombol salin.',
  },
  {
    title: 'Galeri, kisah, dan musik',
    body: 'Foto prewedding, linimasa perjalanan berdua, dan lagu latar yang diputar saat undangan dibuka.',
  },
  {
    title: 'Check in QR di lokasi',
    body: 'Tamu yang sudah konfirmasi mendapat kode QR. Penerima tamu memindainya dari HP untuk mencatat kehadiran dan jumlah orang.',
  },
  {
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
          {FEATURES.map(({ title, body }, index) => (
            <div key={title} className="border-t border-[var(--rh-line)] py-7">
              <dt className="flex items-center gap-3">
                <span className="rh-feature-index" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
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
