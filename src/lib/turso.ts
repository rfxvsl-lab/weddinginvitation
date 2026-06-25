/**
 * Turso Database Client (Server-Side)
 * Koneksi langsung ke database Turso untuk eksekusi server-side query.
 */

import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN || '';

// Initialize client only if config is present (prevents build crash if env variables are empty at build time)
const client = url ? createClient({ url, authToken }) : null;

/**
 * Execute a single SQL statement securely on the server
 */
export async function dbExecute(sql: string, args: Record<string, any> = {}) {
  if (!client) {
    throw new Error('Database client not initialized. Check your TURSO_DATABASE_URL environment variable.');
  }

  // Convert undefined values to null to prevent client errors
  const safeArgs = Object.fromEntries(
    Object.entries(args).map(([k, v]) => [k, v === undefined ? null : v])
  );

  return await client.execute({ sql, args: safeArgs });
}

/**
 * Execute a batch of SQL statements securely on the server
 */
export async function dbBatch(statements: { sql: string; args?: Record<string, any> }[]) {
  if (!client) {
    throw new Error('Database client not initialized. Check your TURSO_DATABASE_URL environment variable.');
  }

  const safeStatements = statements.map(stmt => ({
    sql: stmt.sql,
    args: stmt.args 
      ? Object.fromEntries(Object.entries(stmt.args).map(([k, v]) => [k, v === undefined ? null : v]))
      : []
  }));

  return await client.batch(safeStatements);
}

/**
 * Helper: generate unique ID
 */
export function genId(prefix: string = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}
