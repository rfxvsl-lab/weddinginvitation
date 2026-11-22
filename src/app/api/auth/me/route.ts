import { NextResponse } from 'next/server';
import { getSession, toClientUser, clearSession } from '@/lib/server/auth';
import { getUserById } from '@/lib/db';
import { handleRouteError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null }, { status: 401 });
    const user = await getUserById(session.uid);
    if (!user) return clearSession(NextResponse.json({ user: null }, { status: 401 }));
    return NextResponse.json({ user: toClientUser(user) });
  } catch (err) {
    return handleRouteError('auth/me', err);
  }
}
