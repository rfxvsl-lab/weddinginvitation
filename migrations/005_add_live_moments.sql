-- Wedding SaaS Builder by RFX.visual
-- Migration 005: Live Moments (photo wall + voice wishes) & on-site check-in logistics
-- Database: Turso (LibSQL / SQLite-compatible)
-- Run after 004_add_invitation_slug.sql

-- ============================================
-- ALTER guests: data operasional meja resepsionis
-- ============================================
ALTER TABLE guests ADD COLUMN checked_in_at TEXT DEFAULT NULL;
ALTER TABLE guests ADD COLUMN check_in_pax INTEGER DEFAULT 0;
ALTER TABLE guests ADD COLUMN table_no TEXT DEFAULT '';
ALTER TABLE guests ADD COLUMN souvenir_given INTEGER DEFAULT 0;

-- ============================================
-- TABEL 11: Photo Wall (Guest Camera / Live Moments)
-- ============================================
CREATE TABLE IF NOT EXISTS photo_wall (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  guest_name TEXT NOT NULL DEFAULT 'Tamu',
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_photo_wall_invitation ON photo_wall(invitation_id, created_at);

-- ============================================
-- TABEL 12: Voice Notes (Ucapan Suara Tamu)
-- ============================================
CREATE TABLE IF NOT EXISTS voice_notes (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  guest_name TEXT NOT NULL DEFAULT 'Tamu',
  audio_url TEXT NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_voice_notes_invitation ON voice_notes(invitation_id, created_at);
