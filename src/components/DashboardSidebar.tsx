import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TierCountdown from '@/components/TierCountdown';
import ProjectSwitcher from '@/components/ProjectSwitcher';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/ui/Logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  IconHome,
  IconInvitation,
  IconSettings,
  IconMenu,
  IconUsers,
  IconUser,
  IconSparkleStar,
} from '@/components/Icons';
import { SaaSUser } from '@/types';

interface DashboardSidebarProps {
  activeSegment: string;
  setActiveSegment: (s: string) => void;
  user: SaaSUser | null;
  onLogout: () => void;
  onPublish?: () => void;
  activatedAt?: string | null;
  expiresAt?: string | null;
  // Multi-project
  currentInvitationId?: string | null;
  allInvitations?: { id: string; title: string; slug?: string | null; themeId: string; isPublished: boolean; updatedAt?: string }[];
  onSwitchInvitation?: (invitationId: string) => void;
  onCreateInvitation?: (title: string) => void;
  onUpdateSlug?: (invitationId: string, newSlug: string) => void;
}

export default function DashboardSidebar({ activeSegment, setActiveSegment, user, onLogout, onPublish, activatedAt, expiresAt, currentInvitationId, allInvitations, onSwitchInvitation, onCreateInvitation, onUpdateSlug }: DashboardSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'settings', label: 'Pilih Tema', icon: IconHome },
    { id: 'design', label: 'Desain Undangan', icon: IconInvitation },
    { id: 'guests', label: 'Daftar Tamu', icon: IconUsers },
    { id: 'analytics', label: 'Statistik RSVP', icon: IconSettings },
    { id: 'profile', label: 'Profil Anda', icon: IconUser },
    { id: 'upgrade', label: 'Upgrade Akun', icon: IconSparkleStar },
  ];

  const SidebarContent = () => (
    <div className="saas-scope flex flex-col h-full text-foreground font-sans" style={{ background: "#fff" }}>
      {/* Logo — pinned top */}
      <div className="flex items-center px-5 py-5 border-b shrink-0" style={{ borderColor: "var(--saas-line)" }}>
        <Logo variant="lockup" isLink={false} height="h-9" />
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Project Switcher (multi-project) */}
        {allInvitations && allInvitations.length > 0 && (
          <div className="pt-3">
            <ProjectSwitcher
              currentInvitationId={currentInvitationId || null}
              invitations={allInvitations}
              packageId={user?.packageId || 'demo'}
              onSwitch={(id) => { onSwitchInvitation?.(id); setSidebarOpen(false); }}
              onCreate={(title) => { onCreateInvitation?.(title); setSidebarOpen(false); }}
              onUpdateSlug={onUpdateSlug}
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeSegment === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSegment(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${isActive ? '' : ''}`}
                style={isActive ? { background: "var(--saas-wine-soft)", color: "var(--saas-wine)" } : { color: "var(--saas-muted)" }}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tier Countdown */}
        <TierCountdown
          activatedAt={activatedAt}
          expiresAt={expiresAt}
          packageId={user?.packageId || 'demo'}
          onUpgrade={() => { setActiveSegment('profile'); setSidebarOpen(false); }}
        />

        <div className="p-5 pt-2">
          <button
            onClick={onPublish}
            className="saas-btn-primary w-full !py-3"
          >
            Publish Undangan
          </button>
        </div>
      </div>

      {/* User section — pinned bottom */}
      <div className="p-5 border-t shrink-0" style={{ borderColor: "var(--saas-line)" }}>
        <button
          onClick={() => { setActiveSegment('profile'); setSidebarOpen(false); }}
          className="flex items-center gap-3 mb-6 w-full text-left hover:bg-muted/50 p-2 -m-2 rounded-xl transition cursor-pointer"
        >
          <Avatar className="h-10 w-10 border border-border">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
            ) : null}
            <AvatarFallback className="bg-muted text-foreground text-xs font-bold uppercase">
              {user?.fullName?.substring(0, 2) || 'RH'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold truncate text-foreground">{user?.fullName || 'Pengguna'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </button>
        <button
          onClick={onLogout}
          className="saas-btn-outline w-full !py-2.5 !text-[12px]"
        >
          Keluar Akun
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Kolaboratif Sidebar dengan Hamburger Menu untuk semua viewport */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed top-3 left-4 z-[200] p-3 rounded-full border shadow-sm flex items-center justify-center cursor-pointer"
            style={{ background: "#fff", borderColor: "var(--saas-line)", color: "var(--saas-ink)" }}
            aria-label="Buka menu navigasi"
          >
            <IconMenu size={20} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 z-[300]">
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
