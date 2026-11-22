'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth, type GoogleSignupInfo } from '../hooks/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import {
  CheckCircle2 as CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { SaaSUser, UserPackageId } from '../types';
import { useToast } from '../hooks/useToast';
import { ErrorBoundary } from './ErrorBoundary';
import SignInView from './auth/SignInView';
import SignUpView from './auth/SignUpView';
import EnterpriseSignInView from './auth/EnterpriseSignInView';
import AdminPanelView from './auth/AdminPanelView';

interface AuthGateProps {
  onLoginSuccess: (user: SaaSUser) => void;
  onAdminOverride?: () => void;
}

function AuthGateInner({ onLoginSuccess }: AuthGateProps) {
  const toast = useToast();
  const [mode, setMode] = useState<'signin' | 'signup' | 'enterprise' | 'admin'>('signin');

  // Route automatically to Admin Panel if /admin or #admin or ?admin=true
  useEffect(() => {
    const handleCheckRoute = () => {
      const pName = window.location.pathname.toLowerCase();
      const hashVal = window.location.hash.toLowerCase();
      const hasAdminQuery = window.location.search.toLowerCase().includes('admin=true');

      if (
        pName === '/admin' ||
        pName.endsWith('/admin') ||
        hashVal === '#admin' ||
        hashVal === '#/admin' ||
        hasAdminQuery
      ) {
        setMode('admin');
      } else {
        setMode((prev) => (prev === 'admin' ? 'signin' : prev));
      }
    };

    handleCheckRoute();
    window.addEventListener('popstate', handleCheckRoute);
    window.addEventListener('hashchange', handleCheckRoute);
    return () => {
      window.removeEventListener('popstate', handleCheckRoute);
      window.removeEventListener('hashchange', handleCheckRoute);
    };
  }, []);

  // Honor landing page query params: /auth?mode=register|enterprise&slug=...&email=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intent = (params.get('mode') || '').toLowerCase();
    const prefillEmail = params.get('email');
    const prefillSlug = params.get('slug');

    if (intent === 'enterprise' || intent === 'corporate' || intent === 'company') {
      setMode('enterprise');
    } else if (intent === 'register' || intent === 'signup' || intent === 'daftar') {
      setMode('signup');
      setStep(1);
    }

    if (prefillEmail) {
      setEmail(prefillEmail);
      setLoginEmail(prefillEmail);
    }
    if (prefillSlug) {
      const clean = prefillSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (clean) setSlug(clean);
    }
  }, []);

  const auth = useAuth();
  const usersList = auth.allUsers;
  const transactions = auth.allTransactions;
  const activeUser = auth.currentUser;

  // Sign up Form step wizard states
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Registration Inputs
  const [fullName, setFullName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [noWa, setNoWa] = useState('');
  const [sosmed, setSosmed] = useState('');
  const [packageId, setPackageId] = useState<UserPackageId>('free');
  const [googleUser, setGoogleUser] = useState<GoogleSignupInfo | null>(null);

  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Active Slug Checking for uniqueness
  const [slugError, setSlugError] = useState('');

  // Welcome greeting for new users
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<SaaSUser | null>(null);

  // Load admin data when entering admin mode
  useEffect(() => {
    if (mode === 'admin') {
      auth.fetchAdminData();
    }
  }, [mode]);

  // Auto-enter dashboard whenever activeUser is present (all free & enterprise accounts are instant)
  useEffect(() => {
    if (activeUser && mode !== 'admin' && !showWelcome) {
      onLoginSuccess(activeUser);
    }
  }, [activeUser, mode, showWelcome]);

  // Autogenerate slug from Groom/Bride names if user hasn't manually set a prefill slug
  useEffect(() => {
    if (groomName || brideName) {
      const cleanGroom = groomName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanBride = brideName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanGroom && cleanBride) {
        setSlug(`${cleanGroom}-${cleanBride}`);
      } else if (cleanGroom) {
        setSlug(cleanGroom);
      } else if (cleanBride) {
        setSlug(cleanBride);
      }
    }
  }, [groomName, brideName]);

  // Validate Slug in Realtime (async via Turso)
  useEffect(() => {
    if (!slug) {
      setSlugError('');
      return;
    }
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slug !== cleanSlug) {
      setSlug(cleanSlug);
    }

    const timer = setTimeout(async () => {
      const available = await auth.checkSlugAvailable(cleanSlug);
      if (!available) {
        setSlugError('Tautan ini sudah digunakan. Silakan tambahkan angka atau variasi lain.');
      } else {
        setSlugError('');
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [slug]);

  // Login handler — with password via Turso
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const user = await auth.login(loginEmail, loginPassword);
    if (!user && auth.error) {
      toast.error('Login gagal', auth.error);
      auth.clearError();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    try {
      const result = await auth.loginWithGoogle(credentialResponse.credential);
      if (result) {
        if ('unverifiedEmail' in result) {
          setGoogleUser(result);
          setEmail(result.unverifiedEmail);
          setFullName(result.name);
          setMode('signup');
          setStep(1);
        } else {
          onLoginSuccess(result);
        }
      }
    } catch (err) {
      console.error('Failed to decode Google JWT', err);
    }
  };

  // Step 1 Click Handler (Groom, Bride, FullName)
  const handleNextStep1 = () => {
    if ((!googleUser && !fullName.trim()) || !groomName.trim() || !brideName.trim()) {
      toast.warning('Form tidak lengkap', 'Harap lengkapi nama pemesan dan nama panggilan pasangan.');
      return;
    }
    setStep(2);
  };

  // Step 2 Click Handler (Email, Password, Wa, Sosmed verification)
  const handleNextStep2 = async () => {
    if (!noWa.trim() || !sosmed.trim()) {
      toast.warning('Form tidak lengkap', 'Harap lengkapi nomor WhatsApp dan sosial media Anda.');
      return;
    }
    if (!googleUser) {
      if (!email.trim() || !password) {
        toast.warning('Form tidak lengkap', 'Harap lengkapi email dan password akun Anda.');
        return;
      }
      if (password.length < 8) {
        toast.warning('Password terlalu pendek', 'Password minimal 8 karakter.');
        return;
      }

      const emailAvailable = await auth.checkEmailAvailable(email);
      if (!emailAvailable) {
        toast.error('Email sudah terdaftar', 'Email ini sudah memiliki akun. Silakan masuk melalui menu Sign In.');
        return;
      }
    }
    setStep(3);
  };

  // Complete Registration — Full Gratis (Rp 0), instant activation
  const handleSignUpComplete = async () => {
    const finalSlug =
      slug.trim() ||
      `${groomName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'undangan'}-${
        brideName.toLowerCase().replace(/[^a-z0-9]/g, '') || Math.random().toString(36).slice(2, 6)
      }`;

    if (slugError) {
      toast.error('Slug sudah digunakan', 'Silakan ubah sedikit tautan undangan Anda agar unik.');
      return;
    }

    const newUser = await auth.register({
      fullName: fullName.trim() || googleUser?.name || `${groomName} & ${brideName}`,
      coupleGroom: groomName.trim(),
      coupleBride: brideName.trim(),
      activeSlug: finalSlug,
      email: email.trim().toLowerCase(),
      password: googleUser ? undefined : password,
      googleSignupToken: googleUser?.signupToken,
      noWa: noWa.trim(),
      sosmed: sosmed.trim(),
      packageId: 'free',
      isCustomByRfx: false,
      paymentStatus: 'success',
      authProvider: googleUser ? 'google' : 'local',
      avatarUrl: googleUser?.avatarUrl,
    });

    if (!newUser) {
      if (auth.error) {
        toast.error('Registrasi gagal', auth.error);
        auth.clearError();
      }
      return;
    }

    setWelcomeUser(newUser);
    setShowWelcome(true);
  };

  // Admin Override Actions — via Turso
  const handleApproveTransaction = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    await auth.approveTransaction(txId, tx.userId);
  };

  const handleRejectTransaction = async (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    await auth.rejectTransaction(txId, tx.userId);
  };

  return (
    <div className="saas-scope min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* ==================== SIGN IN VIEW ==================== */}
        {mode === 'signin' && !showWelcome && (
          <ErrorBoundary name="SignIn">
            <SignInView
              loginEmail={loginEmail}
              loginPassword={loginPassword}
              isLoading={auth.isLoading}
              error={auth.error}
              onEmailChange={setLoginEmail}
              onPasswordChange={setLoginPassword}
              onSubmit={handleLogin}
              onGoogleSuccess={handleGoogleSuccess}
              onGotoSignUp={() => {
                setMode('signup');
                setStep(1);
              }}
              onGotoEnterprise={() => setMode('enterprise')}
            />
          </ErrorBoundary>
        )}

        {/* ==================== ENTERPRISE SIGN IN VIEW ==================== */}
        {mode === 'enterprise' && !showWelcome && (
          <ErrorBoundary name="EnterpriseSignIn">
            <EnterpriseSignInView
              onSuccess={(user) => {
                auth.setCurrentUser(user);
                onLoginSuccess(user);
              }}
              onBackToPersonal={() => setMode('signin')}
            />
          </ErrorBoundary>
        )}

        {/* ==================== SIGN UP VIEW (3-STEP FREE WIZARD) ==================== */}
        {mode === 'signup' && !showWelcome && (
          <ErrorBoundary name="SignUp">
            <SignUpView
              step={step}
              fullName={fullName}
              groomName={groomName}
              brideName={brideName}
              email={email}
              password={password}
              noWa={noWa}
              sosmed={sosmed}
              slug={slug}
              packageId={packageId}
              slugError={slugError}
              error={auth.error}
              isLoading={auth.isLoading}
              googleUser={googleUser}
              onFullNameChange={setFullName}
              onGroomChange={setGroomName}
              onBrideChange={setBrideName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onNoWaChange={setNoWa}
              onSosmedChange={setSosmed}
              onSlugChange={setSlug}
              onPackageChange={setPackageId}
              onGotoEnterprise={() => setMode('enterprise')}
              onBack={() => {
                if (step === 1) setMode('signin');
                else setStep((prev) => (prev - 1) as 1 | 2 | 3);
              }}
              onNext1={handleNextStep1}
              onNext2={handleNextStep2}
              onComplete={handleSignUpComplete}
            />
          </ErrorBoundary>
        )}

        {/* ==================== WELCOME GREETING ==================== */}
        {showWelcome && welcomeUser && (
          <div className="w-full max-w-md saas-card p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E9F2EA] border border-[#3F7A52]/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#3F7A52]" />
            </div>

            <div className="space-y-2">
              <span className="saas-kicker">Akun Aktif · Full Gratis</span>
              <h2 className="text-[28px] font-serif text-[#2A1E21] leading-tight">
                Selamat Datang, {welcomeUser.fullName}
              </h2>
              <p className="text-[13.5px] text-[#6B5D54] leading-relaxed">
                Workspace undangan Anda sudah siap digunakan dengan seluruh fitur inti terbuka tanpa biaya.
              </p>
            </div>

            <div className="bg-[#F8F5F0] border border-[#E6DDD2] p-4 rounded-xl space-y-2.5 text-left text-[13px]">
              <div className="flex justify-between items-center">
                <span className="text-[#6B5D54]">Paket Aktif</span>
                <span className="font-bold text-[#3F7A52] bg-[#E9F2EA] px-2.5 py-0.5 rounded-full text-[12px] font-medium">
                  Full Gratis · Rp 0
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-[#6B5D54]">Tautan Undangan</span>
                <span className="font-mono text-[12px] font-semibold text-[#2A1E21] truncate">
                  ruanghadir.net/{welcomeUser.activeSlug}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcome(false);
                onLoginSuccess(welcomeUser);
              }}
              className="w-full saas-btn-primary !py-3.5 cursor-pointer"
            >
              <span>Buka Dashboard Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== PORTAL ADMIN VIEW ==================== */}
        {mode === 'admin' && (
          <ErrorBoundary name="AdminPanel">
            <AdminPanelView
              usersList={usersList}
              transactions={transactions}
              onApprove={handleApproveTransaction}
              onReject={handleRejectTransaction}
              onDeleteUser={async (userId) => {
                await auth.deleteUser(userId);
                if (activeUser?.id === userId) setMode('signin');
              }}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* Panel visual (desktop): tampilan undangan asli */}
      <aside className="relative hidden overflow-hidden bg-[#2A1E21] lg:block" aria-hidden>
        <Image
          src="/assets/themes/shots/storybook-interactive.webp"
          alt=""
          fill
          sizes="45vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E21] via-[#2A1E21]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-[#F6EFE6]">
          <p className="rh-display max-w-[420px] text-[34px] leading-[1.12]">
            Satu tautan untuk seluruh tamu, lengkap dengan nama mereka.
          </p>
          <p className="mt-4 max-w-[380px] text-[15px] leading-[1.6] text-[#D9CCC4]">
            Tema, RSVP, amplop digital, dan check-in QR — gratis untuk setiap pasangan.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default function AuthGate(props: AuthGateProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'placeholder-client-id';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthGateInner {...props} />
    </GoogleOAuthProvider>
  );
}
