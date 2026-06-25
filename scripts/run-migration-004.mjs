/**
 * Run migration 004: Add per-project slug to invitations table
 * Usage: node scripts/run-migration-004.mjs
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('🔄 Running migration 004: Add per-project slug...');

  try {
    await client.execute('ALTER TABLE invitations ADD COLUMN slug TEXT DEFAULT NULL');
    console.log('✅ Added column: slug');
  } catch (err) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log('⏭️  Column slug already exists, skipping.');
    } else {
      console.error('❌ Failed:', err.message);
    }
  }

  // Verify
  const result = await client.execute('PRAGMA table_info(invitations)');
  const columns = result.rows.map(r => r.name);
  console.log('📋 Columns:', columns.join(', '));
  console.log(columns.includes('slug') ? '🎉 Migration 004 done!' : '⚠️ slug column missing');

  process.exit(0);
}

run().catch(err => { console.error('💥', err); process.exit(1); });
