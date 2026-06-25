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
    <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <Logo isLink={false} className="w-48" />
        </div>
        <h2 className="text-2xl font-serif text-foreground tracking-tight">Selamat Datang Kembali</h2>
        <p className="text-sm text-muted-foreground">Silakan masuk ke akun Anda untuk melanjutkan pengelolaan undangan.</p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email" required id="signin-email"
              value={loginEmail} onChange={(e) => onEmailChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none placeholder:text-muted-foreground" 
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password" required id="signin-password"
              value={loginPassword} onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-foreground focus:border-foreground transition-all outline-none placeholder:text-muted-foreground" 
              placeholder="Masukkan password Anda"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3.5 border border-destructive/20 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit" id="signin-submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors disabled:opacity-50"
        >
          <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground uppercase tracking-widest font-bold">Atau</span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => console.error('Google Login Failed')}
          theme="outline" shape="pill" text="continue_with" size="large"
        />
      </div>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Belum memiliki akun?{' '}
          <button
            id="goto-signup"
            onClick={onGotoSignUp}
            className="text-foreground hover:underline font-bold transition-all focus:outline-none"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </div>
  );
}
