/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string; // Tailwind color e.g., 'rose-500' or hex
  primaryHex: string;
  secondaryHex: string;
  bgHex: string;
  bgPatternHex: string;
  textHex: string;
  accentHex: string;
  fontSerif: string; // e.g. Playfair Display, Great Vibes
  fontSans: string; // e.g. Inter
  pattern: 'floral' | 'classic' | 'modern' | 'minimalist' | 'storybook';
  layout?: 'default' | 'dark-luxury' | 'luxury-pink' | 'netflix-luxury' | 'grand-ballroom' | 'royal-arabian' | 'spotilove' | 'javanese-classic' | 'parallax-cinematic' | 'storybook-interactive' | 'kit';
  /** YYYY-MM-DD — untuk label "Baru" (tema Theme Kit) */
  addedAt?: string;
  description?: string;
  /** 'special' = tema adegan 2D/2.5D paralaks */
  tier?: 'regular' | 'special';
}

export interface CoupleMember {
  fullName: string;
  nickname: string;
  fatherName: string;
  motherName: string;
  instagram: string;
  photoUrl: string;
  about: string;
}

export interface WeddingCouple {
  groom: CoupleMember;
  bride: CoupleMember;
}

export interface EventDetails {
  enabled?: boolean;
  name: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  venueName: string;
  address: string;
  googleMapsUrl: string;
  icon: string;
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  story: string;
  imageUrl?: string;
}

export interface DigitalGift {
  id: string;
  type: 'bank' | 'e-wallet' | 'address';
  name: string;
  accountNumber: string;
  accountHolder: string;
}

/** Video Cerita (Enterprise): pemeran, momen kisah, dan aset gambar AI per adegan. */
export interface StoryCast {
  /** Foto wajah (URL Cloudinary), maks. 3. */
  photos: string[];
  /** Ciri penampilan singkat, mis. "berhijab, berkacamata". */
  look?: string;
}
export interface StoryMoment {
  id: string;
  /** Judul singkat, mis. "Pertama kenal". */
  title: string;
  /** Tempat/latar, mis. "toko oleh-oleh di Jogja". */
  place: string;
  /** Apa yang terjadi, mis. "Ana menerima pesan dari Naufal di grup Telegram". */
  action: string;
  /** Siapa yang tampil. */
  who: 'groom' | 'bride' | 'both';
  /** Teks cerita yang tampil di layar. */
  narration?: string;
  /** Balon dialog. */
  dialogue?: { speaker: 'groom' | 'bride'; text: string } | null;
  /** Kutipan chat di layar HP. */
  chat?: { from: 'groom' | 'bride'; text: string }[];
  /** Angka besar, mis. "4721 KM". */
  stat?: string;
}
export interface StoryAsset {
  /** Latar adegan tanpa orang. */
  bg?: string;
  /** Karakter berlatar transparan (PNG). */
  chars?: string;
  /** Sidik isi momen saat aset dibuat; beda = perlu dibuat ulang. */
  sig?: string;
}
export interface StoryProject {
  style?: 'warm-digital' | 'watercolor' | 'soft-anime';
  groom?: StoryCast;
  bride?: StoryCast;
  moments?: StoryMoment[];
  closingNarration?: string;
  /** Pemilik undangan menyetujui foto dikirim ke layanan AI. */
  consent?: boolean;
  /** Lembar karakter (referensi wajah untuk semua adegan). */
  characterSheet?: string;
  /** Sidik foto+ciri+gaya saat lembar karakter dibuat. */
  characterSheetSig?: string;
  assets?: Record<string, StoryAsset>;
  /** Aset adegan pernikahan (penutup). */
  finale?: StoryAsset;
}

/** Pengaturan Video Studio (Enterprise), disimpan bersama data undangan. Semua opsional. */
export interface VideoStudioSettings {
  themeId?: 'javanese-classic' | 'grand-ballroom' | 'luxury-pink' | 'storybook-journey' | 'pasundan';
  aspect?: '9:16' | '1:1' | '16:9';
  quality?: 'hd' | 'fast';
  /** ID tamu untuk versi personal; kosong = "Tamu Undangan". */
  guestId?: string | null;
  music?: {
    source: 'invitation' | 'custom' | 'none';
    /** URL musik khusus video (unggahan Cloudinary). */
    customUrl?: string;
    customTitle?: string;
    /** Mulai dari detik ke-n lagu. */
    offsetSec?: number;
    /** 0..1 */
    volume?: number;
  };
  /** Video Cerita berbasis AI. */
  story?: StoryProject;
  /** Mode studio terakhir. */
  mode?: 'story' | 'template';
  /** Teks yang bisa diubah (berlaku untuk film Perjalanan & Pasundan). */
  copy?: { tagline?: string; closing?: string };
  /** Video terakhir yang diunggah untuk dibagikan lewat tautan. */
  shared?: {
    url: string;
    themeId: string;
    aspect: string;
    guestName?: string | null;
    bytes: number;
    createdAt: string;
  } | null;
}

