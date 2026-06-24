import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { uploadProofTransfer } from '../lib/cloudinary';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { 
  PiHeartDuotone as Heart, 
  PiUserDuotone as User, 
  PiEnvelopeDuotone as Mail, 
  PiPhoneDuotone as Phone, 
  PiGlobeHemisphereWestDuotone as Globe, 
  PiShareNetworkDuotone as Share2, 
  PiCheckCircleDuotone as CheckCircle, 
  PiWarningCircleDuotone as AlertCircle,
  PiFileArchiveDuotone as FileCheck, 
  PiUploadDuotone as Upload, 
  PiCreditCardDuotone as CreditCard, 
  PiShieldCheckDuotone as ShieldCheck, 
  PiQrCodeDuotone as QrCode, 
  PiCopyDuotone as Copy, 
  PiCheckDuotone as Check, 
  PiCaretRightDuotone as ChevronRight, 
  PiArrowLeftDuotone as ArrowLeft,
  PiBuildingsDuotone as Building,
  PiCurrencyDollarDuotone as DollarSign,
  PiChartLineUpDuotone as TrendingUp,
  PiFileTextDuotone as FileText,
  PiPrinterDuotone as Printer,
  PiTrashDuotone as Trash2,
  PiLockKeyDuotone as Lock,
  PiListDuotone as Menu,
  PiEyeDuotone as Eye,
  PiSignOutDuotone as LogOut,
  PiSparkleDuotone as Sparkles,
  PiClockDuotone as Clock,
  PiArrowsClockwiseDuotone as RefreshCw
} from 'react-icons/pi';
import AnimatedEnvelope from './AnimatedEnvelope';
import { SaaSUser, TransactionReport } from '../types';
import * as api from '../lib/api';

// Price parameters as constant
const PRICES = {
  demo: { mandiri: 0, rfx: 0 },
  reguler: { mandiri: 30000, rfx: 45000 },
  medium: { mandiri: 50000, rfx: 65000 },
  premium: { mandiri: 100000, rfx: 125000 },
  luxury: { mandiri: 9999999, rfx: 9999999 }
};

interface AuthGateProps {
  onLoginSuccess: (user: SaaSUser) => void;
  onAdminOverride?: () => void;
}

