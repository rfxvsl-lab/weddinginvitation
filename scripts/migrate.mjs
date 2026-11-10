/**
 * Runner migrasi tunggal.
 *
 *   node scripts/migrate.mjs            # jalankan semua migrasi yang belum tercatat
 *   node scripts/migrate.mjs --status   # tampilkan status tanpa mengubah apa pun
 *
 * Membaca TURSO_DATABASE_URL / TURSO_AUTH_TOKEN dari environment (.env.local dan .env ikut
 * dimuat). Tanpa TURSO_DATABASE_URL, memakai file lokal ./local.db.
 *
 * Migrasi 001–006 dulu dijalankan manual tanpa pencatatan, jadi pernyataan yang
 * gagal karena "sudah ada" dianggap sudah diterapkan dan dilewati.
 */

import { createClient } from '@libsql/client';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

// Sama seperti Next.js: .env.local lebih dulu, lalu .env. Variabel shell tetap menang.
loadEnv({ path: ['.env.local', '.env'], quiet: true });

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(here, '..', 'migrations');
const statusOnly = process.argv.includes('--status');

const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined });

const ALREADY_APPLIED = /duplicate column name|already exists/i;

function statements(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  console.log(`Database: ${url.startsWith('file:') ? url : new URL(url).host}`);

  await client.execute(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name TEXT PRIMARY KEY,
       applied_at TEXT NOT NULL DEFAULT (datetime('now'))
     )`
  );
  const applied = new Set(
    (await client.execute('SELECT name FROM schema_migrations')).rows.map((r) => r.name)
  );

  const files = readdirSync(migrationsDir).filter((f) => /^\d+_.*\.sql$/.test(f)).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  = ${file} (sudah tercatat)`);
      continue;
    }
    if (statusOnly) {
      console.log(`  ! ${file} (BELUM dijalankan)`);
      continue;
    }

    let ran = 0;
    let skipped = 0;
    for (const stmt of statements(readFileSync(path.join(migrationsDir, file), 'utf8'))) {
      try {
        await client.execute(stmt);
        ran += 1;
      } catch (err) {
        if (ALREADY_APPLIED.test(String(err?.message || err))) {
          skipped += 1;
        } else {
          console.error(`  x ${file} GAGAL pada pernyataan:\n${stmt}\n`, err?.message || err);
          process.exit(1);
        }
      }
    }
    await client.execute({ sql: 'INSERT INTO schema_migrations (name) VALUES (?)', args: [file] });
    console.log(`  + ${file} (${ran} dijalankan, ${skipped} sudah ada)`);
  }

  if (statusOnly) return;

  // Admin ditentukan kolom users.role. Jika ADMIN_EMAIL diisi dan akunnya ada, jadikan admin.
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  if (adminEmail) {
    const res = await client.execute({
      sql: "UPDATE users SET role = 'admin' WHERE email = ?",
      args: [adminEmail],
    });
    if (res.rowsAffected > 0) {
      console.log('Akun ADMIN_EMAIL ditandai sebagai admin.');
    } else {
      console.log(
        'ADMIN_EMAIL belum punya akun. Daftar dulu lewat aplikasi, lalu jalankan: node scripts/make-admin.mjs <email>'
      );
    }
  } else {
    console.log('ADMIN_EMAIL kosong: tidak ada akun yang dijadikan admin.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
