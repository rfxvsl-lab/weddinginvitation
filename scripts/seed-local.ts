/**
 * Isi database lokal dengan satu akun contoh untuk development.
 *
 *   npm run migrate
 *   npx tsx scripts/seed-local.ts
 *
 * Login: demo@local.test / demo12345  (paket luxury, sudah lunas)
 * Undangan: http://localhost:3000/rian-salsa
 */

import { createClient } from '@libsql/client';
import 'dotenv/config';
import { DEFAULT_WEDDING_DATA, INITIAL_GUESTS } from '../src/data/defaultData.ts';
import { hashPassword } from '../src/server/password.ts';

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
if (!url.startsWith('file:')) {
  console.error('seed-local hanya untuk database file lokal. TURSO_DATABASE_URL saat ini menunjuk ke server.');
  process.exit(1);
}
const client = createClient({ url });

const userId = 'user-demo';
const invId = 'inv-demo';
await client.execute({ sql: 'DELETE FROM invitations WHERE id = ?', args: [invId] });
await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
await client.execute({
  sql: `INSERT INTO users (id, full_name, couple_groom, couple_bride, active_slug, email, password_hash, no_wa, package_id, payment_status, registered_at)
        VALUES (?, 'Ridho Demo', 'Rian', 'Salsa', 'rian-salsa', 'demo@local.test', ?, '08123', 'luxury', 'success', '2026-01-01')`,
  args: [userId, await hashPassword('demo12345')],
});
await client.execute({
  sql: `INSERT INTO invitations (id, user_id, title, theme_id, wedding_data, is_published, published_at, slug, activated_at, expires_at)
        VALUES (?, ?, 'Demo', 'rfx-dark', ?, 1, datetime('now'), 'rian-salsa', datetime('now'), '2030-01-01')`,
  args: [invId, userId, JSON.stringify(DEFAULT_WEDDING_DATA)],
});
for (const g of INITIAL_GUESTS.slice(0, 3)) {
  await client.execute({
    sql: 'INSERT INTO guests (id, invitation_id, name, group_name, phone_number, pax_limit, status, invitation_code) VALUES (?,?,?,?,?,?,?,?)',
    args: [g.id, invId, g.name, g.group, g.phoneNumber, g.paxLimit, g.status, g.invitationCode],
  });
}
console.log('Seed selesai. Login: demo@local.test / demo12345');