export interface WeddingData {
  couple: WeddingCouple;
  events: {
    akad: EventDetails;
    resepsi: EventDetails;
  };
  loveStories: LoveStoryItem[];
  showLoveStories?: boolean;
  gallery: string[];
  gifts: DigitalGift[];
  musicUrl: string;
  musicTitle: string;
  videoStudio?: VideoStudioSettings;
  countdownDate: string;
  quoteText: string;
  quoteSource: string;
  ogImageUrl?: string;
  bgImageUrl?: string;
  enableDigitalPass?: boolean;
  enableLiveMoments?: boolean;
  liveStreamUrl?: string;
  liveStreamLabel?: string;
  /** varian warna tema Theme Kit yang dipilih pemilik */
  themeVariant?: string;
}

export interface Guest {
  id: string;
  name: string;
  group: string;
  phoneNumber: string;
  paxLimit: number;
  status: 'Draft' | 'Sent' | 'Opened';
  invitationCode: string;
  checkedInAt?: string | null;
  checkInPax?: number;
  tableNo?: string;
  souvenirGiven?: boolean;
  attendance?: string;
  rsvpStatus?: 'UNCONFIRMED' | 'CONFIRMED';
  seatImageUrl?: string;
}

export interface PhotoMoment {
  id: string;
  invitationId: string;
  guestName: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface VoiceWish {
  id: string;
  invitationId: string;
  guestName: string;
  audioUrl: string;
  durationSec: number;
  createdAt: string;
}

export interface RSVP {
  id: string;
  guestId?: string;
  guestName: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Ragu-ragu';
  paxCount: number;
  wishes: string;
  timestamp: string;
}

export interface VisitorLog {
  id: string;
  guestName?: string;
  device: string;
  browser: string;
  timestamp: string;
}

export interface WeddingAnalytics {
  viewsCount: number;
  rsvpHadir: number;
  rsvpAbsen: number;
  rsvpRagu: number;
  totalGuestsAttending: number;
  dailyTraffic: { date: string; views: number; rsvpCount: number }[];
  visitorLogs: VisitorLog[];
}

export interface InvitationProject {
  id: string;
  title: string;
  themeId: string;
  weddingData: WeddingData;
  guests: Guest[];
  rsvps: RSVP[];
  analytics: WeddingAnalytics;
}

/**
 * PackageTier:
 * - 'free'       : Paket Full Gratis (default untuk semua pengguna baru)
 * - 'enterprise' : Paket Enterprise (akses via email perusahaan + kode khusus dari admin@ruanghadir.net)
 * - Legacy IDs ('demo' | 'reguler' | 'premium' | 'luxury') dipertahankan untuk backward-compatibility DB.
 */
export type UserPackageId =
  | 'free'
  | 'enterprise'
  | 'demo'
  | 'reguler'
  | 'premium'
  | 'luxury';

/** Status akun Akses Awal: pendaftar baru menunggu persetujuan admin. */
export type AccountStatus = 'pending' | 'approved' | 'rejected';

/** Data formulir pendaftaran Akses Awal (disimpan untuk ditinjau admin). */
export interface AccessApplication {
  eventDate?: string;
  city?: string;
  referralSource?: string;
  note?: string;
}

export interface SaaSUser {
  id: string;
  fullName: string;
  coupleGroom: string;
  coupleBride: string;
  activeSlug: string;
  email: string;
  noWa: string;
  sosmed: string;
  packageId: UserPackageId;
  isCustomByRfx: boolean;
  paymentStatus: 'pending' | 'success' | 'failed';
  registeredAt: string;
  warningCount?: number;
  slugChangeCount?: number;
  ipAddress?: string;
  avatarUrl?: string;
  authProvider?: 'local' | 'google' | 'enterprise';
  companyName?: string;
  companyDomain?: string;
  /** Password disimpan sebagai hash di server (Turso), tidak pernah di client */
  password?: string;
  /** default 'approved' untuk akun lama */
  accountStatus?: AccountStatus;
  application?: AccessApplication;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface EnterpriseAccessRecord {
  id: string;
  companyName: string;
  allowedDomain: string;
  allowedEmail?: string | null;
  codeHint: string;
  maxSeats: number;
  usedSeats: number;
  active: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface TransactionReport {
  id: string;
  userId: string;
  userName: string;
  userSlug: string;
  userEmail: string;
  packageId: UserPackageId;
  isCustomByRfx: boolean;
  nominalExpected: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  proofImage: string;
  aiResult?: {
    isAuthentic: boolean;
    timestampDetected?: string;
    recipientAccount?: string;
    nominalDetected?: number;
    reasons?: string[];
  } | null;
}
