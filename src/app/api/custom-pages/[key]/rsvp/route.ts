import { NextResponse } from 'next/server';
import { jsonError, limitOr429 } from '../../../../../lib/server/http';
import {
  CUSTOM_PAGE_KEYS,
  CUSTOM_RSVP_STATUSES,
  addCustomRsvp,
  listCustomRsvps,
  type CustomRsvpStatus,
} from '../../../../../lib/customPageRsvp';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ key: string }> };

const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);

function dbUnavailable(e: unknown) {
  return e instanceof Error && /not initialized/i.test(e.message);
}

/** Kode singkat penyebab galat DB (tanpa membocorkan pesan internal) untuk diagnosis produksi. */
function errCode(e: unknown) {
  const m = e instanceof Error ? `${e.message} ${(e as { code?: string }).code || ''}` : String(e);
  if (/no such table/i.test(m)) return 'no_table';
  if (/mismatch/i.test(m)) return 'type';
  if (/param|bind/i.test(m)) return 'param';
  if (/auth|permission|not allowed|readonly|read-only/i.test(m)) return 'auth';
  if (/fetch|network|timeout|ECONN/i.test(m)) return 'net';
  return 'other';
}

export async function GET(req: Request, { params }: Ctx) {
  const { key } = await params;
  if (!CUSTOM_PAGE_KEYS.has(key)) return jsonError('Halaman tidak ditemukan.', 404);
  const limited = limitOr429(req, 'custom-rsvp-read', 90, 60, key);
  if (limited) return limited;
  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  const safeBefore = before && /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(before) ? before : null;
  try {
    const data = await listCustomRsvps(key, safeBefore, 12);
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    if (dbUnavailable(e)) return jsonError('Ucapan belum bisa dimuat.', 503);
    console.error('[custom-rsvp:get]', e);
    return jsonError('Ucapan belum bisa dimuat.', 500, { code: errCode(e) });
  }
}

export async function POST(req: Request, { params }: Ctx) {
  const { key } = await params;
  if (!CUSTOM_PAGE_KEYS.has(key)) return jsonError('Halaman tidak ditemukan.', 404);
  const limited = limitOr429(req, 'custom-rsvp-write', 5, 10 * 60, key);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonError('Data tidak terbaca.');
  }
  // honeypot: field tersembunyi yang hanya diisi bot
  if (clean(body.website, 100)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 60);
  if (name.length < 2) return jsonError('Tulis nama Anda (minimal 2 huruf).');
  const status = String(body.status) as CustomRsvpStatus;
  if (!CUSTOM_RSVP_STATUSES.includes(status)) return jsonError('Pilih status kehadiran.');
  const message = clean(body.message, 500);
  const paxRaw = Math.round(Number(body.pax));
  const pax = status === 'Hadir' ? Math.min(5, Math.max(1, Number.isFinite(paxRaw) ? paxRaw : 1)) : 0;

  try {
    const rsvp = await addCustomRsvp(key, { name, status, pax, message });
    return NextResponse.json({ ok: true, rsvp }, { status: 201 });
  } catch (e) {
    if (dbUnavailable(e)) return jsonError('Konfirmasi belum bisa disimpan. Coba lagi nanti.', 503);
    console.error('[custom-rsvp:post]', e);
    return jsonError('Konfirmasi belum bisa disimpan. Coba lagi nanti.', 500, { code: errCode(e) });
  }
}
