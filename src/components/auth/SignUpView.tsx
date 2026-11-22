'use client';

/**
 * SignUpView — Wizard registrasi 3 langkah Full Gratis (Rp 0).
 * Langkah 1: Profil Pernikahan
 * Langkah 2: Detail Kontak
 * Langkah 3: Tautan Undangan & Konfirmasi Gratis (+ jalan pintas Portal Enterprise)
 */

import React, { useMemo, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Lock,
  Eye,
  EyeOff as EyeSlash,
  CheckCircle2 as CheckCircle,
  ShieldCheck,
  Building2,
  Check,
} from 'lucide-react';
import { ENTERPRISE_CONTACT_EMAIL } from '../../lib/packageLimits';
import type { UserPackageId } from '../../types';

interface GoogleUser {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
}

interface SignUpViewProps {
  step: 1 | 2 | 3;
  fullName: string;
  groomName: string;
  brideName: string;
  email: string;
  password: string;
  noWa: string;
  sosmed: string;
  slug: string;
  packageId: UserPackageId;
  slugError: string;
  error: string | null;
  isLoading: boolean;
  googleUser: GoogleUser | null;
  onFullNameChange: (v: string) => void;
  onGroomChange: (v: string) => void;
  onBrideChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNoWaChange: (v: string) => void;
  onSosmedChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onPackageChange: (id: UserPackageId) => void;
  onGotoEnterprise?: () => void;
  onBack: () => void;
  onNext1: () => void;
  onNext2: () => void;
  onComplete: () => void;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const normaliseWa = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  if (digits.startsWith('8')) return '0' + digits;
  return digits;
};
const isWa = (raw: string) => /^08\d{7,12}$/.test(normaliseWa(raw));

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { score: 0, label: 'Kosong' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^\w\s]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: 'Lemah' };
  if (s <= 3) return { score: 2, label: 'Cukup' };
  return { score: 3, label: 'Kuat' };
}

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Profil' },
    { n: 2, label: 'Kontak' },
    { n: 3, label: 'Aktivasi' },
  ];
  return (
    <nav aria-label="Langkah pendaftaran" className="space-y-2.5">
      <div className="saas-stepper">
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <span
              className="saas-stepper-dot"
              data-state={step > s.n ? 'done' : step === s.n ? 'active' : undefined}
              aria-current={step === s.n ? 'step' : undefined}
            >
              {step > s.n ? <CheckCircle size={14} /> : s.n}
            </span>
            {i < steps.length - 1 && (
              <span className="saas-stepper-track">
                <span style={{ width: step > s.n ? '100%' : '0%' }} />
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-[12px] font-medium">
        {steps.map((s) => (
          <span
            key={s.n}
            style={{ color: step === s.n ? 'var(--saas-primary)' : 'var(--saas-faint)' }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </nav>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon?: React.ElementType;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="saas-field-label" htmlFor={id}>
        {Icon && <Icon className="h-3.5 w-3.5" style={{ color: 'var(--saas-gold)' }} aria-hidden />}
        {label}
      </label>
      <div className="relative">{children}</div>
      {error ? (
        <p className="saas-field-error" role="alert">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p className="saas-field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  backLabel = 'Kembali',
  nextLabel = 'Lanjut',
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="saas-btn-outline flex-1 text-[14px]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="saas-btn-primary flex-[1.6] text-[14px]"
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

const FREE_PERKS = [
  'Semua 9 koleksi tema interaktif & Storybook 3D',
  'Tamu & nama undangan khusus tanpa batas',
  'QR Check-in, amplop digital & buku ucapan RSVP',
  'Publish langsung ke ruanghadir.net tanpa watermark',
];

export default function SignUpView({
  step,
  fullName,
  groomName,
  brideName,
  email,
  password,
  noWa,
  sosmed,
  slug,
  slugError,
  error,
  isLoading,
  googleUser,
  onFullNameChange,
  onGroomChange,
  onBrideChange,
  onEmailChange,
  onPasswordChange,
  onNoWaChange,
  onSosmedChange,
  onSlugChange,
  onGotoEnterprise,
  onBack,
  onNext1,
  onNext2,
  onComplete,
}: SignUpViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const titles = ['Profil Pernikahan', 'Detail Kontak', 'Siap Diterbitkan Gratis'];
  const descs = [
    'Tentukan nama panggilan pasangan dan identitas akun Anda.',
    'Lengkapi kontak untuk masuk kembali serta konfirmasi tamu.',
    'Atur tautan undangan Anda. Seluruh fitur inti aktif gratis tanpa kartu kredit.',
  ];

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!googleUser && !fullName.trim()) e.fullName = 'Nama pemesan wajib diisi.';
    if (!groomName.trim()) e.groomName = 'Wajib diisi.';
    if (!brideName.trim()) e.brideName = 'Wajib diisi.';

    if (!googleUser) {
      if (!email.trim()) e.email = 'Email wajib diisi.';
      else if (!isEmail(email)) e.email = 'Format email belum benar.';
      if (!password) e.password = 'Password wajib diisi.';
      else if (password.length < 8) e.password = 'Gunakan minimal 8 karakter.';
    }

    if (!noWa.trim()) e.noWa = 'Nomor WhatsApp wajib diisi.';
    else if (!isWa(noWa)) e.noWa = 'Gunakan format 08xxxxxxxxxx.';

    if (!sosmed.trim()) e.sosmed = 'Wajib diisi.';
    return e;
  }, [googleUser, fullName, groomName, brideName, email, password, noWa, sosmed]);

  const show = (k: string) => (touched[k] ? errors[k] : undefined);
  const markTouched = (...keys: string[]) =>
    setTouched((prev) => keys.reduce((acc, k) => ({ ...acc, [k]: true }), { ...prev }));

  const handleNext1 = () => {
    const keys = googleUser ? ['groomName', 'brideName'] : ['fullName', 'groomName', 'brideName'];
    markTouched(...keys);
    if (keys.some((k) => errors[k])) return;
    onNext1();
  };

  const handleNext2 = () => {
    const keys = googleUser ? ['noWa', 'sosmed'] : ['email', 'password', 'noWa', 'sosmed'];
    markTouched(...keys);
    if (keys.some((k) => errors[k])) return;
    onNext2();
  };

  const strength = passwordStrength(password);

  return (
    <div className="saas-card w-full max-w-xl space-y-7 p-7 sm:p-10">
      <StepIndicator step={step} />

      <header className="space-y-2 text-center">
        <span className="saas-kicker">Daftar Gratis · RuangHadir</span>
        <h2 className="saas-serif-i text-[30px] leading-tight sm:text-[34px]">
          {titles[step - 1]}
        </h2>
        <p className="mx-auto max-w-[44ch] text-[13.5px]" style={{ color: 'var(--saas-muted)' }}>
          {descs[step - 1]}
        </p>
      </header>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-2xl border p-3.5 text-[12.5px] font-semibold"
          style={{
            borderColor: 'rgba(176,58,58,.28)',
            background: 'var(--saas-danger-soft)',
            color: 'var(--saas-danger)',
          }}
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* -- Langkah 1: Profil -- */}
      {step === 1 && (
        <div className="space-y-5">
          {!googleUser ? (
            <Field id="signup-fullname" label="Nama Lengkap" icon={User} error={show('fullName')}>
              <User
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: 'var(--saas-faint)' }}
                aria-hidden
              />
              <input
                id="signup-fullname"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => onFullNameChange(e.target.value)}
                onBlur={() => markTouched('fullName')}
                aria-invalid={!!show('fullName')}
                className={`saas-input pl-10 ${show('fullName') ? 'is-error' : ''}`}
                placeholder="Contoh: Ridho Alamsyah"
              />
            </Field>
          ) : (
            <div
              className="flex items-center gap-3 rounded-2xl border p-4"
              style={{ borderColor: 'var(--saas-line)', background: 'var(--saas-bg)' }}
            >
              <CheckCircle
                className="h-5 w-5 shrink-0"
                style={{ color: 'var(--saas-success)' }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-[12.5px] font-extrabold">Masuk sebagai {googleUser.name}</p>
                <p className="truncate text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
                  {googleUser.unverifiedEmail}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="signup-groom" label="Panggilan Pria" error={show('groomName')}>
              <input
                id="signup-groom"
                type="text"
                required
                value={groomName}
                onChange={(e) => onGroomChange(e.target.value)}
                onBlur={() => markTouched('groomName')}
                aria-invalid={!!show('groomName')}
                className={`saas-input saas-input-flush ${show('groomName') ? 'is-error' : ''}`}
                placeholder="Contoh: Ridho"
              />
            </Field>
            <Field id="signup-bride" label="Panggilan Wanita" error={show('brideName')}>
              <input
                id="signup-bride"
                type="text"
                required
                value={brideName}
                onChange={(e) => onBrideChange(e.target.value)}
                onBlur={() => markTouched('brideName')}
                aria-invalid={!!show('brideName')}
                className={`saas-input saas-input-flush ${show('brideName') ? 'is-error' : ''}`}
                placeholder="Contoh: Jennie"
              />
            </Field>
          </div>

          {(groomName || brideName) && (
            <p className="text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
              Tautan undangan akan disarankan otomatis dari kedua nama ini.
            </p>
          )}

          <NavButtons onBack={onBack} onNext={handleNext1} backLabel="Batal" />
        </div>
      )}

      {/* -- Langkah 2: Kontak -- */}
      {step === 2 && (
        <div className="space-y-5">
          {!googleUser && (
            <>
              <Field
                id="signup-email"
                label="Alamat Email"
                icon={Mail}
                error={show('email')}
                hint="Dipakai untuk masuk kembali ke akun Anda."
              >
                <Mail
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--saas-faint)' }}
                  aria-hidden
                />
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={() => markTouched('email')}
                  aria-invalid={!!show('email')}
                  className={`saas-input pl-10 ${show('email') ? 'is-error' : ''}`}
                  placeholder="nama@email.com"
                />
              </Field>

              <Field id="signup-password" label="Password Akun" icon={Lock} error={show('password')}>
                <Lock
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--saas-faint)' }}
                  aria-hidden
                />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  onBlur={() => markTouched('password')}
                  aria-invalid={!!show('password')}
                  aria-describedby="signup-password-strength"
                  className={`saas-input pl-10 pr-12 ${show('password') ? 'is-error' : ''}`}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="saas-trailing-btn"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>

              {password && (
                <div id="signup-password-strength" className="flex items-center gap-3">
                  <span className="saas-meter w-24">
                    <i className={strength.score >= 1 ? 'on-weak' : ''} />
                    <i className={strength.score >= 2 ? 'on-fair' : ''} />
                    <i className={strength.score >= 3 ? 'on-strong' : ''} />
                  </span>
                  <span className="text-[11.5px] font-semibold" style={{ color: 'var(--saas-muted)' }}>
                    Kekuatan: {strength.label}
                  </span>
                </div>
              )}
            </>
          )}

          <Field
            id="signup-wa"
            label="WhatsApp Aktif"
            icon={Phone}
            error={show('noWa')}
            hint="Dipakai untuk konfirmasi tamu serta dukungan teknis."
          >
            <Phone
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--saas-faint)' }}
              aria-hidden
            />
            <input
              id="signup-wa"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={noWa}
              onChange={(e) => onNoWaChange(e.target.value)}
              onBlur={() => markTouched('noWa')}
              aria-invalid={!!show('noWa')}
              className={`saas-input pl-10 ${show('noWa') ? 'is-error' : ''}`}
              placeholder="0812xxxxxxxx"
            />
          </Field>

          <Field id="signup-sosmed" label="Instagram / TikTok" icon={Globe} error={show('sosmed')}>
            <Globe
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: 'var(--saas-faint)' }}
              aria-hidden
            />
            <input
              id="signup-sosmed"
              type="text"
              required
              value={sosmed}
              onChange={(e) => onSosmedChange(e.target.value)}
              onBlur={() => markTouched('sosmed')}
              aria-invalid={!!show('sosmed')}
              className={`saas-input pl-10 ${show('sosmed') ? 'is-error' : ''}`}
              placeholder="@username"
            />
          </Field>

          <NavButtons onBack={onBack} onNext={handleNext2} />
        </div>
      )}

      {/* -- Langkah 3: Tautan & Aktivasi Full Gratis -- */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Slug */}
          <div
            className="space-y-3 rounded-2xl border p-5"
            style={{ borderColor: 'var(--saas-line)', background: 'var(--saas-bg)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <label className="saas-field-label" htmlFor="signup-slug">
                <Globe className="h-3.5 w-3.5" style={{ color: 'var(--saas-gold)' }} aria-hidden />
                Tautan Undangan
              </label>
              <span
                className="text-[12px] font-medium"
                style={{ color: 'var(--saas-muted)' }}
              >
                Bisa diubah nanti
              </span>
            </div>
            <input
              id="signup-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              aria-invalid={!!slugError}
              aria-describedby="signup-slug-status"
              className={`saas-input saas-input-flush font-mono ${slugError ? 'is-error' : ''}`}
              placeholder="Contoh: ridho-jennie"
            />
            <div id="signup-slug-status" aria-live="polite">
              {slugError ? (
                <p className="saas-field-error">
                  <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  {slugError}
                </p>
              ) : slug ? (
                <p className="flex flex-wrap items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--saas-success)' }} aria-hidden />
                  Undangan tersedia di
                  <span
                    className="rounded-md border px-2 py-0.5 font-mono text-[11px]"
                    style={{ borderColor: 'var(--saas-line)', background: '#fff', color: 'var(--saas-ink)' }}
                  >
                    ruanghadir.net/{slug}
                  </span>
                </p>
              ) : (
                <p className="text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
                  Tautan ini yang akan Anda bagikan ke tamu.
                </p>
              )}
            </div>
          </div>

          {/* Ringkasan Full Gratis */}
          <div className="rounded-2xl border border-[#E6DDD2] bg-white p-5 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[#EFE8DC] pb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-[#E9F2EA] px-2.5 py-0.5 text-[12px] font-medium text-[#3F7A52]">
                  Full Gratis
                </span>
                <h3 className="mt-1.5 text-[17px] font-bold text-[#2A1E21]">
                  {groomName || '—'} &amp; {brideName || '—'}
                </h3>
              </div>
              <div className="text-right">
                <span className="block text-[12px] font-medium text-[#7D6F71]">
                  Total Biaya
                </span>
                <span className="text-[24px] font-extrabold text-[#2A1E21]">Rp 0</span>
              </div>
            </div>

            <ul className="space-y-2">
              {FREE_PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 text-[12.5px] text-[#4A3E36]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3F7A52]" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            <p className="flex items-center gap-2 text-[11.5px] text-[#6B5D54] pt-1">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#B89047]" aria-hidden />
              Langsung aktif tanpa pembayaran. Tidak perlu kartu kredit.
            </p>
          </div>

          {/* Enterprise hint */}
          <div className="rounded-xl border border-[#E6DDD2] bg-[#F8F5F0] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#6B5D54]">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#7A2E3B]" />
              Untuk WO / Perusahaan? Hubungi{' '}
              <a href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`} className="font-bold text-[#7A2E3B] hover:underline">
                {ENTERPRISE_CONTACT_EMAIL}
              </a>
            </span>
            {onGotoEnterprise && (
              <button
                type="button"
                onClick={onGotoEnterprise}
                className="font-bold text-[#2A1E21] hover:underline cursor-pointer"
              >
                Portal Enterprise →
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="saas-btn-outline flex-1 text-[14px]"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Kembali
            </button>
            <button
              type="button"
              onClick={onComplete}
              disabled={isLoading || !!slugError}
              className="saas-btn-primary flex-[1.8] text-[14px]"
            >
              {isLoading ? (
                <>
                  <span className="saas-spinner" aria-hidden />
                  Menyiapkan Workspace…
                </>
              ) : (
                <>
                  Buat Undangan Gratis
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
