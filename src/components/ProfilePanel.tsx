'use client';

import React, { useState, useRef } from 'react';
import { resolvePublicSlug } from '../lib/utils';
import {
  User,
  Mail,
  Phone,
  AtSign,
  Link2,
  Copy,
  Check,
  Camera,
  Loader2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SaaSUser } from '../types';
import { useAlertModal } from '../hooks/useAlertModal';
import { isEnterpriseTier, normalizePackageId, PACKAGE_NAMES } from '../lib/packageLimits';

export default function ProfilePanel({ wedding }: { wedding?: any }) {
  const auth = useAuth();
  const user = auth.currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const alertModal = useAlertModal();

  if (!user) return null;

  const isEnt = isEnterpriseTier(user.packageId);
  const pkgLabel = PACKAGE_NAMES[normalizePackageId(user.packageId)];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alertModal.warning(
        'File Terlalu Besar',
        'Ukuran file maksimal 5MB. Silakan kompres foto terlebih dahulu.'
      );
      return;
    }

    setIsUploading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset || 'rfx_wedding');
      formData.append('folder', `ruanghadir/avatars/${user.id}`);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload gagal.');

      const data = await res.json();
      const avatarUrl = data.secure_url;

      await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
      });

      auth.setCurrentUser({ ...user, avatarUrl });
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const invitations = wedding?.allInvitations || [];
  const appHost = typeof window !== 'undefined' ? window.location.host : 'ruanghadir.net';

  const handleCopySlug = (id: string, fullUrl: string) => {
    navigator.clipboard?.writeText(`https://${fullUrl}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      {/* ── Profile Identity Card ── */}
      <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative group shrink-0">
            <Avatar className="h-20 w-20 border border-[#E1E7F0]">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.fullName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-[#F3F6FB] text-[#1D1D1F] text-lg font-bold uppercase">
                {user.fullName?.substring(0, 2) || 'RH'}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
              aria-label="Ubah foto profil"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-serif text-[22px] leading-tight text-[#1D1D1F]">
              {user.fullName}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B5D54]">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  isEnt
                    ? 'bg-[#EEEDFE] text-[#5856D6]'
                    : 'bg-[#E8F8EC] text-[#1E7E34]'
                }`}
              >
                {isEnt ? <Building2 className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                Paket {pkgLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-2.5 py-1 text-[11px] font-semibold text-[#48484A]">
                <CheckCircle2 className="h-3 w-3 text-[#1E7E34]" />
                Akun Aktif
              </span>
            </div>

            <p className="mt-3 text-[11.5px] text-[#6E6E73]">
              Masuk melalui{' '}
              {user.authProvider === 'enterprise'
                ? 'Portal Enterprise'
                : user.authProvider === 'google'
                ? 'Google'
                : 'Email'}
              {user.registeredAt ? ` · Terdaftar ${user.registeredAt}` : ''}
            </p>
          </div>
        </div>
      </section>

      {/* ── Invitation Links ── */}
      {invitations.length > 0 && (
        <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#6E6E73]">
            <Link2 className="h-3.5 w-3.5 text-[#007AFF]" />
            <span>Tautan Undangan Anda</span>
          </div>

          <div className="divide-y divide-[#F0E9DE] rounded-xl border border-[#ECE4D8] bg-[#F3F6FB]">
            {invitations.map((inv: any) => {
              const displaySlug = resolvePublicSlug(inv.slug, user.activeSlug, invitations.length) || 'undangan';
              const fullUrl = `${appHost}/${displaySlug}`;
              const isCopied = copiedId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-[#1D1D1F]">
                      {inv.title || 'Proyek Undangan'}
                    </p>
                    <p className="truncate font-mono text-[12px] text-[#6B5D54]">
                      {fullUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopySlug(inv.id, fullUrl)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D2DAE6] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1D1D1F] transition hover:bg-[#F5EFE6] cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-[#1E7E34]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-[#6B5D54]" />
                      )}
                      {isCopied ? 'Tersalin' : 'Salin'}
                    </button>
                    <a
                      href={`/${displaySlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#D2DAE6] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#007AFF] transition hover:bg-[#F5EFE6]"
                      title="Buka undangan"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Account Details ── */}
      <section className="rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_10px_30px_-16px_rgba(15,23,42,0.12)] p-6 space-y-4">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#6E6E73]">
          <User className="h-3.5 w-3.5 text-[#007AFF]" />
          <span>Informasi Akun</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <InfoField icon={User} label="Nama Lengkap" value={user.fullName} />
          <InfoField icon={Mail} label="Email" value={user.email} />
          <InfoField icon={User} label="Mempelai Pria" value={user.coupleGroom || '—'} />
          <InfoField icon={User} label="Mempelai Wanita" value={user.coupleBride || '—'} />
          <InfoField icon={Phone} label="WhatsApp" value={user.noWa || '—'} />
          <InfoField icon={AtSign} label="Sosial Media" value={user.sosmed || '—'} />
        </div>
      </section>
    </div>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#EFE9DF] bg-[#F3F6FB] p-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E73]" />
      <div className="min-w-0">
        <span className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E6E73]">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[13.5px] font-semibold text-[#1D1D1F] select-text">
          {value}
        </span>
      </div>
    </div>
  );
}
