import { NextResponse } from 'next/server';
import { dbExecute } from '../../../lib/turso';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const testWrite = searchParams.get('test-write') === '1';

  if (!slug) {
    return NextResponse.json({ error: 'Missing ?slug= parameter' }, { status: 400 });
  }

  try {
    // 1. Find user by slug
    const userResult = await dbExecute(
      'SELECT id, full_name, couple_groom, couple_bride, active_slug FROM users WHERE active_slug = :slug LIMIT 1',
      { slug }
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: `No user found with slug "${slug}"` });
    }

    const user = userResult.rows[0];
    const userId = user.id as string;

    // 2. Find ALL invitations
    const invResult = await dbExecute(
      'SELECT id, title, theme_id, is_published, published_at, created_at, updated_at, LENGTH(wedding_data) as wd_len, LENGTH(published_wedding_data) as pwd_len, published_theme_id FROM invitations WHERE user_id = :userId ORDER BY created_at DESC',
      { userId }
    );

    if (invResult.rows.length === 0) {
      return NextResponse.json({ error: 'No invitations found', user });
    }

    const latestInv = invResult.rows[0];
    const invId = latestInv.id as string;

    // 3. Test WRITE if requested
    let writeTest = null;
    if (testWrite) {
      try {
        const testMarker = `write-test-${Date.now()}`;
        // Try updating the title with a test marker, then revert
        const before = await dbExecute('SELECT title, updated_at FROM invitations WHERE id = :id', { id: invId });
        const originalTitle = before.rows[0]?.title as string;
        
        // Write test
        await dbExecute(
          'UPDATE invitations SET title = :title, updated_at = :now WHERE id = :id',
          { title: `${originalTitle} [${testMarker}]`, now: new Date().toISOString(), id: invId }
        );
        
        // Read back
        const after = await dbExecute('SELECT title, updated_at FROM invitations WHERE id = :id', { id: invId });
        const newTitle = after.rows[0]?.title as string;
        const newUpdatedAt = after.rows[0]?.updated_at as string;
        
        // Revert
        await dbExecute(
          'UPDATE invitations SET title = :title WHERE id = :id',
          { title: originalTitle, id: invId }
        );

        writeTest = {
          status: newTitle.includes(testMarker) ? 'SUCCESS ✅ — DB writes work!' : 'FAILED ❌',
          originalTitle,
          testTitle: newTitle,
          updatedAt: newUpdatedAt,
        };
      } catch (err: any) {
        writeTest = { status: 'ERROR ❌', error: err.message };
      }
    }

    // 4. Get data preview
    const dataResult = await dbExecute('SELECT wedding_data, published_wedding_data FROM invitations WHERE id = :id', { id: invId });
    const row = dataResult.rows[0];
    
    let draftPreview: any = {};
    try {
      const wd = JSON.parse((row.wedding_data as string) || '{}');
      draftPreview = {
        groomNickname: wd?.couple?.groom?.nickname || '(empty)',
        brideNickname: wd?.couple?.bride?.nickname || '(empty)',
        totalKeys: Object.keys(wd).length,
      };
    } catch { draftPreview = { error: 'parse failed' }; }

    return NextResponse.json({
      user: { id: userId, slug: user.active_slug, fullName: user.full_name },
      invitationCount: invResult.rows.length,
      invitation: {
        id: invId,
        themeId: latestInv.theme_id,
        publishedThemeId: latestInv.published_theme_id || '(null)',
        isPublished: Boolean(latestInv.is_published),
        updatedAt: latestInv.updated_at,
        weddingDataLength: latestInv.wd_len,
        publishedDataLength: latestInv.pwd_len,
      },
      draftPreview,
      writeTest: writeTest || 'Add ?test-write=1 to test DB writes',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
