import { NextResponse } from 'next/server';
import { getUserByEmail, checkBannedIp, updateUserIp } from '@/lib/db';
import { accountStatusResponse, attachSession, canEnter, toClientUser } from '@/lib/server/auth';
import { verifyGoogleCredential } from '@/lib/server/google';
import { signData } from '@/lib/server/session';
import { handleRouteError, jsonError, limitOr429 } from '@/lib/server/http';
import { getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/**
 * Login Google. Jika email belum terdaftar, server mengembalikan `signupToken`
 * (bertanda tangan, berlaku 30 menit) yang wajib dipakai saat registrasi —
 * sehingga email Google tidak bisa dipalsukan dari browser.
 */
export async function POST(req: Request) {
  try {
    const limited = limitOr429(req, 'google', 20, 15 * 60);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const identity = await verifyGoogleCredential(String(body?.credential || ''));
    if (!identity) return jsonError('Verifikasi akun Google gagal. Silakan coba lagi.', 401);

    const ip = getClientIp(req);
    if (ip !== 'unknown' && (await checkBannedIp(ip))) {
      return jsonError('Akses Anda telah diblokir. Hubungi admin.', 403);
    }

    const user = await getUserByEmail(identity.email);
    if (user) {
      if (!canEnter(user)) return accountStatusResponse(user);
      if (ip !== 'unknown') updateUserIp(user.id, ip).catch(() => {});
      return attachSession(NextResponse.json({ ok: true, user: toClientUser(user) }), user);
    }

    const signupToken = await signData({
      kind: 'google-signup',
      email: identity.email,
      name: identity.name,
      picture: identity.picture || '',
      exp: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    return NextResponse.json({
      ok: true,
      needsSignup: true,
      signupToken,
      email: identity.email,
      name: identity.name,
      avatarUrl: identity.picture,
    });
  } catch (err) {
    return handleRouteError('auth/google', err);
  }
}
