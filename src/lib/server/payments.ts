import 'server-only';
import { NextResponse } from 'next/server';

/**
 * Alur pembayaran Pakasir dinonaktifkan sejak model bisnis menjadi Gratis + Enterprise.
 * Kode tetap disimpan; aktifkan kembali dengan ENV `PAYMENTS_ENABLED=true`.
 */
export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === 'true';
}

export function paymentsDisabledResponse() {
  return NextResponse.json(
    { error: 'Pembayaran tidak tersedia. Seluruh fitur RuangHadir kini gratis.' },
    { status: 410 }
  );
}
