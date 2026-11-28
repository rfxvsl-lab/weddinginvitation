import 'server-only';
import { dbExecute } from './turso';

/**
 * RSVP & ucapan untuk halaman undangan khusus (route statis seperti /dani-tia) yang tidak
 * memiliki baris di tabel `invitations`. Disimpan terpisah agar tidak menyentuh skema RSVP
 * undangan biasa. Tabel dibuat otomatis saat pertama dipakai.
 */

/** Halaman khusus yang boleh menerima RSVP. */
export const CUSTOM_PAGE_KEYS = new Set(['dani-tia']);

export type CustomRsvpStatus = 'Hadir' | 'Tidak Hadir' | 'Masih Ragu';
export const CUSTOM_RSVP_STATUSES: CustomRsvpStatus[] = ['Hadir', 'Tidak Hadir', 'Masih Ragu'];

export interface CustomRsvp {
  id: string;
  name: string;
  status: CustomRsvpStatus;
  pax: number;
  message: string;
  createdAt: string;
}

let schemaReady: Promise<void> | null = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await dbExecute(`
        CREATE TABLE IF NOT EXISTS custom_page_rsvps (
          id TEXT PRIMARY KEY,
          page_key TEXT NOT NULL,
          guest_name TEXT NOT NULL,
          status TEXT NOT NULL,
          pax INTEGER NOT NULL DEFAULT 0,
          message TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        )
      `);
      await dbExecute('CREATE INDEX IF NOT EXISTS idx_custom_page_rsvps_page ON custom_page_rsvps (page_key, created_at)');
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

function rowTo(r: Record<string, unknown>): CustomRsvp {
  return {
    id: String(r.id),
    name: String(r.guest_name),
    status: (CUSTOM_RSVP_STATUSES as string[]).includes(String(r.status)) ? (r.status as CustomRsvpStatus) : 'Hadir',
    pax: Number(r.pax) || 0,
    message: String(r.message || ''),
    createdAt: String(r.created_at),
  };
}

export async function listCustomRsvps(pageKey: string, before: string | null, limit: number) {
  await ensureSchema();
  const res = await dbExecute(
    before
      ? 'SELECT * FROM custom_page_rsvps WHERE page_key = :k AND created_at < :before ORDER BY created_at DESC LIMIT :lim'
      : 'SELECT * FROM custom_page_rsvps WHERE page_key = :k ORDER BY created_at DESC LIMIT :lim',
    { k: pageKey, before, lim: limit + 1 }
  );
  const rows = res.rows.map((r) => rowTo(r as unknown as Record<string, unknown>));
  const counts = await dbExecute(
    "SELECT status, COUNT(*) AS n FROM custom_page_rsvps WHERE page_key = :k GROUP BY status",
    { k: pageKey }
  );
  const tally: Record<string, number> = {};
  for (const r of counts.rows as unknown as { status: string; n: number }[]) tally[r.status] = Number(r.n) || 0;
  return { items: rows.slice(0, limit), hasMore: rows.length > limit, tally };
}

export async function addCustomRsvp(pageKey: string, input: Omit<CustomRsvp, 'id' | 'createdAt'>) {
  await ensureSchema();
  const rsvp: CustomRsvp = {
    ...input,
    id: `crsvp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await dbExecute(
    `INSERT INTO custom_page_rsvps (id, page_key, guest_name, status, pax, message, created_at)
     VALUES (:id, :k, :name, :status, :pax, :message, :at)`,
    { id: rsvp.id, k: pageKey, name: rsvp.name, status: rsvp.status, pax: rsvp.pax, message: rsvp.message, at: rsvp.createdAt }
  );
  return rsvp;
}
