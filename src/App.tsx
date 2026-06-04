/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Settings, 
  Users, 
  Activity, 
  Eye, 
  Share2, 
  Sparkles, 
  Wand2, 
  Copy, 
  Check, 
  MessageSquare,
  ChevronRight,
  ArrowLeft,
  XCircle,
  LogOut,
  AlertCircle,
  CheckCircle,
  FileText,
  User,
  Globe,
  History,
  Save,
  RotateCcw,
  Trash2
} from 'lucide-react';

import { 
  WeddingData, 
  Guest, 
  RSVP, 
  WeddingAnalytics, 
  ThemeConfig,
  SaaSUser
} from './types';

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

import { useAuth } from './hooks/useAuth';
import { useWeddingData } from './hooks/useWeddingData';

export default function App() {
  // ============================================
  // HOOKS — Turso-backed state management
  // ============================================
  const auth = useAuth();
  const wedding = useWeddingData();

  // Query parameters parse for personalized invitation view
  const [isInvitationView, setIsInvitationView] = useState(false);
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

  // ============================================
  // SLUG-BASED ROUTING
  // ============================================
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const guestTo = params.get('to');
    const guestCode = params.get('code');

    // Check if this is a slug-based public invitation URL
    // Pattern: /slug-name or /slug-name?to=X&code=Y
    const pathSegments = path.split('/').filter(Boolean);

    if (pathSegments.length === 1 && pathSegments[0] !== 'admin') {
      const slug = pathSegments[0];

      // Load public invitation from Turso
      wedding.loadPublicInvitation(slug).then(found => {
        if (found) {
          setIsInvitationView(true);
          setIsSelectingTheme(false);

          if (guestTo) {
            setUrlGuestName(guestTo);
            // Try to match guest from loaded data
            const matched = wedding.guests.find(
              g => g.name.toLowerCase() === guestTo.toLowerCase() || g.invitationCode === guestCode
            );

            if (matched) {
              setUrlGuest(matched);
              wedding.updateGuestStatus(matched.id, 'Opened');
            } else {
              setUrlGuest({
                id: `tg-${Date.now()}`,
                name: guestTo,
                group: 'Tamu Berharga',
                paxLimit: 2,
                phoneNumber: '081234567890',
                status: 'Opened',
                invitationCode: guestCode || 'W-TEMP'
              });
            }

            // Log visitor
            wedding.addVisitorLog({
              guestName: guestTo,
              device: /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
              browser: navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'Safari / Webkit',
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
    } else if (guestTo && pathSegments.length === 0) {
      // Legacy: root URL with ?to= param (backward compat)
      setIsInvitationView(true);
      setIsSelectingTheme(false);
      setUrlGuestName(guestTo);

      const matched = wedding.guests.find(
        g => g.name.toLowerCase() === guestTo.toLowerCase() || g.invitationCode === guestCode
      );

      if (matched) {
        setUrlGuest(matched);
        wedding.updateGuestStatus(matched.id, 'Opened');
      } else {
        setUrlGuest({
          id: `tg-${Date.now()}`,
          name: guestTo,
          group: 'Tamu Berharga',
          paxLimit: 2,
          phoneNumber: '081234567890',
          status: 'Opened',
          invitationCode: guestCode || 'W-TEMP'
        });
      }
    }
  }, []);

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
    const appUrl = import.meta.env.VITE_APP_URL || 'https://undangankita.rfx.web.id';
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
    
    setIsSelectingTheme(false);
  };

  // ============================================
  // DESIGN SNAPSHOT HANDLERS
  // ============================================
  const handleSaveDesignSnapshot = async (snapshotName: string) => {
    if (!snapshotName.trim()) {
      alert("Harap masukkan nama snapshot desain!");
      return;
    }
    await wedding.saveDesignSnapshot(snapshotName);
    alert(`Snapshot "${snapshotName}" berhasil disimpan!`);
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
    const appUrl = import.meta.env.VITE_APP_URL || 'https://undangankita.rfx.web.id';
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
  // RENDER: STANDALONE INVITATION FOR GUESTS
  // ============================================
  if (isInvitationView) {
    return (
      <div className="relative w-full h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
        {/* Floating Back to Builder */}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <button
            onClick={handleBackToBuilder}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-black/80 hover:bg-black/95 border border-zinc-800 text-white rounded-full text-xs font-semibold shadow-lg transition duration-300 cursor-pointer backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            Kembali ke SaaS Dashboard
          </button>
        </div>

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
            <Heart className="w-8 h-8 fill-rose-800 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-mono uppercase tracking-widest">Memuat Data Undangan...</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1">Menghubungkan ke server Turso</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: AUTH GATE
  // ============================================
  if (!activeSaaSUser || activeSaaSUser.paymentStatus !== 'success') {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  // ============================================
  // RENDER: THEME SELECTOR
  // ============================================
  if (isSelectingTheme) {
    return (
      <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-red-500/30 select-none overflow-x-hidden relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r')" }} />
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-red-650/5 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[85%] rounded-full bg-red-650/5 blur-[120px] pointer-events-none" />

        <header className="border-b border-zinc-900/60 px-8 py-4.5 flex justify-between items-center z-10 bg-[#050505]/70 backdrop-blur-md sticky top-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-red-955/40 text-red-550 border border-red-900/40 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.25)]">
              <Heart className="w-4.5 h-4.5 fill-red-800 animate-pulse" />
            </span>
            <div>
              <h1 className="text-sm font-black tracking-wider flex items-center gap-1.5 uppercase font-mono text-white">
                Wedding Builder <span className="bg-red-650 text-[8.5px] text-white px-2 py-0.5 rounded-full font-bold">BY RFX.VISUAL</span>
              </h1>
              <p className="text-[9.5px] text-zinc-500 font-mono tracking-widest uppercase">Premium Wedding SaaS Builder</p>
            </div>
          </div>
          <div className="text-[10px] text-zinc-505 font-mono hidden md:block">Theme Engine: undangankita.rfx.web.id</div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center z-10 w-full">
          <div className="text-center space-y-3.5 max-w-xl mb-12 animate-fadeIn">
            <span className="text-[9.5px] uppercase font-bold tracking-[0.35em] text-red-500 font-mono block">1. CONTOH PILIH UNDANGAN DILUAR EDITOR</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white uppercase">PILIH TEMPLATE WARNA SOFT & CLEAN</h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-md mx-auto">
              Pilih dari palet warna lembut kami yang dirancang khusus untuk memberikan kesan elegan, tenang, dan premium. Setelah memilih, Anda akan langsung masuk ke editor visual di dalam tata letak undangan impian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-fadeIn" style={{ animationDelay: '100ms' }}>
            {DEFAULT_THEMES.map((theme) => {
              const isSFX = theme.id === 'rfx-dark';
              return (
                <div
                  key={theme.id}
                  onClick={() => {
                    wedding.setThemeId(theme.id);
                    setIsSelectingTheme(false);
                  }}
                  className={`bg-zinc-950/85 border rounded-3xl p-6 flex flex-col justify-between h-64 transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-2xl ${
                    isSFX
                      ? 'border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.20)] hover:border-red-500'
                      : 'border-zinc-850 hover:border-zinc-750'
                  }`}
                >
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundColor: theme.bgHex,
                      backgroundImage: `radial-gradient(${theme.primaryHex} 1.5px, transparent 0)`,
                      backgroundSize: '16px 16px',
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-base text-white tracking-tight uppercase font-sans">
                          {theme.name}
                        </h3>
                        <span className="inline-block text-[9px] font-mono text-zinc-550 uppercase tracking-widest mt-0.5">
                          {theme.pattern} structural style
                        </span>
                      </div>
                      {isSFX && (
                        <span className="bg-red-650/20 text-red-400 border border-red-900/40 text-[8px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider animate-pulse">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-zinc-400 mt-3.5 leading-relaxed font-sans">
                      Arsitektur desain dengan perpaduan font "{theme.fontSerif === 'font-serif' ? 'Georgia Editorial' : 'Space Grotesk'}" serta pernis warna {theme.primaryHex}.
                    </p>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-zinc-900/80 flex justify-between items-center bg-zinc-950/90 rounded-b-xl">
                    <div className="flex gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.primaryHex }} title="Primary" />
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.bgHex }} title="Latar Belakang" />
                      <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: theme.textHex }} title="Font" />
                    </div>
                    <button className="flex items-center gap-0.5 text-[10px] font-bold font-mono text-white group-hover:text-red-500 transition-colors uppercase tracking-wider cursor-pointer">
                      PILIH & EDIT <ChevronRight className="w-3.5 h-3.5" />
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
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-red-600/30">
      
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
        <div className="absolute top-4 left-4 z-40 bg-[#050505]/80 border border-zinc-900 shadow-md backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-2.5 select-none text-[11px] font-mono leading-none font-bold">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
          <span className="text-zinc-400">PANEL EDITING AKTIF</span>
          <span className="text-zinc-650">|</span>
          <span className="text-white">CO-SINKRONISASI</span>
          {wedding.isSaving && (
            <>
              <span className="text-zinc-650">|</span>
              <span className="text-amber-400 animate-pulse">SAVING...</span>
            </>
          )}
        </div>
      )}

      {/* PREVIEW MODE FLOATING BAR */}
      {isPreviewGuestMode && (
        <div className="absolute top-4 right-4 z-[200] animate-fadeIn select-none">
          <button
            onClick={() => setIsPreviewGuestMode(false)}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 border border-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer transform hover:scale-105"
          >
            <Eye className="w-4 h-4 animate-spin-slow animate-pulse" />
            <span>KELUAR DARI PREVIEW TAMU</span>
            <span className="bg-black/25 px-2 py-0.5 rounded-md text-[9px] font-mono font-medium">ESC</span>
          </button>
        </div>
      )}

      {/* FLOATING COLLAPSED RED GEM / TRIGGER BADGE */}
      {!isPreviewGuestMode && !editorExpanded && (
        <div className="absolute top-4 right-4 z-40 animate-bounce">
          <button
            onClick={() => setEditorExpanded(true)}
            className="p-4 rounded-full bg-red-650 border border-red-550 text-white hover:bg-red-700 shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center justify-center cursor-pointer transform hover:scale-105 transition-all"
            title="Buka Panel Editor Visual"
          >
            <Settings className="w-5 h-5 animate-spin-slow" />
          </button>
        </div>
      )}

      {/* FLOATING GLASSMORPHIC EDITOR CONTROL PANEL */}
      {!isPreviewGuestMode && editorExpanded && (
        <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-[#050505]/95 backdrop-blur-2xl border-l border-zinc-900/60 z-[100] flex flex-col overflow-hidden text-zinc-105 shadow-[-10px_0_35px_rgba(0,0,0,0.85)] animate-slideLeft">
          
          {/* EDITOR HEAD */}
          <div className="p-4.5 border-b border-zinc-900 flex justify-between items-center select-none bg-black/40">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-red-955/40 text-red-500 border border-red-900/40 flex items-center justify-center animate-pulse">
                <Heart className="w-3.5 h-3.5 fill-red-900" />
              </span>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase font-mono text-white leading-none">RFX.VISUAL CONTROL DECK</h3>
                <p className="text-[9px] text-zinc-505 font-mono tracking-widest mt-1">REAL-TIME INLINE WEB WORKSPACE</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSelectingTheme(true)}
                className="px-2.5 py-1.5 bg-zinc-90 w-auto hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[9.5px] font-bold font-mono text-zinc-300 hover:text-white transition cursor-pointer"
                title="Ganti Tema Warna / Desain"
              >
                Ganti Desain
              </button>
              
              <button
                onClick={() => setEditorExpanded(false)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition text-[10px] font-mono font-bold leading-none cursor-pointer"
                title="Sembunyikan Panel"
              >
                Sembunyikan
              </button>
            </div>
          </div>

          {/* TAB HEADER */}
          <div className="flex bg-zinc-950/80 p-1 border-b border-zinc-900">
            <button
              onClick={() => setActiveSegment('design')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                activeSegment === 'design'
                  ? 'bg-red-650/15 text-red-400 font-black border border-red-950 shadow-inner'
                  : 'text-zinc-505 hover:text-zinc-300'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Konten Undangan
            </button>
            <button
              onClick={() => setActiveSegment('guests')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition ${
                activeSegment === 'guests'
                  ? 'bg-red-650/15 text-red-400 font-black border border-red-950 shadow-inner'
                  : 'text-zinc-505 hover:text-zinc-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Buku Tamu & QR
            </button>
            <button
              onClick={() => setActiveSegment('analytics')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                activeSegment === 'analytics'
                  ? 'bg-red-650/15 text-red-400 font-black border border-red-950 shadow-inner'
                  : 'text-zinc-505 hover:text-zinc-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Analitik & RSVP
            </button>
          </div>

          {/* SCROLLING TAB VIEW */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-5">
            {/* Quick action bar */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center select-none flex-col xs:flex-row gap-3">
              <div>
                <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500">UTILITY ACCORD</h4>
                <p className="text-xs font-semibold text-zinc-300">Bagikan pratinjau rilis tamu</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsPreviewGuestMode(true)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
                  title="Masuk ke mode simulasi penuh tanpa control panel"
                >
                  <Eye className="w-3 h-3 text-red-500" /> Mode Tamu
                </button>
                <button
                  onClick={() => {
                    setPublishSuccess(false);
                    setShowPublishModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-550 text-white border border-rose-550 font-bold rounded-lg flex items-center gap-1 transition cursor-pointer text-[10px] uppercase shadow-md shadow-rose-950/20"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  Publish
                </button>
              </div>
            </div>

            {/* PROFIL PENGGUNA SAAS */}
            {activeSaaSUser && (
              <div className="bg-zinc-950 border border-zinc-910/80 rounded-2xl p-4.5 space-y-3 shadow-sm select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-tight">{activeSaaSUser.fullName}</h4>
                      <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                        Tier: <span className="text-rose-500 font-bold">{activeSaaSUser.packageId}</span> ({activeSaaSUser.isCustomByRfx ? 'Custom RFX' : 'Mandiri'})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setProfileExpanded(!profileExpanded)}
                    className="p-1 px-2.5 rounded-lg bg-zinc-90 w-auto hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 hover:text-white border border-zinc-850 hover:bg-zinc-855 cursor-pointer transition"
                  >
                    {profileExpanded ? 'Hide' : 'Show Profile'}
                  </button>
                </div>

                {profileExpanded && (
                  <div className="pt-2.5 border-t border-zinc-900/60 space-y-3 animate-slideDown">
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-mono text-zinc-505 uppercase tracking-widest block">Tautan Undangan Aktif:</span>
                      <div className="flex gap-1.5 items-center bg-[#070709] border border-zinc-900 p-2 rounded-xl">
                        <Globe className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-mono text-[11px] text-zinc-300 break-all select-all flex-1">
                          undangankita.rfx.web.id/{activeSaaSUser.activeSlug}
                        </span>
                        <button
                          onClick={handleCopyMainShare}
                          className="p-1 px-2 bg-rose-950/20 hover:bg-rose-900/35 border border-rose-900/40 text-rose-450 hover:text-rose-300 text-[10px] font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                          title="Salin Tautan"
                        >
                          {isCopiedMain ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedMain ? 'Disalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-mono text-zinc-505 uppercase tracking-widest block">Riwayat Desain Template:</span>
                      {themeHistory && themeHistory.length > 0 ? (
                        <div className="max-h-[85px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                          {themeHistory.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-[#08080a] border border-zinc-905 p-2 rounded-xl text-[10px] hover:border-zinc-850 transition">
                              <span className="text-zinc-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <strong className="font-bold text-zinc-200">{item.name}</strong>
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-900">{item.editedAt}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-505 italic">Belum ada riwayat penggantian template.</p>
                      )}
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
                          🕰️ Riwayat & Snapshot Desain Undangan
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
                                      🤵👰 {coupleLabel}
                                    </span>
                                  )}
                                  {item.weddingData.loveStories && (
                                    <span className="text-[9px] bg-emerald-900/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/20 font-mono">
                                      📖 {item.weddingData.loveStories.length} Cerita
                                    </span>
                                  )}
                                  {item.weddingData.bgImageUrl && (
                                    <span className="text-[9px] bg-amber-900/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-900/20 font-mono">
                                      🖼️ Image BG
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
                    🎨 TATA LETAK UNDANGAN AKTIF:
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
              <div className="animate-fadeIn">
                <div className="text-slate-800">
                  <GuestManager 
                    guests={guests}
                    appUrl={import.meta.env.VITE_APP_URL || 'https://undangankita.rfx.web.id'}
                    slug={activeSaaSUser.activeSlug}
                    coupleNames={`${weddingData.couple.groom.nickname} & ${weddingData.couple.bride.nickname}`}
                    onAddGuest={handleAddGuest}
                    onRemoveGuest={handleRemoveGuest}
                    onUpdateGuestStatus={wedding.updateGuestStatus}
                  />
                </div>
              </div>
            )}

            {/* TAB-3: ANALYTICS */}
            {activeSegment === 'analytics' && (
              <div className="animate-fadeIn">
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
            <span>PLATFORM VERSI v5.0 — TURSO BACKED</span>
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
                        {activeSaaSUser.packageId.toUpperCase()} ({activeSaaSUser.isCustomByRfx ? 'Custom Full RFX' : 'Custom Mandiri'})
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
                        📲 Quick Share WhatsApp Generator
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
                      <div className="text-xs text-amber-500 bg-amber-955/10 border border-amber-900/20 p-2.5 rounded-xl font-mono text-left">
                        ⚠️ Belum ada tamu. Silakan tambahkan nama tamu undangan di tab "Daftar Tamu" terlebih dahulu.
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
    </div>
  );
}
