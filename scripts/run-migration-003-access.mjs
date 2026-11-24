#!/usr/bin/env node
/**
 * Migrasi 003 — Akses Awal (whitelist).
 * Menambah kolom status akun ke tabel users. Akun lama otomatis 'approved' (DEFAULT),
 * pendaftar baru ditulis 'pending' oleh /api/auth/register.
 * Aman dijalankan berulang. Aplikasi juga menjalankan langkah yang sama secara otomatis
 * (ensureAccountSchema di src/lib/db.ts), jadi skrip ini opsional.
 *
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/run-migration-003-access.mjs
 */
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;
if (!url) {
  console.error('TURSO_DATABASE_URL belum diisi.');
  process.exit(1);
}
const db = createClient({ url, authToken });
const cols = [
  `ALTER TABLE users ADD COLUMN account_status TEXT DEFAULT 'approved'`,
  `ALTER TABLE users ADD COLUMN application_json TEXT DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN reviewed_at TEXT DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN review_note TEXT DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN applied_at TEXT DEFAULT ''`,
];
for (const sql of cols) {
  try {
    await db.execute(sql);
    console.log('✓', sql);
  } catch (e) {
    if (/duplicate column|already exists/i.test(String(e?.message || e))) console.log('• sudah ada:', sql.split('COLUMN ')[1]);
    else throw e;
  }
}
const r = await db.execute(`SELECT account_status, COUNT(*) AS n FROM users GROUP BY account_status`);
console.log('Ringkasan status:', r.rows);
