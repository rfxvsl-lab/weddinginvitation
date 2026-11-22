import { NextRequest, NextResponse } from 'next/server';
import {
  verifyEnterpriseAccess,
  incrementEnterpriseSeat,
} from '@/lib/enterprise';
import {
  getUserByEmail,
  createUser,
  checkSlugExists,
} from '@/lib/db';
import { dbExecute } from '@/lib/turso';
import { attachSession, toClientUser } from '@/lib/server/auth';
import { limitOr429 } from '@/lib/server/http';

export const runtime = 'nodejs';

/**
 * POST /api/auth/enterprise
 *
 * Autentikasi khusus klien Enterprise:
 * - Wajib menggunakan email perusahaan (domain non-publik)
 * - Wajib menyertakan kode akses khusus yang diterbitkan admin@ruanghadir.net
 */
export async function POST(req: NextRequest) {
  try {
    const limited = limitOr429(req, 'enterprise-auth', 10, 15 * 60);
    if (limited) return limited;
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const accessCode = String(body?.accessCode || '').trim();
    const fullNameInput = String(body?.fullName || '').trim();

    if (!email || !accessCode) {
      return NextResponse.json(
        { error: 'Email perusahaan dan kode akses Enterprise wajib diisi.' },
        { status: 400 }
      );
    }

    const verification = await verifyEnterpriseAccess(email, accessCode);
    if (!verification.ok) {
      return NextResponse.json(
        { error: verification.error || 'Akses Enterprise ditolak.' },
        { status: 403 }
      );
    }

    // Cek apakah akun sudah ada di database
    let user = await getUserByEmail(email);

    if (user) {
      // Pastikan akun dinaikkan ke tier Enterprise & paymentStatus success
      if (user.packageId !== 'enterprise' || user.paymentStatus !== 'success') {
        await dbExecute(
          `UPDATE users SET package_id = 'enterprise', payment_status = 'success' WHERE id = :id`,
          { id: user.id }
        );
        user = {
          ...user,
          packageId: 'enterprise',
          paymentStatus: 'success',
        };
      }
    } else {
      // Auto-provision akun Enterprise baru
      const localPart = email.split('@')[0].replace(/[^a-z0-9]/gi, ' ').trim();
      const displayName =
        fullNameInput ||
        localPart
          .split(/\s+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') ||
        verification.companyName ||
        'Enterprise Member';

      const baseSlug = `${(verification.allowedDomain || 'ent').split('.')[0]}-${localPart.replace(/\s+/g, '')}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 28);

      let slug = baseSlug || `ent-${Math.random().toString(36).slice(2, 7)}`;
      if (await checkSlugExists(slug)) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }

      user = await createUser({
        fullName: displayName,
        coupleGroom: verification.companyName || 'Enterprise',
        coupleBride: 'Event',
        activeSlug: slug,
        email,
        password: `ent_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        noWa: '-',
        sosmed: '',
        packageId: 'enterprise',
        isCustomByRfx: true,
        paymentStatus: 'success',
        authProvider: 'enterprise',
        ipAddress: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim(),
      });

      if (verification.recordId) {
        await incrementEnterpriseSeat(verification.recordId);
      }
    }

    const enrichedUser = {
      ...user,
      packageId: 'enterprise' as const,
      paymentStatus: 'success' as const,
      companyName: verification.companyName,
      companyDomain: verification.allowedDomain,
    };

    const res = NextResponse.json({
      ok: true,
      user: toClientUser(enrichedUser),
      enterprise: {
        companyName: verification.companyName,
        allowedDomain: verification.allowedDomain,
      },
    });

    await attachSession(res, user);
    return res;
  } catch (err: any) {
    console.error('[POST /api/auth/enterprise] Error:', err);
    return NextResponse.json(
      { error: 'Terjadi gangguan pada server autentikasi Enterprise. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
