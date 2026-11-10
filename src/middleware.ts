import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './server/sessionToken';

/**
 * Next.js Middleware — proteksi route. Header keamanan diatur di next.config.js.
 *
 * /dashboard dan /admin hanya bisa dibuka dengan cookie session yang tanda
 * tangannya sah. Middleware hanya penjaga pintu untuk navigasi; setiap akses
 * data tetap dicek ulang di server action dan route handler.
 */

const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const ADMIN_ONLY_ROUTES = ['/admin'];

function matches(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matches(pathname, PROTECTED_ROUTES)) {
    return NextResponse.next();
  }

  // Secret tidak dikonfigurasi = tidak ada session yang bisa dipercaya.
  const secret = process.env.SESSION_SECRET || '';
  const session =
    secret.length >= 32 ? verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, secret) : null;

  if (!session) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    redirectUrl.searchParams.set('reason', 'auth_required');
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(SESSION_COOKIE);
    // Cookie lama tanpa tanda tangan tidak pernah dipercaya lagi.
    response.cookies.delete('saas_user_session');
    return response;
  }

  if (matches(pathname, ADMIN_ONLY_ROUTES) && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Vercel menolak middleware Edge untuk project ini — pakai runtime Node.js
  runtime: 'nodejs',
  // Hanya route terproteksi; halaman undangan dan aset tidak perlu lewat middleware.
  matcher: ['/dashboard', '/dashboard/:path*', '/admin', '/admin/:path*'],
};
