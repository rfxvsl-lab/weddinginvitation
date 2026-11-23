/**
 * Theme Kit — spesifikasi satu tema undangan.
 *
 * Satu tema = satu file di `src/themes/catalog/<id>.tsx` yang mengekspor
 * `defineTheme({...})`. Semua fitur (sampul, musik, hitung mundur, acara,
 * galeri, amplop, RSVP, kode tamu) disediakan oleh KitLayout; tema hanya
 * menentukan karakter visual dan varian tiap bagian.
 */

import type React from 'react';

export type ThemeCategory = 'classic' | 'modern' | 'floral' | 'minimalist' | 'storybook';

export interface ThemePalette {
  /** latar halaman */
  bg: string;
  /** latar kartu/panel */
  surface: string;
  /** warna utama: tombol, judul, aksen kuat */
  primary: string;
  /** warna kedua: garis, ornamen, border */
  secondary: string;
  /** teks utama */
  text: string;
  /** teks sekunder */
  muted: string;
  /** teks di atas `primary` */
  onPrimary: string;
  /** latar sampul/hero yang lebih gelap atau kontras (opsional) */
  cover?: string;
  /** teks di atas `cover` */
  onCover?: string;
}

export interface ThemeFonts {
  /** judul & nama (CSS font-family) */
  display: string;
  /** isi */
  body: string;
  /** huruf sambung untuk aksen (opsional) */
  script?: string;
  /** label kecil (opsional, default = body) */
  label?: string;
  /** query Google Fonts, mis. "Cormorant+Garamond:ital,wght@0,400;1,400&family=Jost:wght@300;400;500" */
  google: string;
}

export type CoverVariant = 'envelope' | 'curtain' | 'gate' | 'card' | 'photo' | 'scene' | 'film';
export type HeroVariant = 'photo' | 'frame' | 'type' | 'scene';
export type FrameShape = 'arch' | 'circle' | 'oval' | 'rect' | 'polaroid';
export type CoupleVariant = 'cards' | 'split';
export type EventsVariant = 'cards' | 'timeline' | 'ticket';
export type GalleryVariant = 'masonry' | 'grid' | 'film';
export type CountdownVariant = 'boxes' | 'inline';
export type DividerPreset = 'floral' | 'diamond' | 'dots' | 'wave' | 'line' | 'none';
export type AmbientPreset = 'petals' | 'sparkles' | 'leaves' | 'bubbles' | 'snow' | 'none';
export type RevealStyle = 'rise' | 'fade' | 'blur' | 'zoom';

export type SectionId = 'hero' | 'quote' | 'couple' | 'interlude' | 'countdown' | 'events' | 'story' | 'gallery' | 'gift' | 'rsvp' | 'wishes' | 'closing';

export interface ThemeCopy {
  coverLabel?: string; // "Kepada Yth."
  coverTitle?: string; // "The Wedding of"
  openButton?: string; // "Buka Undangan"
  heroTitle?: string; // "The Wedding of"
  coupleTitle?: string;
  coupleIntro?: string;
  groomLabel?: string; // "Putra dari"
  brideLabel?: string; // "Putri dari"
  countdownTitle?: string;
  eventsTitle?: string;
  storyTitle?: string;
  galleryTitle?: string;
  giftTitle?: string;
  giftIntro?: string;
  rsvpTitle?: string;
  wishesTitle?: string;
  closingTitle?: string;
  closingText?: string;
}

/** Data undangan yang boleh dipakai ilustrasi bab (mis. foto untuk tema sinematik). */
export interface ChapterData {
  /** foto latar + galeri, sudah dalam URL siap pakai */
  photos: string[];
  groom: string;
  bride: string;
  /** tanggal utama, mis. "08 · 08 · 2026" */
  dateShort: string;
}

/** regular = tema satu halaman biasa; special = adegan 2D/2.5D paralaks (kandidat paket Enterprise) */
export type ThemeTier = 'regular' | 'special';

