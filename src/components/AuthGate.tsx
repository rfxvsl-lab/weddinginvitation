import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import {
  PiCheckCircleDuotone as CheckCircle,
  PiWarningCircleDuotone as AlertCircle,
  PiShieldCheckDuotone as ShieldCheck,
  PiCopyDuotone as Copy,
  PiCheckDuotone as Check,
  PiCaretRightDuotone as ChevronRight,
  PiSignOutDuotone as LogOut,
  PiArrowsClockwiseDuotone as RefreshCw,
  PiQrCodeDuotone as QrCodeIcon,
  PiBankDuotone as BankIcon,
  PiCreditCardDuotone as CreditCardIcon,
  PiWalletDuotone as WalletIcon,
} from 'react-icons/pi';
import AnimatedEnvelope from './AnimatedEnvelope';
import { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';
import { useToast } from '../hooks/useToast';
import { ErrorBoundary } from './ErrorBoundary';
import SignInView from './auth/SignInView';
import SignUpView from './auth/SignUpView';
import { PACKAGE_PRICES as PRICES } from '../lib/packageLimits';
import AdminPanelView from './auth/AdminPanelView';


interface AuthGateProps {
  onLoginSuccess: (user: SaaSUser) => void;
  onAdminOverride?: () => void;
}

function AuthGateInner({ onLoginSuccess }: AuthGateProps) {
  const toast = useToast();
  // Navigation states
  const [mode, setMode] = useState<'signin' | 'signup' | 'payment' | 'admin'>('signin');
  
  // Check URL pathname or hash to route automatically to Admin Panel
  useEffect(() => {
    const handleCheckRoute = () => {
      const pName = window.location.pathname.toLowerCase();
      const hashVal = window.location.hash.toLowerCase();
      const hasAdminQuery = window.location.search.toLowerCase().includes('admin=true');
      
      if (pName === '/admin' || pName.endsWith('/admin') || hashVal === '#admin' || hashVal === '#/admin' || hasAdminQuery) {
        setMode('admin');
      } else {
        setMode(prev => prev === 'admin' ? 'signin' : prev);
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

  const handleExitAdmin = () => {
    if (window.location.pathname.toLowerCase().endsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    if (window.location.hash) {
      window.location.hash = '';
    }
    setMode('signin');
  };
  
  // Auth hook â€” backed by Turso
  const auth = useAuth();
  const usersList = auth.allUsers;
  const transactions = auth.allTransactions;
  const activeUser = auth.currentUser;
  const setActiveUser = auth.setCurrentUser;

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
  const [packageId, setPackageId] = useState<'demo' | 'reguler' | 'premium' | 'luxury'>('reguler');
  const [isCustomByRfx, setIsCustomByRfx] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ unverifiedEmail: string, name: string, avatarUrl?: string } | null>(null);
  
  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Payment Page states (Pakasir)
  const [selectedPayMethod, setSelectedPayMethod] = useState<string | null>(null);
  const [pakasirData, setPakasirData] = useState<{ orderId: string; qrCode: string; paymentUrl: string; paymentNumber?: string; vaNumber?: string; expiredAt?: string; method?: string } | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);

  // Welcome greeting for new users
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState<SaaSUser | null>(null);

  // Load admin data when entering admin mode
  useEffect(() => {
    if (mode === 'admin') {
      auth.fetchAdminData();
    }
  }, [mode]);

  // Payment gateway — route user based on payment status
  useEffect(() => {
    if (activeUser && mode !== 'admin') {
      if (activeUser.paymentStatus === 'pending' && activeUser.packageId !== 'demo') {
        setMode('payment');
      } else {
        onLoginSuccess(activeUser);
      }
    }
  }, [activeUser, mode]);

  // Payment gateway: no longer auto-create — user picks method first
  // (handleCreatePayment is called after user selects a method)

  // Payment polling: check status every 5 seconds
  useEffect(() => {
    if (mode !== 'payment' || !activeUser || !pakasirData) return;

    setPaymentPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-payment-status?userId=${activeUser.id}`);
        const data = await res.json();
        if (data.status === 'success') {
          clearInterval(interval);
          setPaymentPolling(false);
          const updatedUser = { ...activeUser, paymentStatus: 'success' as const };
          auth.setCurrentUser(updatedUser);
          // Show welcome greeting
          setWelcomeUser(updatedUser);
          setShowWelcome(true);
        }
      } catch (e) {
        // Silently retry
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      setPaymentPolling(false);
    };
  }, [mode, activeUser, pakasirData]);

  // Handle Groom/Bride changes to autogenerate slug
  useEffect(() => {
    if (packageId === 'demo') {
      if (!slug.startsWith('rfx-')) {
        setSlug(`rfx-${Math.random().toString(36).substring(2, 8)}`);
      }
      return;
    }
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
  }, [groomName, brideName, packageId]);

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
        setSlugError('Maaf, nama pasangan atau slug ini sudah terdaftar di database kami. Silakan pakai variasi nama lain.');
      } else {
        setSlugError('');
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [slug]);

  // === PAKASIR PAYMENT HANDLER ===
  const handleCreatePayment = async (method?: string) => {
    if (!activeUser) return;
    const payMethod = method || selectedPayMethod || 'qris';
    setIsCreatingPayment(true);
    setPaymentError(null);
    setPakasirData(null);

    const price = PRICES[safePackageId][activeUser.isCustomByRfx ? 'rfx' : 'mandiri'];

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: activeUser.id,
          userName: activeUser.fullName,
          userSlug: activeUser.activeSlug,
          userEmail: activeUser.email,
          packageId: activeUser.packageId,
          isCustomByRfx: activeUser.isCustomByRfx,
          amount: price,
          method: payMethod,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal membuat transaksi.');
      }

      const result = await response.json();
      setPakasirData({
        orderId: result.orderId,
        qrCode: result.qrCode,
        paymentUrl: result.paymentUrl,
        paymentNumber: result.paymentNumber,
        vaNumber: result.vaNumber,
        expiredAt: result.expiredAt,
        method: payMethod,
      });
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || 'Gagal membuat pembayaran. Silakan coba lagi.');
    } finally {
      setIsCreatingPayment(false);
    }
  };

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
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const name = decoded.name;
      const picture = decoded.picture;
      
      const result = await auth.loginWithGoogle(email, name, picture);
      if (result) {
        if ('unverifiedEmail' in result) {
          // New user -> send to signup step 2 directly with email and name filled
          setGoogleUser(result);
          setEmail(result.unverifiedEmail);
          setFullName(result.name);
          setMode('signup');
          setStep(1); // Force step 1 to fill Groom/Bride names
        } else {
          // Existing user -> login via Turso sets active user, we can trigger success
          onLoginSuccess(result);
        }
      }
    } catch (err) {
      console.error('Failed to decode Google JWT', err);
    }
  };

  // Step 1 Click Handler (Groom, Bride, FullName)
  const handleNextStep1 = () => {
    if (!fullName || !groomName || !brideName) {
      toast.warning('Form tidak lengkap', 'Harap lengkapi semua isian formulir profil dasar terlebih dahulu!');
      return;
    }
    setStep(2);
  };

  // Step 2 Click Handler (Email, Password, Wa, Sosmed verification)
  const handleNextStep2 = async () => {
    if (!noWa || !sosmed) {
      toast.warning('Form tidak lengkap', 'Harap lengkapi semua data kontak WhatsApp dan Sosial Media Anda!');
      return;
    }
    if (!googleUser) {
      if (!email || !password) {
        toast.warning('Form tidak lengkap', 'Harap lengkapi semua data kontak dan password Anda!');
        return;
      }
      if (password.length < 6) {
        toast.warning('Password terlalu pendek', 'Password minimal 6 karakter!');
        return;
      }
      
      // Check email uniqueness via Turso
      const emailAvailable = await auth.checkEmailAvailable(email);
      if (!emailAvailable) {
        toast.error('Email sudah terdaftar', 'Email ini sudah pernah mendaftarkan akun. Silakan gunakan menu Sign In.');
        return;
      }
    }
    setStep(3);
  };

  // Complete Registration — save to Turso, then redirect to payment for non-demo
  const handleSignUpComplete = async () => {
    if (packageId !== 'demo' && slugError) {
      toast.error('Slug sudah digunakan', 'Slug nama pasangan sudah digunakan. Silakan modifikasi sedikit agar unik!');
      return;
    }

    const newUser = await auth.register({
      fullName,
      coupleGroom: groomName,
      coupleBride: brideName,
      activeSlug: slug,
      email,
      password: googleUser ? Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) : password,
      noWa,
      sosmed,
      packageId,
      isCustomByRfx: packageId === 'demo' ? false : isCustomByRfx,
      paymentStatus: packageId === 'demo' ? 'success' : 'pending', // Demo = instant, others = pending
      authProvider: googleUser ? 'google' : 'local',
      avatarUrl: googleUser?.avatarUrl
    });

    if (!newUser) {
      if (auth.error) {
        toast.error('Registrasi gagal', auth.error);
        auth.clearError();
      }
      return;
    }

    if (packageId === 'demo') {
      // Demo users get instant access with welcome
      setWelcomeUser(newUser);
      setShowWelcome(true);
    } else {
      // Non-demo users go to payment page
      setMode('payment');
    }
  };

  // Copy helper
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Active Slug Checking for uniqueness
  const [slugError, setSlugError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Admin Override Actions â€” via Turso
  const handleApproveTransaction = async (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    await auth.approveTransaction(txId, tx.userId);
  };

  const handleRejectTransaction = async (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    await auth.rejectTransaction(txId, tx.userId);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Apakah anda yakin ingin menghapus user ini dan semua data transaksinya?")) {
      await auth.deleteUser(userId);
      if (activeUser?.id === userId) {
        setMode('signin');
      }
    }
  };

  const safePackageId = activeUser?.packageId && PRICES[activeUser.packageId] ? activeUser.packageId : 'reguler';
  const currentBillAmount = activeUser 
    ? PRICES[safePackageId][activeUser.isCustomByRfx ? 'rfx' : 'mandiri']
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative selection:bg-foreground selection:text-background overflow-hidden">
      {/* Modern Ambient Backgrounds */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-muted via-background to-transparent pointer-events-none opacity-40" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-foreground/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-muted blur-[150px] pointer-events-none" />
      {/* Ornamental dot pattern (if any) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none dark:bg-[radial-gradient(#262626_1px,transparent_1px)]" />


      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 z-10">
        
        {/* ==================== SIGN IN VIEW ==================== */}
        {mode === 'signin' && (
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
              onGotoSignUp={() => { setMode('signup'); setStep(1); }}
            />
          </ErrorBoundary>
        )}


        {/* ==================== SIGN UP VIEW (3-STEP WIZARD) ==================== */}
        {mode === 'signup' && (
          <ErrorBoundary name="SignUp">
            <SignUpView
              step={step}
              fullName={fullName} groomName={groomName} brideName={brideName}
              email={email} password={password} noWa={noWa} sosmed={sosmed}
              slug={slug} packageId={packageId} isCustomByRfx={isCustomByRfx}
              slugError={slugError} error={auth.error} isLoading={auth.isLoading}
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
              onCustomByRfxChange={setIsCustomByRfx}
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
          <div className="w-full max-w-lg bg-card border border-border p-10 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-700 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-1000">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-emerald-400/20 animate-ping" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-muted-foreground font-mono">SELAMAT DATANG DI RUANGHADIR</span>
              <h2 className="text-3xl font-serif text-foreground tracking-tight">Halo, {welcomeUser.fullName}! 🎉</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Akun Anda telah aktif dengan paket <span className="font-bold text-foreground">{(welcomeUser.packageId || '').toUpperCase()}</span>.
                Selamat memulai perjalanan membuat undangan pernikahan digital yang elegan!
              </p>
            </div>

            <div className="bg-muted/50 border border-border p-5 rounded-2xl space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Paket Aktif</span>
                <span className="text-xs font-bold text-foreground bg-foreground/10 px-2.5 py-1 rounded-full">{(welcomeUser.packageId || '').toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Link Undangan</span>
                <span className="text-xs font-mono text-foreground">ruanghadir.net/{welcomeUser.activeSlug}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Opsi</span>
                <span className="text-xs text-foreground">{welcomeUser.isCustomByRfx ? 'Terima Beres (RFX)' : 'Buat Sendiri'}</span>
              </div>
            </div>

            <button
              onClick={() => { setShowWelcome(false); onLoginSuccess(welcomeUser); }}
              className="w-full py-4 bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Mulai Buat Undangan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== PAYMENT VIEW (PAKASIR) ==================== */}
        {mode === 'payment' && activeUser && !showWelcome && (
          <div className="w-full max-w-xl bg-card border border-border p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500 space-y-6">
            <div className="text-center space-y-1.5 relative">
              <span className="text-[10px] tracking-[0.35em] font-bold uppercase text-muted-foreground font-mono">PEMBAYARAN OTOMATIS</span>
              <h2 className="text-2xl font-serif text-foreground tracking-tight">Selesaikan Pembayaran</h2>
              <p className="text-xs text-muted-foreground">
                Pilih metode pembayaran, lalu selesaikan untuk aktivasi instan.
              </p>
              <button 
                onClick={() => { auth.logout(); setMode('signin'); setPakasirData(null); setSelectedPayMethod(null); }}
                className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>

            {/* Billing Info */}
            <div className="bg-muted/50 border border-border p-5 rounded-2xl flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest">Detail Tagihan</span>
                <h4 className="text-sm font-bold text-foreground">{activeUser.fullName}</h4>
                <p className="text-xs text-muted-foreground">
                  Paket: <span className="text-foreground font-bold">{(activeUser.packageId || '').toUpperCase()}</span> ({activeUser.isCustomByRfx ? 'Terima Beres' : 'Buat Sendiri'})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground font-mono uppercase block">Total</span>
                <h2 className="text-2xl font-serif font-bold text-foreground">
                  Rp {currentBillAmount.toLocaleString('id-ID')}
                </h2>
              </div>
            </div>

            {/* ===== PAYMENT METHOD SELECTOR ===== */}
            {!pakasirData && !isCreatingPayment && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <label className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase font-mono block">Pilih Metode Pembayaran</label>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'qris', label: 'QRIS', sub: 'Semua E-Wallet', iconType: 'qr' },
                    { id: 'bni_va', label: 'BNI', sub: 'Virtual Account', iconType: 'bank' },
                    { id: 'bri_va', label: 'BRI', sub: 'Virtual Account', iconType: 'bank' },
                    { id: 'permata_va', label: 'Permata', sub: 'Virtual Account', iconType: 'bank' },
                    { id: 'cimb_niaga_va', label: 'CIMB Niaga', sub: 'Virtual Account', iconType: 'credit' },
                    { id: 'atm_bersama_va', label: 'ATM Bersama', sub: 'Virtual Account', iconType: 'wallet' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedPayMethod(m.id); handleCreatePayment(m.id); }}
                      className={`group/bento p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center text-center gap-1.5 hover:shadow-xl hover:border-zinc-300 ${
                        selectedPayMethod === m.id
                          ? 'bg-foreground/5 border-foreground/30 shadow-sm'
                          : 'bg-white border-border'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        m.id === 'qris' ? 'bg-emerald-500/10 text-emerald-600' :
                        m.id === 'bni_va' ? 'bg-orange-500/10 text-orange-600' :
                        m.id === 'bri_va' ? 'bg-blue-500/10 text-blue-600' :
                        m.id === 'permata_va' ? 'bg-green-600/10 text-green-700' :
                        m.id === 'cimb_niaga_va' ? 'bg-red-500/10 text-red-600' :
                        'bg-violet-500/10 text-violet-600'
                      }`}>
                        {m.iconType === 'qr' && <QrCodeIcon className="w-4.5 h-4.5" />}
                        {m.iconType === 'bank' && <BankIcon className="w-4.5 h-4.5" />}
                        {m.iconType === 'credit' && <CreditCardIcon className="w-4.5 h-4.5" />}
                        {m.iconType === 'wallet' && <WalletIcon className="w-4.5 h-4.5" />}
                      </div>
                      <span className="text-[11px] font-bold text-foreground leading-tight">{m.label}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{m.sub}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-muted-foreground text-center italic">
                  Pilih metode di atas untuk melanjutkan. Pembayaran diproses secara otomatis.
                </p>
              </div>
            )}

            {/* Loading State */}
            {isCreatingPayment && (
              <div className="bg-muted/30 p-8 rounded-2xl border border-border flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Menyiapkan Pembayaran...</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Menghubungi gateway pembayaran Pakasir.</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {paymentError && (
              <div className="flex items-start gap-2.5 text-xs bg-destructive/10 text-destructive p-4 border border-destructive/20 rounded-2xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Gagal membuat pembayaran</p>
                  <p className="mt-0.5 text-[10px]">{paymentError}</p>
                  <button onClick={() => handleCreatePayment()} className="mt-2 text-[10px] font-bold underline hover:no-underline cursor-pointer">Coba lagi</button>
                </div>
              </div>
            )}

            {/* ===== PAYMENT RESULT DISPLAY ===== */}
            {pakasirData && (
              <div className="space-y-5 animate-in fade-in duration-500">
                
                {/* QRIS Mode */}
                {pakasirData.method === 'qris' && pakasirData.qrCode ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-lg border border-border inline-block">
                      <img 
                        src={pakasirData.qrCode} 
                        alt="QRIS Payment" 
                        className="w-56 h-56 object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Scan QRIS dengan Aplikasi Apa Saja</h5>
                      <p className="text-[10px] text-muted-foreground">
                        GoPay, OVO, DANA, ShopeePay, LinkAja, atau m-Banking.
                      </p>
                    </div>
                  </div>
                ) : pakasirData.vaNumber ? (
                  /* Virtual Account Mode */
                  <div className="bg-muted/30 border border-border p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                        {(pakasirData.method || '').replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-[9px] bg-foreground/10 text-foreground px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Virtual Account</span>
                    </div>
                    
                    <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest block">Nomor Virtual Account</span>
                        <span className="text-lg font-mono font-bold text-foreground tracking-wider select-all">
                          {pakasirData.vaNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => triggerCopy(pakasirData.vaNumber || '', 'va')}
                        className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                      >
                        {copiedText === 'va' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="text-[10px] text-muted-foreground leading-relaxed space-y-1">
                      <p>1. Buka aplikasi m-Banking atau ATM.</p>
                      <p>2. Pilih menu <strong>Transfer → Virtual Account</strong>.</p>
                      <p>3. Masukkan nomor VA di atas, lalu konfirmasi.</p>
                    </div>
                  </div>
                ) : (
                  /* Fallback — no QR, no VA */
                  <div className="flex flex-col items-center text-center space-y-3 bg-muted/30 p-6 rounded-2xl border border-border">
                    <ShieldCheck className="w-8 h-8 text-foreground/50" />
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Lakukan Pembayaran</h5>
                      <p className="text-[10px] text-muted-foreground">
                        Klik tombol di bawah untuk membuka halaman pembayaran.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Link Button */}
                {pakasirData.paymentUrl && (
                  <a
                    href={pakasirData.paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bayar via Halaman Pembayaran</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                )}

                {/* Order Info */}
                <div className="bg-muted/30 border border-border p-4 rounded-2xl grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <span className="text-muted-foreground font-bold uppercase tracking-widest block">Order ID</span>
                    <span className="font-mono text-foreground">{pakasirData.orderId}</span>
                  </div>
                  {pakasirData.expiredAt && (
                    <div className="text-right">
                      <span className="text-muted-foreground font-bold uppercase tracking-widest block">Batas Waktu</span>
                      <span className="font-mono text-foreground">{pakasirData.expiredAt}</span>
                    </div>
                  )}
                </div>

                {/* Change Method */}
                <button
                  onClick={() => { setPakasirData(null); setSelectedPayMethod(null); }}
                  className="w-full py-2.5 bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Ganti Metode Pembayaran
                </button>

                {/* Sandbox Simulate — only on localhost */}
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/simulate-payment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId: pakasirData.orderId,
                            amount: currentBillAmount,
                            userId: activeUser.id,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          toast.success('Simulasi berhasil!', 'Pembayaran sandbox dikonfirmasi. Mengarahkan ke dashboard...');
                        }
                      } catch (e) {
                        console.error('Simulation failed:', e);
                      }
                    }}
                    className="w-full py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>🧪 Simulasi Bayar (Sandbox / Dev Mode)</span>
                  </button>
                )}

                {/* Polling Indicator */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Mendeteksi pembayaran secara otomatis...</span>
                </div>
              </div>
            )}
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
    </div>
  );
}

export default function AuthGate(props: AuthGateProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthGateInner {...props} />
    </GoogleOAuthProvider>
  );
}
