'use client';

import React, { useState } from 'react';
import {
  Building2,
  KeyRound,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ENTERPRISE_CONTACT_EMAIL } from '@/lib/packageLimits';
import type { SaaSUser } from '@/types';

const PUBLIC_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.id',
  'ymail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
]);

interface EnterpriseSignInViewProps {
  onSuccess: (user: SaaSUser) => void;
  onBackToPersonal: () => void;
}

export default function EnterpriseSignInView({
  onSuccess,
  onBackToPersonal,
}: EnterpriseSignInViewProps) {
  const [companyEmail, setCompanyEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = companyEmail.trim().toLowerCase();
    const domain = trimmedEmail.split('@')[1] || '';

    if (!domain || !trimmedEmail.includes('@')) {
      setError('Masukkan alamat email perusahaan yang valid.');
      return;
    }

    if (PUBLIC_DOMAINS.has(domain)) {
      setError(
        `Portal Enterprise wajib menggunakan email perusahaan resmi, bukan domain publik (${domain}).`
      );
      return;
    }

    if (accessCode.trim().length < 6) {
      setError('Masukkan kode akses khusus Enterprise (minimal 6 karakter).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          accessCode: accessCode.trim(),
          fullName: fullName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Akses Enterprise ditolak. Periksa kembali email & kode Anda.');
        return;
      }
      onSuccess(data.user);
    } catch {
      setError('Gagal terhubung ke server autentikasi Enterprise. Coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] saas-card p-8 sm:p-10 space-y-6">
      <div className="text-center space-y-2.5">
        <div className="flex justify-center mb-4">
          <Logo isLink={false} className="w-44" />
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
          style={{
            background: 'var(--saas-gold-soft)',
            color: '#7E5A1E',
          }}
        >
          <Building2 size={12} /> Portal Akses Enterprise
        </span>
        <h2 className="text-[28px] font-serif leading-tight text-[var(--rh-ink)]">
          Masuk dengan Email Perusahaan
        </h2>
        <p className="text-[13.5px] leading-relaxed text-[var(--rh-ink-2)]">
          Masukkan email kantor resmi dan kode akses khusus yang diterbitkan
          oleh tim RuangHadir.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="ent-email" className="saas-field-label">
            Email Perusahaan
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B89047]" />
            <input
              id="ent-email"
              type="email"
              required
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="saas-input"
              placeholder="nama@perusahaan.co.id"
              autoComplete="email"
            />
          </div>
          <p className="text-[11px] text-[var(--rh-muted)]">
            Domain webmail publik (Gmail, Yahoo, Outlook) tidak diizinkan pada
            jalur Enterprise.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ent-code" className="saas-field-label">
            Kode Akses Khusus
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B89047]" />
            <input
              id="ent-code"
              type="text"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="saas-input font-mono uppercase tracking-[0.14em]"
              placeholder="RH-ENT-XXXXXX"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ent-name" className="saas-field-label">
            Nama Lengkap <span className="font-normal normal-case tracking-normal text-[#9B8D84]">(opsional untuk login pertama)</span>
          </label>
          <input
            id="ent-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="saas-input saas-input-flush"
            placeholder="Contoh: Nadia Pratama"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-[#B03A3A]/25 bg-[#F9E9E7] p-3.5 text-[12.5px] font-medium text-[#B03A3A]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="saas-btn-primary w-full !py-3.5"
        >
          <span>{loading ? 'Memverifikasi Akses...' : 'Masuk Workspace Enterprise'}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div
        className="rounded-xl border p-4 text-[12px] leading-relaxed"
        style={{
          borderColor: 'var(--saas-line)',
          background: 'var(--saas-bg)',
          color: 'var(--saas-ink-2)',
        }}
      >
        <p className="flex items-center gap-1.5 font-bold text-[var(--rh-ink)]">
          <ShieldCheck size={14} style={{ color: 'var(--saas-gold)' }} />
          Belum memiliki kode akses Enterprise?
        </p>
        <p className="mt-1">
          Hubungi{' '}
          <a
            href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Permintaan%20Kode%20Akses%20Enterprise`}
            className="font-bold text-[var(--rh-primary)] hover:underline"
          >
            {ENTERPRISE_CONTACT_EMAIL}
          </a>{' '}
          dari email perusahaan Anda untuk pengaktifan akun organisasi.
        </p>
      </div>

      <button
        type="button"
        onClick={onBackToPersonal}
        className="flex w-full items-center justify-center gap-1.5 text-[13px] font-bold text-[var(--rh-ink-2)] hover:text-[var(--rh-ink)] cursor-pointer"
      >
        <ArrowLeft size={14} /> Kembali ke Login Akun Gratis
      </button>
    </div>
  );
}
