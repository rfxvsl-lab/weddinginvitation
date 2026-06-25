-- Wedding SaaS Builder by RFX.visual
-- Migration 003: Add Masa Aktif (Active Period) columns
-- Database: Turso (LibSQL / SQLite-compatible)
--
-- Menambah kolom aktivasi & kadaluwarsa pada tabel invitations.
-- Timer mulai saat payment_status = 'success' (Pakasir webhook).

-- Waktu aktivasi (saat pembayaran berhasil dikonfirmasi)
ALTER TABLE invitations ADD COLUMN activated_at TEXT DEFAULT NULL;

-- Waktu kadaluwarsa (dihitung: activated_at + activeDays dari tier user)
ALTER TABLE invitations ADD COLUMN expires_at TEXT DEFAULT NULL;
