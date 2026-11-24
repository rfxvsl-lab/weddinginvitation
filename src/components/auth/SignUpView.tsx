"use client";

import React, { useEffect, useRef, useState } from "react";
import { ENTERPRISE_CONTACT_EMAIL, PACKAGE_LIMITS } from "@/lib/packageLimits";
import type { UserPackageId } from "@/types";

interface SignUpViewProps {
  step: 1 | 2 | 3;
  fullName: string;
  groomName: string;
  brideName: string;
  email: string;
  password: string;
  noWa: string;
  sosmed: string;
  eventDate: string;
  city: string;
  referralSource: string;
  slug: string;
  packageId: UserPackageId;
  slugError: string;
  error: string | null;
  isLoading: boolean;
  googleUser: {
    unverifiedEmail: string;
    name: string;
    avatarUrl?: string;
  } | null;
  onFullNameChange: (v: string) => void;
  onGroomChange: (v: string) => void;
  onBrideChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onNoWaChange: (v: string) => void;
  onSosmedChange: (v: string) => void;
  onEventDateChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onReferralSourceChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onPackageChange: (v: UserPackageId) => void;
  onGotoEnterprise?: () => void;
  onBack: () => void;
  onNext1: () => void;
  onNext2: () => void;
  onComplete: () => void;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[14px] font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <p
          id={`${id}-hint`}
          className="text-[12px] leading-relaxed text-[var(--rh-muted)]"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

const STEPS = ["Tentang kalian", "Kontak akun", "Tinjau & kirim"];

export default function SignUpView(props: SignUpViewProps) {
  const [showPassword, setShowPassword] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [props.step]);
  const inputClass = "saas-input saas-input-flush w-full !min-h-[46px] !text-[16px]";
  return (
    <section
      className="w-full max-w-[520px] space-y-7 px-2 py-4"
      aria-labelledby="signup-heading"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--rh-line)] pb-5 text-[12px]">
        <span className="font-semibold text-[var(--rh-primary)]">
          AKSES AWAL · Rp0
        </span>
        <span className="text-[var(--rh-muted)]">
          Langkah {props.step} dari 3
        </span>
      </div>
      <header className="space-y-3">
        <h1
          id="signup-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-[30px] leading-tight tracking-tight focus:outline-none"
        >
          {STEPS[props.step - 1]}
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--rh-ink-2)]">
          {props.step === 1
            ? "Kenalkan acara yang sedang kalian siapkan. Pendaftaran ditinjau sebelum akun diaktifkan."
            : props.step === 2
              ? "Gunakan kontak aktif agar kami bisa mengabari hasil peninjauan."
              : "Periksa kembali detailnya. Mengirim formulir belum mengaktifkan dashboard."}
        </p>
      </header>
      {props.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-[14px] text-red-800"
        >
          {props.error}
        </p>
      )}
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (props.step === 1) props.onNext1();
          else if (props.step === 2) props.onNext2();
          else props.onComplete();
        }}
      >
        {props.step === 1 && (
          <>
            <Field id="signup-name" label="Nama lengkap">
              <input
                id="signup-name"
                required
                autoComplete="name"
                maxLength={100}
                value={props.fullName}
                onChange={(e) => props.onFullNameChange(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="signup-groom" label="Panggilan mempelai pria">
                <input
                  id="signup-groom"
                  required
                  maxLength={60}
                  value={props.groomName}
                  onChange={(e) => props.onGroomChange(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field id="signup-bride" label="Panggilan mempelai wanita">
                <input
                  id="signup-bride"
                  required
                  maxLength={60}
                  value={props.brideName}
                  onChange={(e) => props.onBrideChange(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field id="signup-city" label="Kota acara">
              <input
                id="signup-city"
                required
                maxLength={80}
                autoComplete="address-level2"
                value={props.city}
                onChange={(e) => props.onCityChange(e.target.value)}
                className={inputClass}
                placeholder="Contoh: Malang"
              />
            </Field>
            <Field
              id="signup-event-date"
              label="Rencana tanggal acara (opsional)"
              hint="Boleh dikosongkan jika tanggal belum pasti."
            >
              <input
                id="signup-event-date"
                type="date"
                aria-describedby="signup-event-date-hint"
                value={props.eventDate}
                onChange={(e) => props.onEventDateChange(e.target.value)}
                className={inputClass}
              />
            </Field>
          </>
        )}
        {props.step === 2 && (
          <>
            {props.googleUser ? (
              <p className="break-words rounded-lg bg-[var(--rh-linen)] p-4 text-[14px] leading-relaxed">
                Akun Google: <strong>{props.googleUser.unverifiedEmail}</strong>
              </p>
            ) : (
              <>
                <Field id="signup-email" label="Email">
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={160}
                    value={props.email}
                    onChange={(e) => props.onEmailChange(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field
                  id="signup-password"
                  label="Password"
                  hint="Gunakan 8–200 karakter."
                >
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={200}
                      value={props.password}
                      onChange={(e) => props.onPasswordChange(e.target.value)}
                      aria-describedby="signup-password-hint"
                      className={`${inputClass} !pr-24`}
                    />
                    <button
                      type="button"
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-0 min-h-[46px] text-[12px] font-semibold text-[var(--rh-primary)]"
                    >
                      {showPassword ? "Sembunyikan" : "Lihat"}
                    </button>
                  </div>
                </Field>
              </>
            )}
            <Field
              id="signup-wa"
              label="Nomor WhatsApp aktif"
              hint="Untuk kabar pendaftaran dan dukungan akun."
            >
              <input
                id="signup-wa"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                minLength={9}
                maxLength={20}
                pattern="[+0-9 ()-]{9,20}"
                title="Gunakan nomor WhatsApp aktif, misalnya 081234567890 atau +6281234567890."
                value={props.noWa}
                onChange={(e) => props.onNoWaChange(e.target.value)}
                aria-describedby="signup-wa-hint"
                className={inputClass}
              />
            </Field>
            <Field id="signup-source" label="Tahu RuangHadir dari mana?">
              <select
                id="signup-source"
                required
                value={props.referralSource}
                onChange={(e) => props.onReferralSourceChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Pilih sumber informasi</option>
                {[
                  "Instagram",
                  "TikTok",
                  "Teman atau keluarga",
                  "Pencarian internet",
                  "Vendor acara",
                  "Lainnya",
                ].map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </Field>
            <Field id="signup-social" label="Instagram / TikTok (opsional)">
              <input
                id="signup-social"
                maxLength={80}
                value={props.sosmed}
                onChange={(e) => props.onSosmedChange(e.target.value)}
                className={inputClass}
                placeholder="@username"
              />
            </Field>
          </>
        )}
        {props.step === 3 && (
          <>
            <dl className="space-y-4 border-y border-[var(--rh-line)] py-5 text-[14px]">
              {[
                ["Nama", props.fullName],
                ["Pasangan", `${props.groomName} & ${props.brideName}`],
                ["Email", props.email],
                ["WhatsApp", props.noWa],
                ["Kota", props.city],
                ["Tanggal", props.eventDate || "Belum ditentukan"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[86px_1fr] gap-4">
                  <dt className="text-[var(--rh-muted)]">{label}</dt>
                  <dd className="break-words font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <Field
              id="signup-slug"
              label="Pilihan tautan undangan"
              hint="Tautan digunakan setelah akun disetujui dan undangan diterbitkan."
            >
              <input
                id="signup-slug"
                required
                minLength={3}
                maxLength={80}
                pattern="[a-z0-9-]+"
                value={props.slug}
                onChange={(e) => props.onSlugChange(e.target.value)}
                aria-invalid={!!props.slugError}
                aria-describedby="signup-slug-hint signup-slug-error"
                className={inputClass}
              />
              {props.slugError && (
                <p
                  id="signup-slug-error"
                  role="alert"
                  className="text-[13px] text-red-800"
                >
                  {props.slugError}
                </p>
              )}
            </Field>
            <div className="rounded-lg border border-[var(--rh-line)] bg-[var(--rh-linen)] p-5 text-[14px] leading-relaxed">
              <strong>Akses Awal · Rp0</strong>
              <p className="mt-2 text-[var(--rh-ink-2)]">
                Semua tema, tamu tanpa batas, RSVP, amplop digital, dan check in
                QR. Hingga {PACKAGE_LIMITS.free.maxProjects} undangan, aktif{" "}
                {PACKAGE_LIMITS.free.activeDays} hari sejak undangan diaktifkan.
              </p>
              <p className="mt-3 text-[var(--rh-ink-2)]">
                Tim meninjau pendaftaran terlebih dahulu. Kami akan mengabari
                melalui kontak di atas.
              </p>
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--rh-muted)]">
              Informasi ini digunakan untuk meninjau pendaftaran dan menghubungi
              kalian. Baca{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                kebijakan privasi
              </a>{" "}
              sebelum mengirim.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={props.onBack}
            disabled={props.isLoading}
            className="saas-btn-outline flex-1 !min-h-[48px]"
          >
            {props.step === 1 ? "Kembali" : "Sebelumnya"}
          </button>
          <button
            type="submit"
            disabled={
              props.isLoading || (props.step === 3 && !!props.slugError)
            }
            className="saas-btn-primary flex-[1.5] !min-h-[48px]"
          >
            {props.isLoading
              ? "Mengirim…"
              : props.step === 3
                ? "Kirim pendaftaran"
                : "Lanjut"}
          </button>
        </div>
      </form>
      <p className="text-[12px] leading-relaxed text-[var(--rh-muted)]">
        Untuk perusahaan,{" "}
        <a
          href={`mailto:${ENTERPRISE_CONTACT_EMAIL}`}
          className="font-semibold underline underline-offset-4"
        >
          hubungi tim Enterprise
        </a>
        .
      </p>
    </section>
  );
}
