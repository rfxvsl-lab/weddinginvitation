import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { createUser, checkSlugExists, checkEmailExists, checkBannedIp, updateUserAvatar } from '@/lib/db';
import { clearSession } from '@/lib/server/auth';
import { notifyAdmin } from '@/lib/server/notify';
import { verifyData } from '@/lib/server/session';
import { validatePasswordStrength } from '@/lib/server/password';
import { EMAIL_RE, RESERVED_SLUGS, handleRouteError, jsonError, limitOr429, normalizeSlug } from '@/lib/server/http';
import { getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

const clean = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  try {
    const limited = limitOr429(req, 'register', 6, 60 * 60);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const coupleGroom = clean(body?.coupleGroom, 60);
    const coupleBride = clean(body?.coupleBride, 60);
    const noWa = clean(body?.noWa, 20).replace(/[^\d+]/g, '');
    const sosmed = clean(body?.sosmed, 80);
    const activeSlug = normalizeSlug(body?.activeSlug || `${coupleGroom}-${coupleBride}`);
    // Formulir Akses Awal (opsional, ditinjau admin)
    const eventDateRaw = clean(body?.eventDate, 10);
    const application = {
      eventDate: /^\d{4}-\d{2}-\d{2}$/.test(eventDateRaw) ? eventDateRaw : undefined,
      city: clean(body?.city, 80) || undefined,
      referralSource: clean(body?.referralSource, 80) || undefined,
      note: clean(body?.note, 500) || undefined,
    };

    // Identitas: Google (token dari server) atau email + password
    let email = clean(body?.email, 160).toLowerCase();
    let password = String(body?.password || '');
    let fullName = clean(body?.fullName, 100);
    let avatarUrl: string | undefined;
    let authProvider: 'local' | 'google' = 'local';

    if (body?.googleSignupToken) {
      const g = await verifyData<{ kind: string; email: string; name: string; picture?: string; exp: number }>(
        String(body.googleSignupToken)
      );
      if (!g || g.kind !== 'google-signup') {
        return jsonError('Sesi Google kedaluwarsa. Silakan masuk dengan Google sekali lagi.', 401);
      }
      email = g.email;
      fullName = fullName || g.name;
      avatarUrl = g.picture || undefined;
      authProvider = 'google';
      password = randomBytes(24).toString('base64url');
    } else {
      if (!EMAIL_RE.test(email)) return jsonError('Format email tidak valid.');
      const weak = validatePasswordStrength(password);
      if (weak) return jsonError(weak);
    }

    if (!coupleGroom || !coupleBride) return jsonError('Nama panggilan kedua mempelai wajib diisi.');
    if (!fullName) fullName = `${coupleGroom} & ${coupleBride}`;
    if (noWa.replace(/\D/g, '').length < 9) return jsonError('Nomor WhatsApp tidak valid.');
    if (activeSlug.length < 3) return jsonError('Tautan undangan minimal 3 karakter.');
    if (RESERVED_SLUGS.has(activeSlug)) return jsonError('Tautan tersebut tidak tersedia. Pilih variasi lain.');

    const ip = getClientIp(req);
    if (ip !== 'unknown' && (await checkBannedIp(ip))) {
      return jsonError('Pendaftaran ditolak. Alamat IP Anda telah diblokir.', 403);
    }
    if (await checkEmailExists(email)) {
      return jsonError('Email ini sudah terdaftar. Silakan masuk.', 409);
    }
    if (await checkSlugExists(activeSlug)) {
      return jsonError('Tautan undangan sudah digunakan. Silakan ubah sedikit.', 409);
    }

    const user = await createUser({
      fullName,
      coupleGroom,
      coupleBride,
      activeSlug,
      email,
      password,
      noWa,
      sosmed,
      packageId: 'free',
      isCustomByRfx: false,
      paymentStatus: 'success',
      ipAddress: ip === 'unknown' ? '' : ip,
      authProvider,
      avatarUrl,
      accountStatus: 'pending',
      application,
    } as any);
    if (avatarUrl) {
      await updateUserAvatar(user.id, avatarUrl).catch(() => {});
    }

    notifyAdmin('Pendaftar Akses Awal baru', `${fullName} (${email}) menunggu persetujuan.`, { userId: user.id }).catch(() => {});

    // Kontrak A–B: 202 tanpa sesi dashboard; pendaftar menunggu persetujuan admin.
    const res = NextResponse.json(
      { success: true, accountStatus: 'pending', application: { fullName, email } },
      { status: 202 }
    );
    return clearSession(res);
  } catch (err) {
    return handleRouteError('auth/register', err);
  }
}
