/**
 * socialProof.ts — Sumber tunggal angka sosial (social proof) untuk landing page.
 *
 * ⚠️ PENTING: nilai di bawah adalah PLACEHOLDER. Sebelum dipakai produksi,
 * ganti dengan data asli dari database. Menampilkan angka, rating, atau
 * testimoni yang tidak benar sebagai fakta berisiko melanggar UU No. 8/1999
 * tentang Perlindungan Konsumen, dan kebijakan iklan platform.
 *
 * Set `VERIFIED = true` HANYA setelah semua angka di bawah sudah diverifikasi
 * dari data nyata. Selama false, komponen akan menampilkan label netral
 * ("Data sedang diverifikasi") alih-alih mengklaim angka.
 */

export const VERIFIED = false;

/** Label yang dipakai selama data belum diverifikasi. */
export const UNVERIFIED_LABEL = "Data sedang diverifikasi";

export interface SocialStat {
  value: string;
  label: string;
}

/** Angka ringkas untuk strip statistik di bawah hero. */
export const SOCIAL_STATS: SocialStat[] = [
  { value: "50.214", label: "Undangan terkirim" },
  { value: "12.400", label: "Pasangan terdaftar" },
  { value: "0,8 dtk", label: "Check-in per tamu" },
  { value: "4,9/5", label: "Rating kepuasan" },
];

/** Rating agregat yang ditampilkan di hero. */
export const RATING = {
  score: "4,9/5,0",
  reviewCount: 2180,
};

/** Angka pada kartu klaim link di section CTA. */
export const CTA_FACTS = {
  setupDuration: "9 menit 42 detik",
  newCouplesThisMonth: 1240,
};

/**
 * Testimoni. Setiap entri harus berasal dari pelanggan nyata yang memberi izin,
 * dan ditampilkan apa adanya — jangan menyunting isi kutipan.
 */
export interface Testimonial {
  quote: string;
  name: string;
  venue: string;
  initials: string;
  color: string;
  wide?: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "850 tamu hadir tanpa antre berkat QR check-in. Panitia kami cuma tiga orang dan semua tercatat rapi.",
    name: "Amanda & Rendy",
    venue: "Uluwatu, Bali",
    initials: "AR",
    color: "var(--saas-wine)",
    wide: true,
  },
  {
    quote: "Jadi dalam 10 menit dari HP. Amplop QRIS-nya praktis, tanpa potongan.",
    name: "Clarissa & Daniel",
    venue: "Ritz-Carlton, Jakarta",
    initials: "CD",
    color: "var(--saas-gold)",
  },
  {
    quote: "500+ undangan personal via WA blast tanpa satu pun kendala.",
    name: "Sarah & Kevin",
    venue: "Dago, Bandung",
    initials: "SK",
    color: "var(--saas-ink)",
  },
  {
    quote: "Tema luxury-nya bikin semua tamu nanyain kami bikin di mana.",
    name: "Dinda & Fajar",
    venue: "Silver Ballroom, Surabaya",
    initials: "DF",
    color: "var(--saas-wine-2)",
    wide: true,
  },
];
