'use client';

import React from 'react';
import {
  LayoutDashboard,
  PenLine,
  Palette,
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
  // Multi-project
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

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
      { id: 'design', label: 'Editor Undangan', icon: PenLine },
      { id: 'settings', label: 'Koleksi Tema', icon: Palette },
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
] as const;

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
    <div className="flex h-full flex-col bg-white text-[#1C1614] font-sans">
      {/* Brand Header */}
      <div className="flex h-14 items-center border-b border-[#EAE3D8] px-5 shrink-0">
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
              <p className="mb-1.5 px-3 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#9A8C82]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSegment === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#8E2F45]/10 text-[#8E2F45]'
                          : 'text-[#5C4E45] hover:bg-[#FAF6F0] hover:text-[#1C1614]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8E2F45] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#732336] cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            <span>{isPublished ? 'Bagikan Undangan' : 'Publish Undangan'}</span>
          </button>
        </div>
      </div>

      {/* User Footer */}
      <div className="border-t border-[#EAE3D8] p-3 shrink-0">
        <div className="flex items-center gap-2.5 rounded-xl p-2 hover:bg-[#FAF6F0] transition">
          <button
            type="button"
            onClick={() => handleSelect('profile')}
            className="flex flex-1 items-center gap-2.5 min-w-0 text-left cursor-pointer"
          >
            <Avatar className="h-9 w-9 border border-[#E6DFD3] shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : null}
              <AvatarFallback className="bg-[#FAF6F0] text-[#1C1614] text-[11px] font-bold uppercase">
                {user?.fullName?.substring(0, 2) || 'RH'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-bold text-[#1C1614]">
                  {user?.fullName || 'Pengguna'}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${
                    isEnt
                      ? 'bg-[#FBF4E6] text-[#8A611C]'
                      : 'bg-[#EEF6F0] text-[#2D7A4F]'
                  }`}
                >
                  {pkgLabel}
                </span>
              </div>
              <p className="truncate text-[11px] text-[#8B7D74]">{user?.email || ''}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Keluar Akun"
            aria-label="Keluar Akun"
            className="rounded-lg p-2 text-[#8B7D74] transition hover:bg-[#FBECEA] hover:text-[#9B2C2C] cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-[#EAE3D8] bg-white h-full">
        {sidebarBody}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[272px] p-0 z-[300]">
          <SheetTitle className="sr-only">Menu Navigasi Workspace</SheetTitle>
          {sidebarBody}
        </SheetContent>
      </Sheet>
    </>
  );
}
