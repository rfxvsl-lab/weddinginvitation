import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware â€” Route Protection
 * Proteksi halaman /dashboard dan /admin dari akses langsung tanpa session.
 * Session dideteksi dari cookie 'saas_user_session' yang di-set saat login.
 */

// Route yang membutuhkan autentikasi
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

// Route khusus admin saja
const ADMIN_ONLY_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah route ini terproteksi
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();

  // Ambil session cookie
  const sessionCookie = request.cookies.get('saas_user_session');

  // Tidak ada session → redirect ke auth page
  if (!sessionCookie?.value) {
    const redirectUrl = new URL('/auth', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    redirectUrl.searchParams.set('reason', 'auth_required');
    return NextResponse.redirect(redirectUrl);
  }

  // Coba parse session data
  let sessionData: { email?: string; packageId?: string; isAdmin?: boolean } | null = null;
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    sessionData = JSON.parse(decoded);
  } catch {
    // Cookie invalid â†’ hapus dan redirect
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('saas_user_session');
    return response;
  }

  // Validasi route admin
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
  if (isAdminRoute && !sessionData?.isAdmin) {
    // Bukan admin â†’ redirect ke dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Lanjutkan request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
