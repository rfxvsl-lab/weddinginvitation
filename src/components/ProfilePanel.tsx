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
  reguler: { label: 'Reguler',       color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300' },
  medium:  { label: 'Medium',        color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300' },
  premium: { label: 'Premium',       color: 'text-amber-600', bg: 'bg-amber-50 border-amber-300' },
  luxury:  { label: 'Luxury',        color: 'text-rose-600', bg: 'bg-rose-50 border-rose-300' },
};

export default function ProfilePanel() {
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
    <div className="h-full overflow-y-auto bg-zinc-50/50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm">
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

        {/* Slug / Link Undangan (editable) */}
        <SlugEditor user={user} auth={auth} />

        {/* Detail Informasi */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
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
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
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

function SlugEditor({ user, auth }: { user: SaaSUser; auth: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(user.activeSlug || '');
  const [slugError, setSlugError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const alertModal = useAlertModal();

  const profileSlugUrl = `ruanghadir.net/${user.activeSlug}`;

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setNewSlug(clean);
    setSlugError('');
  };

  const handleSaveSlug = async () => {
    if (!newSlug || newSlug.length < 3) {
      setSlugError('Slug minimal 3 karakter.');
      return;
    }
    if (newSlug === user.activeSlug) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setSlugError('');
    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, activeSlug: newSlug }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSlugError(data.error || 'Gagal update slug.');
        return;
      }

      // Update local state
      const savedSlug = data.activeSlug || newSlug;
      auth.setCurrentUser({ ...user, activeSlug: savedSlug });
      setIsEditing(false);

      // Show inline success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Also show modal
      alertModal.success('Slug Diperbarui', `Link undangan Anda sekarang: ruanghadir.net/${savedSlug}`);
    } catch (err: any) {
      console.error('[SlugEditor] Save failed:', err);
      setSlugError(err.message || 'Gagal menyimpan. Periksa koneksi internet Anda.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySlug = () => {
    navigator.clipboard.writeText(`https://${profileSlugUrl}`);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
          <IconLink size={14} /> Link Undangan Anda
        </h3>
        {!isEditing && (
          <button
            onClick={() => { setIsEditing(true); setNewSlug(user.activeSlug || ''); setSaveSuccess(false); }}
            className="flex items-center gap-1 text-[10px] font-bold text-violet-600 hover:text-violet-800 uppercase tracking-wider transition cursor-pointer"
          >
            <PencilIcon className="w-3 h-3" /> Edit Slug
          </button>
        )}
      </div>

      {/* Success banner */}
      {saveSuccess && !isEditing && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] text-emerald-700 font-medium">Slug berhasil diperbarui!</p>
        </div>
      )}

      {!isEditing ? (
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
          <span className="flex-1 text-sm font-mono text-zinc-700 truncate select-all">
            {profileSlugUrl}
          </span>
          <button
            onClick={handleCopySlug}
            className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition cursor-pointer shrink-0"
          >
            {copiedSlug ? <CheckIcon className="w-4 h-4 text-emerald-500" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
            <span className="text-xs text-zinc-400 font-mono pl-4 shrink-0">ruanghadir.net/</span>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 py-3 pr-4 text-sm font-mono text-zinc-800 bg-transparent outline-none"
              placeholder="nama-pasangan"
              autoFocus
            />
          </div>

          {/* Slug length indicator */}
          <p className={`text-[10px] ${newSlug.length < 3 ? 'text-red-400' : 'text-zinc-400'}`}>
            {newSlug.length}/50 karakter {newSlug.length < 3 && '(minimal 3)'}
          </p>

          {slugError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <p className="text-[11px] text-red-600 font-medium">{slugError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSaveSlug}
              disabled={isSaving || !newSlug || newSlug.length < 3}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-40 transition cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Slug'}
            </button>
            <button
              onClick={() => { setIsEditing(false); setSlugError(''); }}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}
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
