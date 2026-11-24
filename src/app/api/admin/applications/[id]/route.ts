import { NextResponse } from 'next/server';
import { getUserById, setAccountStatus } from '@/lib/db';
import { forgetAccountStatus, requireAdmin } from '@/lib/server/auth';
import { handleRouteError, jsonError } from '@/lib/server/http';

export const runtime = 'nodejs';

/** Nomor WA lokal → format internasional untuk tautan wa.me. */
function waNumber(raw: string) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('0')) return `62${d.slice(1)}`;
  return d;
}

/**
 * POST /api/admin/applications/:id  { action: 'approve' | 'reject' | 'reopen', note? }
 * Mengembalikan tautan WhatsApp berisi kabar untuk pendaftar (dikirim manual oleh admin).
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || '');
    const note = String(body?.note || '').trim().slice(0, 500);
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'reopen' ? 'pending' : null;
    if (!status) return jsonError('Aksi tidak dikenal.');

    const user = await getUserById(id);
    if (!user) return jsonError('Pendaftar tidak ditemukan.', 404);

    await setAccountStatus(id, status, note);
    forgetAccountStatus(id);

    const origin = new URL(req.url).origin;
    const name = user.fullName || `${user.coupleGroom} & ${user.coupleBride}`;
    const message =
      status === 'approved'
        ? `Halo ${name}, pendaftaran Akses Awal RuangHadir Anda sudah disetujui. Silakan masuk dengan email ${user.email} di ${origin}/auth untuk mulai membuat undangan.`
        : status === 'rejected'
          ? `Halo ${name}, terima kasih sudah mendaftar Akses Awal RuangHadir. Untuk saat ini pendaftaran Anda belum dapat kami setujui${note ? `: ${note}` : '.'}`
          : '';
    const wa = waNumber(user.noWa);
    return NextResponse.json({
      ok: true,
      accountStatus: status,
      whatsappUrl: message && wa.length >= 9 ? `https://wa.me/${wa}?text=${encodeURIComponent(message)}` : null,
      mailtoUrl: message ? `mailto:${user.email}?subject=${encodeURIComponent('Akses Awal RuangHadir')}&body=${encodeURIComponent(message)}` : null,
    });
  } catch (err) {
    return handleRouteError('admin/applications/:id', err);
  }
}
