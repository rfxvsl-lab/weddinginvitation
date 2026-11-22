'use client';

import React, { useState } from 'react';
import {
  Eye,
  Users,
  CheckCircle2,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Globe,
  ArrowRight,
  Palette,
  PenLine,
  Building2,
  Circle,
  ShieldCheck,
} from 'lucide-react';
import type { SaaSUser, WeddingData, Guest, RSVP, WeddingAnalytics } from '@/types';
import { isEnterpriseTier, PACKAGE_NAMES, normalizePackageId } from '@/lib/packageLimits';

interface DashboardOverviewProps {
  user: SaaSUser;
  weddingData: WeddingData;
  invitation: {
    id: string;
    slug?: string | null;
    themeId: string;
    isPublished: boolean;
    title?: string;
  } | null;
  guests: Guest[];
  rsvps: RSVP[];
  analytics: WeddingAnalytics;
  onNavigate: (
    segment: 'overview' | 'design' | 'settings' | 'guests' | 'analytics' | 'profile' | 'upgrade'
  ) => void;
  onPublish: () => void;
}

export default function DashboardOverview({
  user,
  weddingData,
  invitation,
  guests,
  rsvps,
  analytics,
  onNavigate,
  onPublish,
}: DashboardOverviewProps) {
  const [copied, setCopied] = useState(false);

  const slug = invitation?.slug || user.activeSlug || '';
  const liveUrl = slug ? `https://ruanghadir.net/${slug}` : 'https://ruanghadir.net';
  const isPublished = Boolean(invitation?.isPublished);
  const isEnt = isEnterpriseTier(user.packageId);
  const pkgLabel = PACKAGE_NAMES[normalizePackageId(user.packageId)];

  const groomNick = weddingData?.couple?.groom?.nickname || user.coupleGroom || 'Mempelai Pria';
  const brideNick = weddingData?.couple?.bride?.nickname || user.coupleBride || 'Mempelai Wanita';

  const attendingCount = rsvps.filter((r) => r.status === 'Hadir').length;
  const totalGuestsAttending = analytics?.totalGuestsAttending || 0;
  const totalGuestsCount = guests.length;
  const totalViews = analytics?.viewsCount || 0;
  const totalWishes = rsvps.length;

  // Readiness checklist computed from real user data
  const hasCoupleNames = Boolean(
    weddingData?.couple?.groom?.fullName?.trim() && weddingData?.couple?.bride?.fullName?.trim()
  );
  const hasEventInfo = Boolean(
    weddingData?.events?.akad?.date?.trim() || weddingData?.events?.resepsi?.date?.trim()
  );
  const hasGallery = (weddingData?.gallery?.length || 0) > 0;
  const hasGuests = guests.length > 0;

  const checklist = [
    {
      id: 'couple',
      label: 'Lengkapi data kedua mempelai',
      done: hasCoupleNames,
      actionLabel: 'Isi Profil',
      onAction: () => onNavigate('design'),
    },
    {
      id: 'events',
      label: 'Atur tanggal & lokasi acara',
      done: hasEventInfo,
      actionLabel: 'Atur Jadwal',
      onAction: () => onNavigate('design'),
    },
    {
      id: 'gallery',
      label: 'Unggah foto galeri prewedding',
      done: hasGallery,
      actionLabel: 'Unggah Foto',
      onAction: () => onNavigate('design'),
    },
    {
      id: 'guests',
      label: 'Tambahkan daftar tamu & link personal',
      done: hasGuests,
      actionLabel: 'Kelola Tamu',
      onAction: () => onNavigate('guests'),
    },
    {
      id: 'publish',
      label: 'Terbitkan undangan ke tautan publik',
      done: isPublished,
      actionLabel: 'Publish',
      onAction: onPublish,
    },
  ];

  const completedSteps = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  const handleCopy = () => {
    if (!slug) return;
    navigator.clipboard?.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const recentRsvps = rsvps.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      {/* ── Workspace Header Card ── */}
      <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  isPublished
                    ? 'bg-[#E8F8EC] text-[#1E7E34]'
                    : 'bg-[#EEEDFE] text-[#9A6B1E]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isPublished ? 'bg-[#1E7E34]' : 'bg-[#C6933A]'
                  }`}
                />
                {isPublished ? 'Aktif & Publik' : 'Draft Belum Diterbitkan'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-2.5 py-0.5 text-[11px] font-semibold text-[#48484A]">
                {isEnt ? (
                  <Building2 className="h-3 w-3 text-[#007AFF]" />
                ) : (
                  <ShieldCheck className="h-3 w-3 text-[#1E7E34]" />
                )}
                Paket {pkgLabel}
              </span>
            </div>

            <h1 className="font-serif text-[26px] leading-tight text-[#1D1D1F] sm:text-[30px]">
              {groomNick} &amp; {brideNick}
            </h1>
            <p className="text-[13px] text-[#6B5D54]">
              Kelola konten, tema, daftar tamu, dan pantau kehadiran dari satu workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('design')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D2DAE6] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1D1D1F] transition hover:bg-[#F3F6FB] cursor-pointer"
            >
              <PenLine className="h-4 w-4 text-[#007AFF]" />
              Edit Konten
            </button>
            <button
              type="button"
              onClick={onPublish}
              className="inline-flex items-center gap-2 rounded-xl bg-[#007AFF] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0062CC] cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              {isPublished ? 'Bagikan Undangan' : 'Publish Undangan'}
            </button>
          </div>
        </div>

        {/* Live URL Strip */}
        {slug && (
          <div className="mt-5 flex flex-col gap-2 rounded-xl border border-[#ECE4D8] bg-[#F3F6FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E6E73]">
                Tautan Undangan
              </span>
              <span className="block truncate font-mono text-[13px] font-medium text-[#1D1D1F]">
                {liveUrl}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2DAE6] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1D1D1F] transition hover:bg-[#F5EFE6] cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-[#1E7E34]" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#6B5D54]" />
                )}
                {copied ? 'Tersalin' : 'Salin Link'}
              </button>
              {isPublished && (
                <a
                  href={`/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2DAE6] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1D1D1F] transition hover:bg-[#F5EFE6]"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#007AFF]" />
                  Buka
                </a>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── 4 Real KPI Cards ── */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          {
            label: 'Total Kunjungan',
            value: totalViews.toLocaleString('id-ID'),
            sub: `${analytics?.visitorLogs?.length || 0} log aktivitas`,
            icon: Eye,
            accent: '#007AFF',
            onClick: () => onNavigate('analytics'),
          },
          {
            label: 'Konfirmasi Hadir',
            value: attendingCount.toLocaleString('id-ID'),
            sub: `${totalGuestsAttending} estimasi pax`,
            icon: CheckCircle2,
            accent: '#1E7E34',
            onClick: () => onNavigate('analytics'),
          },
          {
            label: 'Daftar Tamu',
            value: totalGuestsCount.toLocaleString('id-ID'),
            sub: 'Nama undangan tersimpan',
            icon: Users,
            accent: '#9A6B1E',
            onClick: () => onNavigate('guests'),
          },
          {
            label: 'Ucapan Masuk',
            value: totalWishes.toLocaleString('id-ID'),
            sub: 'Buku tamu digital',
            icon: MessageSquare,
            accent: '#5B4B8A',
            onClick: () => onNavigate('analytics'),
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              className="group rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-4 text-left transition hover:border-[#CBBCA6] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#6B5D54]">{kpi.label}</span>
                <Icon className="h-4 w-4" style={{ color: kpi.accent }} />
              </div>
              <p className="mt-2.5 text-[28px] font-bold tracking-tight text-[#1D1D1F] tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-1 text-[11.5px] text-[#6E6E73]">{kpi.sub}</p>
            </button>
          );
        })}
      </section>

      {/* ── Main 2-Column Studio Grid ── */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Readiness Checklist */}
        <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6 lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-bold text-[#1D1D1F]">Checklist Kesiapan Undangan</h2>
              <p className="mt-0.5 text-[12.5px] text-[#6B5D54]">
                {completedSteps} dari {checklist.length} langkah selesai
              </p>
            </div>
            <span className="text-[13px] font-bold tabular-nums text-[#007AFF]">
              {progressPct}%
            </span>
          </div>

          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-[#EFE9DF]">
            <div
              className="h-full rounded-full bg-[#007AFF] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <ul className="mt-5 divide-y divide-[#F0E9DE]">
            {checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.done ? (
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-[#1E7E34]" />
                  ) : (
                    <Circle className="h-4.5 w-4.5 shrink-0 text-[#C9BDAE]" />
                  )}
                  <span
                    className={`truncate text-[13.5px] ${
                      item.done ? 'text-[#6E6E73] line-through' : 'font-medium text-[#1D1D1F]'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {!item.done && (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#E2D9CB] px-2.5 py-1 text-[12px] font-semibold text-[#1D1D1F] transition hover:bg-[#F3F6FB] cursor-pointer"
                  >
                    {item.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Quick Actions Footer */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-[#F0E9DE] pt-4">
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="flex items-center justify-between rounded-xl border border-[#ECE4D8] bg-[#F3F6FB] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#1D1D1F] transition hover:border-[#CFC1AE] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-[#007AFF]" />
                Ganti Tema
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[#6E6E73]" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('guests')}
              className="flex items-center justify-between rounded-xl border border-[#ECE4D8] bg-[#F3F6FB] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#1D1D1F] transition hover:border-[#CFC1AE] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#9A6B1E]" />
                Tambah Tamu
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[#6E6E73]" />
            </button>
          </div>
        </div>

        {/* Right: Recent RSVP & Plan Status */}
        <div className="space-y-6 lg:col-span-5">
          {/* Recent RSVP */}
          <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#1D1D1F]">RSVP &amp; Ucapan Terbaru</h2>
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                className="text-[12px] font-semibold text-[#007AFF] hover:underline cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            {recentRsvps.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[#DFD6C7] bg-[#F3F6FB] p-5 text-center">
                <p className="text-[13px] font-semibold text-[#1D1D1F]">Belum ada ucapan masuk</p>
                <p className="mt-1 text-[12px] text-[#6B5D54]">
                  Bagikan tautan undangan Anda agar tamu bisa mengirim konfirmasi kehadiran.
                </p>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {recentRsvps.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-[#F0E9DE] bg-[#FCFBF8] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-[#1D1D1F]">
                        {entry.guestName}
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          entry.status === 'Hadir'
                            ? 'bg-[#E8F8EC] text-[#1E7E34]'
                            : entry.status === 'Tidak Hadir'
                            ? 'bg-[#FFEBEA] text-[#D70015]'
                            : 'bg-[#EEEDFE] text-[#9A6B1E]'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    {entry.wishes && (
                      <p className="mt-1 line-clamp-2 text-[12px] text-[#6B5D54]">
                        {entry.wishes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Plan Card */}
          <div className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6E73]">
                  Status Layanan
                </span>
                <h3 className="mt-1 text-[15px] font-bold text-[#1D1D1F]">
                  {isEnt ? 'RuangHadir Enterprise' : 'RuangHadir Full Gratis'}
                </h3>
                <p className="mt-1 text-[12px] text-[#6B5D54]">
                  {isEnt
                    ? `Akses organisasi aktif${user.companyDomain ? ` (${user.companyDomain})` : ''}.`
                    : 'Semua tema, tamu tanpa batas, dan publish instan aktif tanpa biaya.'}
                </p>
              </div>
              <Building2 className="h-5 w-5 shrink-0 text-[#007AFF]" />
            </div>
            <button
              type="button"
              onClick={() => onNavigate('upgrade')}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#D2DAE6] bg-[#F3F6FB] px-3.5 py-2 text-[12.5px] font-semibold text-[#1D1D1F] transition hover:bg-[#F2ECE2] cursor-pointer"
            >
              {isEnt ? 'Kelola Akses Enterprise' : 'Info & Aktivasi Enterprise'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
