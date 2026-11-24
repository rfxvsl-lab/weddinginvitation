import { NextResponse } from 'next/server';
import { listAccessApplications } from '@/lib/db';
import { requireAdmin, toClientUser } from '@/lib/server/auth';
import { isAdminEmail } from '@/lib/server/session';
import { handleRouteError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/applications?status=pending|approved|rejected|all — daftar pendaftar Akses Awal (admin). */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const raw = new URL(req.url).searchParams.get('status') || 'pending';
    const status = (['pending', 'approved', 'rejected', 'all'] as const).find((s) => s === raw) || 'pending';
    // Akun admin (ADMIN_EMAILS) selalu boleh masuk, jadi tidak perlu ditinjau.
    const users = (await listAccessApplications(status)).filter((u) => status !== 'pending' || !isAdminEmail(u.email));
    return NextResponse.json({ applications: users.map(toClientUser) });
  } catch (err) {
    return handleRouteError('admin/applications', err);
  }
}
