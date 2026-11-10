/**
 * socialProof.ts — angka sosial dan testimoni untuk landing page.
 *
 * Isi HANYA dengan data nyata:
 * - Statistik: ambil dari database (mis. jumlah undangan terbit), bukan perkiraan.
 * - Testimoni: kutipan asli dari pelanggan yang sudah memberi izin tertulis,
 *   ditampilkan apa adanya (jangan disunting).
 *
 * Selama daftar di bawah kosong, bagian terkait tidak dirender sama sekali —
 * tidak ada label pengganti. Menampilkan angka atau testimoni karangan sebagai
 * fakta melanggar UU No. 8/1999 tentang Perlindungan Konsumen.
 *
 * Riwayat: versi sebelumnya berisi angka placeholder (50.214 undangan, 12.400
 * pasangan, rating 4,9/5) dan empat testimoni contoh yang ditampilkan sebagai
 * fakta. Semuanya dihapus.
 */

export interface SocialStat {
  value: string;
  label: string;
  /** Asal angka, mis. "Tabel invitations, is_published = 1, per 1 Nov 2026" */
  source: string;
}

/** Statistik ringkas. Kosong = strip statistik tidak ditampilkan. */
export const SOCIAL_STATS: SocialStat[] = [];

export interface Testimonial {
  quote: string;
  /** Nama sesuai izin pelanggan */
  name: string;
  /** Opsional; hanya jika pelanggan mengizinkan */
  location?: string;
  /** Tanggal izin tertulis diberikan (YYYY-MM-DD) */
  consentDate: string;
}

/** Testimoni. Kosong = bagian testimoni dan tautan navigasinya disembunyikan. */
export const TESTIMONIALS: Testimonial[] = [];
