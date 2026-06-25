'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { useAuth } from '../../../hooks/useAuth';
import { PiUserDuotone as User, PiCheckCircleDuotone as CheckCircle, PiCameraDuotone as Camera, PiWarningCircleDuotone as AlertCircle } from 'react-icons/pi';
import { updateUserProfile, checkSlugExists } from '../../../lib/api';
import { getLimits } from '../../../lib/packageLimits';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [activeSlug, setActiveSlug] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setActiveSlug(currentUser.activeSlug || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-rose-500"></div>
      </div>
    );
  }

  const limits = getLimits(currentUser.packageId);
  const maxSlugChanges = limits.slugChanges;
  const canChangeSlug = maxSlugChanges > 0;
  const changesLeft = maxSlugChanges === Infinity ? Infinity : maxSlugChanges - (currentUser.slugChangeCount || 0);

  const handleSave = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Validasi Minimal 2 Kata untuk Nama
    if (fullName.trim().split(' ').length < 2) {
      setErrorMsg('Nama Lengkap harus terdiri dari minimal 2 kata.');
      return;
    }

    if (!activeSlug.trim()) {
      setErrorMsg('Slug undangan tidak boleh kosong.');
      return;
    }

    // Validasi Slug Format (mirip regex slug)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(activeSlug)) {
      setErrorMsg('Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).');
      return;
    }

    setIsSaving(true);
    try {
      let finalSlugChangeCount = currentUser.slugChangeCount || 0;
      
      // Jika slug berubah, cek kuota dan ketersediaan
      if (activeSlug !== currentUser.activeSlug) {
        if (!canChangeSlug) {
          throw new Error(`Paket ${currentUser.packageId} tidak mengizinkan pergantian slug.`);
        }
        if (changesLeft <= 0 && currentUser.packageId !== 'luxury') {
          throw new Error('Jatah ganti slug Anda sudah habis.');
        }
        
        const exists = await checkSlugExists(activeSlug, currentUser.id);
        if (exists) {
          throw new Error('Slug tersebut sudah digunakan orang lain. Silakan pilih yang lain.');
        }
        
        finalSlugChangeCount += 1;
      }

      await updateUserProfile(currentUser.id, {
        fullName: fullName.trim(),
        activeSlug: activeSlug.trim(),
        avatarUrl: avatarUrl.trim(),
        slugChangeCount: finalSlugChangeCount
      });

      setCurrentUser({
        ...currentUser,
        fullName: fullName.trim(),
        activeSlug: activeSlug.trim(),
        avatarUrl: avatarUrl.trim(),
        slugChangeCount: finalSlugChangeCount
      });

      setSuccessMsg('Profil berhasil diperbarui!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans">
      <Navigation isDashboard={true} />
      
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Edit Profile</h1>
          <p className="text-[var(--text-secondary)]">Kelola identitas dan preferensi akun Anda di sini.</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row gap-10">
            
            {/* Kiri: Foto Profil */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center relative group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest text-center max-w-[120px]">
                URL Foto Profil (Avatar)
              </p>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="mt-2 w-full max-w-[150px] text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center"
              />
            </div>

            {/* Kanan: Form */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium text-slate-800"
                  placeholder="Misal: John Doe"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">Minimal 2 kata (dipisahkan spasi).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Slug Undangan</span>
                  {canChangeSlug && (
                    <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      Sisa Ganti: {changesLeft}x
                    </span>
                  )}
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono">
                    ruanghadir.net/
                  </span>
                  <input 
                    type="text" 
                    value={activeSlug}
                    onChange={(e) => setActiveSlug(e.target.value)}
                    disabled={!canChangeSlug || (changesLeft <= 0 && activeSlug === currentUser.activeSlug)}
                    className="w-full px-4 py-3 rounded-r-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-mono text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                {!canChangeSlug && (
                  <p className="text-[11px] text-amber-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Paket Anda saat ini tidak mengizinkan ganti slug.
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary rounded-xl px-8 py-3 text-sm font-bold shadow-[var(--shadow-glow-rose)] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
