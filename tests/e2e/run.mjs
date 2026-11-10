/**
 * Menjalankan test end-to-end terhadap build produksi.
 *
 *   npm run build && npm run test:e2e
 *
 * Membuat database SQLite sementara, menjalankan migrasi, menyalakan
 * `next start` dengan gateway pembayaran tiruan, lalu menjalankan test.
 */

import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const APP_PORT = Number(process.env.E2E_APP_PORT || 3100);
const GATEWAY_PORT = Number(process.env.E2E_GATEWAY_PORT || 3199);

if (!existsSync(path.join(root, '.next', 'BUILD_ID'))) {
  console.error('Belum ada build. Jalankan `npm run build` dulu.');
  process.exit(1);
}

const dir = mkdtempSync(path.join(tmpdir(), 'rh-e2e-'));
const dbUrl = `file:${path.join(dir, 'e2e.db')}`;

const env = {
  ...process.env,
  TURSO_DATABASE_URL: dbUrl,
  TURSO_AUTH_TOKEN: '',
  SESSION_SECRET: randomBytes(48).toString('base64'),
  ADMIN_EMAIL: '',
  PAKASIR_PROJECT_SLUG: 'e2e-project',
  PAKASIR_API_KEY: 'e2e-key',
  PAKASIR_BASE_URL: `http://127.0.0.1:${GATEWAY_PORT}`,
  GEMINI_API_KEY: '',
  E2E_BASE_URL: `http://127.0.0.1:${APP_PORT}`,
  E2E_DB_URL: dbUrl,
  E2E_GATEWAY_PORT: String(GATEWAY_PORT),
};

execFileSync(process.execPath, [path.join(root, 'scripts', 'migrate.mjs')], { cwd: dir, env, stdio: 'inherit' });

const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const server = spawn(process.execPath, [nextBin, 'start', '-p', String(APP_PORT), '-H', '127.0.0.1'], {
  cwd: root,
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${env.E2E_BASE_URL}/robots.txt`);
      if (res.ok) return;
    } catch {
      /* belum siap */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server tidak siap.\n${serverLog}`);
}

let code = 1;
try {
  await waitForServer();
  const tests = spawn(
    process.execPath,
    ['--test', '--test-concurrency=1', path.join(root, 'tests', 'e2e', 'app.test.mjs')],
    { cwd: root, env, stdio: 'inherit' }
  );
  code = await new Promise((resolve) => tests.on('exit', (c) => resolve(c ?? 1)));
  if (code !== 0) console.error('\n--- log server ---\n' + serverLog.slice(-4000));
} finally {
  server.kill('SIGTERM');
}
process.exit(code);
