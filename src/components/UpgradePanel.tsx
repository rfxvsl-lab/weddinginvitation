'use client';

/**
 * UpgradePanel — Manajemen Paket & Aktivasi Enterprise RuangHadir.
 * Model 2-tier:
 * - Full Gratis (Rp 0): seluruh fitur inti terbuka tanpa batas.
 * - Enterprise: untuk WO / agensi / korporat, pemesanan via admin@ruanghadir.net
 *   dan aktivasi lewat email perusahaan + kode akses khusus.
 */

import React, { useState } from 'react';
import {
  Building2,
  Check,
  Mail,
  Copy,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,

} from 'lucide-react';
import type { SaaSUser } from '../types';
import {
  ENTERPRISE_CONTACT_EMAIL,
  isEnterpriseTier,
} from '../lib/packageLimits';

interface UpgradePanelProps {
  user: SaaSUser | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  invitationId?: string | null;
  onSuccess?: (updatedUser: SaaSUser) => void;
}

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

const FREE_FEATURES = [
  'Semua koleksi tema, bertambah setiap hari',
  'Tamu & tautan personal tanpa batas',
  'QR Code check-in, amplop digital, & RSVP real-time',
  'Export CSV/PDF & statistik kunjungan',
  'Publish instan tanpa watermark',
];

const ENTERPRISE_FEATURES = [
  'Semua fitur Full Gratis + kapasitas proyek tak terbatas',
  'Custom domain white-label milik perusahaan/WO',
  'Multi-seat akses tim dengan domain email perusahaan',
  'Kontrol kode akses organisasi & audit seat terpusat',
  'SLA dukungan prioritas & integrasi kustom',
];

