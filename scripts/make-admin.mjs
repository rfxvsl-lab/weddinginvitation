/**
 * Jadikan akun yang sudah terdaftar sebagai admin (atau cabut).
 *
 *   node scripts/make-admin.mjs email@contoh.com
 *   node scripts/make-admin.mjs email@contoh.com --revoke
 */

import { createClient } from '@libsql/client';
import 'dotenv/config';

const email = (process.argv[2] || '').toLowerCase().trim();
const role = process.argv.includes('--revoke') ? 'user' : 'admin';

if (!email || !email.includes('@')) {
  console.error('Pemakaian: node scripts/make-admin.mjs <email> [--revoke]');
  process.exit(1);
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const res = await client.execute({ sql: 'UPDATE users SET role = ? WHERE email = ?', args: [role, email] });
if (res.rowsAffected === 0) {
  console.error(`Tidak ada akun dengan email ${email}. Daftar dulu lewat aplikasi.`);
  process.exit(1);
}
console.log(`Peran ${email} sekarang: ${role}. User perlu login ulang agar berlaku.`);
