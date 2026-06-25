/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiHeartDuotone as Heart, 
  PiCalendarDuotone as Calendar, 
  PiBookOpenDuotone as BookOpen, 
  PiImageDuotone as Image, 
  PiMusicNotesDuotone as Music, 
  PiGiftDuotone as Gift, 
  PiQuotesDuotone as Quote, 
  PiPlusDuotone as Plus, 
  PiTrashDuotone as Trash2, 
  PiInstagramLogoDuotone as Instagram, 
  PiMapPinDuotone as MapPin, 
  PiSparkleDuotone as Sparkles,
  PiLinkDuotone as Link,
  PiArrowsClockwiseDuotone as RefreshCw,
  PiUploadDuotone as Upload,
  PiMagnifyingGlassDuotone as Search,
  PiPlayDuotone as Play,
  PiStopDuotone as Stop,
  PiImageSquareDuotone as ImageSquare,
  PiTimerDuotone as Timer,
  PiCheckCircleDuotone as Check,
  PiWarningDuotone as AlertTriangle
} from 'react-icons/pi';
import { WeddingData, LoveStoryItem, DigitalGift } from '../types';
import { convertGoogleDriveUrl } from '../utils/googleDrive';
import { uploadWeddingPhoto as uploadWeddingImage, uploadWeddingAudio } from '../lib/cloudinary';
import { getLimits, isLimitReached, formatLimit, canAccess, type PackageId } from '../lib/packageLimits';
import UpgradePrompt from './UpgradePrompt';
import { useAlertModal } from '../hooks/useAlertModal';
import { FloatingDock } from './ui/floating-dock';

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
    <div className="overflow-hidden flex flex-col h-full relative">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-pink-50" />
        {/* Floating decorative orbs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-amber-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      {/* Mobile Tab Bar — horizontal scroll pills */}
      <div className="relative z-10 flex md:hidden gap-1.5 px-3 py-2.5 bg-white/80 backdrop-blur-xl border-b border-zinc-200/40 overflow-x-auto custom-scrollbar-tabs">
        {([
          { id: 'couple' as const, label: 'Mempelai', icon: Heart, color: 'text-rose-500' },
          { id: 'events' as const, label: 'Acara', icon: Calendar, color: 'text-amber-500' },
          { id: 'stories' as const, label: 'Cerita', icon: BookOpen, color: 'text-violet-500' },
          { id: 'gallery' as const, label: 'Galeri', icon: Image, color: 'text-sky-500' },
          { id: 'gifts' as const, label: 'Kado', icon: Gift, color: 'text-emerald-500' },
          { id: 'quote' as const, label: 'Kutipan', icon: Quote, color: 'text-fuchsia-500' },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-200'
                  : 'text-zinc-500 bg-zinc-100/80 hover:bg-zinc-200/80 font-medium'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Desktop FloatingDock — macOS-style magnetic dock */}
      <div className="relative z-10 hidden md:flex justify-center py-3 bg-white/60 backdrop-blur-xl border-b border-zinc-200/40">
        <FloatingDock
          desktopClassName="shadow-xl shadow-zinc-200/40 border-zinc-200/50"
          items={[
            { title: 'Mempelai', icon: <Heart className="h-full w-full text-rose-500" />, onClick: () => setActiveTab('couple'), active: activeTab === 'couple' },
            { title: 'Detail Acara', icon: <Calendar className="h-full w-full text-amber-500" />, onClick: () => setActiveTab('events'), active: activeTab === 'events' },
            { title: 'Cerita Cinta', icon: <BookOpen className="h-full w-full text-violet-500" />, onClick: () => setActiveTab('stories'), active: activeTab === 'stories' },
            { title: 'Galeri & Musik', icon: <Image className="h-full w-full text-sky-500" />, onClick: () => setActiveTab('gallery'), active: activeTab === 'gallery' },
            { title: 'Kado Digital', icon: <Gift className="h-full w-full text-emerald-500" />, onClick: () => setActiveTab('gifts'), active: activeTab === 'gifts' },
            { title: 'Kutipan', icon: <Quote className="h-full w-full text-fuchsia-500" />, onClick: () => setActiveTab('quote'), active: activeTab === 'quote' },
          ]}
        />
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
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 text-sm">Informasi Mempelai</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Atur biodata kedua calon mempelai</p>
                </div>
              </div>
              <button
                onClick={resetToTamuSampel}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ganti Foto Sampel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROOM PANEL */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-zinc-200 bg-white transition duration-200 hover:shadow-xl hover:border-zinc-300 relative overflow-hidden">
                {/* Aksen garis gradasi atas Groom */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                  <span className="bg-rose-500 text-white text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Pria</span>
                  <h5 className="font-bold text-zinc-800 text-sm">Mempelai Pria (Groom)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.fullName}
                      onChange={(e) => updateGroom('fullName', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                      placeholder="e.g. Budi Hartono, S.T."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.nickname}
                      onChange={(e) => updateGroom('nickname', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                      placeholder="e.g. Budi"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Ayah</label>
                      <input
                        type="text"
                        value={data?.couple?.groom.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateGroom('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Ibu</label>
                      <input
                        type="text"
                        value={data?.couple?.groom.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateGroom('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data?.couple?.groom.photoUrl}
                      onChange={(e) => updateGroom('photoUrl', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all font-mono text-zinc-500 placeholder:text-zinc-400"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Groom */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 border border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={data?.couple?.groom.instagram}
                        onChange={(e) => updateGroom('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Deskripsi Singkat</label>
                    <textarea
                      value={data?.couple?.groom.about}
                      onChange={(e) => updateGroom('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* BRIDE PANEL */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-zinc-200 bg-white transition duration-200 hover:shadow-xl hover:border-zinc-300 relative overflow-hidden">
                {/* Aksen garis gradasi atas Bride */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/30 via-accent to-accent/30" />
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-2.5">
                  <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Wanita</span>
                  <h5 className="font-bold text-zinc-800 text-sm">Mempelai Wanita (Bride)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.fullName}
                      onChange={(e) => updateBride('fullName', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                      placeholder="e.g. Salsabila Cantika, M.Ds"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.nickname}
                      onChange={(e) => updateBride('nickname', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                      placeholder="e.g. Salsa"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Ayah</label>
                      <input
                        type="text"
                        value={data?.couple?.bride.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateBride('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Ibu</label>
                      <input
                        type="text"
                        value={data?.couple?.bride.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateBride('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all text-zinc-800 placeholder:text-zinc-400"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data?.couple?.bride.photoUrl}
                      onChange={(e) => updateBride('photoUrl', e.target.value)}
                      className="w-full text-sm px-4 py-2.5 rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-zinc-50/50 hover:bg-white transition-all font-mono text-zinc-500 placeholder:text-zinc-400"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Bride */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-accent-light hover:bg-accent text-accent hover:text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all duration-200 active:scale-95 border border-accent/20 hover:border-accent shadow-sm hover:shadow-md ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={data?.couple?.bride.instagram}
                        onChange={(e) => updateBride('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Deskripsi Singkat</label>
                    <textarea
                      value={data?.couple?.bride.about}
                      onChange={(e) => updateBride('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-500 resize-none"
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
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-800 text-sm">Waktu & Tempat Acara</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Isi waktu akad dan resepsi dengan benar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AKAD */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-zinc-200 bg-white transition duration-200 hover:shadow-xl hover:border-zinc-300 relative overflow-hidden">
                {/* Aksen garis gradasi atas Akad */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-400" />
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <h5 className="font-bold text-rose-600 font-bold text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Sesi 1: Akad Nikah
                  </h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={data?.events?.akad?.enabled !== false}
                      onChange={(e) => updateAkad('enabled', e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>

                <div className={`space-y-3 transition-opacity ${data?.events?.akad?.enabled === false ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tanggal Akad</label>
                    <input
                      type="date"
                      value={data?.events?.akad?.date}
                      onChange={(e) => updateAkad('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data?.events?.akad?.timeStart}
                        onChange={(e) => updateAkad('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-none bg-white text-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Waktu Selesai</label>
                      <input
                        type="type"
                        value={data?.events?.akad?.timeEnd}
                        onChange={(e) => updateAkad('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-none bg-white text-zinc-800"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data?.events?.akad?.venueName}
                      onChange={(e) => updateAkad('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                      placeholder="Masjid Agung..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Alamat Lengkap</label>
                    <textarea
                      value={data?.events?.akad?.address}
                      onChange={(e) => updateAkad('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={data?.events?.akad?.googleMapsUrl}
                        onChange={(e) => updateAkad('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none font-mono text-zinc-500"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RESEPSI */}
              <div className="group/bento space-y-4 p-5 rounded-xl border border-zinc-200 bg-white transition duration-200 hover:shadow-xl hover:border-zinc-300 relative overflow-hidden">
                {/* Aksen garis gradasi atas Resepsi */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary/30 via-secondary to-secondary/30" />
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <h5 className="font-bold text-rose-600 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    Sesi 2: Resepsi Pernikahan
                  </h5>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={data?.events?.resepsi?.enabled !== false}
                      onChange={(e) => updateResepsi('enabled', e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>

                <div className={`space-y-3 transition-opacity ${data?.events?.resepsi?.enabled === false ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tanggal Resepsi</label>
                    <input
                      type="date"
                      value={data?.events?.resepsi?.date}
                      onChange={(e) => updateResepsi('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data?.events?.resepsi?.timeStart}
                        onChange={(e) => updateResepsi('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-none bg-white text-zinc-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Waktu Selesai</label>
                      <input
                        type="text"
                        value={data?.events?.resepsi?.timeEnd}
                        onChange={(e) => updateResepsi('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-300 focus:outline-none bg-white text-zinc-800"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data?.events?.resepsi?.venueName}
                      onChange={(e) => updateResepsi('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-800"
                      placeholder="Ballroom Hotel..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Alamat Lengkap</label>
                    <textarea
                      value={data?.events?.resepsi?.address}
                      onChange={(e) => updateResepsi('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 bg-white text-zinc-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={data?.events?.resepsi?.googleMapsUrl}
                        onChange={(e) => updateResepsi('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none font-mono text-zinc-500"
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
            <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300 rounded-2xl">
              <div>
                <span className="font-bold text-zinc-800 text-xs block">Tampilkan Bagian Cerita Cinta</span>
                <span className="text-[10px] text-zinc-400">Aktifkan atau sembunyikan seluruh bagian perjalanan kisah cinta pada halaman undangan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data?.showLoveStories !== false}
                  onChange={(e) => onChange({ ...data, showLoveStories: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-800 text-sm">Garis Waktu Perjalanan Kisah Cinta</h4>
                <p className="text-xs text-zinc-500 mt-1">Ceritakan momen pertama kali bertemu hingga memutuskan membina keluarga.</p>
              </div>
              <button
                type="button"
                onClick={addStory}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500 text-white rounded-full text-xs font-bold hover:bg-rose-500/90 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Momen
              </button>
            </div>

            {data?.showLoveStories === false && (
              <div className="p-3.5 bg-white border border-zinc-300 text-zinc-800 rounded-2xl text-[11.5px] font-medium leading-relaxed animate-fade-in flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>Bagian <strong>Perjalanan Kisah Cinta</strong> saat ini dinonaktifkan (disembunyikan) pada halaman web undangan. Pengunjung tidak akan melihat kisah cinta ini di pratinjau utama, tetapi Anda masih bisa menyimpan dan mengedit data momen di bawah ini.</span>
              </div>
            )}

            <div className={`space-y-4 ${data?.showLoveStories === false ? 'opacity-65 transition-opacity' : ''}`}>
              {data?.loveStories?.map((story) => (
                <div key={story.id} className="p-5 border border-zinc-200 rounded-2xl bg-white space-y-3 relative group shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  {/* Aksen garis gradasi atas Cerita */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
                  <button
                    type="button"
                    onClick={() => removeStory(story.id)}
                    className="absolute top-4 right-4 p-1.5 bg-white text-rose-600 hover:bg-white text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Momen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tahun Kejadian</label>
                      <input
                        type="text"
                        value={story.year}
                        onChange={(e) => updateStory(story.id, 'year', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-mono"
                        placeholder="e.g. 2021"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Judul Kejadian</label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => updateStory(story.id, 'title', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800"
                        placeholder="e.g. Pertama Bertemu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Isi Cerita</label>
                    <textarea
                      value={story.story}
                      onChange={(e) => updateStory(story.id, 'story', e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-500"
                      placeholder="Tulis penjelasan mendalam..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Foto Ilustrasi (URL)</label>
                    <input
                      type="text"
                      value={story.imageUrl || ''}
                      onChange={(e) => updateStory(story.id, 'imageUrl', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-400"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Story Moment */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-white text-rose-600 font-bold rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border border-zinc-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Cloud
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY & MUSIC */}
        {activeTab === 'gallery' && (
          <div className="space-y-5">
            {/* Section Header */}
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <Image className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-800 text-sm">Galeri & Musik</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Foto, musik, dan digital pass</p>
              </div>
            </div>
            {/* Show/Hide Digital Pass Toggle */}
            <div className="flex items-center justify-between p-4 bg-white border border-zinc-300 rounded-2xl shadow-sm">
              <div>
                <span className="font-bold text-zinc-800 text-xs block">Digital Entry Pass (QR Check-in)</span>
                <span className="text-[10px] text-zinc-400">Aktifkan tiket QR check-in untuk tamu undangan</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.enableDigitalPass !== false}
                  onChange={(e) => onChange({ ...data, enableDigitalPass: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>

            <div>
              <h4 className="font-bold text-zinc-800 text-sm">Media & Musik Latar</h4>
              <p className="text-xs text-zinc-500 mt-1">Masukkan tautan foto dan musik romantis untuk melengkapi kemeriahan atmosfer undangan digital.</p>
            </div>

            {/* OG IMAGE & BG IMAGE CONFIGURATION */}
            <div className="p-5 border border-zinc-200 rounded-2xl bg-emerald-50/10 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-300/30 via-emerald-500 to-emerald-300/30" />
              <h5 className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                <ImageSquare className="w-4 h-4 text-emerald-500" /> Gambar Sampul & Latar Belakang (OG & BG Image)
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OG Image / Cover */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-500">OG Image Halaman Awal (Sampul/Gate)</label>
                  <input
                    type="text"
                    value={data?.ogImageUrl || ''}
                    onChange={(e) => onChange({ ...data, ogImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                    placeholder="Tautan URL gambar sampul halaman awal..."
                  />
                  {data?.ogImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-zinc-200">
                      <img src={getImageUrl(data?.ogImageUrl)} alt="OG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-lg text-[10px] cursor-pointer transition-all duration-200 active:scale-95 border border-emerald-200 hover:border-emerald-600 shadow-sm">
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
                      className="text-[9.5px] px-2 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-500 font-bold hover:bg-white transition"
                    >
                      Atur Ulang Sampul Bawaan
                    </button>
                  </div>
                </div>

                {/* BG Image / Web Background */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-500">BG Image Setelah Masuk Undangan</label>
                  <input
                    type="text"
                    value={data?.bgImageUrl || ''}
                    onChange={(e) => onChange({ ...data, bgImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                    placeholder="Tautan URL gambar latar belakang undangan..."
                  />
                  {data?.bgImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-zinc-200">
                      <img src={getImageUrl(data?.bgImageUrl)} alt="BG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold rounded-lg text-[10px] cursor-pointer transition-all duration-200 active:scale-95 border border-emerald-200 hover:border-emerald-600 shadow-sm">
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
                      className="text-[9.5px] px-2 py-1 bg-white border border-zinc-200 rounded-lg text-zinc-500 font-bold hover:bg-white transition"
                    >
                      Atur Ulang BG Bawaan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MUSIC SECTION WITH CUSTOM AUDIO FILE UPLOADER */}
            <div className="p-5 border border-zinc-200 rounded-2xl bg-violet-50/15 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-300/30 via-violet-500 to-violet-300/30" />
              <h5 className="font-bold text-violet-700 text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Musik Pengiring Pernikahan (Audio MP3/WAV)
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Judul Lagu</label>
                  <input
                    type="text"
                    value={data?.musicTitle}
                    onChange={(e) => onChange({ ...data, musicTitle: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-medium"
                    placeholder="Judul Lagu / Musik Instrument"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tautan MP3 (URL)</label>
                  <input
                    type="text"
                    value={data?.musicUrl}
                    onChange={(e) => onChange({ ...data, musicUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 font-mono text-[11px]"
                    placeholder="https://domain.com/music.mp3"
                  />
                </div>
              </div>

              {/* SLICK AUDIO FILE UPLOADER */}
              <div className="border border-dashed border-violet-200 p-4 rounded-xl bg-violet-50/5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="text-left">
                  <p className="text-xs font-bold text-violet-800">Unggah File Musik Kustom Anda</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Mendukung file .mp3, .wav, atau audio sejenis (disimpan di Cloudinary cloud storage).</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border border-violet-200 hover:border-violet-600 active:scale-95">
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
                    className="px-3.5 py-2 border border-zinc-200 text-zinc-500 hover:bg-white hover:text-zinc-800 bg-white rounded-xl text-xs font-bold transition active:scale-95"
                  >
                    Atur Ulang
                  </button>
                </div>
              </div>
            </div>

            {/* ITUNES / APPLE MUSIC SEARCH */}
            <div className="p-5 border border-zinc-200 rounded-2xl bg-rose-50/10 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-300/30 via-rose-400 to-rose-300/30" />
              <h5 className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Cari Lagu dari Apple Music / iTunes
              </h5>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Ketik judul atau artis lagu untuk mencari musik pengiring pernikahan. Klik tombol <strong>Gunakan</strong> untuk langsung memasang lagu sebagai musik latar undangan.
              </p>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={itunesQuery}
                  onChange={(e) => setItunesQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all"
                  placeholder="Cari lagu, misal: Perfect Ed Sheeran, A Thousand Years..."
                />
                {itunesLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="w-4 h-4 border-2 border-rose-300/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {itunesResults.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {itunesResults.map((track: any) => (
                    <div
                      key={track.trackId}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-white hover:border-rose-300/30 transition-all duration-200 group"
                    >
                      {/* Album Art */}
                      <img
                        src={track.artworkUrl100}
                        alt={track.trackName}
                        className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0 border border-zinc-200"
                      />

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 truncate">{track.trackName}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{track.artistName}</p>
                        <p className="text-[9px] text-zinc-500/60 truncate">{track.collectionName}</p>
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
                                ? 'bg-rose-500 text-white border-rose-300 shadow-md'
                                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-300/30'
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
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg text-[10px] font-bold border border-rose-200 hover:border-rose-300 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          Gunakan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {itunesQuery.trim().length >= 2 && !itunesLoading && itunesResults.length === 0 && (
                <p className="text-[11px] text-zinc-500 text-center py-4">
                  Tidak ditemukan lagu untuk pencarian "{itunesQuery}". Coba kata kunci lain.
                </p>
              )}
            </div>
            {/* NOVELTY GRID GALLERY DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-zinc-800 text-xs flex items-center gap-1.5">
                  <Image className="w-4 h-4" /> Daftar Foto Prewedding (Tautan URL)
                </h5>
                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-full text-xs font-medium text-zinc-500 hover:bg-white hover:text-zinc-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Foto
                </button>
              </div>

              <div className="space-y-2">
                {data?.gallery?.map((img, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center group border border-zinc-200 p-2.5 rounded-xl bg-white">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-mono font-bold text-zinc-500 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateGalleryItem(idx, e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono text-zinc-500"
                        placeholder="Masukkan URL foto..."
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto pl-7 sm:pl-0">
                      <label className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-white text-rose-600 font-bold rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 border border-zinc-200">
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
                        className="p-1.5 text-rose-600 hover:bg-white rounded-lg transition"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL GIFT */}
        {activeTab === 'gifts' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 text-sm">Kado Digital</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Rekening bank atau e-wallet untuk hadiah</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addGiftItem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>

            <div className="space-y-4">
              {data?.gifts?.map((gift) => (
                <div key={gift.id} className="p-4 border border-zinc-200 rounded-2xl bg-white/10 space-y-3 relative group shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  {/* Aksen garis gradasi atas Kado */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20" />
                  <button
                    type="button"
                    onClick={() => removeGiftItem(gift.id)}
                    className="absolute top-4 right-4 p-1 rounded-lg bg-white text-rose-600 hover:bg-white text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Tipe Metode</label>
                      <select
                        value={gift.type}
                        onChange={(e) => updateGiftItem(gift.id, 'type', e.target.value as any)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white"
                      >
                        <option value="bank">Rekening Bank</option>
                        <option value="e-wallet">Dompet Digital (E-Wallet)</option>
                        <option value="address">Alamat Pengiriman Kado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Layanan (BCA, Mandiri, Gopey, dll)</label>
                      <input
                        type="text"
                        value={gift.name}
                        onChange={(e) => updateGiftItem(gift.id, 'name', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white"
                        placeholder="e.g. Bank Mandiri"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        value={gift.accountHolder}
                        onChange={(e) => updateGiftItem(gift.id, 'accountHolder', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white"
                        placeholder="e.g. Rian Aditama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">
                      {gift.type === 'address' ? 'Alamat Detail Pengiriman' : 'Nomor Rekening / No. HP'}
                    </label>
                    <input
                      type="text"
                      value={gift.accountNumber}
                      onChange={(e) => updateGiftItem(gift.id, 'accountNumber', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800"
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
            <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-zinc-200 transition duration-200 hover:shadow-xl hover:border-zinc-300">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Quote className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-800 text-sm">Kutipan & Countdown</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Kata mutiara dan hitung mundur ke hari H</p>
              </div>
            </div>

            <div className="space-y-4 p-5 border border-zinc-300 rounded-2xl bg-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 via-purple-500 to-purple-300" />
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Kata Mutiara / Quote Undangan</label>
                <textarea
                  value={data?.quoteText}
                  onChange={(e) => onChange({ ...data, quoteText: e.target.value })}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-500"
                  placeholder="Isi kutipan suci pernikahan..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Sumber Kutipan (Akar Sunnah/Alkitab/Tokoh)</label>
                <input
                  type="text"
                  value={data?.quoteSource}
                  onChange={(e) => onChange({ ...data, quoteSource: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800"
                  placeholder="e.g. QS. Ar-Rum: 21, Kolose 3:14, dll"
                />
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <h5 className="font-bold text-zinc-800 text-xs mb-3 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-rose-600" />
                  Waktu Hitung Mundur (Countdown Target)
                </h5>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 tracking-wide">Hari & Jam Mulai Akad</label>
                  <input
                    type="datetime-local"
                    value={data?.countdownDate?.substring(0, 16) || ''}
                    onChange={(e) => onChange({ ...data, countdownDate: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-1.5">Format waktu: standar waktu lokal setempat. Hitung mundur akan dipicu berakhir tepat sewaktu akad nikah berlangsung.</span>
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
