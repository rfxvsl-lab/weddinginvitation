import { NextResponse } from 'next/server';
import { verifyUserPassword, checkBannedIp, updateUserIp } from '@/lib/db';
import { attachSession, toClientUser } from '@/lib/server/auth';
import { handleRouteError, jsonError, limitOr429 } from '@/lib/server/http';
import { getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');
    if (!email || !password) return jsonError('Email dan password wajib diisi.');

    const limited = limitOr429(req, 'login', 8, 15 * 60, email);
    if (limited) return limited;

    const ip = getClientIp(req);
    if (ip !== 'unknown' && (await checkBannedIp(ip))) {
      return jsonError('Akses ditolak. Alamat IP Anda telah diblokir.', 403);
    }

    const user = await verifyUserPassword(email, password);
    if (!user) return jsonError('Email atau password salah.', 401);

    if (ip !== 'unknown') updateUserIp(user.id, ip).catch(() => {});

    const res = NextResponse.json({ ok: true, user: toClientUser(user) });
    return attachSession(res, user);
  } catch (err) {
    return handleRouteError('auth/login', err);
  }
}
