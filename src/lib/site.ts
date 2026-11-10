/**
 * Konfigurasi situs yang dipakai di banyak tempat. Satu sumber supaya nomor
 * kontak dan URL tidak ditulis ulang di tiap file.
 */

const DEFAULT_APP_URL = 'https://ruanghadir.net';

/** Nomor WhatsApp admin dalam format internasional tanpa "+" (mis. 6281234567890). */
function adminWhatsApp(): string {
  const raw = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '';
  const digits = raw.replace(/\D/g, '');
  // Belum dikonfigurasi: kembalikan string kosong; wa.me tanpa nomor membuka pemilih kontak.
  return digits;
}

export const SITE = {
  name: 'ruanghadir.net',
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, ''),
  adminWhatsApp: adminWhatsApp(),
} as const;
