-- Wedding SaaS Builder by RFX.visual
-- Migration 004: Add slug column to invitations
-- Database: Turso (LibSQL / SQLite-compatible)

-- Menambahkan kolom slug pada tabel invitations agar setiap undangan dapat memiliki slug mandiri 
-- (Penting untuk fitur multi-project/Premium/Luxury)
ALTER TABLE invitations ADD COLUMN slug TEXT DEFAULT NULL;

-- Membuat index untuk mempercepat pencarian undangan berdasarkan slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug) WHERE slug IS NOT NULL;
