/**
 * Pakasir Payment Gateway — Server-side Client Wrapper
 * Docs: https://app.pakasir.com
 */

import { PakasirClient } from 'pakasir-client';

if (!process.env.PAKASIR_PROJECT_SLUG || !process.env.PAKASIR_API_KEY) {
  console.warn(
    '[Pakasir] PAKASIR_PROJECT_SLUG atau PAKASIR_API_KEY belum dikonfigurasi. Payment gateway tidak akan berfungsi.'
  );
}

export const pakasir = new PakasirClient({
  project: process.env.PAKASIR_PROJECT_SLUG || '',
  apiKey: process.env.PAKASIR_API_KEY || '',
  // Hanya untuk staging/test: arahkan ke gateway tiruan. Kosongkan di production.
  ...(process.env.PAKASIR_BASE_URL ? { baseUrl: process.env.PAKASIR_BASE_URL } : {}),
});

/**
 * Generate a unique order ID for transactions
 */
export function generateOrderId(_userId?: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, '0');
  return `RU-${timestamp}-${random}`;
}
