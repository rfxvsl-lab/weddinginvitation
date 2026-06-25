import { NextResponse } from 'next/server';
import { dbExecute } from '../../../lib/turso';
import { checkSlugExists, updateUserProfile } from '../../../lib/api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, avatarUrl, activeSlug } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId diperlukan.' }, { status: 400 });
    }

    // Handle avatar update
    if (avatarUrl !== undefined) {
      await dbExecute(
        'UPDATE users SET avatar_url = :avatarUrl WHERE id = :userId',
        { avatarUrl, userId }
      );
      console.log(`[update-profile] ✅ Avatar updated for user ${userId}`);
    }

    // Handle slug update
    if (activeSlug !== undefined) {
      // Validate format
      const cleanSlug = activeSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanSlug.length < 3) {
        return NextResponse.json({ error: 'Slug harus minimal 3 karakter.' }, { status: 400 });
      }
      if (cleanSlug.length > 50) {
        return NextResponse.json({ error: 'Slug maksimal 50 karakter.' }, { status: 400 });
      }

      // Check uniqueness (exclude current user)
      const exists = await checkSlugExists(cleanSlug, userId);
      if (exists) {
        return NextResponse.json({ error: 'Slug sudah digunakan oleh pengguna lain.' }, { status: 409 });
      }

      // Update slug in DB
      await updateUserProfile(userId, { activeSlug: cleanSlug });
      console.log(`[update-profile] ✅ Slug updated for user ${userId}: ${cleanSlug}`);

      return NextResponse.json({ success: true, activeSlug: cleanSlug });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[update-profile] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal update profil.' },
      { status: 500 }
    );
  }
}
