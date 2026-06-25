-- Wedding SaaS Builder by RFX.visual
-- Migration 002: Add missing columns and tables
-- Database: Turso (LibSQL / SQLite-compatible)
-- Run this after 001_initial_schema.sql

-- ============================================
-- ALTER users: tambah kolom yang dipakai di kode tapi belum ada di schema
-- ============================================

-- Kolom ip_address (untuk IP tracking & banning)
ALTER TABLE users ADD COLUMN ip_address TEXT DEFAULT '';

-- Kolom avatar_url (untuk foto profil pengguna)
ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '';

-- Kolom auth_provider (local atau google)
ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';

-- Kolom warning_count (jumlah peringatan pelanggaran)
ALTER TABLE users ADD COLUMN warning_count INTEGER DEFAULT 0;

-- Kolom slug_change_count (batas penggantian slug)
ALTER TABLE users ADD COLUMN slug_change_count INTEGER DEFAULT 0;

-- ============================================
-- ALTER invitations: tambah kolom published data terpisah
-- (agar edit draft tidak langsung mengubah versi publik)
-- ============================================

-- Data undangan yang sudah dipublish (snapshot immutable dari draft saat publish)
ALTER TABLE invitations ADD COLUMN published_wedding_data TEXT DEFAULT NULL;

-- Theme ID yang digunakan saat publish
ALTER TABLE invitations ADD COLUMN published_theme_id TEXT DEFAULT NULL;

-- ============================================
-- TABEL 8: Banned IPs (Block IP nakal)
-- ============================================
CREATE TABLE IF NOT EXISTS banned_ips (
  ip TEXT PRIMARY KEY,
  reason TEXT DEFAULT '',
  banned_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABEL 9: Admin Settings (Config dinamis)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABEL 10: Live Chat Messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT DEFAULT '',
  sender_role TEXT NOT NULL CHECK(sender_role IN ('client', 'admin')),
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEX tambahan
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(conversation_id, is_read);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_timestamp ON visitor_logs(timestamp);
