import { NextRequest, NextResponse } from 'next/server';
import {
  issueEnterpriseCode,
  listEnterpriseCodes,
  revokeEnterpriseCode,
  PUBLIC_EMAIL_DOMAINS,
} from '@/lib/enterprise';
import { getSession } from '@/lib/server/auth';

export const runtime = 'nodejs';

async function isAuthorizedAdmin(req: NextRequest): Promise<boolean> {
  // 1. Header secret opsional untuk integrasi CLI/otomasi
  const apiSecret = process.env.ENTERPRISE_ADMIN_SECRET;
  const headerSecret = req.headers.get('x-admin-secret');
  if (apiSecret && headerSecret && headerSecret === apiSecret) return true;

  // 2. Sesi admin bertanda tangan (httpOnly)
  const session = await getSession();
  return session?.role === 'admin';
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const codes = await listEnterpriseCodes();
    return NextResponse.json({ ok: true, codes });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memuat kode akses Enterprise.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const companyName = String(body?.companyName || '').trim();
    const allowedDomain = String(body?.allowedDomain || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
    const allowedEmail = body?.allowedEmail
      ? String(body.allowedEmail).trim().toLowerCase()
      : undefined;
    const accessCode = String(body?.accessCode || '').trim();
    const maxSeats = Number(body?.maxSeats || 10);
    const expiresAt = body?.expiresAt ? String(body.expiresAt) : null;

    if (!companyName || !allowedDomain || accessCode.length < 6) {
      return NextResponse.json(
        {
          error:
            'companyName, allowedDomain, dan accessCode (min. 6 karakter) wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (PUBLIC_EMAIL_DOMAINS.has(allowedDomain)) {
      return NextResponse.json(
        {
          error: `Domain publik (${allowedDomain}) tidak diizinkan untuk akses Enterprise.`,
        },
        { status: 400 }
      );
    }

    const record = await issueEnterpriseCode({
      companyName,
      allowedDomain,
      allowedEmail,
      accessCode,
      maxSeats,
      expiresAt,
    });

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal menerbitkan kode akses Enterprise.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthorizedAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = req.nextUrl.searchParams.get('id') || '';
    if (!id) {
      return NextResponse.json({ error: 'Parameter id wajib diisi.' }, { status: 400 });
    }
    await revokeEnterpriseCode(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal mencabut kode akses Enterprise.' },
      { status: 500 }
    );
  }
}
