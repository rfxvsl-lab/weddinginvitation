'use client';

import React, { useState } from 'react';
import SpotiLoveLayout from '../../components/templates/SpotiLoveLayout';
import { WeddingData, RSVP, ThemeConfig } from '../../types';
import { DEFAULT_THEMES } from '../../data/defaultData';

/**
 * Halaman statis custom (no account / no DB) untuk:
 * Kharis & Lia — Sabtu, 19 September 2026
 * Dipesen langsung ke RFX, masa aktif ditentukan manual oleh admin.
 * RSVP disimpan lokal per sesi (tanpa database).
 */

const WEDDING_DATA: WeddingData = {
  couple: {
    groom: {
      fullName: 'Muchammad Kharis',
      nickname: 'Kharis',
      fatherName: 'Moch Syahid',
      motherName: 'Nurul Abidah',
      instagram: 'https://instagram.com/khaarissss_',
      photoUrl: '/assets/kharis-lia/groom.jpg',
      about: '',
    },
    bride: {
      fullName: 'Lia Safitri',
      nickname: 'Lia',
      fatherName: 'Romli',
      motherName: 'Sutini',
      instagram: 'https://instagram.com/pretty_yhayaa',
      photoUrl: '/assets/kharis-lia/bride.jpg',
      about: '',
    },
  },
  events: {
    akad: {
      enabled: false,
      name: 'Resepsi',
      date: '2026-09-19',
      timeStart: '07:00',
      timeEnd: 'Selesai',
      venueName: 'Kediaman Mempelai',
      address: 'Bantur Pringgodani, Kab. Malang',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bantur+Pringgodani+Kabupaten+Malang',
      icon: 'party',
    },
    resepsi: {
      enabled: true,
      name: 'Resepsi',
      date: '2026-09-19',
      timeStart: '07:00',
      timeEnd: 'Selesai',
      venueName: 'Kediaman Mempelai',
      address: 'Bantur Pringgodani, Kab. Malang',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bantur+Pringgodani+Kabupaten+Malang',
      icon: 'party',
    },
  },
  loveStories: [],
  showLoveStories: false,
  // Request client: TANPA galeri foto → tab Discography otomatis tersembunyi
  gallery: [],
  gifts: [
    {
      id: 'gift-address',
      type: 'address',
      name: 'Kirim Hadiah ke Alamat',
      accountNumber: 'Bantur Pringgodani, Kab. Malang',
      accountHolder: 'Kharis & Lia',
    },
  ],
  musicUrl: '/assets/kharis-lia/music.mp3',
  musicTitle: 'Wedding Playlist',
  countdownDate: '2026-09-19T07:00:00+07:00',
  quoteText:
    'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
  quoteSource: 'QS Ar-Rum : 21',
  ogImageUrl: '/assets/kharis-lia/hero.jpg',
  bgImageUrl: '/assets/kharis-lia/hero.jpg',
};

const SPOTILOVE_THEME: ThemeConfig =
  DEFAULT_THEMES.find((t) => t.id === 'spotilove') ?? (DEFAULT_THEMES[0] as ThemeConfig);

export default function KharisLiaPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

  const handleAddRSVP = (rsvp: RSVP) => {
    setRsvps((prev) => [{ ...rsvp, id: crypto.randomUUID() }, ...prev]);
  };

  return (
    <SpotiLoveLayout
      data={WEDDING_DATA}
      theme={SPOTILOVE_THEME}
      onAddRSVP={handleAddRSVP}
      rsvps={rsvps}
    />
  );
}
