import * as dotenv from 'dotenv';
dotenv.config();

import { dbExecute } from '../src/lib/turso.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../migrations/004_add_invitation_slug.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('Running migration 004...');
    
    // Simple split by semicolon. Since Turso might not support executing multiple statements
    // in one dbExecute call, we'll split them.
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      if (stmt) {
        console.log(`Executing: ${stmt.substring(0, 50)}...`);
        await dbExecute(stmt);
      }
    }
    
    console.log('Migration 004 completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();
