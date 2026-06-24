'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PiHeartDuotone as Heart, 
  PiGearDuotone as Settings, 
  PiUsersDuotone as Users, 
  PiPulseDuotone as Activity, 
  PiEyeDuotone as Eye, 
  PiShareNetworkDuotone as Share2, 
  PiSparkleDuotone as Sparkles, 
  PiMagicWandDuotone as Wand2, 
  PiCopyDuotone as Copy, 
  PiCheckDuotone as Check, 
  PiChatCircleDuotone as MessageSquare,
  PiCaretRightDuotone as ChevronRight,
  PiArrowLeftDuotone as ArrowLeft,
  PiXCircleDuotone as XCircle,
  PiSignOutDuotone as LogOut,
  PiWarningCircleDuotone as AlertCircle,
  PiCheckCircleDuotone as CheckCircle,
  PiFileTextDuotone as FileText,
  PiUserDuotone as User,
  PiGlobeHemisphereWestDuotone as Globe,
  PiClockCounterClockwiseDuotone as History,
  PiFloppyDiskDuotone as Save,
  PiArrowCounterClockwiseDuotone as RotateCcw,
  PiTrashDuotone as Trash2
} from 'react-icons/pi';

import { 
  WeddingData, 
  Guest, 
  RSVP, 
  WeddingAnalytics, 
  ThemeConfig,
  SaaSUser
} from './types';

import {
  DEFAULT_THEMES, 
  DEFAULT_WEDDING_DATA,
  INITIAL_ANALYTICS 
} from './data/defaultData';

import ThemeSelector from './components/ThemeSelector';
import EditorPanel from './components/EditorPanel';
import GuestManager from './components/GuestManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import InvitationPreview from './components/InvitationPreview';
import AuthGate from './components/AuthGate';
import OnboardingTour from './components/OnboardingTour';
import Navigation from './components/Navigation';
import AnimatedEnvelope from './components/AnimatedEnvelope';
import LiveChat from './components/LiveChat';

import { useAuth } from './hooks/useAuth';
import { useWeddingData } from './hooks/useWeddingData';
import { BookOpen, Image as ImageIcon, Palette, Smartphone, AlertTriangle } from 'lucide-react';

