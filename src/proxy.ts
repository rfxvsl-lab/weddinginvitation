import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken, isAdminEmail } from './lib/session-edge';

/**
 * Proxy (pengganti middleware di Next.js 16)
 * - Menambahkan security headers global
 * - Menjaga /dashboard & /admin: hanya sesi bertanda tangan yang valid yang diterima.
 *   Otorisasi data tetap dicek ulang di setiap Server Action / Route Handler.
 */

function withSecurityHeaders(res: NextResponse) {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isProtected = isAdminRoute || pathname === '/dashboard' || pathname.startsWith('/dashboard/');

  if (!isProtected) return withSecurityHeaders(NextResponse.next());

  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL('/auth', request.url);
    url.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(url);
    res.cookies.set('saas_user_session', '', { path: '/', maxAge: 0 });
    return withSecurityHeaders(res);
  }

  if (isAdminRoute && !isAdminEmail(session.email)) {
    return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|mp3|mp4|woff2?)$).*)'],
};
