'use client';

/**
 * SignInView — Form login akun gratis (email/password + Google OAuth)
 * dilengkapi tombol masuk ke Portal Enterprise.
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Logo } from '@/components/ui/Logo';
import {
  Building2,
  Mail,
  Lock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface SignInViewProps {
  loginEmail: string;
  loginPassword: string;
  isLoading: boolean;
  error: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSuccess: (resp: any) => void;
  onGotoSignUp: () => void;
  onGotoEnterprise?: () => void;
}

export default function SignInView({
  loginEmail,
  loginPassword,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSuccess,
  onGotoSignUp,
  onGotoEnterprise,
}: SignInViewProps) {
  return (
    <div className="w-full max-w-[440px] saas-card p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="flex justify-center mb-4">
          <Logo isLink={false} className="w-44" />
        </div>
        <span className="saas-kicker inline-flex">Workspace RuangHadir</span>
        <h2 className="text-[30px] font-serif leading-tight text-[#2A1E21]">
          Selamat Datang Kembali
        </h2>
        <p className="text-[13.5px] text-[#6B5D54]">
          Masuk untuk mengelola undangan digital gratis Anda.
        </p>
      </div>

      {/* Mode switcher pill */}
      {onGotoEnterprise && (
        <div
          className="grid grid-cols-2 gap-1 rounded-full border p-1"
          style={{
            borderColor: 'var(--saas-line)',
            background: 'var(--saas-bg)',
          }}
        >
          <span
            className="rounded-full py-2 text-center text-[12px] font-bold shadow-sm"
            style={{ background: '#FFFFFF', color: 'var(--saas-ink)' }}
          >
            Akun Gratis
          </span>
          <button
            type="button"
            onClick={onGotoEnterprise}
            className="flex items-center justify-center gap-1.5 rounded-full py-2 text-[12px] font-bold transition-colors hover:text-[#2A1E21] cursor-pointer"
            style={{ color: 'var(--saas-muted)' }}
          >
            <Building2 size={13} /> Enterprise
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="saas-field-label" htmlFor="signin-email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98A44]" />
            <input
              type="email"
              required
              id="signin-email"
              value={loginEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="saas-input pl-10"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="saas-field-label" htmlFor="signin-password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98A44]" />
            <input
              type="password"
              required
              id="signin-password"
              value={loginPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="saas-input pl-10"
              placeholder="Masukkan password Anda"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#7A2E3B] bg-[#7A2E3B]/8 p-3.5 border border-[#7A2E3B]/25 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          id="signin-submit"
          disabled={isLoading}
          className="saas-btn-primary w-full !mt-2"
        >
          <span>{isLoading ? 'Memproses...' : 'Masuk'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E4D8C3]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2.5 text-[#A3917B] font-medium">
            Atau
          </span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => console.error('Google Login Failed')}
          theme="outline"
          shape="pill"
          text="continue_with"
          size="large"
        />
      </div>

      <div className="pt-1 text-center">
        <p className="text-[13.5px] text-[#6B5D54]">
          Belum memiliki akun?{' '}
          <button
            type="button"
            id="goto-signup"
            onClick={onGotoSignUp}
            className="text-[#7A2E3B] hover:underline font-bold transition-all focus:outline-none cursor-pointer"
          >
            Daftar Gratis
          </button>
        </p>
      </div>
    </div>
  );
}
