'use client';

/**
 * SignUpView — wizard registrasi 3 langkah.
 *
 * Perubahan UX dari versi sebelumnya:
 * - Pesan `error` kini tampil di SEMUA langkah (sebelumnya hanya langkah 3).
 * - Validasi inline per kolom, bukan hanya toast setelah menekan Lanjut.
 * - Kartu paket & opsi pembuatan kini <button> sehingga bisa dioperasikan keyboard.
 * - Ringkasan pesanan sebelum tombol Selesaikan (review-before-commit).
 * - Tombol lihat password + meter kekuatan password.
 */

import React, { useMemo, useState } from 'react';
import {
  PiUserDuotone as User,
  PiEnvelopeDuotone as Mail,
  PiPhoneDuotone as Phone,
  PiGlobeHemisphereWestDuotone as Globe,
  PiWarningCircleDuotone as AlertCircle,
  PiCaretRightDuotone as ChevronRight,
  PiCaretLeftDuotone as ChevronLeft,
  PiLockKeyDuotone as Lock,
  PiEyeDuotone as Eye,
  PiEyeSlashDuotone as EyeSlash,
  PiCheckCircleDuotone as CheckCircle,
  PiSparkleDuotone as Sparkle,
  PiShieldCheckDuotone as ShieldCheck,
} from 'react-icons/pi';

import { PACKAGE_PRICES, PACKAGE_NAMES, PACKAGE_LIMITS, formatActiveDays, formatLimit } from '../../lib/packageLimits';

const PRICES = PACKAGE_PRICES;

type PackageId = 'demo' | 'reguler' | 'premium' | 'luxury';

interface GoogleUser {
  unverifiedEmail: string;
  name: string;
  avatarUrl?: string;
}

interface SignUpViewProps {
  step: 1 | 2 | 3;
  fullName: string; groomName: string; brideName: string;
  email: string; password: string; noWa: string; sosmed: string;
  slug: string; packageId: PackageId; isCustomByRfx: boolean;
  slugError: string; error: string | null; isLoading: boolean;
  googleUser: GoogleUser | null;
  onFullNameChange: (v: string) => void;
  onGroomChange: (v: string) => void;
  onBrideChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNoWaChange: (v: string) => void;
  onSosmedChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onPackageChange: (id: PackageId) => void;
  onCustomByRfxChange: (v: boolean) => void;
  onBack: () => void;
  onNext1: () => void;
  onNext2: () => void;
  onComplete: () => void;
}

/* ---------------------------------- Util ---------------------------------- */

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Terima 08xx, 8xx, 62xx, dan bentuk berpemisah spasi/strip. */
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

/* -------------------------------- Primitif -------------------------------- */

function StepIndicator({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Profil' },
    { n: 2, label: 'Kontak' },
    { n: 3, label: 'Paket' },
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
      <div className="flex justify-between text-[10.5px] font-bold uppercase tracking-[0.14em]">
        {steps.map((s) => (
          <span key={s.n} style={{ color: step === s.n ? 'var(--saas-primary)' : 'var(--saas-faint)' }}>
            {s.label}
          </span>
        ))}
      </div>
    </nav>
  );
}

function Field({
  id, label, icon: Icon, error, hint, children,
}: {
  id: string; label: string; icon?: React.ElementType; error?: string; hint?: string; children: React.ReactNode;
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

function PackageCard({
  id, label, tier, desc, priceLabel, badge, featured, isSelected, onSelect,
}: {
  id: PackageId; label: string; tier: string; desc: string; priceLabel: string;
  badge?: string; featured?: boolean; isSelected: boolean; onSelect: () => void;
}) {
  const lim = PACKAGE_LIMITS[id];
  const price = PRICES[id].mandiri;
  const rows = [
    lim.maxGuests === Infinity ? 'Tamu tanpa batas' : `${formatLimit(lim.maxGuests)} tamu`,
    lim.themes === 'all' ? 'Semua tema' : `${lim.themes.length} tema`,
    formatActiveDays(lim.activeDays),
    lim.canPublish ? 'Bisa publish' : 'Preview saja',
  ];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      data-selected={isSelected}
      className={`saas-choice ${featured ? 'saas-dark-panel' : ''}`}
      style={featured ? { borderColor: 'rgba(198,161,91,.42)' } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="block text-[9.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: featured ? 'var(--saas-gold-2)' : 'var(--saas-muted)' }}
          >
            {tier}
          </span>
          <h4
            className={`saas-serif-i text-[21px] leading-tight ${featured ? 'text-white' : ''}`}
            style={featured ? undefined : { color: 'var(--saas-ink)' }}
          >
            {label}
          </h4>
        </div>
        {badge && (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em]"
            style={
              featured
                ? { background: 'var(--saas-gold)', color: '#241505' }
                : { background: 'var(--saas-primary-soft)', color: 'var(--saas-primary)' }
            }
          >
            {badge}
          </span>
        )}
      </div>

      <p className="mt-2 text-[12.5px] leading-snug" style={{ color: featured ? '#E4CFC4' : 'var(--saas-muted)' }}>
        {desc}
      </p>

      <ul className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <li
            key={r}
            className="flex items-center gap-2 text-[12px] font-semibold"
            style={{ color: featured ? '#EFE4DA' : 'var(--saas-ink-2)' }}
          >
            <CheckCircle
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: featured ? 'var(--saas-gold-2)' : 'var(--saas-success)' }}
              aria-hidden
            />
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <span
          className="block text-[9.5px] font-bold uppercase tracking-[0.16em]"
          style={{ color: featured ? '#C9B2A6' : 'var(--saas-faint)' }}
        >
          {priceLabel}
        </span>
        <span
          className={`tabular text-[22px] font-extrabold ${featured ? 'text-white' : ''}`}
          style={featured ? undefined : { color: 'var(--saas-ink)' }}
        >
          {price === 0 ? 'Gratis' : `Rp ${price.toLocaleString('id-ID')}`}
        </span>
      </div>
    </button>
  );
}

