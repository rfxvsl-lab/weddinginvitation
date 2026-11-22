import React from 'react';

const STEPS = [
  {
    title: 'Daftar dan pilih tema',
    body: 'Buat akun dengan email atau Google. Tautan undangan langsung jadi, misalnya ruanghadir.net/rian-salsa.',
  },
  {
    title: 'Isi data acara',
    body: 'Nama mempelai, jadwal akad dan resepsi, lokasi Google Maps, foto, musik, dan rekening amplop. Pratinjau berubah saat Anda mengetik.',
  },
  {
    title: 'Kirim ke setiap tamu',
    body: 'Masukkan daftar tamu, lalu kirim tautan bernama lewat WhatsApp. Konfirmasi kehadiran masuk ke dashboard secara langsung.',
  },
];

export function LandingSteps() {
  return (
    <section id="cara-kerja" className="scroll-mt-20">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
        <h2 className="max-w-[640px] text-[36px] leading-[1.08] sm:text-[44px]">
          Siap dibagikan dalam satu sore.
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-[var(--rh-ink)] pt-6">
              <span className="rh-display block text-[44px] leading-none text-[var(--rh-gold)]" aria-hidden>
                {i + 1}
              </span>
              <h3 className="mt-5 text-[18px]">{s.title}</h3>
              <p className="mt-2.5 text-[15px] leading-[1.65] text-[var(--rh-ink-2)]">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
