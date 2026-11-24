import type { Guest } from '../types';

/** Formatting check only: this cannot verify that a number has a WhatsApp account. */
export function normalizeWhatsAppPhone(value: string): string | null {
  const input = value.trim();
  if (!/^\+?[\d\s().-]+$/.test(input)) return null;
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return /^[1-9]\d{6,14}$/.test(digits) ? digits : null;
}

/** Legacy status mixes sharing, RSVP and check-in, so it cannot prove delivery or attendance. */
export function guestRecordLabel(status: Guest['status']): string {
  if (status === 'Opened') return 'Catatan interaksi';
  if (status === 'Sent') return 'Catatan berbagi';
  return 'Draf';
}
