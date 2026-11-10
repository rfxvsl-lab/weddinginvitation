-- Migration 007: Peran akun, kolom order pembayaran, dan rate limit
-- Jalankan dengan: node scripts/migrate.mjs

-- Peran akun. Admin ditentukan dari kolom ini, bukan dari email di browser.
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Order ID gateway disimpan sebagai kolom, bukan teks di dalam ai_result.
ALTER TABLE transactions ADD COLUMN order_id TEXT DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN tx_type TEXT NOT NULL DEFAULT 'signup';
ALTER TABLE transactions ADD COLUMN invitation_id TEXT DEFAULT NULL;
ALTER TABLE transactions ADD COLUMN paid_at TEXT DEFAULT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id) WHERE order_id IS NOT NULL;

-- Rate limit bersama antar-instance serverless.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
