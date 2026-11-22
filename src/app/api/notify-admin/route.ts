import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/server/auth';
import { notifyAdmin } from '../../../lib/server/notify';
import { handleRouteError } from '../../../lib/server/http';

export const runtime = 'nodejs';

/** Kirim notifikasi uji ke aplikasi admin. Hanya admin yang login. */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const result = await notifyAdmin(
      String(body?.title || 'Notifikasi RuangHadir').slice(0, 120),
      String(body?.message || 'Ada pemberitahuan baru').slice(0, 500),
      typeof body?.data === 'object' && body.data ? body.data : {}
    );
    return NextResponse.json({ success: result.ok, ...result });
  } catch (err) {
    return handleRouteError('notify-admin', err);
  }
}
