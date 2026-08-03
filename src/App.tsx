import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWeddingData } from './hooks/useWeddingData';
import AuthGate from './components/AuthGate';
import DashboardSidebar from './components/DashboardSidebar';
import EditorPanel from './components/EditorPanel';
import GuestManager from './components/GuestManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ThemeSelector from './components/ThemeSelector';
import InvitationPreview from './components/InvitationPreview';
import IframePreview from './components/IframePreview';
import PublishModal from './components/PublishModal';
import ProfilePanel from './components/ProfilePanel';
import { Eye, Heart, Loader2, RefreshCw, Palette, PenLine, Users, BarChart3, UserCircle, Crown } from 'lucide-react';
import UpgradePanel from './components/UpgradePanel';
import { SaaSUser } from './types';

export default function App() {
  const auth = useAuth();
  const wedding = useWeddingData();

  const [activeSegment, setActiveSegment] = useState<'design' | 'guests' | 'analytics' | 'settings' | 'profile' | 'upgrade'>('settings');
  const [isPreviewGuestMode, setIsPreviewGuestMode] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Force refresh preview (re-creates IframePreview + recalculates scale)
  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
    // Recalculate scale after a tick so layout has settled
    setTimeout(() => {
      const container = previewContainerRef.current;
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      const phoneW = 375 + 28 + 8;
      const phoneH = 812 + 28 + 8;
      const scaleX = width / phoneW;
      const scaleY = height / phoneH;
      setPreviewScale(Math.max(Math.min(scaleX, scaleY, 1), 0.3));
    }, 200);
  }, []);

  // Load user data whenever auth.currentUser becomes available
  // This handles page refresh / session restore (not just fresh login)
  useEffect(() => {
    if (auth.currentUser && !wedding.invitation && !wedding.isLoading) {
      console.log('[DEBUG] 🔄 Auto-loading user data for restored session:', auth.currentUser.id);
      wedding.loadUserData(auth.currentUser);
    }
  }, [auth.currentUser, wedding.invitation, wedding.isLoading]);

  // Auto-refresh preview + recalculate scale when data finishes loading
  useEffect(() => {
    if (wedding.invitation && !wedding.isLoading) {
      // Data is ready — refresh preview and recalculate scale
      // Multiple delays to catch layout settling at different speeds
      const t1 = setTimeout(refreshPreview, 100);
      const t2 = setTimeout(refreshPreview, 500);
      const t3 = setTimeout(refreshPreview, 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [wedding.invitation?.id]); // Only when invitation ID changes (null → loaded)


  // Preview auto-scale: mengukur container lalu hitung scale agar mockup 375x812 muat
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5); // Safe default — never start at 0

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const calcScale = () => {
      const { width, height } = container.getBoundingClientRect();
      // Ukuran native mockup (termasuk border 14px * 2 = 28px per sisi)
      const phoneW = 375 + 28 + 8; // + ring
      const phoneH = 812 + 28 + 8;
      const scaleX = width / phoneW;
      const scaleY = height / phoneH;
      // Minimum 0.3 agar mockup tidak pernah invisible
      const newScale = Math.max(Math.min(scaleX, scaleY, 1), 0.3);
      setPreviewScale(newScale);
    };

    // Delay sedikit untuk memastikan layout sudah settle setelah transisi
    const initTimer = setTimeout(calcScale, 100);
    
    const observer = new ResizeObserver(calcScale);
    observer.observe(container);
    return () => {
      clearTimeout(initTimer);
      observer.disconnect();
    };
  }, []);
  
  if (!auth.currentUser) {
    return (
      <AuthGate onLoginSuccess={(user) => {
        auth.setCurrentUser(user);
        wedding.loadUserData(user);
      }} />
    );
  }

  // Block pending-payment users from accessing dashboard
  if (auth.currentUser.paymentStatus === 'pending' && auth.currentUser.packageId !== 'demo') {
    return (
      <AuthGate onLoginSuccess={(user) => {
        auth.setCurrentUser(user);
        wedding.loadUserData(user);
      }} />
    );
  }

  // Menghitung timer secara global (Account-level) berdasarkan seluruh project
  const getAccountTimer = () => {
    if (!wedding.allInvitations || wedding.allInvitations.length === 0) {
      return { activatedAt: wedding.invitation?.activatedAt, expiresAt: wedding.invitation?.expiresAt };
    }
    
    // Cari yang sudah aktif
    const activeInvs = wedding.allInvitations.filter(inv => inv.activatedAt);
    
    if (activeInvs.length === 0) {
      return { activatedAt: wedding.invitation?.activatedAt, expiresAt: wedding.invitation?.expiresAt };
    }
    
    // Gunakan project yang paling pertama diaktifkan sebagai sumber kebenaran (Source of Truth)
    // untuk timer Akun. Ini mencegah progress bar dan waktu out-of-sync jika project baru mendapat +90 hari.
    const earliestActivated = activeInvs.reduce((earliest, inv) => {
      if (!earliest.activatedAt || !inv.activatedAt) return earliest;
      return new Date(inv.activatedAt) < new Date(earliest.activatedAt) ? inv : earliest;
    }, activeInvs[0]);
    
    // Jika ada perpanjangan masa aktif (extend), kita bisa cek expiresAt terlama
    // Tapi kita harus pastikan activatedAt-nya menyesuaikan durasi paket aslinya (agar progress bar proporsional)
    // Untuk saat ini yang paling aman & akurat adalah menggunakan sepasang tanggal dari project utama:
    return { activatedAt: earliestActivated.activatedAt, expiresAt: earliestActivated.expiresAt };
  };

  const accountTimer = getAccountTimer();

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] relative overflow-hidden font-sans">
      {/* Premium Glassmorphic Canvas Elements (Improvisasi UI) */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-amber-200/60 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] bg-zinc-300/70 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-[40%] h-[40%] bg-amber-100/70 rounded-full blur-[90px] pointer-events-none" />


      {/* Loading OVERLAY — sits on top, does NOT unmount the dashboard underneath */}
      {wedding.isLoading && (
        <div className="fixed inset-0 z-[9999] bg-[#050505]/90 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-white font-mono uppercase tracking-widest">Memuat Workspace...</p>
          </div>
        </div>
      )}

      
      {/* LEFT PANEL - DASHBOARD SIDEBAR */}
      {!isPreviewGuestMode && (
        <DashboardSidebar
          activeSegment={activeSegment}
          setActiveSegment={(s: string) => setActiveSegment(s as any)}
          user={auth.currentUser}
          onLogout={auth.logout}
          onPublish={() => setShowPublishModal(true)}
          activatedAt={accountTimer.activatedAt}
          expiresAt={accountTimer.expiresAt}
          currentInvitationId={wedding.invitation?.id}
          allInvitations={wedding.allInvitations}
          onSwitchInvitation={wedding.switchInvitation}
          onCreateInvitation={wedding.createNewInvitation}
          onUpdateSlug={wedding.updateInvitationSlug}
        />
      )}

      {/* MIDDLE PANEL - EDITOR/CONTENT */}
      {!isPreviewGuestMode && (
        <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-3xl overflow-hidden relative border-r border-amber-900/5 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)] z-10 rounded-l-[2.5rem] ml-1 my-1">
          
          {/* Header Top Bar */}
          <header className="h-16 border-b border-amber-900/5 bg-white/40 backdrop-blur-xl flex items-center pl-10 pr-6 shrink-0 z-20">
            {(() => {
              const segments: Record<string, { title: string; sub: string; icon: React.ElementType; color: string; bg: string }> = {
                settings: { title: 'Pilih Tema', sub: 'Koleksi palet eksklusif', icon: Palette, color: 'text-zinc-800', bg: 'bg-amber-100/50 border border-amber-200/50' },
                design: { title: 'Desain Undangan', sub: 'Editor konten utama', icon: PenLine, color: 'text-zinc-800', bg: 'bg-orange-100/50 border border-orange-200/50' },
                guests: { title: 'Daftar Tamu', sub: 'Kelola undangan & QR', icon: Users, color: 'text-zinc-800', bg: 'bg-yellow-100/50 border border-yellow-200/50' },
                analytics: { title: 'Statistik RSVP', sub: 'Monitor kunjungan real-time', icon: BarChart3, color: 'text-zinc-800', bg: 'bg-lime-100/50 border border-lime-200/50' },
                profile: { title: 'Profil Anda', sub: 'Akun & pengaturan', icon: UserCircle, color: 'text-zinc-800', bg: 'bg-amber-100/50 border border-amber-200/50' },
                upgrade: { title: 'Upgrade Akun', sub: 'Tingkatkan paket Anda', icon: Crown, color: 'text-amber-700', bg: 'bg-amber-200/60 border border-amber-300/60' },
              };
              const seg = segments[activeSegment] || segments.settings;
              const Icon = seg.icon;
              return (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${seg.bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${seg.color}`} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-800 tracking-tight">{seg.title}</h2>
                    <p className="text-[10px] text-zinc-400 font-medium">{seg.sub}</p>
                  </div>
                </div>
              );
            })()}
          </header>

          {/* Area Konten Panel Tengah */}
          <div className="flex-1 overflow-hidden relative">
            {activeSegment === 'settings' && (
              <div className="h-full overflow-y-auto bg-transparent p-6 md:p-8">
                <ThemeSelector 
                  currentThemeId={wedding.themeId} 
                  onSelectTheme={(id) => {
                    setPreviewThemeId(id);
                    wedding.setThemeId(id);
                  }}
                  packageId={auth.currentUser?.packageId || 'demo'}
                />
              </div>
            )}
            {activeSegment === 'design' && (
              <div className="h-full overflow-y-auto">
                <EditorPanel data={wedding.weddingData} onChange={wedding.setWeddingData} packageId={auth.currentUser?.packageId || 'demo'} />
              </div>
            )}
            {activeSegment === 'guests' && (
              <div className="h-full overflow-y-auto p-6">
                <GuestManager 
                  guests={wedding.guests || []}
                  onAddGuest={wedding.addGuest}
                  onRemoveGuest={wedding.removeGuest}
                  onUpdateGuestStatus={wedding.updateGuestStatus}
                  appUrl={process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://ruanghadir.net')}
                  slug={wedding.invitation?.slug || auth.currentUser?.activeSlug || 'demo'}
                  coupleNames={wedding.weddingData.couple.bride.nickname + ' & ' + wedding.weddingData.couple.groom.nickname}
                />
              </div>
            )}
            {activeSegment === 'analytics' && (
              <div className="h-full overflow-y-auto p-6">
                <AnalyticsDashboard 
                  analytics={wedding.analytics}
                  rsvps={wedding.rsvps}
                  onDeleteRSVP={wedding.deleteRSVP}
                  onSimulateGuestRSVP={async () => {}}
                  onSimulatePageView={async () => {}}
                />
              </div>
            )}
            {activeSegment === 'profile' && (
              <ProfilePanel wedding={wedding} />
            )}
            {activeSegment === 'upgrade' && (
              <div className="h-full overflow-y-auto">
                <UpgradePanel
                  user={auth.currentUser}
                  activatedAt={wedding.invitation?.activatedAt}
                  expiresAt={wedding.invitation?.expiresAt}
                  invitationId={wedding.invitation?.id}
                  onSuccess={(updatedUser) => { auth.setCurrentUser(updatedUser); wedding.loadUserData(updatedUser); }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT PANEL - LIVE PREVIEW */}
      <div className={`${isPreviewGuestMode ? 'w-full flex' : 'hidden md:flex w-[400px] xl:w-[450px] shrink-0'} bg-transparent flex-col relative my-1 mr-1 rounded-r-[2.5rem] overflow-hidden`}>
        
        {/* Header Preview */}
        <div className="p-4 bg-white/40 backdrop-blur-xl border-b border-amber-900/5 flex justify-between items-start z-10">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-800">
              {isPreviewGuestMode ? 'Mode Layar Penuh' : 'Live Preview'}
            </h3>
            <p className="text-[10px] font-medium text-zinc-500 mt-1 leading-tight max-w-[220px]">
              *Tampilan preview mungkin sedikit bergeser/kurang presisi. Hasil yang di-publish akan 100% sempurna.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <button
              onClick={refreshPreview}
              className="p-2 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 rounded-lg transition cursor-pointer"
              title="Refresh Preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPreviewGuestMode(!isPreviewGuestMode)}
              className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-zinc-900/20"
            >
              <Eye className="w-4 h-4" />
              Kembali ke Editor
            </button>
          </div>
        </div>

        {/* Iframe Mobile Container — transform scale approach */}
        <div ref={previewContainerRef} className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-transparent" style={{ backgroundImage: 'radial-gradient(rgba(245,158,11,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          <div 
            className="w-[375px] h-[812px] shrink-0 rounded-[3rem] border-[14px] border-zinc-900 bg-black shadow-2xl relative overflow-hidden ring-4 ring-zinc-200/50"
            style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}
          >
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 rounded-b-3xl w-40 mx-auto z-[9999]"></div>
            
            <IframePreview key={`main-preview-${previewKey}`}>
              <InvitationPreview 
                data={wedding.weddingData} 
                themeId={previewThemeId || wedding.themeId} 
                onAddRSVP={wedding.addRSVP}
                rsvps={wedding.rsvps}
                embedded={true}
              />
            </IframePreview>
          </div>
        </div>
      </div>

      {/* BUTTON PRATINJAU MELAYANG UNTUK MOBILE */}
      {!isPreviewGuestMode && (
        <button
          onClick={() => setIsPreviewGuestMode(true)}
          className="md:hidden fixed bottom-6 right-6 z-[150] bg-zinc-900 hover:bg-zinc-800 text-amber-400 p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 animate-bounce cursor-pointer"
          title="Pratinjau Undangan"
        >
          <Eye className="w-5 h-5" />
          <span className="text-xs font-black uppercase tracking-widest pr-1">Pratinjau</span>
        </button>
      )}

      {/* THEME SELECTION MODAL (IFRAME MOCKUP HP DENGAN DIMENSI IDEAL & SCROLLABLE MODAL DENGAN MARGIN BAWAH AMAN) */}
      {previewThemeId && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center pt-4 pb-10 px-4 animate-fadeIn overflow-y-auto" onClick={() => setPreviewThemeId(null)}>
          <div className="flex flex-col items-center gap-4 max-w-full my-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Mockup HP dengan dimensi hemat ruang (w-[280px] h-[560px]) agar pas sempurna di laptop beresolusi rendah */}
            <div className="relative w-[280px] h-[560px] rounded-[2rem] border-[6px] border-zinc-900 bg-black shadow-2xl overflow-hidden ring-4 ring-white/10 shrink-0">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-4.5 bg-zinc-900 rounded-b-2xl w-24 mx-auto z-[9999]"></div>
              
              <IframePreview key={`modal-preview-${previewKey}`}>
                <InvitationPreview 
                  data={wedding.weddingData} 
                  themeId={previewThemeId} 
                  onAddRSVP={wedding.addRSVP}
                  rsvps={wedding.rsvps}
                  embedded={true}
                />
              </IframePreview>
            </div>

            {/* Tombol aksi diletakkan di luar mockup HP dengan margin bawah aman agar tidak tertutup widget sudut layar */}
            <div className="flex gap-4 justify-center w-full px-4 pb-2 shrink-0">
              <button
                onClick={() => setPreviewThemeId(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2.5 rounded-full font-bold uppercase text-[11px] shadow-lg tracking-widest transition duration-300 flex items-center justify-center cursor-pointer border border-zinc-700/50"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  wedding.setThemeId(previewThemeId);
                  setPreviewThemeId(null);
                }}
                className="bg-amber-400 hover:bg-amber-500 text-zinc-900 px-6 py-2.5 rounded-full font-black uppercase text-[11px] shadow-lg shadow-amber-500/30 tracking-widest flex items-center gap-2 transition duration-300 flex items-center justify-center cursor-pointer"
              >
                <Heart className="w-4 h-4" /> Gunakan Tema
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PUBLISH MODAL */}
      <PublishModal 
        show={showPublishModal} 
        onClose={() => setShowPublishModal(false)} 
        user={auth.currentUser} 
        wedding={wedding} 
      />

    </div>
  );
}