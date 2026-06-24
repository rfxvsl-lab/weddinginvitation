/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeConfig, WeddingData, Guest, RSVP, WeddingAnalytics } from '../types';

export const DEFAULT_THEMES: ThemeConfig[] = [
  {
    id: 'rfx-dark',
    name: 'RFX Cinematic Dark',
    primary: 'red-600',
    primaryHex: '#DC2626',
    secondaryHex: '#EF4444',
    bgHex: '#050505',
    bgPatternHex: '#0d0d0d',
    textHex: '#E4E4E7',
    accentHex: '#DC2626',
    fontSerif: 'font-sans',
    fontSans: 'font-mono',
    pattern: 'modern',
    layout: 'default'
  },
  {
    id: 'rfx-dark-luxury',
    name: 'Dark Luxury Cinematic',
    primary: 'amber-500',
    primaryHex: '#BF953F',
    secondaryHex: '#FCF6BA',
    bgHex: '#121212',
    bgPatternHex: '#1A1A1A',
    textHex: '#E2E8F0',
    accentHex: '#B38728',
    fontSerif: 'font-luxury', 
    fontSans: 'font-body',
    pattern: 'classic',
    layout: 'dark-luxury'
  },
  {
    id: 'rfx-luxury-pink',
    name: 'Luxury Pink Romance',
    primary: 'rose-600',
    primaryHex: '#be185d',
    secondaryHex: '#fbcfe8',
    bgHex: '#fff1f2',
    bgPatternHex: '#ffe4e6',
    textHex: '#4a4a4a',
    accentHex: '#d4af37',
    fontSerif: 'font-script', 
    fontSans: 'font-body',
    pattern: 'floral',
    layout: 'luxury-pink'
  },
  {
    id: 'rfx-netflix-luxury',
    name: 'Netflix Cinematic Series',
    primary: 'red-600',
    primaryHex: '#E50914',
    secondaryHex: '#b20710',
    bgHex: '#141414',
    bgPatternHex: '#000000',
    textHex: '#ffffff',
    accentHex: '#E50914',
    fontSerif: 'font-netflix', 
    fontSans: 'font-body',
    pattern: 'modern',
    layout: 'netflix-luxury'
  },
  {
    id: 'rfx-grand-ballroom',
    name: 'Grand Ballroom',
    primary: 'yellow-600',
    primaryHex: '#D4AF37',
    secondaryHex: '#8B6508',
    bgHex: '#0f0505',
    bgPatternHex: '#1a1a1a',
    textHex: '#333333',
    accentHex: '#D4AF37',
    fontSerif: 'font-luxury', 
    fontSans: 'font-body',
    pattern: 'classic',
    layout: 'grand-ballroom'
  },
  {
    id: 'rfx-royal-arabian',
    name: 'Royal Arabian',
    primary: 'emerald-900',
    primaryHex: '#0f261f',
    secondaryHex: '#0a1f18',
    bgHex: '#020508',
    bgPatternHex: '#000000',
    textHex: '#F5E6CA',
    accentHex: '#D4AF37',
    fontSerif: 'font-arabic-title', 
    fontSans: 'font-arabic-body',
    pattern: 'classic',
    layout: 'royal-arabian'
  },
  {
    id: 'rfx-spotilove',
    name: 'SpotiLove',
    primary: 'green-500',
    primaryHex: '#1DB954',
    secondaryHex: '#1ED760',
    bgHex: '#121212',
    bgPatternHex: '#000000',
    textHex: '#FFFFFF',
    accentHex: '#1DB954',
    fontSerif: 'font-modern',
    fontSans: 'font-modern',
    pattern: 'modern',
    layout: 'spotilove'
  },
  {
    id: 'cremy-rose',
    name: 'Classic Cremy Rose',
    primary: 'rose-500',
    primaryHex: '#E11D48',
    secondaryHex: '#FDA4AF',
    bgHex: '#FFF1F2',
    bgPatternHex: '#FFE4E6',
    textHex: '#4C0519',
    accentHex: '#BE123C',
    fontSerif: 'font-serif', // Will render beautifully
    fontSans: 'font-sans',
    pattern: 'floral'
  }
];

