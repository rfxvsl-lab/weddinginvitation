/**
 * Run Migration 002 — Add Missing Columns & Tables
 * Menambahkan kolom-kolom yang dipakai di kode tapi belum ada di schema awal.
 * Aman dijalankan berkali-kali (menggunakan IF NOT EXISTS / error handling per statement).
 * 
 * Usage: node scripts/run-migration-002.mjs
 */

import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL || 'libsql://rfxwedding-ridhofbry.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN;

if (!TURSO_TOKEN) {
  console.error('Fatal: TURSO_AUTH_TOKEN tidak ditemukan di environment variables.');
  process.exit(1);
}

/**
 * Jalankan satu SQL statement, abaikan jika kolom/tabel sudah ada
 * SQLite mengembalikan error "duplicate column name" jika ALTER TABLE ke kolom yang sudah ada
 */
async function safeExecute(client, sql, label) {
  try {
    await client.execute(sql);
    console.log(`  ✅ ${label}`);
    return true;
  } catch (err) {
    const msg = err.message || '';
    // Abaikan error "duplicate column name" dan "already exists"
    if (msg.includes('duplicate column name') || msg.includes('already exists')) {
      console.log(`  ⏭️  ${label} — sudah ada, dilewati`);
      return true;
    }
    console.log(`  ❌ ${label} — ${msg}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(55));
  console.log('  Migration 002 — Add Missing Columns & Tables');
  console.log('='.repeat(55));

  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

  // Test koneksi
  console.log('\n[1/4] Koneksi ke Turso...');
  await client.execute('SELECT 1 as ok');
  console.log('  ✅ Connected!');

  // === ALTER TABLE users ===
  console.log('\n[2/4] Menambahkan kolom ke tabel users...');
  const alterUsersCols = [
    [`ALTER TABLE users ADD COLUMN ip_address TEXT DEFAULT ''`, 'users.ip_address'],
    [`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''`, 'users.avatar_url'],
    [`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'`, 'users.auth_provider'],
    [`ALTER TABLE users ADD COLUMN warning_count INTEGER DEFAULT 0`, 'users.warning_count'],
    [`ALTER TABLE users ADD COLUMN slug_change_count INTEGER DEFAULT 0`, 'users.slug_change_count'],
  ];

  for (const [sql, label] of alterUsersCols) {
    await safeExecute(client, sql, label);
  }

  // === ALTER TABLE invitations ===
  console.log('\n[3/4] Menambahkan kolom ke tabel invitations...');
  const alterInvCols = [
    [`ALTER TABLE invitations ADD COLUMN published_wedding_data TEXT DEFAULT NULL`, 'invitations.published_wedding_data'],
    [`ALTER TABLE invitations ADD COLUMN published_theme_id TEXT DEFAULT NULL`, 'invitations.published_theme_id'],
  ];

  for (const [sql, label] of alterInvCols) {
    await safeExecute(client, sql, label);
  }

  // === CREATE new tables ===
  console.log('\n[4/4] Membuat tabel baru yang belum ada...');
  const newTables = [
    [
      `CREATE TABLE IF NOT EXISTS banned_ips (
        ip TEXT PRIMARY KEY,
        reason TEXT DEFAULT '',
        banned_at TEXT DEFAULT (datetime('now'))
      )`,
      'banned_ips'
    ],
    [
      `CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT (datetime('now'))
      )`,
      'admin_settings'
    ],
    [
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_avatar TEXT DEFAULT '',
        sender_role TEXT NOT NULL CHECK(sender_role IN ('client', 'admin')),
        message TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      'chat_messages'
    ],
  ];

  for (const [sql, label] of newTables) {
    await safeExecute(client, sql, `CREATE TABLE ${label}`);
  }

  // === INDEX tambahan ===
  const newIndexes = [
    [`CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id)`, 'idx_chat_messages_conv'],
    [`CREATE INDEX IF NOT EXISTS idx_visitor_logs_ts ON visitor_logs(timestamp)`, 'idx_visitor_logs_ts'],
    [`CREATE INDEX IF NOT EXISTS idx_invitations_published ON invitations(is_published)`, 'idx_invitations_published'],
  ];

  for (const [sql, label] of newIndexes) {
    await safeExecute(client, sql, `INDEX ${label}`);
  }

  // Verifikasi
  console.log('\n📋 Status tabel sekarang:');
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  for (const row of tables.rows) {
    try {
      const cnt = await client.execute(`SELECT COUNT(*) as cnt FROM "${row.name}"`);
      console.log(`   ✅ ${row.name} (${cnt.rows[0].cnt} rows)`);
    } catch {
      console.log(`   ⚠️  ${row.name} (tidak bisa dihitung)`);
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log('  ✅ Migration 002 selesai!');
  console.log('='.repeat(55));

  client.close();
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message || err);
  process.exit(1);
});
