/**
 * Enterprise Access Module (Server-Side)
 *
 * Mengelola validasi email perusahaan (company email) dan verifikasi kode akses
 * khusus untuk portal Enterprise RuangHadir.
 *
 * Alur:
 * 1. Pembeli Enterprise menghubungi admin@ruanghadir.net.
 * 2. Admin menerbitkan kode akses khusus yang terikat pada domain perusahaan
 *    (atau email perusahaan spesifik) dan menyimpannya di tabel `enterprise_access`
 *    (atau melalui ENV `ENTERPRISE_ACCESS_CODES` sebagai fallback darurat).
 * 3. Pengguna masuk melalui `/auth?mode=enterprise` dengan email perusahaan + kode khusus.
 */

import { dbExecute, genId } from './turso';
import type { EnterpriseAccessRecord } from '../types';

/** Daftar domain email publik/gratis yang ditolak pada portal Enterprise */
export const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.id',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'mail.com',
  'yandex.com',
  'yandex.ru',
  'zoho.com',
  'gmx.com',
  'tutanota.com',
]);

export interface CompanyEmailValidation {
  valid: boolean;
  email: string;
  domain: string;
  error?: string;
}

/** Validasi bahwa email berformat benar dan menggunakan domain perusahaan (bukan webmail publik). */
export function validateCompanyEmail(rawEmail: string): CompanyEmailValidation {
  const email = (rawEmail || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i;
  const match = email.match(emailRegex);

  if (!match) {
    return {
      valid: false,
      email,
      domain: '',
      error: 'Format email perusahaan tidak valid.',
    };
  }

  const domain = match[1].toLowerCase();
  if (PUBLIC_EMAIL_DOMAINS.has(domain)) {
    return {
      valid: false,
      email,
      domain,
      error: `Akses Enterprise wajib menggunakan email perusahaan resmi, bukan domain publik (${domain}).`,
    };
  }

  return { valid: true, email, domain };
}

/** Normalisasi kode akses sebelum di-hash (uppercase, hapus spasi berlebih). */
export function normalizeAccessCode(rawCode: string): string {
  return (rawCode || '').trim().toUpperCase().replace(/\s+/g, '');
}

/** SHA-256 hex digest untuk penyimpanan kode akses secara aman */
export async function hashAccessCode(rawCode: string): Promise<string> {
  const normalized = normalizeAccessCode(rawCode);
  const encoder = new TextEncoder();
  const data = encoder.encode(`ruanghadir-ent::${normalized}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Auto-migrasi ringan agar tabel `enterprise_access` selalu tersedia di Turso */
export async function ensureEnterpriseSchema(): Promise<void> {
  await dbExecute(`
    CREATE TABLE IF NOT EXISTS enterprise_access (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      allowed_domain TEXT NOT NULL,
      allowed_email TEXT,
      access_code_hash TEXT NOT NULL,
      code_hint TEXT NOT NULL,
      max_seats INTEGER NOT NULL DEFAULT 10,
      used_seats INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `);
}

export interface EnterpriseVerificationResult {
  ok: boolean;
  error?: string;
  recordId?: string;
  companyName?: string;
  allowedDomain?: string;
}

/**
 * Verifikasi pasangan (email perusahaan, kode akses khusus) terhadap:
 * 1. Tabel `enterprise_access` di Turso
 * 2. Fallback ENV `ENTERPRISE_ACCESS_CODES` (format: `domain.com:KODE-ENT-01:Nama Perusahaan;...`)
 */
export async function verifyEnterpriseAccess(
  rawEmail: string,
  rawCode: string
): Promise<EnterpriseVerificationResult> {
  const emailCheck = validateCompanyEmail(rawEmail);
  if (!emailCheck.valid) {
    return { ok: false, error: emailCheck.error };
  }

  const normalizedCode = normalizeAccessCode(rawCode);
  if (normalizedCode.length < 6) {
    return {
      ok: false,
      error: 'Kode akses Enterprise minimal 6 karakter. Hubungi admin@ruanghadir.net jika belum memiliki kode.',
    };
  }

  const codeHash = await hashAccessCode(normalizedCode);

  // 1. Cek database Turso
  try {
    await ensureEnterpriseSchema();
    const res = await dbExecute(
      `SELECT * FROM enterprise_access
       WHERE active = 1
         AND access_code_hash = :hash
         AND (
           LOWER(allowed_email) = :email
           OR ( (allowed_email IS NULL OR allowed_email = '') AND LOWER(allowed_domain) = :domain )
         )
       LIMIT 1`,
      {
        hash: codeHash,
        email: emailCheck.email,
        domain: emailCheck.domain,
      }
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const expiresAt = row.expires_at as string | null;
      if (expiresAt && new Date(expiresAt) < new Date()) {
        return {
          ok: false,
          error: 'Masa berlaku kode akses Enterprise Anda telah berakhir. Hubungi admin@ruanghadir.net untuk perpanjangan.',
        };
      }

      const maxSeats = Number(row.max_seats || 10);
      const usedSeats = Number(row.used_seats || 0);
      if (usedSeats >= maxSeats) {
        return {
          ok: false,
          error: 'Kuota pengguna (seat) untuk kode akses Enterprise ini sudah penuh. Hubungi admin@ruanghadir.net.',
        };
      }

      return {
        ok: true,
        recordId: row.id as string,
        companyName: row.company_name as string,
        allowedDomain: row.allowed_domain as string,
      };
    }
  } catch (err) {
    console.warn('[verifyEnterpriseAccess] DB check skipped/failed:', err);
  }

  // 2. Fallback ENV: ENTERPRISE_ACCESS_CODES="acme.co.id:RH-ACME-2026:PT Acme Indonesia"
  const envSpec = (process.env.ENTERPRISE_ACCESS_CODES || '').trim();
  if (envSpec) {
    const entries = envSpec.split(/[;\n]+/).map((s) => s.trim()).filter(Boolean);
    for (const entry of entries) {
      const [domainOrEmail, code, companyLabel] = entry.split(':').map((p) => (p || '').trim());
      if (!domainOrEmail || !code) continue;
      const target = domainOrEmail.toLowerCase();
      const emailMatches = target.includes('@')
        ? target === emailCheck.email
        : target === emailCheck.domain;

      if (emailMatches && normalizeAccessCode(code) === normalizedCode) {
        return {
          ok: true,
          recordId: 'env-provisioned',
          companyName: companyLabel || emailCheck.domain.toUpperCase(),
          allowedDomain: emailCheck.domain,
        };
      }
    }
  }

  return {
    ok: false,
    error: 'Email perusahaan atau kode akses Enterprise tidak cocok. Pastikan kode sesuai yang diterbitkan oleh admin@ruanghadir.net.',
  };
}

/** Increment seat count saat pengguna baru mengaktifkan akun Enterprise */
export async function incrementEnterpriseSeat(recordId: string): Promise<void> {
  if (!recordId || recordId === 'env-provisioned') return;
  try {
    await dbExecute(
      `UPDATE enterprise_access SET used_seats = used_seats + 1 WHERE id = :id`,
      { id: recordId }
    );
  } catch (err) {
    console.warn('[incrementEnterpriseSeat] Failed:', err);
  }
}

/** Terbitkan kode akses Enterprise baru (untuk Admin) */
export async function issueEnterpriseCode(input: {
  companyName: string;
  allowedDomain: string;
  allowedEmail?: string;
  accessCode: string;
  maxSeats?: number;
  expiresAt?: string | null;
}): Promise<EnterpriseAccessRecord> {
  await ensureEnterpriseSchema();
  const id = genId('ent');
  const normalizedCode = normalizeAccessCode(input.accessCode);
  const hash = await hashAccessCode(normalizedCode);
  const codeHint =
    normalizedCode.length > 4
      ? `${normalizedCode.slice(0, 3)}••••${normalizedCode.slice(-2)}`
      : '••••••';
  const createdAt = new Date().toISOString();
  const domain = input.allowedDomain.trim().toLowerCase().replace(/^@/, '');
  const email = input.allowedEmail ? input.allowedEmail.trim().toLowerCase() : null;
  const maxSeats = Math.max(1, Number(input.maxSeats || 10));

  await dbExecute(
    `INSERT INTO enterprise_access
      (id, company_name, allowed_domain, allowed_email, access_code_hash, code_hint, max_seats, used_seats, active, expires_at, created_at)
     VALUES
      (:id, :companyName, :domain, :email, :hash, :hint, :maxSeats, 0, 1, :expiresAt, :createdAt)`,
    {
      id,
      companyName: input.companyName.trim(),
      domain,
      email,
      hash,
      hint: codeHint,
      maxSeats,
      expiresAt: input.expiresAt || null,
      createdAt,
    }
  );

  return {
    id,
    companyName: input.companyName.trim(),
    allowedDomain: domain,
    allowedEmail: email,
    codeHint,
    maxSeats,
    usedSeats: 0,
    active: true,
    expiresAt: input.expiresAt || null,
    createdAt,
  };
}

export async function listEnterpriseCodes(): Promise<EnterpriseAccessRecord[]> {
  await ensureEnterpriseSchema();
  const res = await dbExecute(
    `SELECT * FROM enterprise_access ORDER BY created_at DESC`
  );
  return res.rows.map((row: any) => ({
    id: row.id as string,
    companyName: row.company_name as string,
    allowedDomain: row.allowed_domain as string,
    allowedEmail: (row.allowed_email as string) || null,
    codeHint: row.code_hint as string,
    maxSeats: Number(row.max_seats || 10),
    usedSeats: Number(row.used_seats || 0),
    active: Boolean(row.active),
    expiresAt: (row.expires_at as string) || null,
    createdAt: row.created_at as string,
  }));
}

export async function revokeEnterpriseCode(id: string): Promise<void> {
  await ensureEnterpriseSchema();
  await dbExecute(`UPDATE enterprise_access SET active = 0 WHERE id = :id`, { id });
}
