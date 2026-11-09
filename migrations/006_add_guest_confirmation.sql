-- Wedding SaaS Builder by RFX.visual
-- Migration 006: Guest confirmation state & seat map (hasil RE alur RSVP satumomen/acaranya)
-- Database: Turso (LibSQL / SQLite-compatible)
-- Run after 005_add_live_moments.sql

ALTER TABLE guests ADD COLUMN attendance TEXT DEFAULT '';
ALTER TABLE guests ADD COLUMN rsvp_status TEXT DEFAULT 'UNCONFIRMED';
ALTER TABLE guests ADD COLUMN seat_image_url TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_guests_code_invitation ON guests(invitation_id, invitation_code);