function ChoiceCard({
  selected, title, sub, price, onSelect,
}: { selected: boolean; title: string; sub: string; price: number; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={selected} data-selected={selected} onClick={onSelect} className="saas-choice">
      <h5 className="text-[12.5px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--saas-ink)' }}>
        {title}
      </h5>
      <p className="mt-1 text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>{sub}</p>
      <span className="tabular mt-3 text-[15px] font-extrabold" style={{ color: 'var(--saas-primary)' }}>
        Rp {price.toLocaleString('id-ID')}
      </span>
    </button>
  );
}

function NavButtons({
  onBack, onNext, backLabel = 'Kembali', nextLabel = 'Lanjut', disabled,
}: { onBack: () => void; onNext: () => void; backLabel?: string; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onBack} className="saas-btn-outline flex-1 text-[11.5px] uppercase tracking-[0.14em]">
        <ChevronLeft className="h-4 w-4" aria-hidden />
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="saas-btn-primary flex-[1.6] text-[11.5px] uppercase tracking-[0.14em]"
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/* ----------------------------------- View ----------------------------------- */

export default function SignUpView({
  step, fullName, groomName, brideName, email, password, noWa, sosmed,
  slug, packageId, isCustomByRfx, slugError, error, isLoading,
  googleUser,
  onFullNameChange, onGroomChange, onBrideChange, onEmailChange,
  onPasswordChange, onNoWaChange, onSosmedChange, onSlugChange,
  onPackageChange, onCustomByRfxChange, onBack, onNext1, onNext2, onComplete,
}: SignUpViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const titles = ['Profil Pernikahan', 'Detail Kontak', 'Pilih Paket Layanan'];
  const descs = [
    'Tentukan nama panggilan serta tautan unik undangan Anda.',
    'Lengkapi kontak agar tamu bisa RSVP dan kami bisa menghubungi Anda.',
    'Pilih layanan sesuai kebutuhan — bisa ditingkatkan kapan saja.',
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
      else if (password.length < 6) e.password = 'Gunakan minimal 6 karakter.';
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
  const currentPrice = packageId === 'demo' ? 0 : PRICES[packageId][isCustomByRfx ? 'rfx' : 'mandiri'];

  return (
    <div className="saas-card w-full max-w-xl space-y-7 p-7 sm:p-10">
      <StepIndicator step={step} />

      <header className="space-y-2 text-center">
        <span className="saas-kicker">Registrasi RuangHadir</span>
        <h2 className="saas-serif-i text-[30px] leading-tight sm:text-[34px]">{titles[step - 1]}</h2>
        <p className="mx-auto max-w-[42ch] text-[13.5px]" style={{ color: 'var(--saas-muted)' }}>
          {descs[step - 1]}
        </p>
      </header>

      {/* Error server/kredensial — tampil di semua langkah, bukan hanya langkah terakhir. */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-2xl border p-3.5 text-[12.5px] font-semibold"
          style={{ borderColor: 'rgba(176,58,58,.28)', background: 'var(--saas-danger-soft)', color: 'var(--saas-danger)' }}
        >
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* -- Langkah 1: Profil -- */}
      {step === 1 && (
        <div className="space-y-5">
          {!googleUser ? (
            <Field id="signup-fullname" label="Nama Pemesan" icon={User} error={show('fullName')}>
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--saas-faint)' }} aria-hidden />
              <input
                id="signup-fullname" type="text" autoComplete="name" required
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
              <CheckCircle className="h-5 w-5 shrink-0" style={{ color: 'var(--saas-success)' }} aria-hidden />
              <div className="min-w-0">
                <p className="text-[12.5px] font-extrabold">Masuk sebagai {googleUser.name}</p>
                <p className="truncate text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>{googleUser.unverifiedEmail}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="signup-groom" label="Panggilan Pria" error={show('groomName')}>
              <input
                id="signup-groom" type="text" required
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
                id="signup-bride" type="text" required
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
                id="signup-email" label="Alamat Email" icon={Mail} error={show('email')}
                hint="Dipakai untuk masuk kembali ke akun Anda."
              >
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--saas-faint)' }} aria-hidden />
                <input
                  id="signup-email" type="email" autoComplete="email" required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={() => markTouched('email')}
                  aria-invalid={!!show('email')}
                  className={`saas-input pl-10 ${show('email') ? 'is-error' : ''}`}
                  placeholder="nama@email.com"
                />
              </Field>

              <Field id="signup-password" label="Password Akun" icon={Lock} error={show('password')}>
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--saas-faint)' }} aria-hidden />
                <input
                  id="signup-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  onBlur={() => markTouched('password')}
                  aria-invalid={!!show('password')}
                  aria-describedby="signup-password-strength"
                  className={`saas-input pl-10 pr-12 ${show('password') ? 'is-error' : ''}`}
                  placeholder="Minimal 6 karakter"
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
            id="signup-wa" label="WhatsApp Aktif" icon={Phone} error={show('noWa')}
            hint="Dipakai tamu untuk konfirmasi, dan oleh tim kami bila Anda butuh bantuan."
          >
            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--saas-faint)' }} aria-hidden />
            <input
              id="signup-wa" type="tel" inputMode="tel" autoComplete="tel" required
              value={noWa}
              onChange={(e) => onNoWaChange(e.target.value)}
              onBlur={() => markTouched('noWa')}
              aria-invalid={!!show('noWa')}
              className={`saas-input pl-10 ${show('noWa') ? 'is-error' : ''}`}
              placeholder="0812xxxxxxxx"
            />
          </Field>

          <Field id="signup-sosmed" label="Instagram / TikTok" icon={Globe} error={show('sosmed')}>
            <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--saas-faint)' }} aria-hidden />
            <input
              id="signup-sosmed" type="text" required
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

      {/* -- Langkah 3: Paket -- */}
      {step === 3 && (
        <div className="space-y-6">
          <div role="radiogroup" aria-label="Pilih paket" className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <PackageCard
              id="demo" label="Demo" tier="Uji coba" badge="Tanpa bayar"
              desc="Coba seluruh alur sebelum memutuskan." priceLabel="Biaya"
              isSelected={packageId === 'demo'} onSelect={() => onPackageChange('demo')}
            />
            <PackageCard
              id="reguler" label="Reguler" tier="Dasar"
              desc="Untuk pernikahan intim dengan tamu terbatas." priceLabel="Buat sendiri"
              isSelected={packageId === 'reguler'} onSelect={() => onPackageChange('reguler')}
            />
            <PackageCard
              id="premium" label="Premium" tier="Paling populer" badge="Rekomendasi" featured
              desc="Tema lengkap, galeri luas, dan QR check-in tamu." priceLabel="Buat sendiri"
              isSelected={packageId === 'premium'} onSelect={() => onPackageChange('premium')}
            />
            <PackageCard
              id="luxury" label="Luxury" tier="Eksklusif"
              desc="Masa aktif terpanjang dan tamu tanpa batas." priceLabel="Buat sendiri"
              isSelected={packageId === 'luxury'} onSelect={() => onPackageChange('luxury')}
            />
          </div>

          {/* Slug */}
          <div className="space-y-3 rounded-2xl border p-5" style={{ borderColor: 'var(--saas-line)', background: 'var(--saas-bg)' }}>
            <div className="flex items-center justify-between gap-3">
              <label className="saas-field-label" htmlFor="signup-slug">
                <Globe className="h-3.5 w-3.5" style={{ color: 'var(--saas-gold)' }} aria-hidden />
                Tautan Undangan
              </label>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--saas-muted)' }}>
                {packageId === 'demo' ? 'Otomatis' : 'Bisa diubah'}
              </span>
            </div>
            <input
              id="signup-slug" type="text" required
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              disabled={packageId === 'demo'}
              aria-invalid={packageId !== 'demo' && !!slugError}
              aria-describedby="signup-slug-status"
              className={`saas-input saas-input-flush font-mono ${packageId !== 'demo' && slugError ? 'is-error' : ''}`}
              placeholder="Contoh: ridho-jennie"
            />
            <div id="signup-slug-status" aria-live="polite">
              {packageId !== 'demo' && slugError ? (
                <p className="saas-field-error">
                  <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  {slugError}
                </p>
              ) : slug ? (
                <p className="flex flex-wrap items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
                  <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--saas-success)' }} aria-hidden />
                  Undangan Anda akan tersedia di
                  <span
                    className="rounded-md border px-2 py-0.5 font-mono text-[11px]"
                    style={{ borderColor: 'var(--saas-line)', background: '#fff', color: 'var(--saas-ink)' }}
                  >
                    ruanghadir.net/{slug}
                  </span>
                </p>
              ) : (
                <p className="text-[11.5px]" style={{ color: 'var(--saas-muted)' }}>
                  Tautan ini yang akan Anda sebar ke tamu.
                </p>
              )}
            </div>
          </div>

          {/* Opsi pembuatan */}
          {packageId !== 'demo' && (
            <div className="space-y-3.5 rounded-2xl border p-5" style={{ borderColor: 'var(--saas-line)', background: 'var(--saas-bg)' }}>
              <span className="saas-field-label" id="signup-mode-label">Opsi pembuatan</span>
              <div role="radiogroup" aria-labelledby="signup-mode-label" className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <ChoiceCard
                  selected={!isCustomByRfx} title="Buat sendiri" sub="Anda mengisi data lewat editor."
                  price={PRICES[packageId].mandiri} onSelect={() => onCustomByRfxChange(false)}
                />
                <ChoiceCard
                  selected={isCustomByRfx} title="Terima beres" sub="Tim kami menyiapkan undangan Anda."
                  price={PRICES[packageId].rfx} onSelect={() => onCustomByRfxChange(true)}
                />
              </div>
            </div>
          )}

          {/* Ringkasan sebelum commit */}
          <div className="saas-dark-panel rounded-3xl p-6">
            <div className="flex items-center gap-2">
              <Sparkle className="h-4 w-4" style={{ color: 'var(--saas-gold-2)' }} aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--saas-gold-2)' }}>
                Ringkasan pesanan
              </span>
            </div>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt style={{ color: '#D8C3B4' }}>Nama pasangan</dt>
                <dd className="text-right font-bold">
                  {groomName || '—'} &amp; {brideName || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt style={{ color: '#D8C3B4' }}>Paket</dt>
                <dd className="text-right font-bold">{PACKAGE_NAMES[packageId]}</dd>
              </div>
              {packageId !== 'demo' && (
                <div className="flex justify-between gap-4">
                  <dt style={{ color: '#D8C3B4' }}>Dikerjakan</dt>
                  <dd className="text-right font-bold">{isCustomByRfx ? 'Tim RuangHadir' : 'Sendiri'}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt style={{ color: '#D8C3B4' }}>Masa aktif</dt>
                <dd className="text-right font-bold">{formatActiveDays(PACKAGE_LIMITS[packageId].activeDays)}</dd>
              </div>
              <div
                className="flex items-center justify-between gap-4 border-t pt-3.5"
                style={{ borderColor: 'rgba(222,205,184,.22)' }}
              >
                <dt className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--saas-gold-2)' }}>Total</dt>
                <dd className="text-[24px] font-bold text-white">
                  {currentPrice === 0 ? 'Gratis' : `Rp ${currentPrice.toLocaleString('id-ID')}`}
                </dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-2 text-[11.5px]" style={{ color: '#C9B2A6' }}>
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'var(--saas-gold-2)' }} aria-hidden />
              {packageId === 'demo'
                ? 'Tidak perlu pembayaran. Bisa ditingkatkan kapan saja.'
                : 'Pembayaran aman lewat QRIS, transfer bank, atau e-wallet.'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onBack} className="saas-btn-outline flex-1 text-[11.5px] uppercase tracking-[0.14em]">
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Kembali
            </button>
            <button
              type="button" onClick={onComplete} disabled={isLoading}
              className="saas-btn-primary flex-[1.7] text-[11.5px] uppercase tracking-[0.14em]"
            >
              {isLoading ? (
                <>
                  <span className="saas-spinner" aria-hidden />
                  Memproses…
                </>
              ) : (
                <>
                  {packageId === 'demo' ? 'Mulai Sekarang' : 'Lanjut ke Pembayaran'}
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
