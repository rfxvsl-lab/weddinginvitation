'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { resolvePublicSlug } from './lib/utils';
import { useAuth } from './hooks/useAuth';
import { useWeddingData } from './hooks/useWeddingData';
import AuthGate from './components/AuthGate';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardOverview from './components/DashboardOverview';
import EditorPanel from './components/EditorPanel';
import GuestManager from './components/GuestManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ThemeSelector from './components/ThemeSelector';
import InvitationPreview from './components/InvitationPreview';
import IframePreview from './components/IframePreview';
import PublishModal from './components/PublishModal';
import ProfilePanel from './components/ProfilePanel';
import UpgradePanel from './components/UpgradePanel';
import VideoInvitationStudio from './components/VideoInvitationStudio';
import {
  Menu,
  Eye,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  X,
} from 'lucide-react';

type DashboardSegment =
  | 'overview'
  | 'design'
  | 'settings'
  | 'video'
  | 'guests'
  | 'analytics'
  | 'profile'
  | 'upgrade';

const SEGMENT_META: Record<DashboardSegment, { title: string; sub: string }> = {
  overview: { title: 'Ringkasan', sub: 'Status undangan & metrik utama' },
  design: { title: 'Editor Undangan', sub: 'Konten mempelai, acara, galeri & amplop' },
  settings: { title: 'Koleksi Tema', sub: 'Pilih tampilan & tata letak undangan' },
  video: { title: 'Video Studio', sub: 'Film undangan MP4 dari data undangan — Enterprise' },
  guests: { title: 'Daftar Tamu', sub: 'Nama personal, link WhatsApp & QR check-in' },
  analytics: { title: 'Analitik & RSVP', sub: 'Kunjungan & konfirmasi kehadiran tamu' },
  profile: { title: 'Profil & Pengaturan', sub: 'Informasi akun & tautan undangan' },
  upgrade: { title: 'Paket & Enterprise', sub: 'Status Full Gratis & akses perusahaan' },
};