export default function App() {
  // ============================================
  // HOOKS — Turso-backed state management
  // ============================================
  const auth = useAuth();
  const wedding = useWeddingData();

  // Query parameters parse for personalized invitation view
  const [isInvitationView, setIsInvitationView] = useState(false);
  const [isInvitationNotFound, setIsInvitationNotFound] = useState(false);
  const [urlGuest, setUrlGuest] = useState<Guest | undefined>(undefined);
  const [urlGuestName, setUrlGuestName] = useState<string | null>(null);

  // Publish configurations modal states
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [linkCopiedInPublishModal, setLinkCopiedInPublishModal] = useState(false);

  // SaaS Builder state controls
  const [isSelectingTheme, setIsSelectingTheme] = useState<boolean>(true);
  const [editorExpanded, setEditorExpanded] = useState<boolean>(true);
  const [isPreviewGuestMode, setIsPreviewGuestMode] = useState<boolean>(false);
  const [activeSegment, setActiveSegment] = useState<'design' | 'guests' | 'analytics'>('design');
  const [isCopiedMain, setIsCopiedMain] = useState(false);

  const [profileExpanded, setProfileExpanded] = useState<boolean>(true);
  const [customSnapshotName, setCustomSnapshotName] = useState<string>('');

  // Quick Share WhatsApp state controls
  const [selectedShareGuestId, setSelectedShareGuestId] = useState<string>('');
  const [selectedShareTemplateId, setSelectedShareTemplateId] = useState<string>('formal');
  const [customShareMessage, setCustomShareMessage] = useState<string>('');
  const [shareMessageCopied, setShareMessageCopied] = useState<boolean>(false);

  // Demo Expiration & Upgrade Logic
  const isDemoExpired = React.useMemo(() => {
    if (auth.currentUser?.packageId === 'demo' && auth.currentUser.registeredAt) {
      const parts = auth.currentUser.registeredAt.split('/');
      if (parts.length === 3) {
        // [DD, MM, YYYY] or [D, M, YYYY]
        const [dd, mm, yyyy] = parts;
        const regDate = new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 14;
      }
    }
    return false;
  }, [auth.currentUser]);

  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [upgradingTo, setUpgradingTo] = useState<'reguler' | 'medium' | 'premium' | null>(null);

  const handleUpgradeSubmit = async () => {
    if (!auth.currentUser || !upgradingTo) return;
    await auth.upgradePackage(auth.currentUser.id, upgradingTo);
    window.location.reload(); // Reload to hit AuthGate payment screen
  };

  // ============================================
  // Legacy SLUG-BASED ROUTING removed - handled by src/app/[slug]/page.tsx

  // ============================================
  // WHATSAPP MESSAGE GENERATOR
  // ============================================
  const generateFormattedMessage = (guestId: string, templateId: string) => {
    const guest = wedding.guests.find(g => g.id === guestId);
    if (!guest) return '';
    
    const groomName = wedding.weddingData?.couple?.groom?.nickname || 'Rian';
    const brideName = wedding.weddingData?.couple?.bride?.nickname || 'Salsa';
    const coupleString = `${groomName} & ${brideName}`;
    
    const slug = auth.currentUser?.activeSlug || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || 'https://undangankita.rfx.web.id';
    const personalizedLink = `${appUrl}/${slug}?to=${encodeURIComponent(guest.name)}&code=${guest.invitationCode}`;
    
    if (templateId === 'casual') {
      return `Halo *${guest.name}*,\n\nSemoga kabar baik selalu menyertaimu. Kami ingin berbagi kebahagiaan dan mengundangmu untuk hadir di acara pernikahan kami, *${coupleString}*.\n\nDetail info waktu, peta lokasi, dan RSVP digital bisa langsung diakses di tautan ini:\n${personalizedLink}\n\nKehadiranmu sangat berarti bagi kami. Terima kasih ya!`;
    } else if (templateId === 'short') {
      return `Halo *${guest.name}*, mohon doa restu dan kehadirannya di pernikahan *${coupleString}*. Detail undangan dan RSVP: ${personalizedLink}`;
    } else {
      return `Yth. Bapak/Ibu/Saudara/i *${guest.name}*,\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk menghadiri pernikahan kami, *${coupleString}*.\n\nSilakan buka tautan undangan digital di bawah ini untuk melihat detail acara, lokasi, serta mengisi konfirmasi kehadiran (RSVP):\n${personalizedLink}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih.`;
    }
  };

  // Auto-update message when share params change
  useEffect(() => {
    if (selectedShareGuestId) {
      const msg = generateFormattedMessage(selectedShareGuestId, selectedShareTemplateId);
      setCustomShareMessage(msg);
    } else if (wedding.guests && wedding.guests.length > 0) {
      setSelectedShareGuestId(wedding.guests[0].id);
    } else {
      setCustomShareMessage('');
    }
  }, [selectedShareGuestId, selectedShareTemplateId, wedding.guests, wedding.weddingData]);

  // Listener for ESC to toggle preview modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewGuestMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================
  // LOGIN SUCCESS HANDLER
  // ============================================
  const handleLoginSuccess = async (user: SaaSUser) => {
    auth.setCurrentUser(user);
    setLinkCopiedInPublishModal(false);
    
    // Load all user data from Turso
    await wedding.loadUserData(user);
  };

  // Auto-load data if user is already logged in (from localStorage caching)
  useEffect(() => {
    if (auth.currentUser && !wedding.invitation && !wedding.isLoading) {
      wedding.loadUserData(auth.currentUser);
    }
  }, [auth.currentUser, wedding.invitation]);

  // ============================================
  // DESIGN SNAPSHOT HANDLERS
  // ============================================
  const handleSaveDesignSnapshot = async (snapshotName: string) => {
    if (!snapshotName.trim()) {
      alert("Harap masukkan nama snapshot desain!");
      return;
    }
    try {
      await wedding.saveDesignSnapshot(snapshotName);
      alert(`Snapshot "${snapshotName}" berhasil disimpan!`);
    } catch (err) {
      // Error alert sudah ditangani di dalam useWeddingData.ts
    }
  };

  const handleRevertDesignSnapshot = (snapshot: any) => {
    const backupName = snapshot.note || `Desain ${snapshot.name}`;
    if (confirm(`Apakah Anda yakin ingin mengembalikan tata letak dan seluruh konfigurasi teks undangan ke silsilah checkpoint "${backupName}"?`)) {
      wedding.revertDesignSnapshot(snapshot);
      alert("Konfigurasi tema dan seluruh teks isi undangan berhasil dipulihkan!");
    }
  };

  const handleDeleteDesignSnapshot = async (snapshotId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus checkpoint riwayat desain ini dari daftar?")) {
      await wedding.deleteDesignSnapshot(snapshotId);
    }
  };

  // ============================================
  // GUEST OPERATIONS
  // ============================================
  const handleAddGuest = async (newGuestData: Omit<Guest, 'id' | 'invitationCode'>) => {
    await wedding.addGuest(newGuestData);
  };

  const handleRemoveGuest = async (id: string) => {
    await wedding.removeGuest(id);
  };

  // ============================================
  // RSVP OPERATIONS
  // ============================================
  const handleAddRSVP = async (newRSVP: RSVP) => {
    await wedding.addRSVP(newRSVP);
  };

  const handleDeleteRSVP = async (id: string) => {
    await wedding.deleteRSVP(id);
  };

  // ============================================
  // SIMULATION HELPERS
  // ============================================
  const simulatePageView = () => {
    const randomGuests = [
      'Anies Baswedan', 'Prabowo Subianto', 'Ganjar Pranowo', 'Megawati', 
      'Gibran Rakabuming', 'Ridwan Kamil', 'Sandiaga Uno', 'Erick Thohir'
    ];
    const visitor = randomGuests[Math.floor(Math.random() * randomGuests.length)];
    const devices = ['Mobile', 'Desktop', 'Tablet'];
    const dev = devices[Math.floor(Math.random() * devices.length)];
    const browsers = ['Chrome Mobile', 'Safari', 'Firefox', 'Opera Mini'];
    const brow = browsers[Math.floor(Math.random() * browsers.length)];

    wedding.setAnalytics(prev => ({
      ...prev,
      viewsCount: prev.viewsCount + 1,
      visitorLogs: [
        {
          id: `vlog-sim-${Date.now()}`,
          guestName: visitor,
          device: dev,
          browser: brow,
          timestamp: 'Baru Saja'
        },
        ...prev.visitorLogs
      ]
    }));
  };

  const simulateGuestRSVP = () => {
    const randomGuestNames = [
      'Najwa Shihab', 'Raffi Ahmad', 'Baim Wong', 'Deddy Corbuzier', 
      'Merry Riana', 'Raditya Dika', 'Vidi Aldiano', 'Cinta Laura'
    ];
    const statuses: ('Hadir' | 'Tidak Hadir' | 'Ragu-ragu')[] = ['Hadir', 'Hadir', 'Ragu-ragu', 'Tidak Hadir'];
    const name = randomGuestNames[Math.floor(Math.random() * randomGuestNames.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const wishesText = [
      'Semoga langgeng hingga akhir hayat! Doa terbaik dari saya.',
      'Sangat bahagia mendengar kabar ini! Semoga dimudahkan segala urusannya.',
      'Insya Allah diusahakan hadir ya. Selamat berbahagia!',
      'Maaf belum bisa hadir karena jadwal bentrok, namun rukun selalu ya!'
    ];
    const wish = wishesText[Math.floor(Math.random() * wishesText.length)];
    const limits = [1, 2, 3];
    const pax = status === 'Hadir' ? limits[Math.floor(Math.random() * limits.length)] : 0;

    handleAddRSVP({
      id: `rsvp-sim-${Date.now()}`,
      guestName: name,
      status,
      paxCount: pax,
      wishes: wish,
      timestamp: new Date().toISOString()
    });
  };

  // Main copy link helper
  const handleCopyMainShare = () => {
    const slug = auth.currentUser?.activeSlug || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || 'https://undangankita.rfx.web.id';
    const mainUrl = `${appUrl}/${slug}`;
    navigator.clipboard.writeText(mainUrl).then(() => {
      setIsCopiedMain(true);
      setTimeout(() => setIsCopiedMain(false), 2000);
    });
  };

  const isAdmin = auth.currentUser?.email === 'mhmmadridho64@gmail.com';

  // Switch from invitation view back to builder
  const handleBackToBuilder = () => {
    window.history.pushState({}, '', '/');
    setIsInvitationView(false);
    setIsSelectingTheme(true);
    setUrlGuest(undefined);
    setUrlGuestName(null);
  };

  // Shorthand references
  const activeSaaSUser = auth.currentUser;
  const weddingData = wedding.weddingData;
  const themeId = wedding.themeId;
  const guests = wedding.guests;
  const rsvps = wedding.rsvps;
  const analytics = wedding.analytics;
  const themeHistory = wedding.themeHistory;

  // ============================================
  // RENDER: INVITATION NOT FOUND
  // ============================================
  if (isInvitationNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
        <div className="max-w-md w-full bg-[#0a0a0e] rounded-3xl p-8 border border-zinc-800/50 flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <Globe className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Undangan Tidak Ditemukan</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Maaf, halaman undangan yang Anda cari tidak dapat ditemukan. Pastikan URL atau slug yang Anda masukkan sudah benar.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition text-sm"
          >
            Buat Undangan Sendiri
          </a>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: STANDALONE INVITATION FOR GUESTS
  // ============================================
  if (isInvitationView) {
    return (
      <div className="relative w-full h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
        {/* Floating Back to Builder (Hanya di mode preview builder, bukan di public slug) */}
        {window.location.pathname === '/' && (
          <div className="fixed top-4 left-4 z-50 flex gap-2">
            <button
              onClick={handleBackToBuilder}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-black/80 hover:bg-black/95 border border-zinc-800 text-white rounded-full text-xs font-semibold shadow-lg transition duration-300 cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-4 h-4 text-red-500" />
              Kembali ke SaaS Dashboard
            </button>
          </div>
        )}

        {/* Live Invitation Full View */}
        <div className="w-full h-full relative animate-fadeIn">
          <InvitationPreview 
            data={weddingData} 
            themeId={themeId} 
            onAddRSVP={handleAddRSVP}
            rsvps={rsvps}
            guest={urlGuest}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  if (wedding.isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4 animate-pulse">
          <div className="p-4 rounded-2xl bg-rose-955/40 text-rose-500 border border-rose-900/40 inline-flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.3)]">
            <AnimatedEnvelope size={32} color="#be123c" className="animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-mono uppercase tracking-widest">Memuat Data Undangan...</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">Menyiapkan aplikasi...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: AUTH GATE
  // ============================================
  const pName = window.location.pathname.toLowerCase();
  const isAdminRoute = pName === '/admin' || pName.endsWith('/admin') || window.location.hash.toLowerCase().includes('admin');

  if (!auth.currentUser || auth.currentUser.paymentStatus !== 'success' || isAdminRoute) {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  // ============================================
  // RENDER: UPGRADE / EXPIRED OVERLAY
  // ============================================
  if (isDemoExpired || showUpgradeModal) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--color-primary-light)] selection:text-[var(--color-primary-hover)]">
        <div className="absolute inset-0 ornament-dots opacity-[0.03] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-[var(--color-primary-light)] blur-[120px] pointer-events-none opacity-20" />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full animate-fadeIn">
          {isDemoExpired && !showUpgradeModal && (
            <div className="space-y-6 max-w-lg mx-auto card-glass p-10 rounded-[32px]">
              <div className="w-20 h-20 bg-[var(--color-danger-light)] border border-[var(--color-danger)]/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                <AlertCircle className="w-10 h-10 text-[var(--color-danger)]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)] uppercase tracking-tight">Masa Uji Coba Berakhir</h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-body-serif">
                Masa uji coba gratis 14 hari Anda telah berakhir. Untuk melanjutkan menggunakan layanan UndanganKita dan mendapatkan akses penuh tanpa batas, silakan upgrade ke paket berbayar.
              </p>
              <div className="pt-4 flex gap-4 justify-center">
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="btn-primary px-8 py-3.5 text-sm"
                >
                  Lihat Paket Tersedia
                </button>
              </div>
            </div>
          )}

          {showUpgradeModal && (
            <div className="w-full card-glass-strong rounded-[36px] p-8 animate-slideUp text-left relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] uppercase">Upgrade Paket Undangan Anda</h3>
                  <p className="text-sm text-[var(--text-secondary)] font-body-serif mt-1">Pilih paket layanan Premium untuk melanjutkan dan mendapatkan fitur eksklusif.</p>
                </div>
                {!isDemoExpired && (
                  <button onClick={() => setShowUpgradeModal(false)} className="text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors">
                    <XCircle className="w-7 h-7" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                {[
                  { id: 'reguler', name: 'Reguler', price: 30000, maxGuest: 'Maks. 1 Acara' },
                  { id: 'medium', name: 'Medium', price: 50000, maxGuest: 'Maks. 2 Acara' },
                  { id: 'premium', name: 'Premium', price: 100000, maxGuest: 'Maks. 4 Acara' }
                ].map(pkg => (
                  <div 
                    key={pkg.id}
                    onClick={() => setUpgradingTo(pkg.id as any)}
                    className={`card-interactive p-6 rounded-3xl flex flex-col justify-between h-full ${upgradingTo === pkg.id ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]' : ''}`}
                  >
                    <div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] uppercase">{pkg.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 font-body-serif">{pkg.maxGuest}</p>
                    </div>
                    <div className="pt-5 border-t border-[var(--border-light)] mt-6">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Biaya Paket</span>
                      <h5 className="text-2xl font-bold text-[var(--color-primary)] mt-1">Rp {pkg.price.toLocaleString('id-ID')}</h5>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 relative z-10">
                <button
                  onClick={() => { auth.logout(); window.location.href = '/'; }}
                  className="btn-ghost px-6 py-3 text-xs"
                >
                  Keluar Akun
                </button>
                <button
                  onClick={handleUpgradeSubmit}
                  disabled={!upgradingTo}
                  className="btn-primary px-8 py-3 text-xs disabled:opacity-50"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: THEME SELECTOR
  // ============================================
  if (isSelectingTheme) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--color-primary-light)] selection:text-[var(--color-primary-hover)] select-none overflow-x-hidden relative">
        <OnboardingTour />
        <div className="absolute inset-0 ornament-dots opacity-[0.04] pointer-events-none" />
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--color-primary-light)] blur-[150px] pointer-events-none opacity-40" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[var(--color-accent-lighter)] blur-[150px] pointer-events-none opacity-40" />

        {(auth.currentUser?.warningCount ?? 0) > 0 && (
          <div className="sticky top-0 z-[999] w-full bg-[var(--color-danger)] text-white px-4 py-3 flex items-center justify-center gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 animate-pulse" />
            <p className="text-[11px] font-bold font-sans tracking-wide">
              PERINGATAN AKUN ({auth.currentUser.warningCount}/3): Anda terdeteksi melanggar ketentuan layanan kami.
            </p>
          </div>
        )}

        {/* Elegant Navigation for Editor */}
        <Navigation isDashboard={true} />
        <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center z-10 w-full relative">
          <div className="text-center space-y-4 max-w-2xl mb-14 animate-fadeIn">
            <span className="text-[10px] font-semibold tracking-widest text-[var(--color-primary)] uppercase font-mono bg-[var(--color-primary-lighter)] px-3 py-1 rounded-full border border-[var(--color-primary-light)]">Koleksi Desain Premium</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)]">
              {auth.currentUser?.fullName ? `Pilih Tema Undangan Anda, ${auth.currentUser.fullName.split(' ')[0]}` : 'Pilih Tema Undangan Anda'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-body-serif max-w-xl mx-auto mt-2">
              Pilih dari koleksi tema elegan yang dirancang khusus untuk memukau tamu Anda. Setelah memilih, Anda dapat mengubah setiap detail di dalam editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full animate-slideUp" style={{ animationDelay: '100ms' }}>
            {DEFAULT_THEMES.map((theme) => {
              const isRecommended = theme.id === 'rfx-light' || theme.id === 'rfx-gold';
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    wedding.setThemeId(theme.id);
                    setIsSelectingTheme(false);
                  }}
                  className={`card-interactive p-0 flex flex-col justify-between h-[300px] transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-1 ${
                    isRecommended
                      ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)]'
                      : ''
                  }`}
                >
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      backgroundColor: theme.bgHex,
                      backgroundImage: `radial-gradient(${theme.primaryHex} 1.5px, transparent 0)`,
                      backgroundSize: '24px 24px',
                    }}
                  />

                  <div className="relative z-10 p-7 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-bold text-2xl text-[var(--text-primary)] tracking-tight uppercase">
                          {theme.name}
                        </h3>
                        <span className="inline-block text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mt-1">
                          {theme.pattern} design
                        </span>
                      </div>
                      {isRecommended && (
                        <span className="bg-[var(--color-primary)] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          Pilihan
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[var(--text-secondary)] mt-4 leading-relaxed font-body-serif">
                      Estetika visual dengan kombinasi font {theme.fontSerif === 'font-serif' ? 'Cormorant / Lora' : 'Great Vibes / Inter'} serta palet warna lembut {theme.primaryHex}.
                    </p>
                  </div>

                  <div className="relative z-10 p-5 border-t border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-surface-alt)] backdrop-blur-md">
                    <div className="flex gap-2">
                      <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.primaryHex }} title="Warna Utama" />
                      <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.bgHex }} title="Warna Latar" />
                      <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: theme.textHex }} title="Warna Teks" />
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors uppercase tracking-wider cursor-pointer">
                      PILIH TEMA <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // RENDER: WYSIWYG WORKSPACE (MAIN EDITOR)
  // ============================================
  return (
    <div className="relative min-h-screen font-sans bg-[#050505] text-white overflow-hidden selection:bg-red-500/30">
      
      {(auth.currentUser?.warningCount ?? 0) > 0 && !isPreviewGuestMode && (
        <div className="absolute top-0 left-0 right-0 z-[999] bg-red-600 border-b border-red-500 text-white px-4 py-3 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(220,38,38,0.5)]">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <p className="text-[11px] font-bold font-sans tracking-wide uppercase">
            PERINGATAN AKUN ({auth.currentUser.warningCount}/3): Anda terdeteksi melanggar ketentuan layanan kami.
          </p>
        </div>
      )}

      <OnboardingTour />
      {/* FULL SCREEN DYNAMIC INVITATION PREVIEW BACKGROUND */}
      <div className="w-full h-full overflow-y-auto">
        <InvitationPreview 
          data={weddingData} 
          themeId={themeId} 
          onAddRSVP={handleAddRSVP}
          rsvps={rsvps}
          guest={urlGuest}
        />
      </div>

      {/* FLOAT TOP-LEFT BRAND BANNER */}
      {!isPreviewGuestMode && (
        <div className="absolute top-4 left-4 z-40 bg-white/80 border border-[var(--border-default)] shadow-sm backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2.5 select-none text-[11px] font-mono leading-none font-bold">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
          <span className="text-[var(--text-muted)]">PANEL EDITING AKTIF</span>
          <span className="text-[var(--text-faint)]">|</span>
          <span className="text-[var(--text-primary)]">CO-SINKRONISASI</span>
          {wedding.isSaving && (
            <>
              <span className="text-[var(--text-faint)]">|</span>
              <span className="text-[var(--color-secondary)] animate-pulse">SAVING...</span>
            </>
          )}
        </div>
      )}

      {/* PREVIEW MODE FLOATING BAR */}
      {isPreviewGuestMode && (
        <div className="absolute top-4 right-4 z-[200] animate-fadeIn select-none">
          <button
            onClick={() => setIsPreviewGuestMode(false)}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full text-xs font-bold shadow-md transition-all cursor-pointer transform hover:scale-105"
          >
            <Eye className="w-4 h-4 animate-spin-slow animate-pulse" />
            <span>KELUAR DARI PREVIEW TAMU</span>
            <span className="bg-black/10 px-2 py-0.5 rounded-md text-[9px] font-mono font-medium">ESC</span>
          </button>
        </div>
      )}

      {/* FLOATING COLLAPSED GEM / TRIGGER BADGE */}
      {!isPreviewGuestMode && !editorExpanded && (
        <div className="absolute top-4 right-4 z-40 animate-bounce">
          <button
            onClick={() => setEditorExpanded(true)}
            className="p-4 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center cursor-pointer transform hover:scale-105 transition-all"
            title="Buka Panel Editor Visual"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
          </button>
        </div>
      )}

      {/* FLOATING GLASSMORPHIC EDITOR CONTROL PANEL */}
      {!isPreviewGuestMode && editorExpanded && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] glass-panel border-l border-[var(--border-light)] z-[100] flex flex-col overflow-hidden text-[var(--text-primary)] shadow-[-10px_0_35px_rgba(0,0,0,0.05)] animate-slideLeft">
          
          {/* EDITOR HEAD */}
          <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center select-none bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm flex items-center justify-center animate-pulse">
                <AnimatedEnvelope size={16} color="var(--color-primary)" />
              </span>
              <div>
                <h3 className="text-[11px] font-bold tracking-wide text-[var(--text-primary)] leading-none mb-1">Editor Undangan</h3>
                <p className="text-[10px] text-[var(--text-muted)] font-sans">SaaS Builder Workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSelectingTheme(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-[var(--bg-surface-alt)] border border-[var(--border-default)] rounded-lg text-[9.5px] font-bold font-mono text-[var(--text-secondary)] transition cursor-pointer"
                title="Ganti Tema Warna / Desain"
              >
                Ganti Desain
              </button>
              
              <button
                onClick={() => setEditorExpanded(false)}
                className="btn-ghost p-1.5 text-[10px] font-mono leading-none"
                title="Tampilkan Live Preview"
              >
                Live Preview
              </button>
            </div>
          </div>

          {/* TAB HEADER */}
          <div className="flex bg-[var(--bg-surface-alt)] p-1.5 border-b border-[var(--border-light)]">
            <button
              onClick={() => setActiveSegment('design')}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                activeSegment === 'design'
                  ? 'bg-white text-[var(--color-primary)] font-bold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]"><Wand2 className="w-3 h-3" /></div>
              Konten & Desain
            </button>
            <button
              onClick={() => setActiveSegment('guests')}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                activeSegment === 'guests'
                  ? 'bg-white text-[var(--color-primary)] font-bold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"><Users className="w-3 h-3" /></div>
              Buku Tamu
            </button>
            <button
              onClick={() => setActiveSegment('analytics')}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeSegment === 'analytics'
                  ? 'bg-white text-[var(--color-primary)] font-bold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]"><Activity className="w-3 h-3" /></div>
              Analitik
            </button>
          </div>

          {/* SCROLLING TAB VIEW */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-5 bg-white/40">
            {/* Quick action bar */}
            <div className="bg-white border border-[var(--border-default)] rounded-2xl p-4 flex justify-between items-center select-none flex-col xs:flex-row gap-3 shadow-sm">
              <div>
                <h4 className="text-[11px] font-bold text-[var(--text-primary)]">Simulasi Tamu</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-body-serif">Lihat hasil undangan tanpa panel ini.</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsPreviewGuestMode(true)}
                  className="btn-ghost px-3 py-1.5 text-[10px] font-bold border border-[var(--border-light)]"
                  title="Masuk ke mode simulasi penuh tanpa control panel"
                >
                  <Eye className="w-3 h-3 text-[var(--color-primary)]" /> Mode Tamu
                </button>
                <button
                  onClick={() => {
                    setPublishSuccess(false);
                    setShowPublishModal(true);
                  }}
                  className="btn-primary px-3.5 py-1.5 text-[10px] uppercase tracking-wider"
                >
                  <Sparkles className="w-3 h-3" />
                  Publish
                </button>
              </div>
            </div>

            {/* PROFIL PENGGUNA SAAS (CLIENT CARD) */}
            {activeSaaSUser && (
              <div className="bg-white border border-[var(--border-default)] rounded-2xl p-5 shadow-sm select-none transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] shadow-inner">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[var(--text-primary)] tracking-wide">{activeSaaSUser.fullName}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] font-sans mt-0.5">
                        Paket <span className="text-[var(--color-primary)] font-bold capitalize">{activeSaaSUser.packageId}</span> 
                        <span className="mx-1.5 opacity-50">•</span>
                        {activeSaaSUser.isCustomByRfx ? 'Terima Beres' : 'Buat Sendiri'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileExpanded(!profileExpanded)}
                    className="btn-ghost px-3 py-1.5 text-[10px]"
                  >
                    {profileExpanded ? 'Tutup Profil' : 'Lihat Detail'}
                  </button>
                </div>

                {profileExpanded && (
                  <div className="mt-4 pt-4 border-t border-[var(--border-light)] space-y-4 animate-slideDown">
                    
                    {/* Data Klien */}
                    <div className="grid grid-cols-2 gap-3 bg-[var(--bg-surface-alt)] border border-[var(--border-light)] p-3 rounded-xl">
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5 font-bold">Mempelai</span>
                        <p className="text-[11px] text-[var(--text-primary)] font-semibold">{activeSaaSUser.coupleGroom} & {activeSaaSUser.coupleBride}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5 font-bold">Tgl Daftar</span>
                        <p className="text-[11px] text-[var(--text-primary)] font-semibold">
                          {new Date(activeSaaSUser.registeredAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5 font-bold">Email</span>
                        <p className="text-[11px] text-[var(--text-primary)] font-semibold truncate" title={activeSaaSUser.email}>{activeSaaSUser.email}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest block mb-0.5 font-bold">Kontak WA</span>
                        <p className="text-[11px] text-[var(--text-primary)] font-semibold">{activeSaaSUser.noWa}</p>
                      </div>
                    </div>

                    {/* Tautan Live */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] block">Tautan Undangan Aktif:</span>
                      <div className="flex gap-2 items-center bg-[var(--bg-surface)] border border-[var(--border-light)] p-2.5 rounded-xl">
                        <Globe className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] break-all select-all flex-1">
                          undangankita.rfx.web.id/{activeSaaSUser.activeSlug}
                        </span>
                        <button
                          onClick={handleCopyMainShare}
                          className="px-2.5 py-1.5 bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-lighter)] border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          {isCopiedMain ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedMain ? 'Disalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* TAB-1: DESIGN & CONTENT */}
            {activeSegment === 'design' && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* DESIGN HISTORY & SNAPSHOTS */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-955/20 text-rose-500 rounded-xl border border-rose-900/30">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left">
                          Riwayat & Snapshot Desain Undangan
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5 text-left">
                          Cadangkan kondisi tata letak dan konfigurasi teks undangan Anda agar bisa dikembalikan kapan saja.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="text"
                        placeholder="Nama checkpoint baru..."
                        value={customSnapshotName}
                        onChange={(e) => setCustomSnapshotName(e.target.value)}
                        className="bg-zinc-900 text-white placeholder-zinc-650 border border-zinc-850 px-3 py-1.5 rounded-xl text-xs w-full sm:w-44 focus:outline-none focus:border-rose-900 tracking-tight transition"
                      />
                      <button
                        onClick={() => {
                          handleSaveDesignSnapshot(customSnapshotName);
                          setCustomSnapshotName('');
                        }}
                        className="px-3 py-1.5 bg-rose-900 hover:bg-rose-850 border border-rose-850 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0"
                        title="Simpan konfigurasi desain saat ini sebagai snapshot manual."
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>

                  {themeHistory && themeHistory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1 pb-1 scrollbar-thin">
                      {themeHistory.map((item: any, idx: number) => {
                        const isCustom = item.note?.startsWith('Snapshot Kustom:');
                        const displayName = isCustom ? item.note?.replace('Snapshot Kustom: ', '') : item.note || 'Desain Auto-save';
                        const groomNick = item.weddingData?.couple?.groom?.nickname;
                        const brideNick = item.weddingData?.couple?.bride?.nickname;
                        const coupleLabel = groomNick && brideNick ? `${groomNick} & ${brideNick}` : null;
                        
                        return (
                          <div 
                            key={item.id || idx} 
                            className={`flex flex-col justify-between bg-zinc-900/40 border p-3 rounded-2xl hover:bg-zinc-900/65 hover:border-zinc-800 transition ${
                              isCustom ? 'border-zinc-850/70' : 'border-zinc-900/60'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[11px] font-extrabold text-zinc-150 leading-tight block text-left">
                                  {displayName}
                                </span>
                                <span className={`text-[8.5px] font-mono uppercase font-black px-1.5 py-0.5 rounded shrink-0 border ${
                                  isCustom 
                                    ? 'bg-rose-955/20 text-rose-450 border-rose-900/30' 
                                    : 'bg-zinc-950/60 text-zinc-450 border-zinc-900'
                                }`}>
                                  {isCustom ? 'Manual' : 'Auto'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-zinc-500 font-mono">
                                <span>Style: <strong className="text-zinc-400 font-sans">{item.name}</strong></span>
                                <span>•</span>
                                <span>{item.editedAt}</span>
                              </div>

                              {item.weddingData && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-zinc-900/50 mt-1">
                                  {coupleLabel && (
                                    <span className="text-[9px] bg-indigo-950/30 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/20 font-medium">
                                      <Users className="w-3 h-3 inline mr-1" /> {coupleLabel}
                                    </span>
                                  )}
                                  {item.weddingData.loveStories && (
                                    <span className="text-[9px] bg-emerald-900/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/20 font-mono">
                                      <BookOpen className="w-3 h-3 inline mr-1" /> {item.weddingData.loveStories.length} Cerita
                                    </span>
                                  )}
                                  {item.weddingData.bgImageUrl && (
                                    <span className="text-[9px] bg-amber-900/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/20 font-mono">
                                      <ImageIcon className="w-3 h-3 inline mr-1" /> Image BG
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-zinc-900/50">
                              <button
                                onClick={() => handleRevertDesignSnapshot(item)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-750 text-zinc-200 hover:text-white text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                                title="Kembalikan layout & seluruh konten undangan ke versi ini."
                              >
                                <RotateCcw className="w-3 h-3 text-rose-500" />
                                <span>Revert</span>
                              </button>
                              
                              <button
                                onClick={() => handleDeleteDesignSnapshot(item.id)}
                                className="p-1 px-1.5 bg-zinc-950/40 hover:bg-red-955/20 border border-zinc-900 hover:border-red-900/20 text-zinc-550 hover:text-red-450 rounded-lg cursor-pointer transition"
                                title="Hapus checkpoint ini"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-zinc-900/25 border border-dashed border-zinc-905 p-6 rounded-2xl text-center">
                      <p className="text-xs text-zinc-500 italic text-left sm:text-center">Belum ada riwayat atau snapshot tersimpan.</p>
                      <p className="text-[10px] text-zinc-650 mt-1 text-left sm:text-center font-mono">Snapshot akan direkam otomatis sewaktu Anda berganti layout, atau buat snapshot secara manual di atas.</p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4" /> TATA LETAK UNDANGAN AKTIF:
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Undangan Anda saat ini menggunakan layout gaya <strong>{DEFAULT_THEMES.find(t => t.id === themeId)?.name || 'Default theme'}</strong>. Semua modifikasi teks di bawah ini akan tersinkronisasi instan ke seluruh bagian undangan.
                  </p>
                </div>
                
                <div className="text-slate-800">
                  <EditorPanel data={weddingData} onChange={wedding.setWeddingData} />
                </div>
              </div>
            )}

            {/* TAB-2: GUEST MANAGER */}
            {activeSegment === 'guests' && (
              <div className="p-4 sm:p-5 lg:p-6 animate-fadeIn">
                <div className="text-slate-800">
                  <GuestManager 
                    guests={guests}
                    appUrl={process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_APP_URL || 'https://undangankita.rfx.web.id'}
                    slug={activeSaaSUser.activeSlug}
                    coupleNames={`${weddingData?.couple?.groom?.nickname || 'Groom'} & ${weddingData?.couple?.bride?.nickname || 'Bride'}`}
                    onAddGuest={handleAddGuest}
                    onRemoveGuest={handleRemoveGuest}
                    onUpdateGuestStatus={wedding.updateGuestStatus}
                  />
                </div>
              </div>
            )}

            {/* TAB-3: ANALYTICS */}
            {activeSegment === 'analytics' && (
              <div className="p-4 sm:p-5 lg:p-6 animate-fadeIn">
                <div className="text-slate-800">
                  {isAdmin && (
                    <AnalyticsDashboard 
                      analytics={analytics} 
                      rsvps={rsvps}
                      onDeleteRSVP={handleDeleteRSVP}
                      onSimulateGuestRSVP={simulateGuestRSVP}
                      onSimulatePageView={simulatePageView}
                    />
                  )}
                  {!isAdmin && (
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-500">
                      <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">Statistik Riil sedang berjalan...</p>
                      <p className="text-xs">Data kunjungan dan RSVPs akan otomatis tampil di sini ketika undangan Anda disebar ke publik.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-3 border-t border-zinc-900 bg-black/60 text-center select-none text-[10px] font-mono text-zinc-650 flex justify-between items-center px-4">
            <span>Version 1.0.0 - by RFX VISUAL</span>
            <span className="text-red-500 font-extrabold shadow-[0_0_10px_rgba(220,38,38,0.25)]">RFX.VISUAL WEDDING SUITE</span>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {showPublishModal && activeSaaSUser && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[300] animate-fadeIn text-zinc-105 overflow-y-auto">
          <div className="bg-[#0c0c0e] border border-zinc-900 p-6 md:p-8 rounded-[32px] w-full max-w-4xl space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setLinkCopiedInPublishModal(false);
                setShowPublishModal(false);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold bg-transparent border-none cursor-pointer text-xs"
            >
              Tutup
            </button>

            <div className="text-center space-y-2">
              <span className="p-3 rounded-2xl bg-rose-950/40 text-rose-500 border border-rose-900/40 inline-flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.25)]">
                <Heart className="w-5 h-5 fill-rose-800 animate-pulse" />
              </span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight">Cek, Publish & Share Tautan Undangan</h3>
              <p className="text-xs text-zinc-400">
                Lakukan rilis template {DEFAULT_THEMES.find(t => t.id === themeId)?.name} Anda sekaligus bagikan pesan personal ke tamu kesayangan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-zinc-900/50 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <div className="border-b border-zinc-900 pb-2 flex justify-between items-center text-[10px] font-mono text-zinc-350 uppercase tracking-widest font-bold">
                    <span>Rincian Akun & Kuota SaaS</span>
                    <span className="text-rose-500">Active License</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-mono">Nama Pengguna:</span>
                      <span className="font-bold text-white uppercase">{activeSaaSUser.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-mono">Platform Tautan:</span>
                      <span className="font-bold text-rose-550 font-mono">undangankita.rfx.web.id/{activeSaaSUser.activeSlug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-mono">Paket SaaS:</span>
                      <span className="font-extrabold text-white uppercase bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-[10px]">
                        {(activeSaaSUser.packageId || '').toUpperCase() || 'ADMIN'} ({activeSaaSUser.isCustomByRfx ? 'Custom Full RFX' : 'Custom Mandiri'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Copy Link */}
                {!publishSuccess && (
                  <div className="bg-rose-955/20 border border-rose-900/40 p-4.5 rounded-2xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-black text-rose-450 uppercase tracking-wide">Langkah Wajib: Salin Tautan Rilis</h4>
                        <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-0.5">
                          Demi kelancaran sharing digital, Anda wajib menyalin tautan resmi di bawah ini terlebih dahulu agar tombol Publish dapat terbuka.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center bg-[#070709] p-2 rounded-xl border border-zinc-850">
                      <span className="font-mono text-[11px] text-zinc-300 break-all select-all flex-1 px-1">
                        https://undangankita.rfx.web.id/{activeSaaSUser.activeSlug}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://undangankita.rfx.web.id/${activeSaaSUser.activeSlug}`);
                          setLinkCopiedInPublishModal(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition ${
                          linkCopiedInPublishModal
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900'
                            : 'bg-rose-600 hover:bg-rose-550 text-white border border-rose-550 shadow-md'
                        }`}
                      >
                        {linkCopiedInPublishModal ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Selesai Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Tautan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {publishSuccess && (
                  <div className="bg-emerald-955/15 border border-emerald-500/30 text-emerald-550 p-4.5 rounded-2xl text-center space-y-2 animate-fadeIn">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-450">Sukses Dipublikasikan!</h4>
                    <p className="text-[11px] text-zinc-400">
                      Tautan share digital Anda telah sukses ter-publish secara aktif di server RFX Visual.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      setLinkCopiedInPublishModal(false);
                      setShowPublishModal(false);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 rounded-2xl py-3 text-xs uppercase font-bold cursor-pointer"
                  >
                    Kembali
                  </button>

                  {!publishSuccess && (
                    <button
                      onClick={async () => {
                        if (!linkCopiedInPublishModal) {
                          alert("Harap salin tautan rilis Anda terlebih dahulu!");
                          return;
                        }
                        setIsPublishing(true);
                        await wedding.publishInvitation();
                        setTimeout(() => {
                          setIsPublishing(false);
                          setPublishSuccess(true);
                        }, 1500);
                      }}
                      disabled={isPublishing || !linkCopiedInPublishModal}
                      className={`flex-1 rounded-2xl py-3 text-xs uppercase font-black transition duration-300 flex items-center justify-center gap-1 cursor-pointer ${
                        isPublishing || !linkCopiedInPublishModal
                          ? 'bg-zinc-800 text-zinc-600 border border-zinc-850 cursor-not-allowed opacity-50'
                          : 'bg-rose-600 text-white hover:bg-rose-550 shadow-md shadow-rose-950/10'
                      }`}
                    >
                      {isPublishing ? (
                        <span>Memproses...</span>
                      ) : (
                        <>
                          <span>Ya, Publish!</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: WhatsApp Share */}
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl space-y-4 flex flex-col justify-between h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-900">
                    <div className="p-2 bg-rose-955/20 text-rose-500 rounded-xl border border-rose-900/30">
                      <MessageSquare className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider block">
                        Quick Share WhatsApp Generator
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Pilih nama tamu untuk mengirim draft pesan personal & link autentik ke WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Pilih Penerima (Tamu)</label>
                    {guests && guests.length > 0 ? (
                      <select
                        value={selectedShareGuestId}
                        onChange={(e) => setSelectedShareGuestId(e.target.value)}
                        className="w-full bg-zinc-900 text-white border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-950/40 font-sans cursor-pointer"
                      >
                        {guests.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.group}) — {g.phoneNumber}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-amber-500 bg-amber-955/10 border border-amber-900/20 p-2.5 rounded-xl font-mono text-left flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        Belum ada tamu. Silakan tambahkan nama tamu undangan di tab "Daftar Tamu" terlebih dahulu.
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Pilihlah Gaya Bahasa Template</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['formal', 'casual', 'short'].map((tId) => (
                        <button
                          key={tId}
                          type="button"
                          onClick={() => setSelectedShareTemplateId(tId)}
                          className={`py-1.5 text-[10.5px] rounded-xl font-bold uppercase transition scale-hover border text-center cursor-pointer ${
                            selectedShareTemplateId === tId
                              ? 'bg-rose-900 text-white border-rose-850 shadow-md shadow-rose-950/20'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-850 hover:bg-zinc-850'
                          }`}
                        >
                          {tId === 'formal' ? 'Formal' : tId === 'casual' ? 'Kasual' : 'Ringkas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Ubah & Sesuaikan Isi Pesan</label>
                    <textarea
                      value={customShareMessage}
                      onChange={(e) => setCustomShareMessage(e.target.value)}
                      rows={5}
                      placeholder="Draf pesan teks undangan otomatis..."
                      className="w-full bg-zinc-900 text-white text-[11px] border border-zinc-850 p-3 rounded-xl focus:outline-none focus:border-rose-900 font-sans leading-relaxed resize-none scrollbar-thin shadow-inner"
                    />
                  </div>
                </div>

                {selectedShareGuestId && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-900/60">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(customShareMessage);
                        setShareMessageCopied(true);
                        wedding.updateGuestStatus(selectedShareGuestId, 'Sent');
                        setTimeout(() => setShareMessageCopied(false), 2000);
                      }}
                      className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-805 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer text-zinc-200 hover:text-white transition animate-fadeIn"
                      title="Salin isi pesan ini ke clipboard komputer"
                    >
                      {shareMessageCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Teks Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Salin (Sent)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const guest = guests.find(g => g.id === selectedShareGuestId);
                        if (!guest) return;
                        const waUrl = `https://api.whatsapp.com/send?phone=${guest.phoneNumber}&text=${encodeURIComponent(customShareMessage)}`;
                        wedding.updateGuestStatus(guest.id, 'Opened');
                        window.open(waUrl, '_blank');
                      }}
                      className="py-2.5 px-4 bg-emerald-655 hover:bg-emerald-600 border border-emerald-655 rounded-xl text-xs font-black text-center text-white flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-emerald-950/20 shadow-md transition animate-fadeIn"
                      title="Kirim pesan langsung ke WhatsApp Web / App"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-white" />
                      <span>Kirim WA (Open)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CHAT WIDGET */}
      {!isPreviewGuestMode && !isInvitationView && auth.currentUser && (
        <LiveChat currentUser={auth.currentUser} />
      )}
    </div>
  );
}
