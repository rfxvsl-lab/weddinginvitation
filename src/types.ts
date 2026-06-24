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
  pattern: 'floral' | 'classic' | 'modern' | 'minimalist';
  layout?: 'default' | 'dark-luxury' | 'luxury-pink' | 'netflix-luxury' | 'grand-ballroom' | 'royal-arabian' | 'spotilove'; // Penentu struktur HTML yang di-render
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
  name: string; // e.g. BCA, Mandiri, OVO, Rumah Mempelai
  accountNumber: string;
  accountHolder: string;
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
  countdownDate: string;
  quoteText: string;
  quoteSource: string;
  ogImageUrl?: string;
  bgImageUrl?: string;
  enableDigitalPass?: boolean;
}

export interface Guest {
  id: string;
  name: string;
  group: string; // e.g., Keluarga, Sahabat, Kerja, Tetangga
  phoneNumber: string;
  paxLimit: number;
  status: 'Draft' | 'Sent' | 'Opened';
  invitationCode: string;
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

export interface SaaSUser {
  id: string;
  fullName: string;
  coupleGroom: string;
  coupleBride: string;
  activeSlug: string;
  email: string;
  noWa: string;
  sosmed: string;
  packageId: 'demo' | 'reguler' | 'medium' | 'premium' | 'luxury';
  isCustomByRfx: boolean; // true = custom full by rfx, false = custom mandiri
  paymentStatus: 'pending' | 'success' | 'failed';
  registeredAt: string;
  warningCount?: number;
  slugChangeCount?: number;
  ipAddress?: string;
  avatarUrl?: string;
  authProvider?: 'local' | 'google';
  /** Password disimpan sebagai hash di server (Turso), tidak pernah di client */
  password?: string;
}

export interface TransactionReport {
  id: string;
  userId: string;
  userName: string;
  userSlug: string;
  userEmail: string;
  packageId: 'demo' | 'reguler' | 'medium' | 'premium' | 'luxury';
  isCustomByRfx: boolean;
  nominalExpected: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  proofImage: string; // Cloudinary URL (bukan base64 lagi)
  aiResult?: {
    isAuthentic: boolean;
    timestampDetected?: string;
    recipientAccount?: string;
    nominalDetected?: number;
    reasons?: string[];
  } | null;
}

