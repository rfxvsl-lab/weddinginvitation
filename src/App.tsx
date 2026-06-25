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
  
  // SLUG-BASED ROUTING FOR GUEST VIEW
  const [isInvitationView, setIsInvitationView] = useState(false);
  const [urlGuest, setUrlGuest] = useState(undefined);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.length > 1 && path !== '/dashboard' && path !== '/admin') {
      setIsInvitationView(true);
      wedding.loadPublicInvitation(path.substring(1)).catch(() => setIsInvitationView(false));
    }
  }, []);

  if (isInvitationView) {
    return (
      <div className="w-full h-screen">
        <InvitationPreview 
          data={wedding.weddingData} 
          themeId={wedding.themeId} 
          onAddRSVP={wedding.addRSVP}
          rsvps={wedding.rsvps}
          guest={urlGuest}
        />
      </div>
    );
  }

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

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">

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
          activatedAt={wedding.invitation?.activatedAt}
          expiresAt={wedding.invitation?.expiresAt}
          currentInvitationId={wedding.invitation?.id}
          allInvitations={wedding.allInvitations}
          onSwitchInvitation={wedding.switchInvitation}
          onCreateInvitation={wedding.createNewInvitation}
          onUpdateSlug={wedding.updateInvitationSlug}
        />
      )}

      {/* MIDDLE PANEL - EDITOR/CONTENT */}
      {!isPreviewGuestMode && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative border-r border-zinc-200">
          
          {/* Header Top Bar */}
          <header className="h-16 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl flex items-center pl-16 pr-6 shrink-0 z-20">
            {(() => {
              const segments: Record<string, { title: string; sub: string; icon: React.ElementType; color: string; bg: string }> = {
                settings: { title: 'Pilih Tema', sub: 'Koleksi palet eksklusif', icon: Palette, color: 'text-rose-600', bg: 'bg-rose-100' },
                design: { title: 'Desain Undangan', sub: 'Editor konten utama', icon: PenLine, color: 'text-violet-600', bg: 'bg-violet-100' },
                guests: { title: 'Daftar Tamu', sub: 'Kelola undangan & QR', icon: Users, color: 'text-sky-600', bg: 'bg-sky-100' },
                analytics: { title: 'Statistik RSVP', sub: 'Monitor kunjungan real-time', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                profile: { title: 'Profil Anda', sub: 'Akun & pengaturan', icon: UserCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
                upgrade: { title: 'Upgrade Akun', sub: 'Tingkatkan paket Anda', icon: Crown, color: 'text-rose-600', bg: 'bg-rose-100' },
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
              <div className="h-full overflow-y-auto bg-rose-50/20 p-6 md:p-8">
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
                  appUrl="https://ruanghadir.net"
                  slug={auth.currentUser?.activeSlug || 'demo'}
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
              <ProfilePanel />
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
      <div className={`${isPreviewGuestMode ? 'w-full flex' : 'hidden md:flex w-[400px] xl:w-[450px] shrink-0'} bg-zinc-100 flex-col relative`}>
        
        {/* Header Preview */}
        <div className="p-4 bg-white border-b border-zinc-200 flex justify-between items-center z-10 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-800">
            {isPreviewGuestMode ? 'Mode Layar Penuh' : 'Live Preview'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPreview}
              className="p-2 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 rounded-lg transition cursor-pointer"
              title="Refresh Preview"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPreviewGuestMode(!isPreviewGuestMode)}
              className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-xl text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Kembali ke Editor
            </button>
          </div>
        </div>

        {/* Iframe Mobile Container — transform scale approach */}
        <div ref={previewContainerRef} className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-zinc-50/50" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
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
          className="md:hidden fixed bottom-6 right-6 z-[150] bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 animate-bounce cursor-pointer"
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
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-full font-black uppercase text-[11px] shadow-lg tracking-widest flex items-center gap-2 transition duration-300 flex items-center justify-center cursor-pointer"
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