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
