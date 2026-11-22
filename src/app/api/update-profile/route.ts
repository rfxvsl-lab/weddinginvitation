import { NextResponse } from 'next/server';
import { checkSlugExists, updateUserProfile } from '../../../lib/db';
import { requireSession } from '../../../lib/server/auth';
import { handleRouteError, jsonError, normalizeSlug, RESERVED_SLUGS } from '../../../lib/server/http';

export const runtime = 'nodejs';

/** Update avatar / slug untuk akun yang sedang login (userId dari sesi, bukan dari body). */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const userId = session.uid;
    const body = await req.json().catch(() => ({}));
    const { avatarUrl, activeSlug } = body ?? {};

    if (avatarUrl !== undefined) {
      const url = String(avatarUrl || '').trim().slice(0, 500);
      if (url && !/^https:\/\//.test(url)) return jsonError('URL foto profil tidak valid.');
      await updateUserProfile(userId, { avatarUrl: url });
    }

    if (activeSlug !== undefined) {
      const cleanSlug = normalizeSlug(String(activeSlug));
      if (cleanSlug.length < 3) return jsonError('Slug harus minimal 3 karakter.');
      if (RESERVED_SLUGS.has(cleanSlug)) return jsonError('Slug tersebut tidak tersedia.');
      if (await checkSlugExists(cleanSlug, userId)) {
        return jsonError('Slug sudah digunakan oleh pengguna lain.', 409);
      }
      await updateUserProfile(userId, { activeSlug: cleanSlug });
      return NextResponse.json({ success: true, activeSlug: cleanSlug });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError('update-profile', err);
  }
}