export default function UpgradePanel({ user, onSuccess }: UpgradePanelProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [companyEmail, setCompanyEmail] = useState(
    user?.email && !PUBLIC_DOMAINS.has((user.email.split('@')[1] || '').toLowerCase())
      ? user.email
      : ''
  );
  const [accessCode, setAccessCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  const isEnt = isEnterpriseTier(user.packageId);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(ENTERPRISE_CONTACT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1800);
  };

  const handleActivateEnterprise = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmed = companyEmail.trim().toLowerCase();
    const domain = trimmed.split('@')[1] || '';

    if (!domain || !trimmed.includes('@')) {
      setError('Masukkan email perusahaan resmi Anda.');
      return;
    }
    if (PUBLIC_DOMAINS.has(domain)) {
      setError(`Aktivasi Enterprise wajib menggunakan email perusahaan, bukan ${domain}.`);
      return;
    }
    if (accessCode.trim().length < 6) {
      setError('Masukkan kode akses khusus Enterprise yang valid.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          accessCode: accessCode.trim(),
          fullName: user.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Kode akses atau email perusahaan tidak valid.');
        return;
      }
      setSuccessMsg('Akses Enterprise berhasil diaktifkan pada akun perusahaan Anda.');
      setAccessCode('');
      if (onSuccess && data.user) {
        onSuccess(data.user);
      }
    } catch {
      setError('Gagal menghubungi server aktivasi Enterprise.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      {/* ── Active Plan Banner ── */}
      <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isEnt ? 'bg-[#F4ECDD] text-[#8C6B34]' : 'bg-[#E9F2EA] text-[#3F7A52]'
              }`}
            >
              {isEnt ? <Building2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <div>
              <span className="text-[12px] font-medium text-[#7D6F71]">
                Paket Aktif Saat Ini
              </span>
              <h2 className="text-[20px] font-bold text-[#2A1E21]">
                {isEnt ? 'RuangHadir Enterprise' : 'RuangHadir Full Gratis'}
              </h2>
              <p className="mt-0.5 text-[13px] text-[#6B5D54]">
                {isEnt
                  ? `Terverifikasi untuk organisasi ${user.companyName || user.companyDomain || user.email}.`
                  : 'Seluruh fitur undangan personal sudah aktif penuh dengan biaya Rp 0.'}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${
              isEnt ? 'bg-[#F4ECDD] text-[#8C6B34]' : 'bg-[#E9F2EA] text-[#3F7A52]'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            Aktif
          </span>
        </div>
      </section>

      {/* ── 2-Tier Comparison ── */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Free Card */}
        <div className="flex flex-col rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#3F7A52]">
              Personal
            </span>
            {!isEnt && (
              <span className="rounded-full bg-[#E9F2EA] px-2.5 py-0.5 text-[10.5px] font-bold text-[#3F7A52]">
                Paket Anda
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-[24px] text-[#2A1E21]">Full Gratis</h3>
          <p className="mt-1 text-[28px] font-extrabold text-[#2A1E21]">
            Rp 0 <span className="text-[12.5px] font-normal text-[#7D6F71]">/ selamanya</span>
          </p>
          <p className="mt-2 text-[13px] text-[#6B5D54]">
            Untuk pasangan yang ingin membuat dan menerbitkan undangan digital elegan tanpa biaya.
          </p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#4A3E36]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3F7A52]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Enterprise Card */}
        <div className="flex flex-col rounded-2xl border border-[#D8C5A3] bg-[#FCF9F3] p-6">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#8C6B34]">
              WO · Agensi · Korporat
            </span>
            {isEnt && (
              <span className="rounded-full bg-[#F4ECDD] px-2.5 py-0.5 text-[10.5px] font-bold text-[#8C6B34]">
                Aktif
              </span>
            )}
          </div>
          <h3 className="mt-2 font-serif text-[24px] text-[#2A1E21]">Enterprise</h3>
          <p className="mt-1 text-[28px] font-extrabold text-[#2A1E21]">
            Custom{' '}
            <span className="text-[12.5px] font-normal text-[#7D6F71]">/ kontrak organisasi</span>
          </p>
          <p className="mt-2 text-[13px] text-[#6B5D54]">
            Dirancang untuk Wedding Organizer, agensi event, dan perusahaan dengan akses email kantor resmi.
          </p>
          <ul className="mt-5 space-y-2.5 flex-1">
            {ENTERPRISE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#4A3E36]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#7A2E3B]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href={`mailto:${ENTERPRISE_CONTACT_EMAIL}?subject=Permintaan%20Paket%20Enterprise%20RuangHadir`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2A1E21] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#332925]"
            >
              <Mail className="h-4 w-4" />
              Hubungi {ENTERPRISE_CONTACT_EMAIL}
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D6C9BA] bg-white px-3.5 py-2.5 text-[12.5px] font-semibold text-[#2A1E21] transition hover:bg-[#F8F5F0] cursor-pointer"
              title="Salin email Enterprise"
            >
              {copiedEmail ? <Check className="h-4 w-4 text-[#3F7A52]" /> : <Copy className="h-4 w-4 text-[#6B5D54]" />}
              {copiedEmail ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Inline Enterprise Access Code Activation ── */}
      {!isEnt && (
        <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7A2E3B]/10 text-[#7A2E3B]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#2A1E21]">
                Sudah Punya Kode Akses Enterprise?
              </h3>
              <p className="mt-0.5 text-[12.5px] text-[#6B5D54]">
                Masukkan email perusahaan resmi dan kode khusus dari{' '}
                <a
                  href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`}
                  className="font-semibold text-[#7A2E3B] hover:underline"
                >
                  {ENTERPRISE_CONTACT_EMAIL}
                </a>{' '}
                untuk langsung membuka workspace Enterprise.
              </p>
            </div>
          </div>

          <form onSubmit={handleActivateEnterprise} className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <label htmlFor="dash-ent-email" className="mb-1.5 block text-[11.5px] font-bold text-[#54464A]">
                Email Perusahaan
              </label>
              <input
                id="dash-ent-email"
                type="email"
                required
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="nama@perusahaan.co.id"
                className="w-full rounded-xl border border-[#D6C9BA] bg-[#F8F5F0] px-3.5 py-2.5 text-[13px] text-[#2A1E21] outline-none focus:border-[#7A2E3B] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="dash-ent-code" className="mb-1.5 block text-[11.5px] font-bold text-[#54464A]">
                Kode Akses Khusus
              </label>
              <input
                id="dash-ent-code"
                type="text"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="RH-ENT-XXXXXX"
                className="w-full rounded-xl border border-[#D6C9BA] bg-[#F8F5F0] px-3.5 py-2.5 font-mono text-[13px] uppercase tracking-wider text-[#2A1E21] outline-none focus:border-[#7A2E3B] focus:bg-white"
              />
            </div>

            <div className="flex items-end sm:col-span-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7A2E3B] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#63232F] disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? 'Memverifikasi...' : 'Aktifkan'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#B03A3A]/25 bg-[#F9E9E7] px-3.5 py-2.5 text-[12.5px] text-[#B03A3A]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#3F7A52]/25 bg-[#E9F2EA] px-3.5 py-2.5 text-[12.5px] text-[#3F7A52]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