function AuthGateInner({ onLoginSuccess }: AuthGateProps) {
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
  
  // Auth hook — backed by Turso
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
  const [packageId, setPackageId] = useState<'demo' | 'reguler' | 'medium' | 'premium' | 'luxury'>('reguler');
  const [isCustomByRfx, setIsCustomByRfx] = useState(false);
  const [googleUser, setGoogleUser] = useState<{ unverifiedEmail: string, name: string, avatarUrl?: string } | null>(null);
  
  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Payment Page states
  const [selectedMethod, setSelectedMethod] = useState<'mandiri' | 'seabank' | 'qris' | 'shopeepay' | null>(null);
  const [proofImage, setProofImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'failed' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Active Slug Checking for uniqueness
  const [slugError, setSlugError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // PDF print modal state
  const [printingReport, setPrintingReport] = useState<TransactionReport | null>(null);

  // AI OCR States
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);
  const [scanSuccess, setScanSuccess] = useState<'pending' | boolean>(false);

  // Load admin data when entering admin mode
  useEffect(() => {
    if (mode === 'admin') {
      auth.fetchAdminData();
    }
  }, [mode]);

  // Payment gateway disabled — always bypass to dashboard
  useEffect(() => {
    if (activeUser && mode !== 'admin') {
      onLoginSuccess(activeUser);
    }
  }, [activeUser, mode]);

  // Check if user already has a pending transaction when in payment mode
  useEffect(() => {
    if (mode === 'payment' && activeUser && activeUser.paymentStatus === 'pending') {
      api.getTransactionsByUser(activeUser.id).then((txs) => {
        const pendingTx = txs.find(t => t.status === 'pending');
        if (pendingTx) {
          setTransactionStatus('pending');
        }
      }).catch(console.error);
    }
  }, [mode, activeUser]);

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

  const submitProofTransaction = async (imageSrc: string) => {
    if (!activeUser) return;
    setIsUploading(true);
    setPaymentError(null);
    setTransactionStatus(null);
    setAiAnalysisResult(null);
    setScanSuccess('pending');

    const price = PRICES[packageId][isCustomByRfx ? 'rfx' : 'mandiri'];

    try {
      // 1. Call server-side payment verification API route
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageSrc,
          expectedNominal: price,
          userId: activeUser.id,
          userName: activeUser.fullName,
          userSlug: activeUser.activeSlug,
          userEmail: activeUser.email,
          packageId: activeUser.packageId,
          isCustomByRfx: activeUser.isCustomByRfx,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal memproses verifikasi AI.');
      }

      const result = await response.json();
      
      // Save AI analysis result
      setAiAnalysisResult(result.aiResult);
      setScanSuccess(result.success);

      if (result.success) {
        // Update local session
        const updatedUser = { ...activeUser, paymentStatus: 'success' as const };
        auth.setCurrentUser(updatedUser);
        setTransactionStatus('pending'); // will be bypassed to success on next effect run
      } else {
        setTransactionStatus('failed');
      }

      // Trigger Admin Push Notification Webhook
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: result.success ? '✅ Pembayaran Lolos AI' : '⚠️ Gagal Verifikasi AI',
            message: `User: ${activeUser.fullName} (Rp ${price.toLocaleString('id-ID')}). Status: ${result.success ? 'Sukses' : 'Review Manual'}`,
            data: { userId: activeUser.id, status: result.success ? 'success' : 'pending' }
          })
        });
      } catch (e) {
        console.error('Failed to trigger webhook', e);
      }

    } catch (err: any) {
      console.error(err);
      setPaymentError("Gagal memproses verifikasi pembayaran. Silakan coba lagi.");
      setScanSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  // Image Upload handler — uploads to Cloudinary, then directly saves
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setPaymentError(null);
      // Upload to Cloudinary
      const result = await uploadProofTransfer(file, (p) => setUploadProgress(p));
      setProofImage(result.secureUrl);
      
      // Pass the secure URL instead of base64
      submitProofTransaction(result.secureUrl);
    } catch (err: any) {
      console.error('Cloudinary Upload Error:', err);
      setPaymentError(err.message || 'Gagal mengunggah gambar. Pastikan ukuran file max 5MB dan format sesuai.');
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Drag and drop dropzone handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  // Login handler — with password via Turso
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const user = await auth.login(loginEmail, loginPassword);
    if (!user && auth.error) {
      alert(auth.error);
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
      alert("Harap lengkapi semua isian formulir profil dasar terlebih dahulu!");
      return;
    }
    setStep(2);
  };

  // Step 2 Click Handler (Email, Password, Wa, Sosmed verification)
  const handleNextStep2 = async () => {
    if (!noWa || !sosmed) {
      alert("Harap lengkapi semua data kontak WhatsApp dan Sosial Media Anda!");
      return;
    }
    if (!googleUser) {
      if (!email || !password) {
        alert("Harap lengkapi semua data kontak dan password Anda!");
        return;
      }
      if (password.length < 6) {
        alert("Password minimal 6 karakter!");
        return;
      }
      
      // Check email uniqueness via Turso
      const emailAvailable = await auth.checkEmailAvailable(email);
      if (!emailAvailable) {
        alert("Email ini sudah pernah mendaftarkan akun. Silakan gunakan menu Sign In.");
        return;
      }
    }
    setStep(3);
  };

  // Complete Registration Form Step 3 — save to Turso
  const handleSignUpComplete = async () => {
    if (packageId !== 'demo' && slugError) {
      alert("Slug nama pasangan sudah digunakan. Silakan modifikasi sedikit agar unik!");
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
      paymentStatus: 'success', // Payment disabled — all users get instant access
      authProvider: googleUser ? 'google' : 'local',
      avatarUrl: googleUser?.avatarUrl
    });

    if (!newUser) {
      if (auth.error) {
        alert(auth.error);
        auth.clearError();
      }
      return;
    }

    // Payment disabled — always bypass to dashboard
    onLoginSuccess(newUser!);
  };

  // Copy helper
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Admin Override Actions — via Turso
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans relative selection:bg-[var(--color-primary-light)] selection:text-[var(--color-primary-hover)]">
      {/* Soft Ambient Backgrounds */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-gradient-to-b from-[var(--color-primary-lighter)] via-[var(--bg-primary)] to-transparent pointer-events-none opacity-60" />
      <div className="absolute top-20 left-[5%] w-[35%] h-[35%] rounded-full bg-[var(--color-primary-light)] blur-[130px] pointer-events-none opacity-30" />
      <div className="absolute bottom-20 right-[5%] w-[40%] h-[40%] rounded-full bg-[var(--color-accent-lighter)] blur-[140px] pointer-events-none opacity-30" />
      {/* Ornamental dot pattern */}
      <div className="absolute inset-0 ornament-dots opacity-[0.03] pointer-events-none" />


      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 z-10">
        
        {/* ==================== SIGN IN VIEW ==================== */}
        {mode === 'signin' && (
          <div className="w-full max-w-md card-glass p-8 rounded-[32px] animate-slideUp space-y-6">
            {/* Decorative header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-primary-light)] flex items-center justify-center animate-float">
                <Heart className="w-7 h-7 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] tracking-tight">Selamat Datang</h2>
              <p className="text-sm text-[var(--text-secondary)] font-body-serif">Masuk untuk mengelola undangan digital Anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-elegant pl-11"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-elegant pl-11"
                    placeholder="Masukkan password Anda"
                  />
                </div>
              </div>

              {auth.error && (
                <div className="flex items-center gap-2 text-[11px] text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 border border-[var(--color-danger)]/20 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{auth.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={auth.isLoading}
                className="btn-primary w-full py-3.5 text-sm rounded-2xl disabled:opacity-50"
              >
                <span>{auth.isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="divider-ornamental text-sm py-1">
              atau
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('Google Login Failed')}
                theme="outline"
                shape="pill"
                text="continue_with"
                size="large"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-light)] text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Belum punya akun?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setStep(1);
                  }}
                  className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold hover:underline focus:outline-none bg-transparent border-none cursor-pointer transition-colors"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ==================== SIGN UP VIEW (3-STEP WIZARD) ==================== */}
        {mode === 'signup' && (
          <div className="w-full max-w-xl card-glass-strong p-8 rounded-[36px] animate-slideUp space-y-6">
            
            {/* Step indicators */}
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]'}`}>1</span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--text-secondary)] hidden sm:inline">Profil</span>
              </div>
              <div className="w-8 h-[1px] bg-[var(--border-default)]" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]'}`}>2</span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--text-secondary)] hidden sm:inline">Kontak</span>
              </div>
              <div className="w-8 h-[1px] bg-[var(--border-default)]" />
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${step >= 3 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--bg-surface-alt)] text-[var(--text-muted)]'}`}>3</span>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[var(--text-secondary)] hidden sm:inline">Paket</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-[var(--color-primary)] font-mono">REGISTRASI UNDANGANKITA</span>
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] uppercase tracking-tight">
                {step === 1 && "1. Profil Pernikahan"}
                {step === 2 && "2. Detail Kontak"}
                {step === 3 && "3. Pilih Paket Layanan"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-body-serif">
                {step === 1 && "Tentukan nama panggilan serta tautan (slug) unik pasangan Anda."}
                {step === 2 && "Lengkapi detail email, nomor WhatsApp untuk RSVP, serta media sosial."}
                {step === 3 && "Tentukan limitasi kuota undangan serta model layanan sesuai kebutuhan Anda."}
              </p>
            </div>

            {/* STEP 1: Basic Profiles and Auto Slug generator */}
            {step === 1 && (
              <div className="space-y-4 pt-2">
                {!googleUser && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Nama Lengkap Pemesan</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-elegant pl-11"
                        placeholder="Contoh: Ridho Alamsyah"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Panggilan Pria</label>
                    <input
                      type="text"
                      required
                      value={groomName}
                      onChange={(e) => setGroomName(e.target.value)}
                      className="input-elegant"
                      placeholder="Contoh: Ridho"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Panggilan Wanita</label>
                    <input
                      type="text"
                      required
                      value={brideName}
                      onChange={(e) => setBrideName(e.target.value)}
                      className="input-elegant"
                      placeholder="Contoh: Jennie"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setMode('signin')}
                    className="btn-ghost flex-1 py-3 text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleNextStep1}
                    className="btn-primary flex-1 py-3 text-xs"
                  >
                    <span>Lanjut</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Contacts and email verification */}
            {step === 2 && (
              <div className="space-y-4 pt-2">
                {!googleUser && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Alamat Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-elegant pl-11"
                          placeholder="nama@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Password Akun</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-elegant pl-11"
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">WhatsApp Aktif</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input
                      type="tel"
                      required
                      value={noWa}
                      onChange={(e) => setNoWa(e.target.value)}
                      className="input-elegant pl-11"
                      placeholder="Format: 0812xxxxxxxx"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase">Instagram/TikTok</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input
                      type="text"
                      required
                      value={sosmed}
                      onChange={(e) => setSosmed(e.target.value)}
                      className="input-elegant pl-11"
                      placeholder="@username_anda"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-ghost flex-1 py-3 text-xs"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleNextStep2}
                    className="btn-primary flex-1 py-3 text-xs"
                  >
                    <span>Lanjut</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Premium Tier/Package Selection */}
            {step === 3 && (
              <div className="space-y-5 pt-2">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Demo Package Card */}
                    <div 
                      onClick={() => setPackageId('demo')}
                      className={`card-interactive p-5 relative flex flex-col justify-between ${packageId === 'demo' ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : ''}`}
                    >
                      <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-[var(--bg-surface-alt)] text-[9px] text-[var(--text-secondary)] font-bold tracking-wide uppercase border border-[var(--border-default)]">14 Hari</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-secondary)]">Uji Coba</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] uppercase">DEMO</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Limitasi: 20 Tamu & Tanpa QR</p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border-light)] mt-4">
                        <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Biaya</span>
                        <h4 className="text-xl font-bold text-[var(--color-secondary)]">Gratis</h4>
                      </div>
                    </div>
                    {/* Reguler Package Card */}
                    <div 
                      onClick={() => setPackageId('reguler')}
                      className={`card-interactive p-5 relative flex flex-col justify-between ${packageId === 'reguler' ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : ''}`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Dasar</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] uppercase">REGULER</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Batas Maksimal: 1 Acara</p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border-light)] mt-4">
                        <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Mulai dari</span>
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">Rp 30.000</h4>
                      </div>
                    </div>

                    {/* Medium Package Card */}
                    <div 
                      onClick={() => setPackageId('medium')}
                      className={`card-interactive p-5 relative flex flex-col justify-between ${packageId === 'medium' ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : ''}`}
                    >
                      <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[9px] text-white font-bold tracking-wide uppercase">Populer</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">Menengah</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] uppercase">MEDIUM</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Batas Maksimal: 2 Acara</p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border-light)] mt-4">
                        <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Mulai dari</span>
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">Rp 50.000</h4>
                      </div>
                    </div>

                    {/* Premium Package Card */}
                    <div 
                      onClick={() => setPackageId('premium')}
                      className={`card-interactive p-5 relative flex flex-col justify-between ${packageId === 'premium' ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : ''}`}
                    >
                      <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[9px] font-bold tracking-wide uppercase border border-[var(--color-accent)]/20">Eksklusif</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">Tertinggi</span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] uppercase">PREMIUM</h4>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Batas Maksimal: 4 Acara</p>
                      </div>
                      <div className="pt-4 border-t border-[var(--border-light)] mt-4">
                        <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">Mulai dari</span>
                        <h4 className="text-xl font-bold text-[var(--text-primary)]">Rp 100.000</h4>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slug Input Selection on Step 3 */}
                <div className="space-y-2 bg-[var(--bg-surface-alt)] border border-[var(--border-light)] p-5 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-semibold text-[var(--color-primary)] tracking-wider uppercase flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <span>Slug / Link Undangan</span>
                    </label>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{packageId === 'demo' ? 'Otomatis' : 'Custom'}</span>
                  </div>

                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={packageId === 'demo'}
                    className={`input-elegant font-mono ${packageId === 'demo' ? 'bg-[var(--border-light)] text-[var(--text-muted)] cursor-not-allowed' : ''}`}
                    placeholder="Contoh: ridho-jennie"
                  />

                  {packageId !== 'demo' && slugError ? (
                    <div className="flex items-start gap-1.5 text-[11px] text-[var(--color-danger)] bg-[var(--color-danger-light)] p-2.5 border border-[var(--color-danger)]/20 rounded-xl mt-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{slugError}</span>
                    </div>
                  ) : slug ? (
                    <div className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-2 flex items-center flex-wrap gap-1">
                      Link anda nantinya:{' '}
                      <span className="text-[var(--text-primary)] font-bold bg-[var(--bg-surface)] px-2 py-0.5 rounded-lg border border-[var(--border-default)] font-mono break-all inline-block mt-1 w-full sm:w-auto">
                        undangankita.rfx.web.id/{slug}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Custom Type Configurator */}
                {packageId !== 'demo' && (
                <div className="bg-[var(--bg-surface-alt)] border border-[var(--border-light)] p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--border-default)]">
                    <label className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)]">Opsi Pembuatan</label>
                  </div>

                  <div className="flex gap-4">
                    <div 
                      onClick={() => setIsCustomByRfx(false)}
                      className={`flex-1 p-4 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between bg-[var(--bg-surface)] ${!isCustomByRfx ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : 'border-[var(--border-default)]'}`}
                    >
                      <div>
                        <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase">Buat Sendiri</h5>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Edit via builder</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-primary)] mt-3">Rp {PRICES[packageId].mandiri.toLocaleString('id-ID')}</span>
                    </div>

                    <div 
                      onClick={() => setIsCustomByRfx(true)}
                      className={`flex-1 p-4 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between bg-[var(--bg-surface)] ${isCustomByRfx ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : 'border-[var(--border-default)]'}`}
                    >
                      <div>
                        <h5 className="text-xs font-bold text-[var(--text-primary)] uppercase">Terima Beres</h5>
                        <p className="text-[11px] text-[var(--text-secondary)] font-body-serif mt-1">Dibuatkan tim kami</p>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-primary)] mt-3">Rp {PRICES[packageId].rfx.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                )}

                {/* Final Checkout calculation review */}
                <div className="bg-[var(--color-primary-lighter)] border border-[var(--color-primary-light)] p-5 rounded-3xl flex justify-between items-center shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold tracking-wider text-[var(--color-primary-hover)] uppercase">Total Ringkasan</span>
                    <h5 className="text-[13px] font-bold text-[var(--text-primary)]">
                      Paket {(packageId || '').toUpperCase()} {packageId !== 'demo' && `+ ${isCustomByRfx ? 'Terima Beres' : 'Buat Sendiri'}`}
                    </h5>
                  </div>
                  <h4 className={`text-2xl font-display font-bold ${packageId === 'demo' ? 'text-[var(--color-secondary)]' : 'text-[var(--color-primary)]'}`}>
                    {packageId === 'demo' ? 'Gratis' : `Rp ${PRICES[packageId][isCustomByRfx ? 'rfx' : 'mandiri'].toLocaleString('id-ID')}`}
                  </h4>
                </div>
                
                {auth.error && (
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-danger)] bg-[var(--color-danger-light)] p-3 border border-[var(--color-danger)]/20 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{auth.error}</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-ghost flex-1 py-3 text-xs"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleSignUpComplete}
                    disabled={auth.isLoading}
                    className="btn-primary flex-1 py-3 text-xs"
                  >
                    <span>{auth.isLoading ? 'Memproses...' : 'Selesaikan Registrasi'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ==================== PAYMENT VIEW ==================== */}
        {mode === 'payment' && activeUser && (
          <div className="w-full max-w-2xl bg-zinc-950/75 border border-zinc-900 p-8 rounded-[38px] shadow-2xl backdrop-blur-xl animate-fadeIn space-y-6">
            <div className="text-center space-y-1.5 relative">
              <span className="text-[10px] tracking-[0.35em] font-black uppercase text-rose-500 font-mono">GERBANG PEMBAYARAN MANUAL & VERIFIKASI AI</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Menunggu Pembayaran Paket</h2>
              <p className="text-xs text-zinc-400">
                Silakan lakukan transfer sesuai tagihan di bawah ini untuk aktivasi instan akun SaaS Anda.
              </p>
              <button 
                onClick={() => { auth.logout(); setMode('signin'); }}
                className="absolute top-0 right-0 p-2 text-zinc-500 hover:text-white transition flex items-center gap-1 text-[10px] uppercase font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar Akun
              </button>
            </div>

            {/* Billing Info */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-3xl flex justify-between items-center">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-rose-500 font-bold uppercase tracking-widest">Detail Tagihan Aktif</span>
                <h4 className="text-base font-extrabold text-white uppercase">{activeUser.fullName}</h4>
                <p className="text-xs text-zinc-400">
                  Paket: <span className="text-zinc-200 font-bold">{(activeUser.packageId || '').toUpperCase()}</span> ({activeUser.isCustomByRfx ? 'Custom Full RFX' : 'Custom Mandiri'})
                </p>
                <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-900 inline-block">
                  Aturan Slug: undangankita.rfx.web.id/{activeUser.activeSlug}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Jumlah yang harus dibayar</span>
                <h2 className="text-3xl font-black text-rose-500 select-all">
                  Rp {currentBillAmount.toLocaleString('id-ID')}
                </h2>
                <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full inline-block font-mono tracking-wider mt-1.5 uppercase font-bold">
                  Menunggu Bukti Transfer
                </span>
              </div>
            </div>

            {/* Method Selectors */}
            {transactionStatus !== 'pending' && (
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase font-mono block">Pilih Metode Transaksi</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-4 rounded-2xl border transition duration-250 cursor-pointer flex flex-col justify-between items-center text-center gap-1.5 ${selectedMethod === 'qris' ? 'bg-zinc-900/90 border-rose-500/60 shadow-md' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <QrCode className="w-5 h-5 text-rose-500" />
                  <span className="text-xs font-extrabold text-white uppercase">QRIS GoPay</span>
                  <span className="text-[9px] font-mono text-zinc-500">Scan Instan</span>
                </div>

                <div 
                  onClick={() => setSelectedMethod('shopeepay')}
                  className={`p-4 rounded-2xl border transition duration-250 cursor-pointer flex flex-col justify-between items-center text-center gap-1.5 ${selectedMethod === 'shopeepay' ? 'bg-zinc-900/90 border-rose-500/60 shadow-md' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <Building className="w-5 h-5 text-orange-500" />
                  <span className="text-xs font-extrabold text-white uppercase">ShopeePay</span>
                  <span className="text-[9px] font-mono text-zinc-500">Transfer Saldo</span>
                </div>

                <div 
                  onClick={() => setSelectedMethod('mandiri')}
                  className={`p-4 rounded-2xl border transition duration-250 cursor-pointer flex flex-col justify-between items-center text-center gap-1.5 ${selectedMethod === 'mandiri' ? 'bg-zinc-900/90 border-rose-500/60 shadow-md' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <Building className="w-5 h-5 text-sky-505" />
                  <span className="text-xs font-extrabold text-white uppercase">Bank Mandiri</span>
                  <span className="text-[9px] font-mono text-zinc-500">Transfer no.rek</span>
                </div>

                <div 
                  onClick={() => setSelectedMethod('seabank')}
                  className={`p-4 rounded-2xl border transition duration-250 cursor-pointer flex flex-col justify-between items-center text-center gap-1.5 ${selectedMethod === 'seabank' ? 'bg-zinc-900/90 border-rose-500/60 shadow-md' : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800'}`}
                >
                  <Building className="w-5 h-5 text-yellow-502" />
                  <span className="text-xs font-extrabold text-white uppercase">SeaBank</span>
                  <span className="text-[9px] font-mono text-zinc-500">Transfer no.rek</span>
                </div>
              </div>
            </div>
            )}

            {/* Payment Details + Upload container */}
            {selectedMethod && transactionStatus !== 'pending' && (
              <div className="bg-zinc-950/90 border border-zinc-900 p-6 rounded-3xl space-y-6 animate-fadeIn">
                
                {/* Method instructions */}
                {selectedMethod === 'qris' ? (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <span className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-widest">QRIS Merchant Resmi</span>
                    
                    {/* QR Code Container styled big, elegant and center */}
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-zinc-800 inline-block relative overflow-hidden">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1053TSiJi-dnopA528U8JWjlG8c7CNH2m" 
                        alt="QRIS RFX.visual" 
                        className="w-56 h-56 object-contain"
                      />
                      <div className="absolute inset-x-0 bottom-1 text-center bg-zinc-900 text-white font-mono text-[8px] tracking-wider py-0.5">
                        RFX.VISUAL BRAND PAYMENTS
                      </div>
                    </div>

                    <div className="space-y-1 max-w-sm">
                      <h5 className="text-xs font-extrabold text-white uppercase">QRIS DUKUNG SELURUH E-WALLET & BANK</h5>
                      <p className="text-[10px] text-zinc-400">
                        Pindai kode QR di atas menggunakan GoPay, OVO, Dana, ShopeePay, LinkAja, atau aplikasi m-Banking kesayangan Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-zinc-900/20 p-5 border border-zinc-900 rounded-3xl">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Metode Tujuan Transfer</span>
                      <h4 className="text-base font-black text-white uppercase">
                        {selectedMethod === 'mandiri' ? 'BANK MANDIRI' : selectedMethod === 'seabank' ? 'SEABANK' : 'SHOPEEPAY'}
                      </h4>
                      <div className="font-mono text-zinc-300 text-xs bg-zinc-950 p-3 rounded-2xl border border-zinc-900 relative">
                        <span className="block font-bold text-rose-500 text-[10px] uppercase mb-0.5">Nomor Tujuan Resmi</span>
                        {selectedMethod === 'mandiri' ? '1440029346159' : selectedMethod === 'seabank' ? '901410104102' : '085731021469'}
                        <button
                          onClick={() => triggerCopy(selectedMethod === 'mandiri' ? '1440029346159' : selectedMethod === 'seabank' ? '901410104102' : '085731021469', 'rek')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                        >
                          {copiedText === 'rek' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        Atas Nama Penerima: <span className="text-white font-bold">MUHAMMAD RIDHO FEBRIYANSYAH</span>
                      </p>
                    </div>

                    <div className="text-[11px] text-zinc-400 leading-relaxed space-y-2 border-t sm:border-t-0 sm:border-l border-zinc-900 pt-4 sm:pt-0 sm:pl-5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Panduan Transfer</span>
                      <p>
                        1. Pastikan Anda mentransfer tepat sejumlah <span className="text-white font-mono font-bold">Rp {currentBillAmount.toLocaleString('id-ID')}</span>.
                      </p>
                      <p>
                        2. Simpan struk digital atau struk kertas cetak, lalu unggah gambarnya pada dropzone di bawah ini untuk dianalisis oleh AI.
                      </p>
                    </div>
                  </div>
                )}

                {/* Panduan Verifikasi Manual */}
                <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-2xl flex items-start gap-3">
                  <div className="bg-amber-950 p-2 rounded-xl border border-amber-900/50 mt-0.5 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white uppercase tracking-wide">Penting: Panduan Verifikasi Admin</h5>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      Bukti transfer Anda akan ditinjau secara manual oleh Admin. Setelah Anda mengunggah gambar bukti transfer, status akun Anda akan langsung masuk ke antrean pengecekan. Mohon tunggu konfirmasi admin atau hubungi Admin via WhatsApp.
                    </p>
                  </div>
                </div>

                {/* Dropzone Upload */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-500 tracking-wider uppercase font-mono block">Unggah Bukti Transaksi Anda</label>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-900/10 hover:bg-rose-950/5 p-8 rounded-3xl text-center transition duration-300 relative cursor-pointer"
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-[#070708] border border-zinc-800 text-zinc-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold text-white">Letakkan Berkas Bukti Transfer atau Klik disini</h4>
                        <p className="text-[10px] text-zinc-500">Mendukung JPEG, PNG, WEBP (Maks 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Status Indicator Scanning */}
                {isUploading && (
                  <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center text-center space-y-3.5 animate-pulse">
                    <Upload className="w-6 h-6 text-rose-550 animate-bounce" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Mengunggah Bukti Pembayaran...</h4>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        Mohon tunggu sebentar, file sedang diunggah ke server...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending State Rendering */}
            {transactionStatus === 'pending' && (
              <div className="p-5 rounded-3xl border bg-amber-950/15 border-amber-500/30 text-amber-400 animate-fadeIn space-y-4">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Menunggu Konfirmasi Admin
                    </h4>
                    <p className="text-[10px] text-zinc-400">Bukti transfer diproses untuk review admin</p>
                  </div>
                </div>

                <div className="pt-2 text-[10.5px] text-zinc-300 leading-relaxed">
                  <span className="block font-bold text-zinc-400 font-mono text-[9px] uppercase tracking-wider mb-1">Status Laporan:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Bukti pembayaran telah berhasil diterima oleh sistem.</li>
                    <li>Transaksi masuk ke antrean pengecekan admin.</li>
                    <li>Mohon tunggu atau hubungi admin via WhatsApp jika butuh bantuan cepat.</li>
                  </ul>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-550 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Cek Status Terbaru</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Analysis Result Prompts */}
                {aiAnalysisResult && (
                  <div className={`p-5 rounded-3xl border ${scanSuccess === true ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-400' : scanSuccess === 'pending' ? 'bg-amber-950/15 border-amber-500/30 text-amber-400' : 'bg-red-950/15 border-red-500/30 text-red-400'} animate-fadeIn space-y-4`}>
                    <div className="flex items-center gap-2.5">
                      {scanSuccess === true ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : scanSuccess === 'pending' ? (
                        <Clock className="w-5 h-5 text-amber-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">
                          {scanSuccess === true ? 'Transaksi Lolos Verifikasi AI' : scanSuccess === 'pending' ? 'Menunggu Konfirmasi Admin' : 'Transaksi Anda Terbukti Gagal!'}
                        </h4>
                        <p className="text-[10px] text-zinc-400">Bukti transfer diproses untuk review admin</p>
                      </div>
                    </div>

                    {scanSuccess !== 'pending' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-900 font-mono text-[10.5px]">
                        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
                          <span className="block text-[8.5px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Tanggal Terbaca</span>
                          <span className="text-zinc-300">{aiAnalysisResult.timestampDetected || 'Tidak terbaca'}</span>
                        </div>
                        
                        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
                          <span className="block text-[8.5px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Penerima Terbaca</span>
                          <span className="text-zinc-300">{aiAnalysisResult.recipientAccount || 'Tidak terbaca'}</span>
                        </div>

                        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
                          <span className="block text-[8.5px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Nominal Terbaca</span>
                          <span className="text-rose-500 font-bold">
                            {aiAnalysisResult.nominalDetected ? `Rp ${aiAnalysisResult.nominalDetected.toLocaleString('id-ID')}` : 'Tidak terbaca'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 text-[10.5px] text-zinc-300 leading-relaxed">
                      <span className="block font-bold text-zinc-400 font-mono text-[9px] uppercase tracking-wider mb-1">Status Laporan:</span>
                      <ul className="list-disc pl-4 space-y-1">
                        {aiAnalysisResult.reasons?.map((res: string, idx: number) => (
                          <li key={idx}>{res}</li>
                        ))}
                      </ul>
                    </div>

                    {scanSuccess === true ? (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => onLoginSuccess(activeUser)}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <span>Masuki Dashboard SaaS</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : scanSuccess === 'pending' ? (
                      <div className="text-center pt-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-550 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <span>Cek Status Sekarang</span>
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center pt-2">
                        <p className="text-[10px] text-zinc-500">Merespon analisis gagal. Silakan lakukan transfer yang benar lalu unggah bukti transfer yang sah.</p>
                      </div>
                    )}
                  </div>
                )}
          </div>
        )}

        {/* ==================== PORTAL ADMIN VIEW ==================== */}
        {mode === 'admin' && (
          <div className="w-full max-w-5xl card-glass-strong p-8 rounded-[38px] animate-slideUp space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-default)]">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.35em] font-bold uppercase text-[var(--color-primary)] font-mono">PANEL ADMINISTRASI UNDANGANKITA</span>
                <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] uppercase tracking-tight">Inspeksi Keuangan SaaS</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-3.5 py-1 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-light)] text-[var(--text-secondary)] font-mono text-xs">
                  Total Users: <span className="text-[var(--text-primary)] font-bold">{usersList.length}</span>
                </span>
                <span className="px-3.5 py-1 rounded-full bg-[var(--bg-surface-alt)] border border-[var(--border-light)] text-[var(--text-secondary)] font-mono text-xs">
                  Transaksi: <span className="text-[var(--color-secondary)] font-bold">{transactions.length}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Registered Users list */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase font-mono">Daftar Pengguna SaaS</h3>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {usersList.length === 0 ? (
                    <div className="p-6 border border-[var(--border-light)] rounded-3xl text-center text-xs text-[var(--text-muted)] font-mono">
                      Belum ada pengguna terdaftar
                    </div>
                  ) : (
                    usersList.map((usr) => {
                      const amount = PRICES[usr.packageId][usr.isCustomByRfx ? 'rfx' : 'mandiri'];
                      return (
                        <div 
                          key={usr.id}
                          className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-default)] space-y-3 relative group"
                        >
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--color-danger-light)] text-[var(--text-faint)] hover:text-[var(--color-danger)] opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">{usr.fullName}</h4>
                            <p className="text-[10.5px] text-[var(--text-secondary)] font-mono">{usr.email}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">WA: {usr.noWa}</p>
                          </div>

                          <div className="pt-2 border-t border-[var(--border-light)] flex justify-between items-center text-[10.5px]">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] font-mono text-[9px] font-bold">
                                {(usr.packageId || '').toUpperCase()}
                              </span>
                              <span className="text-[9.5px] font-mono text-[var(--color-primary)] ml-1.5 font-bold">
                                Rp {amount.toLocaleString('id-ID')}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono ${
                              usr.paymentStatus === 'success' 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                : usr.paymentStatus === 'pending'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}>
                              {usr.paymentStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Transaction Reports and AI verify log */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider uppercase font-mono">Bukti Analisis Transfer AI</h3>
                  <span className="text-[9.5px] text-[var(--text-faint)] font-mono">Detail Laporan Analisis Admin</span>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {transactions.length === 0 ? (
                    <div className="p-8 border border-[var(--border-light)] rounded-3xl text-center text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-surface-alt)]">
                      Belum ada transaksi bukti pembayaran masuk yang tercatat
                    </div>
                  ) : (
                    transactions.map((tx) => {
                      return (
                        <div 
                          key={tx.id}
                          className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-default)] space-y-4"
                        >
                          {/* Header info */}
                          <div className="flex justify-between sm:flex-row flex-col gap-2 items-start pb-3 border-b border-[var(--border-light)]">
                            <div>
                              <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-tight">{tx.userName}</h4>
                              <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">Email: {tx.userEmail} | Slug: {tx.userSlug}</p>
                              <p className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">Tagihan: Rp {tx.nominalExpected.toLocaleString('id-ID')} | {(tx.packageId || '').toUpperCase()}</p>
                            </div>
                            <div className="text-right sm:text-right text-left">
                              <span className="bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] px-2.5 py-1 rounded font-mono text-[9px] border border-[var(--border-light)]">
                                {tx.timestamp}
                              </span>
                              <div className="mt-2.5">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase ${
                                  tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                }`}>
                                  AI STATUS: {tx.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Image and Analysis panel split layout */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left: physical receipt thumbnail */}
                            <div className="md:col-span-5 bg-[var(--bg-surface-alt)] p-2 rounded-2xl border border-[var(--border-light)] flex flex-col justify-between">
                              <img 
                                src={tx.proofImage} 
                                alt="Receipt" 
                                className="w-full h-44 object-contain bg-white rounded-xl"
                              />
                              <div className="pt-2 text-center">
                                <a 
                                  href={tx.proofImage} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--color-primary)] underline font-mono flex items-center justify-center gap-1 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Buka Gambar Asli</span>
                                </a>
                              </div>
                            </div>

                            {/* Right: AI details checklist */}
                            <div className="md:col-span-7 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-default)] text-[11px] leading-relaxed space-y-3 font-mono">
                              <span className="block text-[8.5px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mb-1">Inspektur Pembaca AI:</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px] bg-[var(--bg-surface)] p-2.5 border border-[var(--border-light)] rounded-xl">
                                <div>
                                  <span className="text-[var(--text-faint)] block text-[8px] uppercase font-bold">Akun Penerima</span>
                                  <span className="text-[var(--text-primary)] font-bold">{tx.aiResult?.recipientAccount || 'Tidak terdeteksi'}</span>
                                </div>
                                <div>
                                  <span className="text-[var(--text-faint)] block text-[8px] uppercase font-bold">Nominal Transfer</span>
                                  <span className="text-[var(--text-primary)] font-bold">
                                    {tx.aiResult?.nominalDetected ? `Rp ${tx.aiResult.nominalDetected.toLocaleString('id-ID')}` : 'Tidak terdeteksi'}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <span className="block text-[var(--text-faint)] text-[8px] uppercase font-bold">Alasan & Rekomendasi:</span>
                                <ul className="list-disc pl-3.5 space-y-1 text-[var(--text-secondary)] text-[10px]">
                                  {tx.aiResult?.reasons?.map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-light)]">
                                <span className="text-[9px] text-[var(--text-muted)]">Keaslian: {tx.aiResult?.isAuthentic !== false ? 'Asli (Lolos)' : 'Palsu (Gagal)'}</span>
                                
                                <button
                                  onClick={() => setPrintingReport(tx)}
                                  className="btn-ghost px-2.5 py-1.5 text-[10px]"
                                  title="Cetak Laporan PDF"
                                >
                                  <Printer className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                                  <span>Cetak PDF</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Hooks: override buttons */}
                          <div className="flex gap-2.5 pt-3 border-t border-[var(--border-light)] justify-end">
                            <span className="text-xs text-[var(--text-faint)] flex items-center mr-auto font-mono text-[9px] tracking-wide uppercase font-bold">Intervensi Manual:</span>
                            {tx.status !== 'success' && (
                              <button
                                onClick={() => handleApproveTransaction(tx.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-[10px] font-bold text-emerald-700 uppercase transition cursor-pointer"
                              >
                                Setujui Transaksi (Override)
                              </button>
                            )}
                            {tx.status !== 'failed' && (
                              <button
                                onClick={() => handleRejectTransaction(tx.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-[10px] font-bold text-red-700 uppercase transition cursor-pointer"
                              >
                                Tolak Transaksi (Override)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ==================== PRINT PDF REPORT EMBEDDED MODAL ==================== */}
      {printingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white text-zinc-900 p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative block" id="print-area">
            
            {/* Modal actions */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden z-20">
              <button
                onClick={() => window.print()}
                className="btn-primary p-2.5 text-xs shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Sekarang</span>
              </button>
              <button
                onClick={() => setPrintingReport(null)}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-none flex items-center gap-1.5 text-xs font-bold transition shadow-md cursor-pointer"
              >
                <span>Tutup</span>
              </button>
            </div>

            {/* Print Header */}
            <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-5">
              <div>
                <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--color-primary)] uppercase">UNDANGANKITA</h1>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-1">Platform Undangan Digital</p>
                <p className="text-xs text-zinc-600 mt-1">Taman Anggrek Residence, Jakarta Barat, 11470</p>
              </div>
              <div className="text-right">
                <span className="bg-[var(--color-primary)] text-white text-[9px] px-3 py-1 rounded-md font-mono font-bold tracking-wide uppercase">LAPORAN AUDIT KHUSUS</span>
                <p className="text-xs text-zinc-500 font-mono mt-1.5">No Referensi: tx-{printingReport.id}</p>
              </div>
            </div>

            {/* Audit Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-200 pb-1 flex items-center gap-1">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Rangkuman Akun Pengguna</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="text-zinc-550 py-1 font-mono">Nama Pengguna:</td>
                        <td className="font-extrabold text-zinc-900 py-1">{printingReport.userName}</td>
                      </tr>
                      <tr>
                        <td className="text-zinc-550 py-1 font-mono">ID Pengguna:</td>
                        <td className="font-bold text-zinc-500 py-1">{printingReport.userId}</td>
                      </tr>
                      <tr>
                        <td className="text-zinc-550 py-1 font-mono">Email:</td>
                        <td className="text-zinc-700 py-1">{printingReport.userEmail}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="text-zinc-550 py-1 font-mono">Paket Terpilih:</td>
                        <td className="font-extrabold text-zinc-900 py-1 uppercase">{printingReport.packageId}</td>
                      </tr>
                      <tr>
                        <td className="text-zinc-500 py-1 font-mono">Kustomisasi:</td>
                        <td className="font-bold text-zinc-700 py-1">{printingReport.isCustomByRfx ? 'Terima Beres' : 'Buat Sendiri'}</td>
                      </tr>
                      <tr>
                        <td className="text-zinc-550 py-1 font-mono">Tagihan Target:</td>
                        <td className="font-extrabold text-zinc-900 py-1">Rp {printingReport.nominalExpected.toLocaleString('id-ID')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI Scanning Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-200 pb-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-rose-600" />
                <span>Hasil Review Admin</span>
              </h3>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-zinc-100 p-3 rounded-2xl">
                  <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider mb-1">Tanggal Transaksi</span>
                  <span className="text-zinc-950 font-bold">{printingReport.aiResult?.timestampDetected || 'Tidak terbaca'}</span>
                </div>
                
                <div className="bg-zinc-100 p-3 rounded-2xl">
                  <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider mb-1">Penerima Transaksi</span>
                  <span className="text-zinc-950 font-bold">{printingReport.aiResult?.recipientAccount || 'Tidak terbaca'}</span>
                </div>

                <div className="bg-zinc-100 p-3 rounded-2xl">
                  <span className="block text-[8px] text-zinc-500 uppercase font-black tracking-wider mb-1">Nominal Terbaca</span>
                  <span className="text-rose-650 font-extrabold">
                    {printingReport.aiResult?.nominalDetected ? `Rp ${printingReport.aiResult.nominalDetected.toLocaleString('id-ID')}` : 'Tidak terbaca'}
                  </span>
                </div>
              </div>

              <div className="text-xs leading-relaxed space-y-1 bg-zinc-50 p-4 rounded-3xl border border-zinc-200">
                <span className="block font-bold text-zinc-900 uppercase font-mono text-[9px] mb-1">Pernyataan Validasi AI & Pemeriksaan:</span>
                <ul className="list-disc pl-4 space-y-1 text-zinc-700 text-[11px]">
                  {printingReport.aiResult?.reasons?.map((res, idx) => (
                    <li key={idx}>{res}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Physical Proof thumbnail built into report */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-200 pb-1">Lampiran Berkas Bukti Transfer</h3>
              <div className="bg-zinc-100 p-3 rounded-3xl text-center">
                <img 
                  src={printingReport.proofImage} 
                  alt="Bukti Transfer Fisik" 
                  className="w-full h-44 object-contain rounded-2xl bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Print Footer */}
            <div className="border-t border-zinc-300 pt-5 flex justify-between text-[10px] text-zinc-500 font-mono">
              <p>Laporan diterbitkan pada: {printingReport.timestamp}</p>
              <p>Metode Inspeksi: Manual Review Admin</p>
            </div>
          </div>
        </div>
      )}

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