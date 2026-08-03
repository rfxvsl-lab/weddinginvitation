'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconUser, IconMail, IconPhone, IconInstagram, IconLink, IconUpload, IconImage } from './Icons';
import {
  PiCheckCircleDuotone as CheckCircle,
  PiPencilSimpleDuotone as PencilIcon,
  PiCrownDuotone as CrownIcon,
  PiCopyDuotone as CopyIcon,
  PiCheckDuotone as CheckIcon,
  PiCameraDuotone as CameraIcon,
  PiArrowsClockwiseDuotone as RefreshIcon,
} from 'react-icons/pi';
import { SaaSUser } from '../types';
import { useAlertModal } from '../hooks/useAlertModal';

const PACKAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  demo:    { label: 'Demo (Gratis)', color: 'text-zinc-600', bg: 'bg-zinc-100 border-zinc-300' },
  reguler: { label: 'Reguler',       color: 'text-zinc-700', bg: 'bg-zinc-100 border-zinc-300' },
  medium:  { label: 'Medium',        color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' },
  premium: { label: 'Premium',       color: 'text-amber-800', bg: 'bg-amber-100 border-amber-400' },
  luxury:  { label: 'Luxury',        color: 'text-zinc-900', bg: 'bg-amber-300 border-amber-500' },
};

export default function ProfilePanel({ wedding }: { wedding?: any }) {
  const auth = useAuth();
  const user = auth.currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const alertModal = useAlertModal();

  if (!user) return null;

  const pkg = PACKAGE_META[user.packageId] || PACKAGE_META.demo;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alertModal.warning('File Terlalu Besar', 'Ukuran file maksimal 5MB. Silakan kompres foto terlebih dahulu.');
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

      // Update user avatar in DB
      await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, avatarUrl }),
      });

      // Update local state
      auth.setCurrentUser({ ...user, avatarUrl });
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-transparent p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition duration-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar with upload */}
            <div className="relative group shrink-0">
              <Avatar className="h-24 w-24 border-2 border-zinc-200 shadow-md">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xl font-bold uppercase">
                  {user.fullName?.substring(0, 2) || 'RH'}
                </AvatarFallback>
              </Avatar>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <RefreshIcon className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <CameraIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold uppercase tracking-widest bg-white border border-zinc-200 px-1.5 py-0.5 rounded-full text-zinc-500 shadow-sm">
                Edit
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-xl font-bold text-zinc-900">{user.fullName}</h2>
              <p className="text-sm text-zinc-500">{user.email}</p>
              
              {/* Package Badge */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${pkg.bg} ${pkg.color}`}>
                  <CrownIcon className="w-3.5 h-3.5" />
                  Paket {pkg.label}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  user.paymentStatus === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                    : user.paymentStatus === 'pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-red-50 border-red-300 text-red-600'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  {user.paymentStatus === 'success' ? 'Aktif' : user.paymentStatus === 'pending' ? 'Pending' : 'Gagal'}
                </span>
              </div>

              {/* Registration date */}
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider">
                Terdaftar: {user.registeredAt || 'N/A'} · via {user.authProvider === 'google' ? 'Google' : 'Email'}
              </p>
            </div>
          </div>
        </div>

        {/* Daftar Link Undangan Proyek */}
        <ProjectSlugsList user={user} wedding={wedding} />

        {/* Detail Informasi */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition duration-200 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <IconUser size={14} /> Informasi Akun
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField icon={<IconUser size={16} />} label="Nama Lengkap" value={user.fullName} />
            <InfoField icon={<IconMail size={16} />} label="Email" value={user.email} />
            <InfoField icon={<IconUser size={16} />} label="Mempelai Pria" value={user.coupleGroom} />
            <InfoField icon={<IconUser size={16} />} label="Mempelai Wanita" value={user.coupleBride} />
            <InfoField icon={<IconPhone size={16} />} label="No. WhatsApp" value={user.noWa || '-'} />
            <InfoField icon={<IconInstagram size={16} />} label="Sosial Media" value={user.sosmed || '-'} />
          </div>
        </div>

        {/* Paket Detail */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition duration-200 space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <CrownIcon className="w-3.5 h-3.5" /> Detail Paket
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField icon={<CrownIcon className="w-4 h-4" />} label="Paket Saat Ini" value={pkg.label} highlight={pkg.color} />
            <InfoField icon={<CheckCircle className="w-4 h-4" />} label="Status Pembayaran" value={user.paymentStatus === 'success' ? 'Lunas' : user.paymentStatus === 'pending' ? 'Belum Dibayar' : 'Gagal'} />
            <InfoField icon={<PencilIcon className="w-4 h-4" />} label="Mode Pembuatan" value={user.isCustomByRfx ? 'Terima Beres (RFX)' : 'Buat Sendiri'} />
            <InfoField icon={<IconLink size={16} />} label="Slug Undangan" value={user.activeSlug} />
          </div>
        </div>

      </div>
    </div>
  );
}

function ProjectSlugsList({ user, wedding }: { user: SaaSUser; wedding?: any }) {
  const alertModal = useAlertModal();
  
  const invitations = wedding?.allInvitations || [];
  const appHost = typeof window !== 'undefined' ? window.location.host : 'ruanghadir.net';
  
  if (invitations.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition duration-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
          <IconLink size={14} /> Daftar Link Undangan Anda
        </h3>
      </div>
      
      <div className="space-y-3">
        {invitations.map((inv: any) => {
          const displaySlug = inv.slug || user.activeSlug || 'demo';
          const fullUrl = `${appHost}/${displaySlug}`;
          
          return (
            <div key={inv.id} className="bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-6 lg:p-7 flex flex-col sm:flex-row gap-3 ring-1 ring-zinc-900/5 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-bold text-zinc-800 truncate">{inv.title || 'Proyek Undangan'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-600 truncate">{fullUrl}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${fullUrl}`);
                    alertModal.success('Berhasil Disalin', `Tautan undangan ${inv.title} berhasil disalin ke clipboard.`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CopyIcon className="w-3.5 h-3.5" /> Salin
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-zinc-400 mt-2">
        <span className="text-amber-500 font-bold">*</span> Anda dapat mengubah nama tautan (slug) untuk setiap proyek melalui menu navigasi proyek di bar navigasi atas.
      </p>
    </div>
  );
}

function InfoField({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
      <div className="text-zinc-400 mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">{label}</span>
        <span className={`text-sm font-medium truncate block ${highlight || 'text-zinc-800'}`}>{value}</span>
      </div>
    </div>
  );
}