export default function App() {
  const auth = useAuth();
  const wedding = useWeddingData();

  const [activeSegment, setActiveSegment] = useState<DashboardSegment>(() => {
    if (typeof window === 'undefined') return 'overview';
    const tab = new URLSearchParams(window.location.search).get('tab');
    const allowed: DashboardSegment[] = ['overview', 'design', 'settings', 'video', 'guests', 'analytics', 'profile', 'upgrade'];
    return allowed.includes(tab as DashboardSegment) ? (tab as DashboardSegment) : 'overview';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRightPreview, setShowRightPreview] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [copiedSlug, setCopiedSlug] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.72);

  const calcPreviewScale = useCallback(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const phoneW = 375 + 24;
    const phoneH = 812 + 24;
    const scaleX = (width - 24) / phoneW;
    const scaleY = (height - 24) / phoneH;
    setPreviewScale(Math.max(Math.min(scaleX, scaleY, 0.92), 0.35));
  }, []);

  const refreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
    setTimeout(calcPreviewScale, 150);
  }, [calcPreviewScale]);


  // Auto-load user data whenever auth.currentUser becomes available
  useEffect(() => {
    if (auth.currentUser && !wedding.invitation && !wedding.isLoading) {
      wedding.loadUserData(auth.currentUser);
    }
  }, [auth.currentUser, wedding.invitation, wedding.isLoading]);

  // Refresh preview when invitation finishes loading
  useEffect(() => {
    if (wedding.invitation && !wedding.isLoading) {
      const t1 = setTimeout(refreshPreview, 120);
      const t2 = setTimeout(refreshPreview, 650);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [wedding.invitation?.id]);

  // Keep phone preview scaled cleanly on resize or toggle
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const initTimer = setTimeout(calcPreviewScale, 80);
    const observer = new ResizeObserver(calcPreviewScale);
    observer.observe(container);
    return () => {
      clearTimeout(initTimer);
      observer.disconnect();
    };
  }, [showRightPreview, calcPreviewScale]);

  if (!auth.currentUser) {
    return (
      <AuthGate
        onLoginSuccess={(user) => {
          auth.setCurrentUser(user);
          wedding.loadUserData(user);
        }}
      />
    );
  }

  // Undangan lama punya slug otomatis "inv-…"; untuk proyek utama tampilkan tautan pilihan user.
  const slug = resolvePublicSlug(wedding.invitation?.slug, auth.currentUser.activeSlug, wedding.allInvitations.length);
  const isPublished = Boolean(wedding.invitation?.isPublished);
  const segMeta = SEGMENT_META[activeSegment];

  const handleCopyLink = () => {
    if (!slug) return;
    navigator.clipboard?.writeText(`https://ruanghadir.net/${slug}`);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 1800);
  };

  return (
    <div className="saas-scope saas-dash rh-product dashboard-shell-lock fixed inset-0 flex h-[100dvh] w-full max-w-[100vw] overflow-hidden glx-wallpaper text-[var(--rh-ink)] font-sans">
      {/* Loading Overlay */}
      {wedding.isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--rh-ivory)]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-[var(--rh-primary)]" />
            <p className="text-[13px] font-medium text-[var(--rh-ink-2)]">
              Memuat Workspace…
            </p>
          </div>
        </div>
      )}

      {/* 1. LEFT SIDEBAR (Persistent on desktop, Drawer on mobile) */}
      <DashboardSidebar
        activeSegment={activeSegment}
        setActiveSegment={(s) => setActiveSegment(s as DashboardSegment)}
        user={auth.currentUser}
        onLogout={auth.logout}
        onPublish={() => setShowPublishModal(true)}
        isPublished={isPublished}
        mobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
        currentInvitationId={wedding.invitation?.id}
        allInvitations={wedding.allInvitations}
        onSwitchInvitation={wedding.switchInvitation}
        onCreateInvitation={wedding.createNewInvitation}
        onUpdateSlug={wedding.updateInvitationSlug}
      />

      {/* 2. MAIN WORKSPACE COLUMN */}
      <div className="rh-workspace flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Workspace Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--rh-line)] bg-white/70 backdrop-blur-2xl px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-[var(--rh-line)] text-[var(--rh-ink)] hover:bg-[var(--rh-ivory)] cursor-pointer"
              aria-label="Buka navigasi"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[15px] font-bold text-[var(--rh-ink)]">
                  {segMeta.title}
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isPublished
                      ? 'bg-[#E9F2EA] text-[#3F7A52]'
                      : 'bg-[#F4ECDD] text-[#9A6B1E]'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPublished ? 'bg-[#3F7A52]' : 'bg-[#C6933A]'
                    }`}
                  />
                  {isPublished ? 'Publik' : 'Draft'}
                </span>
              </div>
              <p className="hidden md:block truncate text-[11.5px] text-[var(--rh-muted)]">
                {segMeta.sub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {slug && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[var(--rh-line)] bg-[var(--rh-ivory)] px-3 py-1.5 text-[12px] font-semibold text-[var(--rh-ink)] transition hover:bg-[#F2ECE2] cursor-pointer"
                title={`Salin ruanghadir.net/${slug}`}
              >
                {copiedSlug ? (
                  <Check className="h-3.5 w-3.5 text-[#3F7A52]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[var(--rh-ink-2)]" />
                )}
                <span className="max-w-[140px] truncate font-mono text-[11.5px]">
                  /{slug}
                </span>
              </button>
            )}

            {slug && isPublished && (
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[var(--rh-line)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--rh-ink)] transition hover:bg-[var(--rh-ivory)]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[var(--rh-primary)]" />
                Buka
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreenPreview(true)}
              className="inline-flex xl:hidden items-center gap-1.5 rounded-lg bg-[var(--rh-primary)] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[var(--rh-primary-hover)] cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              Pratinjau
            </button>

            <button
              type="button"
              onClick={() => setShowRightPreview((v) => !v)}
              className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-[var(--rh-line)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--rh-ink-2)] transition hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-ink)] cursor-pointer"
              title={showRightPreview ? 'Sembunyikan panel pratinjau' : 'Tampilkan panel pratinjau'}
            >
              {showRightPreview ? (
                <>
                  <PanelRightClose className="h-4 w-4" />
                  <span>Sembunyikan Preview</span>
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-4 w-4" />
                  <span>Tampilkan Preview</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {activeSegment === 'overview' && (
            <DashboardOverview
              user={auth.currentUser}
              weddingData={wedding.weddingData}
              invitation={wedding.invitation}
              guests={wedding.guests || []}
              rsvps={wedding.rsvps || []}
              analytics={wedding.analytics}
              onNavigate={(seg) => setActiveSegment(seg)}
              onPublish={() => setShowPublishModal(true)}
              publicSlug={slug}
            />
          )}

          {activeSegment === 'settings' && (
            <div className="mx-auto max-w-5xl p-5 sm:p-8">
              <ThemeSelector
                currentThemeId={wedding.themeId}
                onSelectTheme={(id) => {
                  setPreviewThemeId(id);
                  wedding.setThemeId(id);
                }}
                packageId={auth.currentUser?.packageId || 'free'}
                currentVariant={wedding.weddingData.themeVariant}
                onSelectVariant={(variantId) => wedding.setWeddingData((prev) => ({ ...prev, themeVariant: variantId }))}
              />
            </div>
          )}

          {activeSegment === 'design' && (
            <div className="h-full">
              <EditorPanel
                data={wedding.weddingData}
                onChange={wedding.setWeddingData}
                packageId={auth.currentUser?.packageId || 'free'}
              />
            </div>
          )}

          {activeSegment === 'guests' && (
            <div className="mx-auto max-w-5xl p-5 sm:p-8">
              <GuestManager
                guests={wedding.guests || []}
                onAddGuest={wedding.addGuest}
                onRemoveGuest={wedding.removeGuest}
                onUpdateGuestStatus={wedding.updateGuestStatus}
                appUrl={
                  process.env.NEXT_PUBLIC_APP_URL ||
                  (typeof window !== 'undefined' ? window.location.origin : 'https://ruanghadir.net')
                }
                slug={slug || 'undangan'}
                coupleNames={`${wedding.weddingData.couple.bride.nickname} & ${wedding.weddingData.couple.groom.nickname}`}
              />
            </div>
          )}

          {activeSegment === 'analytics' && (
            <div className="mx-auto max-w-5xl p-5 sm:p-8">
              <AnalyticsDashboard
                analytics={wedding.analytics}
                rsvps={wedding.rsvps}
                onDeleteRSVP={wedding.deleteRSVP}
                onSimulateGuestRSVP={async () => {}}
                onSimulatePageView={async () => {}}
              />
            </div>
          )}

          {activeSegment === 'profile' && <ProfilePanel wedding={wedding} />}

          {activeSegment === 'video' && (
            <VideoInvitationStudio
              wedding={wedding.weddingData}
              guests={wedding.guests || []}
              slug={slug}
              user={auth.currentUser}
              onOpenEnterprise={() => setActiveSegment('upgrade')}
              onSettingsChange={(videoStudio) => wedding.setWeddingData((prev) => ({ ...prev, videoStudio }))}
            />
          )}

          {activeSegment === 'upgrade' && (
            <UpgradePanel
              user={auth.currentUser}
              activatedAt={wedding.invitation?.activatedAt}
              expiresAt={wedding.invitation?.expiresAt}
              invitationId={wedding.invitation?.id}
              onSuccess={(updatedUser) => {
                auth.setCurrentUser(updatedUser);
                wedding.loadUserData(updatedUser);
              }}
            />
          )}
        </main>
      </div>

      {/* 3. RIGHT LIVE PREVIEW PANE (Toggleable on xl+ screens) */}
      {showRightPreview && (
        <aside className="hidden xl:flex w-[380px] shrink-0 flex-col border-l border-[var(--rh-line)] bg-[#F3EFE8]">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--rh-line)] bg-white px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#3F7A52]" />
              <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--rh-ink)]">
                Live Preview
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={refreshPreview}
                className="rounded-lg p-1.5 text-[var(--rh-ink-2)] transition hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-ink)] cursor-pointer"
                title="Muat ulang pratinjau"
                aria-label="Muat ulang pratinjau"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(true)}
                className="rounded-lg p-1.5 text-[var(--rh-ink-2)] transition hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-ink)] cursor-pointer"
                title="Perbesar layar penuh"
                aria-label="Perbesar layar penuh"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={previewContainerRef}
            className="flex flex-1 items-center justify-center overflow-hidden p-4"
          >
            <div
              className="relative h-[812px] w-[375px] shrink-0 overflow-hidden rounded-[2.75rem] border-[12px] border-[#1E1A18] bg-black shadow-xl"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'center center',
              }}
            >
              <div className="absolute inset-x-0 top-0 z-[9999] mx-auto h-6 w-36 rounded-b-2xl bg-[#1E1A18]" />
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
        </aside>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-[9000] flex flex-col bg-[#161311]/95 backdrop-blur-sm">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-5 text-white">
            <div className="flex items-center gap-2.5">
              <Eye className="h-4 w-4 text-[#D9B878]" />
              <span className="text-[13px] font-bold">Pratinjau Layar Penuh</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshPreview}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/90 hover:bg-white/10 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-[12px] font-bold text-[var(--rh-ink)] hover:bg-white/90 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Tutup
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
            <div className="relative h-full max-h-[820px] w-full max-w-[400px] overflow-hidden rounded-[2.5rem] border-[10px] border-[#26211E] bg-black shadow-2xl">
              <IframePreview key={`fs-preview-${previewKey}`}>
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
      )}

      {/* THEME SELECTION QUICK PREVIEW MODAL */}
      {previewThemeId && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm overflow-y-auto"
          onClick={() => setPreviewThemeId(null)}
        >
          <div
            className="flex flex-col items-center gap-4 max-w-full my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[560px] w-[280px] shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-[#1E1A18] bg-black shadow-2xl">
              <div className="absolute inset-x-0 top-0 z-[9999] mx-auto h-4 w-24 rounded-b-xl bg-[#1E1A18]" />
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

            <div className="flex w-full justify-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewThemeId(null)}
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-white/20 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  wedding.setThemeId(previewThemeId);
                  setPreviewThemeId(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--rh-primary)] px-5 py-2.5 text-[12px] font-bold text-white transition hover:bg-[var(--rh-primary-hover)] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Gunakan Tema Ini
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
