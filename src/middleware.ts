import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './server/sessionToken';

/**
 * Next.js Middleware — proteksi route dan header keamanan.
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

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Kamera & mikrofon hanya untuk origin sendiri (scanner check-in, ucapan suara).
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matches(pathname, PROTECTED_ROUTES)) {
    return withSecurityHeaders(NextResponse.next());
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
    return withSecurityHeaders(response);
  }

  if (matches(pathname, ADMIN_ONLY_ROUTES) && session.role !== 'admin') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  // Vercel menolak middleware Edge untuk project ini — pakai runtime Node.js
  runtime: 'nodejs',
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
