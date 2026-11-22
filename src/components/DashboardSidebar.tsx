'use client';

import React from 'react';
import {
  LayoutDashboard,
  PenLine,
  Palette,
  Film,
  Users,
  BarChart3,
  UserCircle,
  Building2,
  Globe,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ProjectSwitcher from '@/components/ProjectSwitcher';
import { Logo } from '@/components/ui/Logo';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { isEnterpriseTier, normalizePackageId, PACKAGE_NAMES } from '@/lib/packageLimits';
import { SaaSUser } from '@/types';

interface DashboardSidebarProps {
  activeSegment: string;
  setActiveSegment: (s: string) => void;
  user: SaaSUser | null;
  onLogout: () => void;
  onPublish?: () => void;
  isPublished?: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  currentInvitationId?: string | null;
  allInvitations?: {
    id: string;
    title: string;
    slug?: string | null;
    themeId: string;
    isPublished: boolean;
    updatedAt?: string;
  }[];
  onSwitchInvitation?: (invitationId: string) => void;
  onCreateInvitation?: (title: string) => void;
  onUpdateSlug?: (invitationId: string, newSlug: string) => void;
}

const NAV_GROUPS: {
  label: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
      { id: 'design', label: 'Editor Undangan', icon: PenLine },
      { id: 'settings', label: 'Koleksi Tema', icon: Palette },
      { id: 'video', label: 'Video Studio', icon: Film, badge: 'ENT' },
    ],
  },
  {
    label: 'Tamu & Data',
    items: [
      { id: 'guests', label: 'Daftar Tamu', icon: Users },
      { id: 'analytics', label: 'Analitik & RSVP', icon: BarChart3 },
    ],
  },
  {
    label: 'Akun',
    items: [
      { id: 'profile', label: 'Profil & Pengaturan', icon: UserCircle },
      { id: 'upgrade', label: 'Paket & Enterprise', icon: Building2 },
    ],
  },
];

export default function DashboardSidebar({
  activeSegment,
  setActiveSegment,
  user,
  onLogout,
  onPublish,
  isPublished,
  mobileOpen,
  onMobileOpenChange,
  currentInvitationId,
  allInvitations,
  onSwitchInvitation,
  onCreateInvitation,
  onUpdateSlug,
}: DashboardSidebarProps) {
  const isEnt = isEnterpriseTier(user?.packageId);
  const pkgLabel = PACKAGE_NAMES[normalizePackageId(user?.packageId)];

  const handleSelect = (id: string) => {
    setActiveSegment(id);
    onMobileOpenChange(false);
  };

  const sidebarBody = (
    <div className="flex h-full flex-col bg-white/75 backdrop-blur-2xl text-[#2A1E21] font-sans">
      {/* Brand Header */}
      <div className="flex h-14 items-center border-b border-black/[0.06] px-5 shrink-0">
        <Logo variant="lockup" isLink={false} height="h-7" />
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 min-h-0">
        {allInvitations && allInvitations.length > 0 && (
          <div className="px-1">
            <ProjectSwitcher
              currentInvitationId={currentInvitationId || null}
              invitations={allInvitations}
              packageId={user?.packageId || 'free'}
              userSlug={user?.activeSlug}
              onSwitch={(id) => {
                onSwitchInvitation?.(id);
                onMobileOpenChange(false);
              }}
              onCreate={(title) => {
                onCreateInvitation?.(title);
                onMobileOpenChange(false);
              }}
              onUpdateSlug={onUpdateSlug}
            />
          </div>
        )}

        <nav className="space-y-5" aria-label="Navigasi Dashboard">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[12px] font-medium text-[#A99C9C]">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSegment === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#7A2E3B] text-white shadow-[0_8px_20px_-8px_rgba(122, 46, 59,0.65)]'
                          : 'text-[#54464A] hover:bg-white/80 hover:text-[#2A1E21]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {item.badge && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[12px] font-medium ${
                            active
                              ? 'bg-white/25 text-white'
                              : 'bg-[#8C6B34]/12 text-[#8C6B34]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Publish CTA */}
        <div className="px-1 pt-1">
          <button
            type="button"
            onClick={() => {
              onPublish?.();
              onMobileOpenChange(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#94404F] to-[#7A2E3B] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(122, 46, 59,0.65)] transition hover:brightness-105 active:scale-[0.98] cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            <span>{isPublished ? 'Bagikan Undangan' : 'Publish Undangan'}</span>
          </button>
        </div>
      </div>

      {/* User Footer */}
      <div className="border-t border-black/[0.06] p-3 shrink-0">
        <div className="flex items-center gap-2.5 rounded-2xl p-2 hover:bg-white/75 transition">
          <button
            type="button"
            onClick={() => handleSelect('profile')}
            className="flex flex-1 items-center gap-2.5 min-w-0 text-left cursor-pointer"
          >
            <Avatar className="h-9 w-9 border border-white/80 shadow-sm shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : null}
              <AvatarFallback className="bg-[#7A2E3B]/12 text-[#7A2E3B] text-[11px] font-bold uppercase">
                {user?.fullName?.substring(0, 2) || 'RH'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-bold text-[#2A1E21]">
                  {user?.fullName || 'Pengguna'}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[12px] font-medium ${
                    isEnt
                      ? 'bg-[#8C6B34]/14 text-[#8C6B34]'
                      : 'bg-[#3F7A52]/14 text-[#3F7A52]'
                  }`}
                >
                  {pkgLabel}
                </span>
              </div>
              <p className="truncate text-[11px] text-[#7D6F71]">{user?.email || ''}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Keluar Akun"
            aria-label="Keluar Akun"
            className="rounded-xl p-2 text-[#7D6F71] transition hover:bg-[#B03A3A]/12 hover:text-[#B03A3A] cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-[256px] shrink-0 flex-col border-r border-white/80 bg-white/65 backdrop-blur-2xl h-full">
        {sidebarBody}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[276px] p-0 z-[300] bg-white/85 backdrop-blur-2xl">
          <SheetTitle className="sr-only">Menu Navigasi Workspace</SheetTitle>
          {sidebarBody}
        </SheetContent>
      </Sheet>
    </>
  );
}
