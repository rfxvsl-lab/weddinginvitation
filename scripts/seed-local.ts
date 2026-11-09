import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { DEFAULT_WEDDING_DATA, INITIAL_GUESTS } from '../src/data/defaultData.ts';

const client = createClient({ url: 'file:./local.db' });

for (const f of ['001_initial_schema.sql', '002_add_missing_columns.sql', '003_add_expiration.sql', '004_add_invitation_slug.sql', '005_add_live_moments.sql']) {
  try {
    const sql = readFileSync(new URL(`../migrations/${f}`, import.meta.url), 'utf8');
    for (const stmt of sql.split(';').map(s => s.trim()).filter(Boolean)) {
      try { await client.execute(stmt); } catch (e) { if (!/duplicate column|already exists/i.test(String(e))) console.log('skip', f, String(e).slice(0, 80)); }
    }
    console.log('ran', f);
  } catch (e) { console.log('fail', f, e.message); }
}

const userId = 'user-demo';
const invId = 'inv-demo';
await client.execute({ sql: 'DELETE FROM invitations WHERE id = ?', args: [invId] });
await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
await client.execute({
  sql: `INSERT INTO users (id, full_name, couple_groom, couple_bride, active_slug, email, password_hash, no_wa, package_id, payment_status, registered_at)
        VALUES (?, 'Ridho Demo', 'Rian', 'Salsa', 'rian-salsa', 'demo@local.test', 'x', '08123', 'luxury', 'success', '2026-01-01')`,
  args: [userId],
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
console.log('seeded', invId);
