/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Calendar,
  BookOpen,
  Image,
  Music,
  Gift,
  Quote,
  Plus,
  Trash2,
  Instagram,
  MapPin,
  Wand2,
  Link2 as Link,
  RefreshCw,
  Upload,
  Search,
  Play,
  Square as Stop,
  Image as ImageSquare,
  Timer,
  CheckCircle2 as Check,
  AlertTriangle,
} from 'lucide-react';
import { WeddingData, LoveStoryItem, DigitalGift } from '../types';
import { convertGoogleDriveUrl } from '../utils/googleDrive';
import { uploadWeddingPhoto as uploadWeddingImage, uploadWeddingAudio } from '../lib/cloudinary';
import { getLimits, isLimitReached, formatLimit, canAccess, type PackageId } from '../lib/packageLimits';
import UpgradePrompt from './UpgradePrompt';
import { useAlertModal } from '../hooks/useAlertModal';

interface EditorPanelProps {
  data: WeddingData;
  onChange: (newData: WeddingData) => void;
  packageId?: string;
}

export default function EditorPanel({ data, onChange, packageId = 'luxury' }: EditorPanelProps) {
  const limits = getLimits(packageId);
  const alertModal = useAlertModal();
  const [activeTab, setActiveTab] = useState<'couple' | 'events' | 'stories' | 'gallery' | 'gifts' | 'quote'>('couple');

  // Upload progress tracking
  const [isUploading, setIsUploading] = useState(false);

  // iTunes music search state
  const [itunesQuery, setItunesQuery] = useState('');
  const [itunesResults, setItunesResults] = useState<any[]>([]);
  const [itunesLoading, setItunesLoading] = useState(false);
  const [itunesPreviewAudio, setItunesPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [itunesPlayingId, setItunesPlayingId] = useState<number | null>(null);

  // Debounced iTunes search
  useEffect(() => {
    if (itunesQuery.trim().length < 2) {
      setItunesResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setItunesLoading(true);
      try {
        const res = await fetch(`/api/music-search?term=${encodeURIComponent(itunesQuery)}`);
        const json = await res.json();
        setItunesResults(json.results || []);
      } catch {
        setItunesResults([]);
      } finally {
        setItunesLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [itunesQuery]);

  // Cleanup preview audio on unmount
  useEffect(() => {
    return () => {
      if (itunesPreviewAudio) {
        itunesPreviewAudio.pause();
        itunesPreviewAudio.src = '';
      }
    };
  }, [itunesPreviewAudio]);

  const handleItunesPreview = (trackId: number, previewUrl: string) => {
    if (itunesPlayingId === trackId) {
      itunesPreviewAudio?.pause();
      setItunesPlayingId(null);
      return;
    }
    if (itunesPreviewAudio) {
      itunesPreviewAudio.pause();
    }
    const audio = new Audio(previewUrl);
    audio.play().catch(() => {}); // Ignore AbortError when pause() interrupts play()
    audio.onended = () => setItunesPlayingId(null);
    setItunesPreviewAudio(audio);
    setItunesPlayingId(trackId);
  };

  const handleSelectItunesTrack = (track: any) => {
    if (itunesPreviewAudio) {
      itunesPreviewAudio.pause();
      setItunesPlayingId(null);
    }
    onChange({
      ...data,
      musicUrl: track.previewUrl,
      musicTitle: `${track.trackName} — ${track.artistName}`
    });
    setItunesQuery('');
    setItunesResults([]);
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return convertGoogleDriveUrl(url);
  };

  // Specific helpers
  const updateGroom = (field: string, value: string) => {
    const processedValue = field === 'photoUrl' ? convertGoogleDriveUrl(value) : value;
    onChange({
      ...data,
      couple: {
        ...data.couple,
        groom: {
          ...data?.couple?.groom,
          [field]: processedValue
        }
      }
    });
  };

  const updateBride = (field: string, value: string) => {
    const processedValue = field === 'photoUrl' ? convertGoogleDriveUrl(value) : value;
    onChange({
      ...data,
      couple: {
        ...data.couple,
        bride: {
          ...data?.couple?.bride,
          [field]: processedValue
        }
      }
    });
  };

  const updateAkad = (field: string, value: any) => {
    onChange({
      ...data,
      events: {
        ...data.events,
        akad: {
          ...data?.events?.akad,
          [field]: value
        }
      }
    });
  };

  const updateResepsi = (field: string, value: any) => {
    onChange({
      ...data,
      events: {
        ...data.events,
        resepsi: {
          ...data?.events?.resepsi,
          [field]: value
        }
      }
    });
  };

  const addStory = () => {
    const currentCount = data?.loveStories?.length || 0;
    if (isLimitReached(packageId, 'maxLoveStories', currentCount)) {
      alertModal.upgrade('Batas Cerita Cinta', `Batas maksimal Cerita Cinta (${formatLimit(limits.maxLoveStories)}) untuk paket Anda telah tercapai. Silakan upgrade.`);
      return;
    }
    const newStory: LoveStoryItem = {
      id: `story-${Date.now()}`,
      year: '2026',
      title: 'Judul Cerita',
      story: 'Ceritakan momen spesial Anda di sini bersama pasangan...',
      imageUrl: 'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg'
    };
    onChange({
      ...data,
      loveStories: [...(data?.loveStories || []), newStory]
    });
  };

  const updateStory = (id: string, field: keyof LoveStoryItem, value: string) => {
    const processedValue = field === 'imageUrl' ? convertGoogleDriveUrl(value) : value;
    const updatedStories = data?.loveStories?.map(story => {
      if (story.id === id) {
        return { ...story, [field]: processedValue };
      }
      return story;
    });
    onChange({
      ...data,
      loveStories: updatedStories
    });
  };

  const removeStory = (id: string) => {
    onChange({
      ...data,
      loveStories: data?.loveStories?.filter(story => story.id !== id)
    });
  };

  const addGiftItem = () => {
    const currentCount = data?.gifts?.length || 0;
    if (isLimitReached(packageId, 'maxGifts', currentCount)) {
      alertModal.upgrade('Batas Kado Digital', `Batas maksimal Kado Digital (${formatLimit(limits.maxGifts)}) untuk paket Anda telah tercapai. Silakan upgrade.`);
      return;
    }
    const newGift: DigitalGift = {
      id: `gift-${Date.now()}`,
      type: 'bank',
      name: 'Bank Jago',
      accountNumber: '102030405060',
      accountHolder: data?.couple?.groom.nickname
    };
    onChange({
      ...data,
      gifts: [...(data?.gifts || []), newGift]
    });
  };

  const updateGiftItem = (id: string, field: keyof DigitalGift, value: string) => {
    const updatedGifts = data?.gifts?.map(gift => {
      if (gift.id === id) {
        return { ...gift, [field]: value };
      }
      return gift;
    });
    onChange({
      ...data,
      gifts: updatedGifts
    });
  };

  const removeGiftItem = (id: string) => {
    onChange({
      ...data,
      gifts: data?.gifts?.filter(gift => gift.id !== id)
    });
  };

  const updateGalleryItem = (index: number, value: string) => {
    const newGallery = [...(data?.gallery || [])];
    newGallery[index] = convertGoogleDriveUrl(value);
    onChange({ ...data, gallery: newGallery });
  };

  const addGalleryItem = () => {
    const currentCount = data?.gallery?.length || 0;
    if (isLimitReached(packageId, 'maxGallery', currentCount)) {
      alertModal.upgrade('Batas Foto Galeri', `Batas maksimal foto galeri (${formatLimit(limits.maxGallery)}) untuk paket Anda telah tercapai. Silakan upgrade.`);
      return;
    }
    onChange({
      ...data,
      gallery: [...(data?.gallery || []), 'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg']
    });
  };

  const removeGalleryItem = (index: number) => {
    onChange({
      ...data,
      gallery: data?.gallery?.filter((_, i) => i !== index)
    });
  };

  const resetToTamuSampel = () => {
    // Re-fill photos with quick placeholder buttons
    onChange({
      ...data,
      couple: {
        groom: {
          ...data?.couple?.groom,
          photoUrl: 'https://lh3.googleusercontent.com/d/1IugI8pHxov6LaSyvLaJ1BhAK_Mo_9WAp'
        },
        bride: {
          ...data?.couple?.bride,
          photoUrl: 'https://lh3.googleusercontent.com/d/1zCuUKGqbl_g75unk6ZfKMrSkjBDX6b7V'
        }
      }
    });
  };

  return (
    <div className="overflow-hidden flex flex-col h-full relative bg-[var(--rh-ivory)]">
      {/* Unified Pro SaaS Sticky Tab Bar */}
      <div className="sticky top-0 z-20 border-b border-[var(--rh-line)] bg-[var(--rh-paper)] px-4 sm:px-6">
        <div
          role="tablist"
          aria-label="Bagian Editor Undangan"
          className="flex items-center gap-1 overflow-x-auto py-2.5"
        >
          {([
            { id: 'couple' as const, label: 'Mempelai', icon: Users },
            { id: 'events' as const, label: 'Detail Acara', icon: Calendar },
            { id: 'stories' as const, label: 'Cerita Cinta', icon: BookOpen },
            { id: 'gallery' as const, label: 'Galeri & Musik', icon: Image },
            { id: 'gifts' as const, label: 'Kado Digital', icon: Gift },
            { id: 'quote' as const, label: 'Kutipan', icon: Quote },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[var(--rh-primary-soft)] text-[var(--rh-primary)]'
                    : 'text-[var(--rh-ink-2)] hover:bg-[var(--rh-ivory)] hover:text-[var(--rh-ink)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area with AnimatePresence */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
        {/* TAB 1: MEMPELAI */}
        {activeTab === 'couple' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Section Header */}
            <div className="flex items-center justify-between bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl p-4 border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--rh-linen)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--rh-primary)]" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--rh-ink)] text-sm">Informasi Mempelai</h4>
                  <p className="text-xs text-[var(--rh-muted)] mt-0.5">Atur biodata kedua calon mempelai</p>
                </div>
              </div>
              <button
                onClick={resetToTamuSampel}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--rh-ink-2)] hover:bg-[var(--rh-paper)] px-3 py-2 rounded-lg border border-[var(--rh-line)] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto Sampel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROOM PANEL */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)] relative overflow-hidden">


                <div className="flex items-center gap-2 border-b border-[var(--rh-line)] pb-2.5">
                  <span className="bg-[var(--rh-primary-soft)] text-[var(--rh-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full">Pria</span>
                  <h5 className="font-bold text-[var(--rh-ink)] text-sm">Mempelai Pria (Groom)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.fullName}
                      onChange={(e) => updateGroom('fullName', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                      placeholder="e.g. Budi Hartono, S.T."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.nickname}
                      onChange={(e) => updateGroom('nickname', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                      placeholder="e.g. Budi"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Ayah</label>
                      <input
                        type="text"
                        value={data?.couple?.groom.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateGroom('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Ibu</label>
                      <input
                        type="text"
                        value={data?.couple?.groom.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateGroom('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.photoUrl}
                      onChange={(e) => updateGroom('photoUrl', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all font-mono text-[var(--rh-muted)] placeholder:text-[var(--rh-muted)]"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Groom */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-[var(--rh-paper)] hover:bg-[var(--rh-primary)] text-[var(--rh-ink-2)] hover:text-[var(--rh-paper)] rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 border border-[var(--rh-line)] hover:border-[var(--rh-line-strong)] shadow-sm hover:shadow-md ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-3 h-3" />
                        <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const result = await uploadWeddingImage(file);
                                updateGroom('photoUrl', result.secureUrl);
                              } catch (err) {
                                console.error('Gagal mengunggah foto pria:', err);
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                        />
                      </label>
                      {data?.couple?.groom.photoUrl?.startsWith('https://res.cloudinary.com') && (
                        <span className="text-[10px] text-[var(--rh-ink-2)] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-[var(--rh-muted)]" />
                      <input
                        type="text"
                        value={data?.couple?.groom.instagram}
                        onChange={(e) => updateGroom('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Deskripsi Singkat</label>
                    <textarea
                      value={data?.couple?.groom.about}
                      onChange={(e) => updateGroom('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-muted)] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* BRIDE PANEL */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)] relative overflow-hidden">


                <div className="flex items-center gap-2 border-b border-[var(--rh-line)] pb-2.5">
                  <span className="bg-[var(--rh-primary-soft)] text-[var(--rh-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full">Wanita</span>
                  <h5 className="font-bold text-[var(--rh-ink)] text-sm">Mempelai Wanita (Bride)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.fullName}
                      onChange={(e) => updateBride('fullName', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                      placeholder="e.g. Salsabila Cantika, M.Ds"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.nickname}
                      onChange={(e) => updateBride('nickname', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                      placeholder="e.g. Salsa"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Ayah</label>
                      <input
                        type="text"
                        value={data?.couple?.bride.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateBride('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Ibu</label>
                      <input
                        type="text"
                        value={data?.couple?.bride.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateBride('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all text-[var(--rh-ink)] placeholder:text-[var(--rh-muted)]"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.photoUrl}
                      onChange={(e) => updateBride('photoUrl', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-muted)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] transition-all font-mono text-[var(--rh-muted)] placeholder:text-[var(--rh-muted)]"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Bride */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-[var(--rh-primary-soft)] hover:bg-[var(--rh-primary)] text-[var(--rh-primary)] hover:text-[var(--rh-paper)] rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 border border-[var(--rh-line-strong)] hover:border-[var(--rh-primary)] shadow-sm hover:shadow-md ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-3 h-3" />
                        <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const result = await uploadWeddingImage(file);
                                updateBride('photoUrl', result.secureUrl);
                              } catch (err) {
                                console.error('Gagal mengunggah foto wanita:', err);
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                        />
                      </label>
                      {data?.couple?.bride.photoUrl?.startsWith('https://res.cloudinary.com') && (
                        <span className="text-[10px] text-[var(--rh-ink-2)] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-[var(--rh-muted)]" />
                      <input
                        type="text"
                        value={data?.couple?.bride.instagram}
                        onChange={(e) => updateBride('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Deskripsi Singkat</label>
                    <textarea
                      value={data?.couple?.bride.about}
                      onChange={(e) => updateBride('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-muted)] resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETIL ACARA */}
        {activeTab === 'events' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl p-4 border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--rh-ivory)] border border-[var(--rh-line)] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[var(--rh-gold-deep)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--rh-ink)] text-sm">Waktu & Tempat Acara</h4>
                <p className="text-xs text-[var(--rh-muted)] mt-0.5">Isi waktu akad dan resepsi dengan benar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AKAD */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)] relative overflow-hidden">


                <div className="flex items-center justify-between border-b border-[var(--rh-line)] pb-2.5">
                  <h5 className="font-bold text-[var(--rh-ink-2)] font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--rh-primary)]" />
                    Sesi 1: Akad Nikah
                  </h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={data?.events?.akad?.enabled !== false}
                      onChange={(e) => updateAkad('enabled', e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-[var(--rh-line-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--rh-paper)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--rh-paper)] after:border-[var(--rh-line-strong)] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--rh-primary)]"></div>
                  </label>
                </div>

                <div className={`space-y-3 transition-opacity ${data?.events?.akad?.enabled === false ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tanggal Akad</label>
                    <input
                      type="date"
                      value={data?.events?.akad?.date}
                      onChange={(e) => updateAkad('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data?.events?.akad?.timeStart}
                        onChange={(e) => updateAkad('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Waktu Selesai</label>
                      <input
                        type="type"
                        value={data?.events?.akad?.timeEnd}
                        onChange={(e) => updateAkad('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data?.events?.akad?.venueName}
                      onChange={(e) => updateAkad('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                      placeholder="Masjid Agung..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Alamat Lengkap</label>
                    <textarea
                      value={data?.events?.akad?.address}
                      onChange={(e) => updateAkad('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-muted)] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-[var(--rh-muted)]" />
                      <input
                        type="text"
                        value={data?.events?.akad?.googleMapsUrl}
                        onChange={(e) => updateAkad('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none font-mono text-[var(--rh-muted)]"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RESEPSI */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)] relative overflow-hidden">


                <div className="flex items-center justify-between border-b border-[var(--rh-line)] pb-2.5">
                  <h5 className="font-bold text-[var(--rh-ink-2)] text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[var(--rh-primary)]" />
                    Sesi 2: Resepsi Pernikahan
                  </h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={data?.events?.resepsi?.enabled !== false}
                      onChange={(e) => updateResepsi('enabled', e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-[var(--rh-line-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--rh-paper)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--rh-paper)] after:border-[var(--rh-line-strong)] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--rh-primary)]"></div>
                  </label>
                </div>

                <div className={`space-y-3 transition-opacity ${data?.events?.resepsi?.enabled === false ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tanggal Resepsi</label>
                    <input
                      type="date"
                      value={data?.events?.resepsi?.date}
                      onChange={(e) => updateResepsi('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data?.events?.resepsi?.timeStart}
                        onChange={(e) => updateResepsi('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Waktu Selesai</label>
                      <input
                        type="text"
                        value={data?.events?.resepsi?.timeEnd}
                        onChange={(e) => updateResepsi('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data?.events?.resepsi?.venueName}
                      onChange={(e) => updateResepsi('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                      placeholder="Ballroom Hotel..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Alamat Lengkap</label>
                    <textarea
                      value={data?.events?.resepsi?.address}
                      onChange={(e) => updateResepsi('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] bg-[var(--rh-paper)] text-[var(--rh-muted)] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-[var(--rh-muted)]" />
                      <input
                        type="text"
                        value={data?.events?.resepsi?.googleMapsUrl}
                        onChange={(e) => updateResepsi('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-[var(--rh-line-strong)] focus:outline-none font-mono text-[var(--rh-muted)]"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CERITA CINTA (LOVE STORY) */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            {/* Show/Hide Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--rh-paper)] border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)] rounded-2xl">
              <div>
                <span className="font-bold text-[var(--rh-ink)] text-xs block">Tampilkan Bagian Cerita Cinta</span>
                <span className="text-[10px] text-[var(--rh-muted)]">Aktifkan atau sembunyikan seluruh bagian perjalanan kisah cinta pada halaman undangan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data?.showLoveStories !== false}
                  onChange={(e) => onChange({ ...data, showLoveStories: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--rh-line-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--rh-paper)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--rh-paper)] after:border-[var(--rh-line-strong)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--rh-primary)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[var(--rh-ink)] text-sm">Garis Waktu Perjalanan Kisah Cinta</h4>
                <p className="text-xs text-[var(--rh-muted)] mt-1">Ceritakan momen pertama kali bertemu hingga memutuskan membina keluarga.</p>
              </div>
              <button
                type="button"
                onClick={addStory}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--rh-primary)] text-[var(--rh-paper)] rounded-full text-xs font-bold hover:bg-[var(--rh-primary)] transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Momen
              </button>
            </div>

            {data?.showLoveStories === false && (
              <div className="p-3.5 bg-[var(--rh-paper)] border border-[var(--rh-line-strong)] text-[var(--rh-ink)] rounded-2xl text-[11.5px] font-medium leading-relaxed animate-fade-in flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--rh-ink-2)] mt-0.5" />
                <span>Bagian <strong>Perjalanan Kisah Cinta</strong> saat ini dinonaktifkan (disembunyikan) pada halaman web undangan. Pengunjung tidak akan melihat kisah cinta ini di pratinjau utama, tetapi Anda masih bisa menyimpan dan mengedit data momen di bawah ini.</span>
              </div>
            )}

            <div className={`space-y-4 ${data?.showLoveStories === false ? 'opacity-65 transition-opacity' : ''}`}>
              {data?.loveStories?.map((story, index) => (
                <details key={story.id} className="rounded-[1.5rem] border border-[var(--rh-line)] bg-[var(--rh-paper)] backdrop-blur-md shadow-sm relative group overflow-hidden transition-all duration-300">
                  <summary className="cursor-pointer px-5 py-4 bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] text-sm font-bold text-[var(--rh-ink)] flex items-center justify-between border-b border-transparent group-open:border-[var(--rh-line)] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="bg-[var(--rh-primary)] text-[var(--rh-paper)] w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-mono shadow-sm">{index + 1}</span>
                      <span>{story.title || "Kisah Baru"}</span>
                    </div>
                    <span className="text-[10px] text-[var(--rh-muted)] font-normal group-open:hidden">Edit ▼</span>
                  </summary>
                  <div className="p-5 space-y-4 bg-[var(--rh-paper)] relative">
                    <button
                      type="button"
                      onClick={() => removeStory(story.id)}
                      className="absolute top-2 right-2 p-1.5 bg-[var(--rh-linen)] text-[var(--rh-ink-2)] hover:bg-[var(--rh-line)] rounded-lg transition-colors"
                      title="Hapus Momen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tahun Kejadian</label>
                      <input
                        type="text"
                        value={story.year}
                        onChange={(e) => updateStory(story.id, 'year', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)] font-mono"
                        placeholder="e.g. 2021"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Judul Kejadian</label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => updateStory(story.id, 'title', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                        placeholder="e.g. Pertama Bertemu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Isi Cerita</label>
                    <textarea
                      value={story.story}
                      onChange={(e) => updateStory(story.id, 'story', e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-muted)]"
                      placeholder="Tulis penjelasan mendalam..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Foto Ilustrasi (URL)</label>
                    <input
                      type="text"
                      value={story.imageUrl || ''}
                      onChange={(e) => updateStory(story.id, 'imageUrl', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] font-mono text-[var(--rh-muted)]"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Story Moment */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] text-[var(--rh-ink-2)] font-bold rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border border-[var(--rh-line)] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload className="w-3 h-3" />
                        <span>{isUploading ? 'Mengunggah...' : 'Unggah Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const result = await uploadWeddingImage(file);
                                updateStory(story.id, 'imageUrl', result.secureUrl);
                              } catch (err) {
                                console.error('Gagal mengunggah foto cerita:', err);
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                        />
                      </label>
                      {story.imageUrl?.startsWith('https://res.cloudinary.com') && (
                        <span className="text-[10px] text-[var(--rh-ink-2)] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY & MUSIC */}
        {activeTab === 'gallery' && (
          <div className="space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-3 bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl p-4 border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--rh-ivory)] border border-[var(--rh-line)] flex items-center justify-center">
                <Image className="w-5 h-5 text-[var(--rh-ink-2)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--rh-ink)] text-sm">Galeri & Musik</h4>
                <p className="text-xs text-[var(--rh-muted)] mt-0.5">Foto, musik, dan digital pass</p>
              </div>
            </div>
            {/* Show/Hide Digital Pass Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--rh-paper)] border border-[var(--rh-line-strong)] rounded-2xl shadow-sm">
              <div>
                <span className="font-bold text-[var(--rh-ink)] text-xs block">Digital Entry Pass (QR Check-in)</span>
                <span className="text-[10px] text-[var(--rh-muted)]">Aktifkan tiket QR check-in untuk tamu undangan</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.enableDigitalPass !== false}
                  onChange={(e) => onChange({ ...data, enableDigitalPass: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--rh-line-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--rh-paper)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--rh-paper)] after:border-[var(--rh-line-strong)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--rh-primary)]"></div>
              </label>
            </div>

            <div>
              <h4 className="font-bold text-[var(--rh-ink)] text-sm">Media & Musik Latar</h4>
              <p className="text-xs text-[var(--rh-muted)] mt-1">Masukkan tautan foto dan musik romantis untuk melengkapi kemeriahan atmosfer undangan digital.</p>
            </div>

            {/* Live Streaming */}
            <div className="p-4 bg-[var(--rh-paper)] border border-[var(--rh-line-strong)] rounded-2xl shadow-sm space-y-2">
              <span className="font-bold text-[var(--rh-ink)] text-xs block">Live Streaming</span>
              <span className="text-[10px] text-[var(--rh-muted)] block">Tautan YouTube/Instagram Live. Kosongkan bila tidak dipakai.</span>
              <input
                value={data.liveStreamUrl || ''}
                onChange={(e) => onChange({ ...data, liveStreamUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... atau https://instagram.com/..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] bg-[var(--rh-paper)]"
              />
              <input
                value={data.liveStreamLabel || ''}
                onChange={(e) => onChange({ ...data, liveStreamLabel: e.target.value })}
                placeholder="Label tombol (opsional)"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line-strong)] bg-[var(--rh-paper)]"
              />
            </div>

            {/* Show/Hide Live Moments (Guest Camera + Voice Wishes) */}
            <div className="flex items-center justify-between p-4 bg-[var(--rh-paper)] border border-[var(--rh-line-strong)] rounded-2xl shadow-sm">
              <div>
                <span className="font-bold text-[var(--rh-ink)] text-xs block">Live Moments (Kamera Tamu & Ucapan Suara)</span>
                <span className="text-[10px] text-[var(--rh-muted)]">Tamu bisa mengirim foto ke dinding momen dan merekam ucapan suara</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.enableLiveMoments !== false}
                  onChange={(e) => onChange({ ...data, enableLiveMoments: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[var(--rh-line-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--rh-paper)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--rh-paper)] after:border-[var(--rh-line-strong)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--rh-primary)]"></div>
              </label>
            </div>
            <div className="p-5 border border-[var(--rh-line)] rounded-2xl bg-[var(--rh-paper)] space-y-4 shadow-sm relative overflow-hidden">

              <h5 className="font-bold text-[var(--rh-ink)] text-xs flex items-center gap-1.5">
                <ImageSquare className="w-4 h-4 text-[var(--rh-primary)]" /> Gambar Sampul & Latar Belakang (OG & BG Image)
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OG Image / Cover */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--rh-muted)]">OG Image Halaman Awal (Sampul/Gate)</label>
                  <input
                    type="text"
                    value={data?.ogImageUrl || ''}
                    onChange={(e) => onChange({ ...data, ogImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] font-mono text-[var(--rh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)]"
                    placeholder="Tautan URL gambar sampul halaman awal..."
                  />
                  {data?.ogImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-[var(--rh-line)]">
                      <img src={getImageUrl(data?.ogImageUrl)} alt="OG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--rh-primary)] hover:bg-[var(--rh-primary-hover)] text-[var(--rh-paper)] font-bold rounded-lg text-[10px] cursor-pointer transition-all duration-200 active:scale-95 border border-[var(--rh-line)] border-[var(--rh-primary)] shadow-sm">
                      <Upload className="w-3 h-3" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsUploading(true);
                              const result = await uploadWeddingImage(file);
                              onChange({ ...data, ogImageUrl: result.secureUrl });
                            } catch (err) {
                              console.error('Gagal mengunggah foto OG:', err);
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, ogImageUrl: 'https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r' })}
                      className="text-[9.5px] px-2 py-1 bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-lg text-[var(--rh-muted)] font-bold hover:bg-[var(--rh-paper)] transition"
                    >
                      Atur Ulang Sampul Bawaan
                    </button>
                  </div>
                </div>

                {/* BG Image / Web Background */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--rh-muted)]">BG Image Setelah Masuk Undangan</label>
                  <input
                    type="text"
                    value={data?.bgImageUrl || ''}
                    onChange={(e) => onChange({ ...data, bgImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] font-mono text-[var(--rh-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)]"
                    placeholder="Tautan URL gambar latar belakang undangan..."
                  />
                  {data?.bgImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-[var(--rh-line)]">
                      <img src={getImageUrl(data?.bgImageUrl)} alt="BG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--rh-primary)] hover:bg-[var(--rh-primary-hover)] text-[var(--rh-paper)] font-bold rounded-lg text-[10px] cursor-pointer transition-all duration-200 active:scale-95 border border-[var(--rh-line)] border-[var(--rh-primary)] shadow-sm">
                      <Upload className="w-3 h-3" />
                      <span>Unggah</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setIsUploading(true);
                              const result = await uploadWeddingImage(file);
                              onChange({ ...data, bgImageUrl: result.secureUrl });
                            } catch (err) {
                              console.error('Gagal mengunggah foto BG:', err);
                            } finally {
                              setIsUploading(false);
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => onChange({ ...data, bgImageUrl: 'https://lh3.googleusercontent.com/d/1UoKVxvP08iYb7tS91UU6iwkLXvigkwVE' })}
                      className="text-[9.5px] px-2 py-1 bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-lg text-[var(--rh-muted)] font-bold hover:bg-[var(--rh-paper)] transition"
                    >
                      Atur Ulang BG Bawaan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MUSIC SECTION WITH CUSTOM AUDIO FILE UPLOADER */}
            <div className="p-5 border border-[var(--rh-line)] rounded-2xl bg-[var(--rh-paper)] space-y-4 shadow-sm relative overflow-hidden">

              <h5 className="font-bold text-[var(--rh-ink)] text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Musik Pengiring Pernikahan (Audio MP3/WAV)
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Judul Lagu</label>
                  <input
                    type="text"
                    value={data?.musicTitle}
                    onChange={(e) => onChange({ ...data, musicTitle: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)] font-medium"
                    placeholder="Judul Lagu / Musik Instrument"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tautan MP3 (URL)</label>
                  <input
                    type="text"
                    value={data?.musicUrl}
                    onChange={(e) => onChange({ ...data, musicUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-muted)] font-mono text-[11px]"
                    placeholder="https://domain.com/music.mp3"
                  />
                </div>
              </div>

              {/* SLICK AUDIO FILE UPLOADER */}
              <div className="border border-dashed border-[var(--rh-line-strong)] p-4 rounded-xl bg-[var(--rh-ivory)] flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--rh-ink)]">Unggah File Musik Kustom Anda</p>
                  <p className="text-[10px] text-[var(--rh-muted)] mt-0.5">Mendukung file .mp3, .wav, atau audio sejenis (disimpan di Cloudinary cloud storage).</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--rh-primary)] hover:bg-[var(--rh-primary-hover)] text-[var(--rh-paper)] rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border border-[var(--rh-primary)] active:scale-95">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setIsUploading(true);
                            const result = await uploadWeddingAudio(file);
                            onChange({
                              ...data,
                              musicUrl: result.secureUrl,
                              musicTitle: `Kustom: ${file.name}`
                            });
                          } catch (err) {
                            console.error('Gagal mengunggah musik kustom:', err);
                          } finally {
                            setIsUploading(false);
                          }
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...data,
                        musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                        musicTitle: 'Beautiful Piano - Canon in D'
                      });
                    }}
                    className="px-3.5 py-2 border border-[var(--rh-line)] text-[var(--rh-muted)] hover:bg-[var(--rh-paper)] hover:text-[var(--rh-ink)] bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    Atur Ulang
                  </button>
                </div>
              </div>
            </div>

            {/* ITUNES / APPLE MUSIC SEARCH */}
            <div className="p-5 border border-[var(--rh-line)] rounded-2xl bg-[var(--rh-paper)] space-y-4 shadow-sm relative overflow-hidden">

              <h5 className="font-bold text-[var(--rh-ink)] text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Cari Lagu dari Apple Music / iTunes
              </h5>
              <p className="text-[10px] text-[var(--rh-muted)] leading-relaxed">
                Ketik judul atau artis lagu untuk mencari musik pengiring pernikahan. Klik tombol <strong>Gunakan</strong> untuk langsung memasang lagu sebagai musik latar undangan.
              </p>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--rh-muted)]" />
                <input
                  type="text"
                  value={itunesQuery}
                  onChange={(e) => setItunesQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--rh-primary-soft)] focus:border-[var(--rh-line-strong)] transition-all"
                  placeholder="Cari lagu, misal: Perfect Ed Sheeran, A Thousand Years..."
                />
                {itunesLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="w-4 h-4 border-2 border-[var(--rh-line-strong)] border-t-[var(--rh-primary)] rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {itunesResults.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {itunesResults.map((track: any) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] hover:border-[var(--rh-line-strong)] transition-all duration-200 group"
                    >
                      {/* Album Art */}
                      <img
                        src={track.artworkUrl100}
                        alt={track.trackName}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0 border border-[var(--rh-line)]"
                      />

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--rh-ink)] truncate">{track.trackName}</p>
                        <p className="text-[10px] text-[var(--rh-muted)] truncate">{track.artistName}</p>
                        <p className="text-[9px] text-[var(--rh-muted)] truncate">{track.collectionName}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Preview Play/Stop */}
                        {track.previewUrl && (
                          <button
                            type="button"
                            onClick={() => handleItunesPreview(track.trackId, track.previewUrl)}
                            className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                              itunesPlayingId === track.trackId
                                ? 'bg-[var(--rh-primary)] text-[var(--rh-paper)] border-[var(--rh-line-strong)] shadow-md'
                                : 'bg-[var(--rh-paper)] text-[var(--rh-muted)] border-[var(--rh-line)] hover:bg-[var(--rh-primary)] hover:text-[var(--rh-ink-2)] hover:border-[var(--rh-line-strong)]'
                            }`}
                            title={itunesPlayingId === track.trackId ? 'Hentikan pratinjau' : 'Dengarkan pratinjau 30 detik'}
                          >
                            {itunesPlayingId === track.trackId ? <Stop className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Use Track Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectItunesTrack(track)}
                          className="px-3 py-2 bg-[var(--rh-paper)] hover:bg-[var(--rh-primary)] text-[var(--rh-ink-2)] hover:text-[var(--rh-paper)] rounded-lg text-[10px] font-bold border border-[var(--rh-line)] hover:border-[var(--rh-line-strong)] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          Gunakan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {itunesQuery.trim().length >= 2 && !itunesLoading && itunesResults.length === 0 && (
                <p className="text-[11px] text-[var(--rh-muted)] text-center py-4">
                  Tidak ditemukan lagu untuk pencarian "{itunesQuery}". Coba kata kunci lain.
                </p>
              )}
            </div>
            {/* NOVELTY GRID GALLERY DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-[var(--rh-ink)] text-xs flex items-center gap-1.5">
                  <Image className="w-4 h-4" /> Daftar Foto Prewedding (Tautan URL)
                </h5>
                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--rh-line)] rounded-full text-xs font-medium text-[var(--rh-muted)] hover:bg-[var(--rh-paper)] hover:text-[var(--rh-ink)] transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Foto
                </button>
              </div>

              <div className="space-y-2">
                {data?.gallery?.map((img, idx) => (
                  <details key={idx} className="group border border-[var(--rh-line)] rounded-2xl bg-[var(--rh-paper)] backdrop-blur-sm overflow-hidden transition-all shadow-sm">
                    <summary className="cursor-pointer px-4 py-3 bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] text-xs font-bold text-[var(--rh-ink)] flex items-center justify-between border-b border-transparent group-open:border-[var(--rh-line)] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="bg-[var(--rh-primary)] text-[var(--rh-paper)] w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{idx + 1}</span>
                        <span>Foto {idx + 1}</span>
                      </div>
                      <span className="text-[10px] text-[var(--rh-muted)] font-normal">Edit ▼</span>
                    </summary>
                    <div className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[var(--rh-paper)]">
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => updateGalleryItem(idx, e.target.value)}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] font-mono text-[var(--rh-muted)]"
                          placeholder="Masukkan URL foto..."
                        />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto pl-7 sm:pl-0">
                      <label className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--rh-paper)] hover:bg-[var(--rh-paper)] text-[var(--rh-ink-2)] font-bold rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 border border-[var(--rh-line)]">
                        <Upload className="w-3 h-3" />
                        <span>Unggah</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const result = await uploadWeddingImage(file);
                                updateGalleryItem(idx, result.secureUrl);
                              } catch (err) {
                                console.error('Gagal mengunggah foto galeri:', err);
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(idx)}
                        className="p-1.5 text-[var(--rh-ink-2)] hover:bg-[var(--rh-paper)] rounded-lg transition"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL GIFT */}
        {activeTab === 'gifts' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl p-4 border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--rh-ivory)] border border-[var(--rh-line)] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[var(--rh-ink-2)]" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--rh-ink)] text-sm">Kado Digital</h4>
                  <p className="text-xs text-[var(--rh-muted)] mt-0.5">Rekening bank atau e-wallet untuk hadiah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addGiftItem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--rh-primary)] text-[var(--rh-paper)] rounded-lg text-xs font-semibold hover:bg-[var(--rh-primary-hover)] transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            <div className="space-y-4">
              {data?.gifts?.map((gift) => (
                <div key={gift.id} className="p-4 border border-[var(--rh-line)] rounded-2xl bg-[var(--rh-paper)] space-y-3 relative group shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">


                  <button
                    type="button"
                    onClick={() => removeGiftItem(gift.id)}
                    className="absolute top-4 right-4 p-1 rounded-lg bg-[var(--rh-paper)] text-[var(--rh-ink-2)] hover:bg-[var(--rh-paper)] text-[var(--rh-ink-2)]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Tipe Metode</label>
                      <select
                        value={gift.type}
                        onChange={(e) => updateGiftItem(gift.id, 'type', e.target.value as any)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)]"
                      >
                        <option value="bank">Rekening Bank</option>
                        <option value="e-wallet">Dompet Digital (E-Wallet)</option>
                        <option value="address">Alamat Pengiriman Kado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Layanan (BCA, Mandiri, Gopey, dll)</label>
                      <input
                        type="text"
                        value={gift.name}
                        onChange={(e) => updateGiftItem(gift.id, 'name', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)]"
                        placeholder="e.g. Bank Mandiri"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        value={gift.accountHolder}
                        onChange={(e) => updateGiftItem(gift.id, 'accountHolder', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)]"
                        placeholder="e.g. Rian Aditama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">
                      {gift.type === 'address' ? 'Alamat Detail Pengiriman' : 'Nomor Rekening / No. HP'}
                    </label>
                    <input
                      type="text"
                      value={gift.accountNumber}
                      onChange={(e) => updateGiftItem(gift.id, 'accountNumber', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                      placeholder={gift.type === 'address' ? 'Lokasi lengkap pengiriman kado fisik...' : '8415XXXX'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: QUOTE & COUNTDOWN */}
        {activeTab === 'quote' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-[var(--rh-paper)] border border-[var(--rh-line)] rounded-xl p-4 border border-[var(--rh-line)] transition duration-200 hover:shadow-xl hover:border-[var(--rh-line-strong)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--rh-primary-soft)] flex items-center justify-center">
                <Quote className="w-5 h-5 text-[var(--rh-primary)]" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--rh-ink)] text-sm">Kutipan & Countdown</h4>
                <p className="text-xs text-[var(--rh-muted)] mt-0.5">Kata mutiara dan hitung mundur ke hari H</p>
              </div>
            </div>

            <div className="space-y-4 p-5 border border-[var(--rh-line-strong)] rounded-2xl bg-[var(--rh-paper)] shadow-sm relative overflow-hidden">

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[var(--rh-ink-2)] tracking-wide">Kata Mutiara / Quote Undangan</label>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/ai/invitation-copy', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            type: 'quote',
                            tone: 'islami',
                            groomName: data?.couple?.groom?.nickname || 'Mempelai Pria',
                            brideName: data?.couple?.bride?.nickname || 'Mempelai Wanita',
                          }),
                        });
                        const resData = await res.json();
                        if (resData.success && (resData.quote || resData.text)) {
                          onChange({
                            ...data,
                            quoteText: resData.quote || resData.text,
                            quoteSource: resData.source || data?.quoteSource || 'QS. Ar-Rum: 21',
                          });
                        }
                      } catch (err) {
                        console.error('Gagal generate quote AI:', err);
                      }
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--rh-primary)] hover:text-[var(--rh-primary-hover)] bg-[var(--rh-primary-soft)] hover:bg-[var(--rh-primary-soft)] px-2 py-0.5 rounded-md transition"
                  >
                    <Wand2 className="w-3 h-3" /> Susun Otomatis
                  </button>
                </div>
                <textarea
                  value={data?.quoteText}
                  onChange={(e) => onChange({ ...data, quoteText: e.target.value })}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-muted)]"
                  placeholder="Isi kutipan suci pernikahan..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Sumber Kutipan (Akar Sunnah/Alkitab/Tokoh)</label>
                <input
                  type="text"
                  value={data?.quoteSource}
                  onChange={(e) => onChange({ ...data, quoteSource: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)]"
                  placeholder="e.g. QS. Ar-Rum: 21, Kolose 3:14, dll"
                />
              </div>

              <div className="border-t border-[var(--rh-line)] pt-4">
                <h5 className="font-bold text-[var(--rh-ink)] text-xs mb-3 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-[var(--rh-ink-2)]" />
                  Waktu Hitung Mundur (Countdown Target)
                </h5>

                <div>
                  <label className="block text-xs font-semibold text-[var(--rh-ink-2)] mb-1.5 tracking-wide">Hari & Jam Mulai Akad</label>
                  <input
                    type="datetime-local"
                    value={data?.countdownDate?.substring(0, 16) || ''}
                    onChange={(e) => onChange({ ...data, countdownDate: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[var(--rh-line)] bg-[var(--rh-paper)] text-[var(--rh-ink)] font-mono"
                  />
                  <span className="text-[10px] text-[var(--rh-muted)] block mt-1.5">Format waktu: standar waktu lokal setempat. Hitung mundur akan dipicu berakhir tepat sewaktu akad nikah berlangsung.</span>
                </div>
              </div>
            </div>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
