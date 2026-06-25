/**
 * Run migration 003: Add expiration columns to invitations table
 * Usage: node scripts/run-migration-003.mjs
 */

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('🔄 Running migration 003: Add expiration columns...');
  console.log('   Database:', process.env.TURSO_DATABASE_URL);

  try {
    // Add activated_at column
    await client.execute('ALTER TABLE invitations ADD COLUMN activated_at TEXT DEFAULT NULL');
    console.log('✅ Added column: activated_at');
  } catch (err) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log('⏭️  Column activated_at already exists, skipping.');
    } else {
      console.error('❌ Failed to add activated_at:', err.message);
    }
  }

  try {
    // Add expires_at column
    await client.execute('ALTER TABLE invitations ADD COLUMN expires_at TEXT DEFAULT NULL');
    console.log('✅ Added column: expires_at');
  } catch (err) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log('⏭️  Column expires_at already exists, skipping.');
    } else {
      console.error('❌ Failed to add expires_at:', err.message);
    }
  }

  // Verify
  const result = await client.execute('PRAGMA table_info(invitations)');
  const columns = result.rows.map(r => r.name);
  console.log('\n📋 Invitations table columns:', columns.join(', '));

  const hasActivatedAt = columns.includes('activated_at');
  const hasExpiresAt = columns.includes('expires_at');
  
  if (hasActivatedAt && hasExpiresAt) {
    console.log('\n🎉 Migration 003 completed successfully!');
  } else {
    console.log('\n⚠️  Some columns are missing. Please check errors above.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error('💥 Migration failed:', err);
  process.exit(1);
});
