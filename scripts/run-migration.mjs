/**
 * Run Turso Migration — Fixed Version
 * Mengirim setiap CREATE TABLE dan CREATE INDEX sebagai batch ke Turso
 * Usage: node scripts/run-migration.mjs
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TURSO_URL = 'libsql://rfxwedding-ridhofbry.aws-ap-south-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODA1NTk1MzYsImlkIjoiMDE5ZTkxOGQtYjcwMS03YjVhLWFhZGQtM2ZkYzBhMTVlZWU3IiwicmlkIjoiOWJlOGZjM2EtOWUyOS00NTc2LWFkMTMtZWI2OTJkNDhjNzNmIn0.-OXOXoHh7y92RSpT732iaiLBTtM3_5T8n-dhS6pp3YZBkd-3rPEP9i-aePsXukT1gqb-XnH1BzQ66iYQ8CQDBA';

async function main() {
  console.log('='.repeat(50));
  console.log('  Turso Migration Runner');
  console.log('='.repeat(50));

  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Test connection
  console.log('\n[1/3] Connecting to Turso...');
  const test = await client.execute('SELECT 1 as ok');
  console.log('✅ Connected!', test.rows);

  // Define all SQL statements explicitly (avoiding parsing issues)
  console.log('\n[2/3] Running CREATE TABLE statements...');

  const createStatements = [
    // 1. Users
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      couple_groom TEXT NOT NULL,
      couple_bride TEXT NOT NULL,
      active_slug TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL DEFAULT '',
      no_wa TEXT NOT NULL,
      sosmed TEXT DEFAULT '',
      package_id TEXT NOT NULL DEFAULT 'reguler',
      is_custom_by_rfx INTEGER NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      registered_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    // 2. Invitations
    `CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      theme_id TEXT NOT NULL DEFAULT 'rfx-dark',
      wedding_data TEXT NOT NULL DEFAULT '{}',
      is_published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 3. Guests
    `CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL,
      name TEXT NOT NULL,
      group_name TEXT DEFAULT '',
      phone_number TEXT DEFAULT '',
      pax_limit INTEGER NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'Draft',
      invitation_code TEXT UNIQUE NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
    )`,

    // 4. RSVPs
    `CREATE TABLE IF NOT EXISTS rsvps (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL,
      guest_id TEXT,
      guest_name TEXT NOT NULL,
      status TEXT NOT NULL,
      pax_count INTEGER NOT NULL DEFAULT 0,
      wishes TEXT DEFAULT '',
      timestamp TEXT NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
      FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
    )`,

    // 5. Visitor Logs
    `CREATE TABLE IF NOT EXISTS visitor_logs (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL,
      guest_name TEXT DEFAULT 'Anonim',
      device TEXT DEFAULT '',
      browser TEXT DEFAULT '',
      timestamp TEXT NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
    )`,

    // 6. Transactions
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_slug TEXT NOT NULL,
      user_email TEXT NOT NULL,
      package_id TEXT NOT NULL,
      is_custom_by_rfx INTEGER NOT NULL DEFAULT 0,
      nominal_expected INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      timestamp TEXT NOT NULL,
      proof_image_url TEXT DEFAULT '',
      ai_result TEXT DEFAULT '{}',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    // 7. Design Snapshots
    `CREATE TABLE IF NOT EXISTS design_snapshots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      invitation_id TEXT NOT NULL,
      theme_id TEXT NOT NULL,
      theme_name TEXT NOT NULL,
      wedding_data TEXT NOT NULL DEFAULT '{}',
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
    )`,
  ];

  const indexStatements = [
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_slug ON users(active_slug)`,
    `CREATE INDEX IF NOT EXISTS idx_invitations_user ON invitations(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_visitor_logs_invitation ON visitor_logs(invitation_id)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_design_snapshots_user ON design_snapshots(user_id)`,
  ];

  let success = 0;
  let errors = 0;

  // Run CREATE TABLEs
  for (let i = 0; i < createStatements.length; i++) {
    const label = createStatements[i].match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `table-${i}`;
    try {
      await client.execute(createStatements[i]);
      success++;
      console.log(`  ✅ Table: ${label}`);
    } catch (err) {
      errors++;
      console.log(`  ❌ Table: ${label} — ${err.message}`);
    }
  }

  // Run CREATE INDEXes
  console.log('\n[3/3] Running CREATE INDEX statements...');
  for (let i = 0; i < indexStatements.length; i++) {
    const label = indexStatements[i].match(/idx_\w+/)?.[0] || `index-${i}`;
    try {
      await client.execute(indexStatements[i]);
      success++;
      console.log(`  ✅ Index: ${label}`);
    } catch (err) {
      errors++;
      console.log(`  ❌ Index: ${label} — ${err.message}`);
    }
  }

  // Verify
  console.log('\n📋 Verifying tables...');
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%' ORDER BY name"
  );
  for (const row of tables.rows) {
    const cnt = await client.execute(`SELECT COUNT(*) as cnt FROM "${row.name}"`);
    console.log(`   ✅ ${row.name} (${cnt.rows[0].cnt} rows)`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`  ✅ Migration complete: ${success} success, ${errors} errors`);
  console.log('='.repeat(50));

  client.close();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
