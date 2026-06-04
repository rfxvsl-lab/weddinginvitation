-- Wedding SaaS Builder by RFX.visual
-- Migration 001: Initial Schema
-- Database: Turso (LibSQL / SQLite-compatible)

-- ============================================
-- TABEL 1: Users (Akun SaaS)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  couple_groom TEXT NOT NULL,
  couple_bride TEXT NOT NULL,
  active_slug TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  no_wa TEXT NOT NULL,
  sosmed TEXT DEFAULT '',
  package_id TEXT NOT NULL DEFAULT 'reguler',
  is_custom_by_rfx INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  registered_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABEL 2: Invitations (Proyek Undangan)
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  theme_id TEXT NOT NULL DEFAULT 'rfx-dark',
  wedding_data TEXT NOT NULL DEFAULT '{}',
  is_published INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABEL 3: Guests (Daftar Tamu)
-- ============================================
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  name TEXT NOT NULL,
  group_name TEXT DEFAULT '',
  phone_number TEXT DEFAULT '',
  pax_limit INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'Draft',
  invitation_code TEXT UNIQUE NOT NULL,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- ============================================
-- TABEL 4: RSVPs (Konfirmasi Kehadiran)
-- ============================================
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  guest_id TEXT,
  guest_name TEXT NOT NULL,
  status TEXT NOT NULL,
  pax_count INTEGER NOT NULL DEFAULT 0,
  wishes TEXT DEFAULT '',
  timestamp TEXT NOT NULL,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);

-- ============================================
-- TABEL 5: Visitor Logs (Analitik Pengunjung)
-- ============================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  guest_name TEXT DEFAULT 'Anonim',
  device TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  timestamp TEXT NOT NULL,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- ============================================
-- TABEL 6: Transactions (Pembayaran)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_slug TEXT NOT NULL,
  user_email TEXT NOT NULL,
  package_id TEXT NOT NULL,
  is_custom_by_rfx INTEGER NOT NULL DEFAULT 0,
  nominal_expected INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  timestamp TEXT NOT NULL,
  proof_image_url TEXT DEFAULT '',
  ai_result TEXT DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABEL 7: Design Snapshots (Riwayat Desain)
-- ============================================
CREATE TABLE IF NOT EXISTS design_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  invitation_id TEXT NOT NULL,
  theme_id TEXT NOT NULL,
  theme_name TEXT NOT NULL,
  wedding_data TEXT NOT NULL DEFAULT '{}',
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invitation_id) REFERENCES invitations(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_slug ON users(active_slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_invitation ON visitor_logs(invitation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_design_snapshots_user ON design_snapshots(user_id);