/** Adegan paralaks untuk tema Spesial. Lihat src/themes/kit/scene.tsx. */
export interface SceneConfig {
  /**
   * Latar adegan (fixed, memenuhi layar). Susun dari <Layer depth> dan gunakan
   * useScene() untuk efek per frame (warna langit, matahari, lampion, dsb.).
   */
  Backdrop?: React.ComponentType<{ palette: ThemePalette }>;
  /**
   * Bab adegan layar penuh untuk setiap bagian (gaya situs naratif paralaks).
   * Dirender dua kali per bagian: layer 'back' (di belakang teks) dan 'front' (di depan teks).
   * Susun dari <ArtLayer depth> di kit/chapters.tsx. Bila ada, Backdrop tidak dipakai.
   */
  Chapter?: React.ComponentType<{ id: SectionId; layer: 'back' | 'front'; data: ChapterData }>;
  /** posisi teks di bab pembuka: 'top' (default, di langit) atau 'bottom' (gaya judul film di atas foto) */
  heroAlign?: 'top' | 'bottom';
  /** warna teks + bayangan teks yang berada langsung di atas ilustrasi setiap bab */
  ink?: Partial<Record<SectionId, { color: string; shadow?: string }>>;
  /** animasi kamera setelah sampul dibuka */
  intro: 'dolly' | 'popup' | 'rise' | 'descend';
  introMs?: number;
  /** warna teks yang tampil langsung di atas adegan: [awal halaman, akhir halaman] */
  heroText: string;
  closingText: string;
  /** bayangan teks penutup (default gelap untuk langit malam) */
  closingShadow?: string;
  /**
   * Ornamen paralaks per bagian. Dirender dua kali di setiap bagian:
   * layer 'back' di belakang panel dan 'front' di depan panel/teks.
   * Gunakan <Px> dari kit/scene agar bergerak terhadap posisi bagian di layar.
   */
  SectionDecor?: React.ComponentType<{ id: SectionId; layer: 'back' | 'front'; palette: ThemePalette }>;
  /** panel konten: kaca buram di atas adegan */
  panel?: { background: string; blur?: number; border?: string };
}

/** Varian warna yang bisa dipilih pemilik undangan di dashboard. */
export interface ThemeVariant {
  id: string;
  name: string;
  palette: Partial<ThemePalette>;
  /** warna bunga ornamen untuk varian ini */
  flora?: string[];
}

export interface ThemeSpec {
  /** varian warna; varian pertama = bawaan */
  variants?: ThemeVariant[];
  /**
   * Warna bunga ornamen (mawar, kuncup) yang mengapit foto & panel. Default dari palet.
   * leaf = warna daun.
   */
  flora?: { colors: string[]; leaf: string };
  /**
   * Panggung pembuka (hero) berlapis 2.5D: setelah sampul dibuka kamera turun dari langit
   * dan lapisan naik satu per satu. Default: taman prosedural dari palet tema.
   * Komponen kustom disusun dari <ArtLayer hero order> di kit/chapters.
   */
  Stage?: React.ComponentType<{ palette: ThemePalette; flora: { colors: string[]; leaf: string }; photo?: string }>;
  /** default 'regular' */
  tier?: ThemeTier;
  /** wajib untuk tier 'special' */
  scene?: SceneConfig;
  id: string;
  name: string;
  category: ThemeCategory;
  /** satu kalimat karakter tema (dipakai di katalog) */
  description: string;
  /** tanggal rilis YYYY-MM-DD — tema 14 hari terakhir diberi label "Baru" */
  addedAt: string;
  palette: ThemePalette;
  fonts: ThemeFonts;
  /** pola latar CSS (background-image), mis. data-URI SVG; opsional */
  pattern?: string;
  patternOpacity?: number;
  /** ornamen pemisah antar bagian */
  divider: DividerPreset;
  /** SVG pemisah kustom (menggantikan preset) — gunakan currentColor */
  dividerSvg?: string;
  /** ornamen sudut kustom untuk kartu (SVG, currentColor) */
  cornerSvg?: string;
  /** bentuk bingkai foto */
  frame: FrameShape;
  /** radius sudut kartu (px) */
  radius: number;
  cover: CoverVariant;
  hero: HeroVariant;
  couple: CoupleVariant;
  countdown: CountdownVariant;
  events: EventsVariant;
  gallery: GalleryVariant;
  ambient: AmbientPreset;
  reveal: RevealStyle;
  /** urutan bagian (default: semua bagian dalam urutan standar) */
  sections?: SectionId[];
  copy?: ThemeCopy;
  /** lapisan dekorasi khas tema (opsional) — dirender di atas latar, di bawah konten */
  Signature?: React.ComponentType<{ palette: ThemePalette }>;
  /** ornamen khas di sampul (opsional) */
  CoverArt?: React.ComponentType<{ palette: ThemePalette }>;
}

export function defineTheme(spec: ThemeSpec): ThemeSpec {
  return spec;
}
