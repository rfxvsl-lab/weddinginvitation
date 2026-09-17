'use client';

/**
 * SignInView — Form login email/password + Google OAuth
 */

import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Logo } from '@/components/ui/Logo';
import {
  PiEnvelopeDuotone as Mail,
  PiLockKeyDuotone as Lock,
  PiWarningCircleDuotone as AlertCircle,
  PiCaretRightDuotone as ChevronRight,
} from 'react-icons/pi';

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
}

export default function SignInView({
  loginEmail, loginPassword, isLoading, error,
  onEmailChange, onPasswordChange, onSubmit, onGoogleSuccess, onGotoSignUp,
}: SignInViewProps) {
  return (
    <div className="w-full max-w-md saas-card p-8 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-5">
          <Logo isLink={false} className="w-48" />
        </div>
        <span className="saas-kicker block">Portal Pelanggan</span>
        <h2 className="text-3xl font-serif saas-serif-i text-[#2B2018]">Selamat Datang Kembali</h2>
        <p className="text-sm text-[#6B5B4A]">Silakan masuk ke akun Anda untuk melanjutkan pengelolaan undangan.</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="saas-kicker block !text-[10px]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98A44]" />
            <input
              type="email" required id="signin-email"
              value={loginEmail} onChange={(e) => onEmailChange(e.target.value)}
              className="saas-input pl-10"
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="saas-kicker block !text-[10px]">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B98A44]" />
            <input
              type="password" required id="signin-password"
              value={loginPassword} onChange={(e) => onPasswordChange(e.target.value)}
              className="saas-input pl-10"
              placeholder="Masukkan password Anda"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#8E2F45] bg-[#8E2F45]/8 p-3.5 border border-[#8E2F45]/25 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit" id="signin-submit"
          disabled={isLoading}
          className="saas-btn-primary w-full !mt-2"
        >
          <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E4D8C3]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#FFFDFB] px-2 text-[#A3917B] uppercase tracking-widest font-bold">Atau</span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => console.error('Google Login Failed')}
          theme="outline" shape="pill" text="continue_with" size="large"
        />
      </div>

      <div className="pt-1 text-center">
        <p className="text-sm text-[#6B5B4A]">
          Belum memiliki akun?{' '}
          <button
            id="goto-signup"
            onClick={onGotoSignUp}
            className="text-[#8E2F45] hover:underline font-bold transition-all focus:outline-none"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
