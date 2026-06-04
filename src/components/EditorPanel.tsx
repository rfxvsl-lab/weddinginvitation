/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
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
  Sparkles,
  Link,
  RefreshCw,
  Upload
} from 'lucide-react';
import { WeddingData, LoveStoryItem, DigitalGift } from '../types';
import { convertGoogleDriveUrl } from '../utils/googleDrive';
import { uploadWeddingPhoto as uploadWeddingImage, uploadWeddingAudio } from '../lib/cloudinary';

interface EditorPanelProps {
  data: WeddingData;
  onChange: (newData: WeddingData) => void;
}

export default function EditorPanel({ data, onChange }: EditorPanelProps) {
  const [activeTab, setActiveTab] = useState<'couple' | 'events' | 'stories' | 'gallery' | 'gifts' | 'quote'>('couple');

  // Upload progress tracking
  const [isUploading, setIsUploading] = useState(false);

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
          ...data.couple.groom,
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
          ...data.couple.bride,
          [field]: processedValue
        }
      }
    });
  };

  const updateAkad = (field: string, value: string) => {
    onChange({
      ...data,
      events: {
        ...data.events,
        akad: {
          ...data.events.akad,
          [field]: value
        }
      }
    });
  };

  const updateResepsi = (field: string, value: string) => {
    onChange({
      ...data,
      events: {
        ...data.events,
        resepsi: {
          ...data.events.resepsi,
          [field]: value
        }
      }
    });
  };

  const addStory = () => {
    const newStory: LoveStoryItem = {
      id: `story-${Date.now()}`,
      year: '2026',
      title: 'Judul Cerita',
      story: 'Ceritakan momen spesial Anda di sini bersama pasangan...',
      imageUrl: 'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg'
    };
    onChange({
      ...data,
      loveStories: [...data.loveStories, newStory]
    });
  };

  const updateStory = (id: string, field: keyof LoveStoryItem, value: string) => {
    const processedValue = field === 'imageUrl' ? convertGoogleDriveUrl(value) : value;
    const updatedStories = data.loveStories.map(story => {
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
      loveStories: data.loveStories.filter(story => story.id !== id)
    });
  };

  const addGiftItem = () => {
    const newGift: DigitalGift = {
      id: `gift-${Date.now()}`,
      type: 'bank',
      name: 'Bank Jago',
      accountNumber: '102030405060',
      accountHolder: data.couple.groom.nickname
    };
    onChange({
      ...data,
      gifts: [...data.gifts, newGift]
    });
  };

  const updateGiftItem = (id: string, field: keyof DigitalGift, value: string) => {
    const updatedGifts = data.gifts.map(gift => {
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
      gifts: data.gifts.filter(gift => gift.id !== id)
    });
  };

  const updateGalleryItem = (index: number, value: string) => {
    const newGallery = [...data.gallery];
    newGallery[index] = convertGoogleDriveUrl(value);
    onChange({ ...data, gallery: newGallery });
  };

  const addGalleryItem = () => {
    onChange({
      ...data,
      gallery: [...data.gallery, 'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg']
    });
  };

  const removeGalleryItem = (index: number) => {
    onChange({
      ...data,
      gallery: data.gallery.filter((_, i) => i !== index)
    });
  };

  const resetToTamuSampel = () => {
    // Re-fill photos with quick placeholder buttons
    onChange({
      ...data,
      couple: {
        groom: {
          ...data.couple.groom,
          photoUrl: 'https://lh3.googleusercontent.com/d/1IugI8pHxov6LaSyvLaJ1BhAK_Mo_9WAp'
        },
        bride: {
          ...data.couple.bride,
          photoUrl: 'https://lh3.googleusercontent.com/d/1zCuUKGqbl_g75unk6ZfKMrSkjBDX6b7V'
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Editor Tab Headers */}
      <div className="flex border-b border-slate-100 bg-slate-50 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('couple')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'couple'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          Mempelai
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Detail Acara
        </button>
        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'stories'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Cerita Cinta
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'gallery'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          Galeri & Musik
        </button>
        <button
          onClick={() => setActiveTab('gifts')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'gifts'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          Kado Digital
        </button>
        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
            activeTab === 'quote'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          Kutipan & Countdown
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* TAB 1: MEMPELAI */}
        {activeTab === 'couple' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Informasi Mempelai Pernikahan</h4>
                <p className="text-xs text-slate-400">Atur biodata singkat kedua calon mempelai secara terperinci.</p>
              </div>
              <button
                onClick={resetToTamuSampel}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-full border border-indigo-100 transition-all shadow-sm"
              >
                <RefreshCw className="w-3 h-3" /> Ganti Foto Sampel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GROOM PANEL */}
              <div className="space-y-4 p-5 rounded-2xl bg-amber-50/20 border border-amber-100/40">
                <div className="flex items-center gap-2 border-b border-amber-100/50 pb-2.5">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Pria</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Mempelai Pria (Groom)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data.couple.groom.fullName}
                      onChange={(e) => updateGroom('fullName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                      placeholder="e.g. Budi Hartono, S.T."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data.couple.groom.nickname}
                      onChange={(e) => updateGroom('nickname', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                      placeholder="e.g. Budi"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        value={data.couple.groom.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateGroom('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        value={data.couple.groom.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateGroom('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data.couple.groom.photoUrl}
                      onChange={(e) => updateGroom('photoUrl', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-slate-600"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Groom */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-805 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border border-amber-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                      {data.couple.groom.photoUrl?.startsWith('https://res.cloudinary.com') && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          ✓ Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={data.couple.groom.instagram}
                        onChange={(e) => updateGroom('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Singkat</label>
                    <textarea
                      value={data.couple.groom.about}
                      onChange={(e) => updateGroom('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* BRIDE PANEL */}
              <div className="space-y-4 p-5 rounded-2xl bg-rose-50/20 border border-rose-100/40">
                <div className="flex items-center gap-2 border-b border-rose-100/50 pb-2.5">
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Wanita</span>
                  <h5 className="font-semibold text-slate-800 text-sm">Mempelai Wanita (Bride)</h5>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      value={data.couple.bride.fullName}
                      onChange={(e) => updateBride('fullName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                      placeholder="e.g. Salsabila Cantika, M.Ds"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Panggilan</label>
                    <input
                      type="text"
                      value={data.couple.bride.nickname}
                      onChange={(e) => updateBride('nickname', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all text-slate-700"
                      placeholder="e.g. Salsa"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        value={data.couple.bride.fatherName.replace('Bapak ', '')}
                        onChange={(e) => updateBride('fatherName', `Bapak ${e.target.value}`)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                        placeholder="Nama Ayah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        value={data.couple.bride.motherName.replace('Ibu ', '')}
                        onChange={(e) => updateBride('motherName', `Ibu ${e.target.value}`)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800"
                        placeholder="Nama Ibu"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Mempelai (URL)</label>
                    <input
                      type="text"
                      value={data.couple.bride.photoUrl}
                      onChange={(e) => updateBride('photoUrl', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono text-slate-600"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Bride */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-805 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border border-rose-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                      {data.couple.bride.photoUrl?.startsWith('https://res.cloudinary.com') && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          ✓ Cloud
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Akun Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={data.couple.bride.instagram}
                        onChange={(e) => updateBride('instagram', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi Singkat</label>
                    <textarea
                      value={data.couple.bride.about}
                      onChange={(e) => updateBride('about', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-600 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETIL ACARA */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Petunjuk Waktu & Tempat Acara</h4>
              <p className="text-xs text-slate-400">Pastikan waktu akad nikah dan resepsi terisi dengan benar untuk pemandu navigasi tamu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AKAD */}
              <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/10 border border-indigo-100/40">
                <h5 className="font-semibold text-indigo-700 text-xs flex items-center gap-1.5 border-b border-indigo-100/50 pb-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Sesi 1: Akad Nikah
                </h5>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Akad</label>
                    <input
                      type="date"
                      value={data.events.akad.date}
                      onChange={(e) => updateAkad('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data.events.akad.timeStart}
                        onChange={(e) => updateAkad('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
                      <input
                        type="type"
                        value={data.events.akad.timeEnd}
                        onChange={(e) => updateAkad('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data.events.akad.venueName}
                      onChange={(e) => updateAkad('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
                      placeholder="Masjid Agung..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                    <textarea
                      value={data.events.akad.address}
                      onChange={(e) => updateAkad('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-600 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={data.events.akad.googleMapsUrl}
                        onChange={(e) => updateAkad('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-600"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RESEPSI */}
              <div className="space-y-4 p-5 rounded-2xl bg-pink-50/10 border border-pink-100/40">
                <h5 className="font-semibold text-pink-700 text-xs flex items-center gap-1.5 border-b border-pink-100/50 pb-2.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  Sesi 2: Resepsi Pernikahan
                </h5>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Resepsi</label>
                    <input
                      type="date"
                      value={data.events.resepsi.date}
                      onChange={(e) => updateResepsi('date', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Mulai</label>
                      <input
                        type="time"
                        value={data.events.resepsi.timeStart}
                        onChange={(e) => updateResepsi('timeStart', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Waktu Selesai</label>
                      <input
                        type="text"
                        value={data.events.resepsi.timeEnd}
                        onChange={(e) => updateResepsi('timeEnd', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none bg-white text-slate-700"
                        placeholder="e.g. Selesai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Tempat / Gedung</label>
                    <input
                      type="text"
                      value={data.events.resepsi.venueName}
                      onChange={(e) => updateResepsi('venueName', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-700"
                      placeholder="Ballroom Hotel..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap</label>
                    <textarea
                      value={data.events.resepsi.address}
                      onChange={(e) => updateResepsi('address', e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white text-slate-600 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tautan Google Maps</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={data.events.resepsi.googleMapsUrl}
                        onChange={(e) => updateResepsi('googleMapsUrl', e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none font-mono text-slate-600"
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
            <div className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <div>
                <span className="font-semibold text-slate-800 text-xs block">Tampilkan Bagian Cerita Cinta</span>
                <span className="text-[10px] text-slate-400">Aktifkan atau sembunyikan seluruh bagian perjalanan kisah cinta pada halaman undangan.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.showLoveStories !== false}
                  onChange={(e) => onChange({ ...data, showLoveStories: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Garis Waktu Perjalanan Kisah Cinta</h4>
                <p className="text-xs text-slate-400">Ceritakan momen pertama kali bertemu hingga memutuskan membina keluarga.</p>
              </div>
              <button
                type="button"
                onClick={addStory}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Momen
              </button>
            </div>

            {data.showLoveStories === false && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-[11.5px] font-medium leading-relaxed animate-fade-in">
                ⚠️ Bagian <strong>Perjalanan Kisah Cinta</strong> saat ini dinonaktifkan (disembunyikan) pada halaman web undangan. Pengunjung tidak akan melihat kisah cinta ini di pratinjau utama, tetapi Anda masih bisa menyimpan dan mengedit data momen di bawah ini.
              </div>
            )}

            <div className={`space-y-4 ${data.showLoveStories === false ? 'opacity-65 transition-opacity' : ''}`}>
              {data.loveStories.map((story) => (
                <div key={story.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => removeStory(story.id)}
                    className="absolute top-4 right-4 p-1.5 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus Momen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tahun Kejadian</label>
                      <input
                        type="text"
                        value={story.year}
                        onChange={(e) => updateStory(story.id, 'year', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono"
                        placeholder="e.g. 2021"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Kejadian</label>
                      <input
                        type="text"
                        value={story.title}
                        onChange={(e) => updateStory(story.id, 'title', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                        placeholder="e.g. Pertama Bertemu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Isi Cerita</label>
                    <textarea
                      value={story.story}
                      onChange={(e) => updateStory(story.id, 'story', e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600"
                      placeholder="Tulis penjelasan mendalam..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Foto Ilustrasi (URL)</label>
                    <input
                      type="text"
                      value={story.imageUrl || ''}
                      onChange={(e) => updateStory(story.id, 'imageUrl', e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-500"
                      placeholder="https://drive.google.com/file/d/... (atau unggah lewat tombol)"
                    />
                    {/* Slick Photo Uploader for Story Moment */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className={`flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[11px] font-bold cursor-pointer transition active:scale-95 border border-indigo-150 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
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
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                          ✓ Cloud
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
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Media & Musik Latar</h4>
              <p className="text-xs text-slate-400">Masukkan tautan foto dan musik romantis untuk melengkapi kemeriahan atmosfer undangan digital.</p>
            </div>

            {/* OG IMAGE & BG IMAGE CONFIGURATION */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-emerald-50/10 space-y-4">
              <h5 className="font-semibold text-emerald-800 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Gambar Sampul & Latar Belakang (OG & BG Image)
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OG Image / Cover */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-650">OG Image Halaman Awal (Sampul/Gate)</label>
                  <input
                    type="text"
                    value={data.ogImageUrl || ''}
                    onChange={(e) => onChange({ ...data, ogImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-205 bg-white font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Tautan URL gambar sampul halaman awal..."
                  />
                  {data.ogImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-100">
                      <img src={getImageUrl(data.ogImageUrl)} alt="OG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 border border-indigo-100">
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
                      className="text-[9.5px] px-2 py-1 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-700 hover:bg-indigo-100 transition font-bold"
                    >
                      Atur Ulang Sampul Bawaan
                    </button>
                  </div>
                </div>

                {/* BG Image / Web Background */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-655">BG Image Setelah Masuk Undangan</label>
                  <input
                    type="text"
                    value={data.bgImageUrl || ''}
                    onChange={(e) => onChange({ ...data, bgImageUrl: convertGoogleDriveUrl(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-205 bg-white font-mono text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Tautan URL gambar latar belakang undangan..."
                  />
                  {data.bgImageUrl && (
                    <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-100">
                      <img src={getImageUrl(data.bgImageUrl)} alt="BG Preview" className="w-full h-full object-cover animate-fade-in" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 border border-indigo-100">
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
                      className="text-[9.5px] px-2 py-1 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-700 hover:bg-indigo-100 transition font-bold"
                    >
                      Atur Ulang BG Bawaan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* MUSIC SECTION WITH CUSTOM AUDIO FILE UPLOADER */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-violet-50/15 space-y-4">
              <h5 className="font-semibold text-violet-700 text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Musik Pengiring Pernikahan (Audio MP3/WAV)
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Lagu</label>
                  <input
                    type="text"
                    value={data.musicTitle}
                    onChange={(e) => onChange({ ...data, musicTitle: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
                    placeholder="Judul Lagu / Musik Instrument"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tautan MP3 (URL)</label>
                  <input
                    type="text"
                    value={data.musicUrl}
                    onChange={(e) => onChange({ ...data, musicUrl: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-mono text-[11px]"
                    placeholder="https://domain.com/music.mp3"
                  />
                </div>
              </div>

              {/* SLICK AUDIO FILE UPLOADER */}
              <div className="border border-dashed border-violet-200 p-4 rounded-xl bg-violet-50/5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="text-left">
                  <p className="text-xs font-semibold text-violet-800">Unggah File Musik Kustom Anda</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mendukung file .mp3, .wav, atau audio sejenis (disimpan di Cloudinary cloud storage).</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <label className="flex items-center gap-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-md shadow-violet-600/10 active:scale-95">
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
                    className="px-3.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 bg-white rounded-xl text-xs font-semibold transition active:scale-95"
                  >
                    Atur Ulang
                  </button>
                </div>
              </div>
            </div>

            {/* NOVELTY GRID GALLERY DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
                  <Image className="w-4 h-4" /> Daftar Foto Prewedding (Tautan URL)
                </h5>
                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Foto
                </button>
              </div>

              <div className="space-y-2">
                {data.gallery.map((img, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center group border border-slate-100 p-2.5 rounded-xl bg-slate-50/30">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateGalleryItem(idx, e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-600"
                        placeholder="Masukkan URL foto..."
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto pl-7 sm:pl-0">
                      <label className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer transition active:scale-95 border border-indigo-150">
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
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Sistem Kado Digital & Dompet Digital</h4>
                <p className="text-xs text-slate-400">Atur nomor rekening bank atau e-wallet agar tamu dapat mentransfer hadiah secara aman.</p>
              </div>
              <button
                type="button"
                onClick={addGiftItem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Metode
              </button>
            </div>

            <div className="space-y-4">
              {data.gifts.map((gift) => (
                <div key={gift.id} className="p-4 border border-slate-100 rounded-2xl bg-amber-50/10 space-y-3 relative group">
                  <button
                    type="button"
                    onClick={() => removeGiftItem(gift.id)}
                    className="absolute top-4 right-4 p-1 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Metode</label>
                      <select
                        value={gift.type}
                        onChange={(e) => updateGiftItem(gift.id, 'type', e.target.value as any)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="bank">Rekening Bank</option>
                        <option value="e-wallet">Dompet Digital (E-Wallet)</option>
                        <option value="address">Alamat Pengiriman Kado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Layanan (BCA, Mandiri, Gopey, dll)</label>
                      <input
                        type="text"
                        value={gift.name}
                        onChange={(e) => updateGiftItem(gift.id, 'name', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                        placeholder="e.g. Bank Mandiri"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pemilik Rekening</label>
                      <input
                        type="text"
                        value={gift.accountHolder}
                        onChange={(e) => updateGiftItem(gift.id, 'accountHolder', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                        placeholder="e.g. Rian Aditama"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {gift.type === 'address' ? 'Alamat Detail Pengiriman' : 'Nomor Rekening / No. HP'}
                    </label>
                    <input
                      type="text"
                      value={gift.accountNumber}
                      onChange={(e) => updateGiftItem(gift.id, 'accountNumber', e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700"
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
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-800 text-sm">Kata Mutiara & Pengingat Sesi (Countdown)</h4>
              <p className="text-xs text-slate-400">Atur kutipan suci perkawinan beserta penunjuk hitung mundur menuju hari sakral.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kata Mutiara / Quote Undangan</label>
                <textarea
                  value={data.quoteText}
                  onChange={(e) => onChange({ ...data, quoteText: e.target.value })}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600"
                  placeholder="Isi kutipan suci pernikahan..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sumber Kutipan (Akar Sunnah/Alkitab/Tokoh)</label>
                <input
                  type="text"
                  value={data.quoteSource}
                  onChange={(e) => onChange({ ...data, quoteSource: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                  placeholder="e.g. QS. Ar-Rum: 21, Kolose 3:14, dll"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h5 className="font-semibold text-slate-700 text-xs mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Waktu Hitung Mundur (Countdown Target)
                </h5>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hari & Jam Mulai Akad</label>
                  <input
                    type="datetime-local"
                    value={data.countdownDate.substring(0, 16)}
                    onChange={(e) => onChange({ ...data, countdownDate: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1.5">Format waktu: standar waktu lokal setempat. Hitung mundur akan dipicu berakhir tepat sewaktu akad nikah berlangsung.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
