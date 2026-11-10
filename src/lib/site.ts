/**
 * Konfigurasi situs yang dipakai di banyak tempat. Satu sumber supaya kontak,
 * jam layanan, dan URL tidak ditulis ulang (dan tidak saling bertentangan)
 * di landing, FAQ, halaman legal, dan halaman undangan.
 */

const DEFAULT_APP_URL = 'https://ruanghadir.net';

/** Nomor WhatsApp admin, format internasional tanpa "+". */
function adminWhatsApp(): string {
  const digits = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '').replace(/\D/g, '');
  // Nomor yang tercantum di halaman Kebijakan Pengembalian (085731021469).
  return digits || '6285731021469';
}

export const SITE = {
  name: 'RuangHadir.net',
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, ''),
  adminWhatsApp: adminWhatsApp(),
  instagram: 'ruanghadir_net',
  /** Sama dengan halaman Kebijakan Pengembalian. Ubah di sini saja. */
  supportHours: 'Senin–Sabtu, 09.00–21.00 WIB',
  /** Garansi sesuai halaman Kebijakan Pengembalian, bagian 1. */
  refundDays: 7,
} as const;

export function whatsappLink(text: string): string {
  return `https://wa.me/${SITE.adminWhatsApp}?text=${encodeURIComponent(text)}`;
}
