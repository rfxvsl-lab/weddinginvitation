import { NextResponse } from 'next/server';
import { updateUserProfile } from '../../../lib/api';
import { errorResponse, jsonError, readJson } from '../../../server/http';

export const runtime = 'nodejs';

/**
 * Perbarui avatar atau slug akun yang sedang login.
 * `userId` di body diabaikan; identitas diambil dari session.
 */
export async function POST(req: Request) {
  try {
    const body = await readJson(req);
    const updates: { avatarUrl?: string; activeSlug?: string } = {};
    if (body.avatarUrl !== undefined) updates.avatarUrl = String(body.avatarUrl);
    if (body.activeSlug !== undefined) updates.activeSlug = String(body.activeSlug);

    const result = await updateUserProfile('', updates);
    if (result.ok === false) return jsonError(result.error, 400);
    return NextResponse.json({ success: true, activeSlug: result.user.activeSlug, avatarUrl: result.user.avatarUrl });
  } catch (error) {
    return errorResponse('update-profile', error);
  }
}