export const DEFAULT_WEDDING_DATA: WeddingData = {
  showLoveStories: true,
  couple: {
    groom: {
      fullName: 'Rian Aditama, S.Kom',
      nickname: 'Rian',
      fatherName: 'Bapak Ir. H. Bambang Aditama',
      motherName: 'Ibu Hj. Endang Rahayu',
      instagram: '@rian_aditama',
      photoUrl: 'https://lh3.googleusercontent.com/d/1IugI8pHxov6LaSyvLaJ1BhAK_Mo_9WAp',
      about: 'Putra pertama dari dua bersaudara yang berprofesi sebagai Software Engineer. Menemukan belahan jiwanya dalam kebersamaan organisasi.'
    },
    bride: {
      fullName: 'Salsabila Putri, S.Ds',
      nickname: 'Salsa',
      fatherName: 'Bapak Dr. H. Ahmad Fauzi',
      motherName: 'Ibu Hj. Siti Aminah',
      instagram: '@salsabila_ptr',
      photoUrl: 'https://lh3.googleusercontent.com/d/1zCuUKGqbl_g75unk6ZfKMrSkjBDX6b7V',
      about: 'Putri bungsu dari tiga bersaudara berkepribadian kreatif yang berprofesi sebagai UI/UX Designer. Seseorang yang periang dan bersemangat.'
    }
  },
  events: {
    akad: {
      enabled: true,
      name: 'Akad Nikah',
      date: '2026-08-08',
      timeStart: '08:00',
      timeEnd: '10:00',
      venueName: 'Masjid Agung Al-Azhar, Kebayoran Baru',
      address: 'Jl. Sisingamangaraja, RT.2/RW.1, Selong, Kec. Kby. Baru, Kota Jakarta Selatan, DKI Jakarta 12110',
      googleMapsUrl: 'https://maps.app.goo.gl/ALAzharKebayoranBaru',
      icon: 'Heart'
    },
    resepsi: {
      enabled: true,
      name: 'Resepsi Pernikahan',
      date: '2026-08-08',
      timeStart: '11:00',
      timeEnd: '14:00',
      venueName: 'The Royal Ballroom, Hotel Mulia Senayan',
      address: 'Jl. Asia Afrika, Gelora, Kecamatan Tanah Abhang, Jakarta Pusat, DKI Jakarta 10270',
      googleMapsUrl: 'https://maps.app.goo.gl/HotelMuliaSenayan',
      icon: 'Sparkles'
    }
  },
  loveStories: [
    {
      id: 'story-1',
      year: '2021',
      title: 'Pertama Bertemu',
      story: 'Kami pertama kali bertemu di sebuah proyek digital creative agency. Berawal dari diskusi teknis programming mendalam antara developer dan desainer, benih-benih kecocokan mulai tumbuh alami.',
      imageUrl: 'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg'
    },
    {
      id: 'story-2',
      year: '2023',
      title: 'Ikatan Suci',
      story: 'Setelah dua tahun saling memahami sifat pribadi masing-masing dan mendapat restu hangat dari kedua orang tua, kami membulatkan niat tulus untuk menjalin komitmen hubungan yang lebih serius.',
      imageUrl: 'https://lh3.googleusercontent.com/d/1-ZOM9SLuYEzihJfrFaYBQRb6N5bsUZZW'
    },
    {
      id: 'story-3',
      year: '2025',
      title: 'Hari Kebebasan Bertunangan (Proposal)',
      story: 'Dengan kejutan romantis yang dipersiapkan matang di hadapan keluarga dekat, Rian melamar Salsa, dan dengan kebahagiaan mendalam Salsa berkata "Yes, I Do". Kami sepakat melangkah ke pelaminan.',
      imageUrl: 'https://lh3.googleusercontent.com/d/1pzxlTW21vx4SW9K7hUeE6l0pjL1UXMw1'
    }
  ],
  gallery: [
    'https://lh3.googleusercontent.com/d/1p7rdtzfEPB_QsUz-NugF2fEaVT_Cqefg',
    'https://lh3.googleusercontent.com/d/1-ZOM9SLuYEzihJfrFaYBQRb6N5bsUZZW',
    'https://lh3.googleusercontent.com/d/1pzxlTW21vx4SW9K7hUeE6l0pjL1UXMw1',
    'https://lh3.googleusercontent.com/d/1vZfCejzg6xYTGH7xhrc1uGCPZGpgOrUv',
    'https://lh3.googleusercontent.com/d/1kiKo6PWW_sOfo8zqtQ2qIRmFOpKoZhS4',
    'https://lh3.googleusercontent.com/d/1YTNeSf4Gw9RhcfYEr878MSuvDRDahiQy',
    'https://lh3.googleusercontent.com/d/18RvyrH5ap6bwJ9KrDov1h1eZwCG_f86k',
    'https://lh3.googleusercontent.com/d/1L-7ZOYkz_H_jZeoXUs9eGKbuVQSBSkZN',
    'https://lh3.googleusercontent.com/d/1vabQWjbSav1sooHcaVuMvBPDTMisToMY'
  ],
  gifts: [
    {
      id: 'gift-1',
      type: 'bank',
      name: 'Bank Central Asia (BCA)',
      accountNumber: '8415256420',
      accountHolder: 'Rian Aditama'
    },
    {
      id: 'gift-2',
      type: 'bank',
      name: 'Bank Mandiri',
      accountNumber: '1240007895471',
      accountHolder: 'Salsabila Putri'
    },
    {
      id: 'gift-3',
      type: 'address',
      name: 'Alamat Pengiriman Kado',
      accountNumber: 'Jl. Melati Indah No. 45, Kebayoran Baru, Jakarta Selatan',
      accountHolder: 'Penerima: Rian & Salsa'
    }
  ],
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Romantic-sounding sample
  musicTitle: 'Beautiful Piano - Canon in D',
  countdownDate: '2026-08-08T08:00:00',
  quoteText: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
  quoteSource: 'QS. Ar-Rum: 21',
  ogImageUrl: 'https://lh3.googleusercontent.com/d/1EhkWZdyR3SGNE8bXdrxDFTrNzN9RHx0r',
  bgImageUrl: 'https://lh3.googleusercontent.com/d/1UoKVxvP08iYb7tS91UU6iwkLXvigkwVE'
};

