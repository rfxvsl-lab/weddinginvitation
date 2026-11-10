/**
 * Database SQLite sementara untuk test. Harus dipanggil SEBELUM modul yang
 * mengimpor src/lib/turso.ts dimuat, karena klien dibuat saat import.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export function createTestDatabase(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'rh-test-'));
  const url = `file:${path.join(dir, 'test.db')}`;
  process.env.TURSO_DATABASE_URL = url;
  delete process.env.TURSO_AUTH_TOKEN;
  execFileSync(process.execPath, [path.join(root, 'scripts', 'migrate.mjs')], {
    cwd: dir, // tanpa .env proyek
    env: { ...process.env, TURSO_DATABASE_URL: url, ADMIN_EMAIL: '' },
    stdio: 'pipe',
  });
  return url;
}
