/**
 * Turso Database Client
 * Koneksi ke Turso LibSQL database untuk Wedding SaaS Builder
 */

import { createClient } from '@libsql/client/web';

// Singleton client instance
let _client: ReturnType<typeof createClient> | null = null;

export function getTursoClient() {
  if (_client) return _client;

  const url = import.meta.env.VITE_TURSO_DATABASE_URL;
  const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error(
      'Turso env vars missing! Set VITE_TURSO_DATABASE_URL and VITE_TURSO_AUTH_TOKEN in .env.local'
    );
    throw new Error('Turso database not configured');
  }

  _client = createClient({ url, authToken });
  return _client;
}

/**
 * Execute a single SQL statement with params
 */
export async function dbExecute(sql: string, args: Record<string, any> = {}) {
  const client = getTursoClient();
  return client.execute({ sql, args });
}

/**
 * Execute a batch of SQL statements in a transaction
 */
export async function dbBatch(statements: { sql: string; args?: Record<string, any> }[]) {
  const client = getTursoClient();
  return client.batch(
    statements.map((s) => ({ sql: s.sql, args: s.args || {} })),
    'write'
  );
}

/**
 * Helper: generate unique ID
 */
export function genId(prefix: string = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}