export const INITIAL_GUESTS: Guest[] = [
  { id: 'g-1', name: 'Bahlil Lahadalia', group: 'Rekan Kerja', phoneNumber: '081234567890', paxLimit: 2, status: 'Opened', invitationCode: 'W-BAHLIL' },
  { id: 'g-2', name: 'Keluarga Paman Hendra', group: 'Keluarga', phoneNumber: '085678901234', paxLimit: 5, status: 'Sent', invitationCode: 'W-HENDRA' },
  { id: 'g-3', name: 'Andi Wijaya & Partner', group: 'Sahabat', phoneNumber: '087890123456', paxLimit: 2, status: 'Opened', invitationCode: 'W-ANDIW' },
  { id: 'g-4', name: 'Dian Sastrowardoyo', group: 'Rekan Kerja', phoneNumber: '089012345678', paxLimit: 2, status: 'Draft', invitationCode: 'W-DIANS' },
  { id: 'g-5', name: 'Zulkifli Hasan', group: 'Keluarga', phoneNumber: '082134567899', paxLimit: 4, status: 'Sent', invitationCode: 'W-ZULHAS' }
];

export const INITIAL_RSVPS: RSVP[] = [
  { id: 'r-1', guestName: 'Bahlil Lahadalia', status: 'Hadir', paxCount: 2, wishes: 'Selamat menempuh hidup baru Rian dan Salsa! Semoga menjadi keluarga sakinah, mawaddah, warahmah. Maaf jika belum bisa hadir tepat waktu.', timestamp: '2026-06-03T11:40:00Z' },
  { id: 'r-2', guestName: 'Keluarga Paman Hendra', status: 'Hadir', paxCount: 4, wishes: 'Selamat ya keponakanku tersayang Rian dan Salsa. Semoga lancar sampai hari H ya, Paman sekeluarga pasti datang!', timestamp: '2026-06-03T14:45:00Z' },
  { id: 'r-3', guestName: 'Andi Wijaya & Partner', status: 'Ragu-ragu', paxCount: 1, wishes: 'Wah congrats Rian! Insya Allah diusahakan hadir bro, semoga lancar persiapannya.', timestamp: '2026-06-03T20:10:00Z' }
];

export const INITIAL_ANALYTICS: WeddingAnalytics = {
  viewsCount: 148,
  rsvpHadir: 6,
  rsvpAbsen: 0,
  rsvpRagu: 1,
  totalGuestsAttending: 14, // 2 (Bahlil) + 4 (Hendra) + 1 (Andi) etc + simulated
  dailyTraffic: [
    { date: '28 Mei', views: 12, rsvpCount: 0 },
    { date: '29 Mei', views: 24, rsvpCount: 1 },
    { date: '30 Mei', views: 35, rsvpCount: 0 },
    { date: '31 Mei', views: 40, rsvpCount: 1 },
    { date: '01 Juni', views: 55, rsvpCount: 0 },
    { date: '02 Juni', views: 110, rsvpCount: 2 },
    { date: '03 Juni', views: 148, rsvpCount: 3 }
  ],
  visitorLogs: [
    { id: 'vl-1', guestName: 'Bahlil Lahadalia', device: 'Mobile', browser: 'Chrome Mobile', timestamp: '22 menit yang lalu' },
    { id: 'vl-2', guestName: 'Keluarga Paman Hendra', device: 'Mobile', browser: 'Safari', timestamp: '2 jam yang lalu' },
    { id: 'vl-3', guestName: 'Andi Wijaya & Partner', device: 'Desktop', browser: 'Chrome Chrome', timestamp: '3 jam yang lalu' },
    { id: 'vl-4', guestName: 'Anonim', device: 'Mobile', browser: 'Samsung Internet', timestamp: '6 jam yang lalu' },
    { id: 'vl-5', guestName: 'Zulkifli Hasan', device: 'Mobile', browser: 'Chrome Mobile', timestamp: '12 jam yang lalu' }
  ]
};
