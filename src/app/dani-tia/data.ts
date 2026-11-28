/**
 * Data undangan Tia & Dhany — disalin persis dari undangan cetak (brief 28 Nov 2026).
 * Jangan mengubah ejaan nama, orang tua, tanggal, jam, atau alamat.
 * Item bertanda PLACEHOLDER menunggu data asli dari keluarga.
 */

export const PAGE_KEY = 'dani-tia';

export const COUPLE = {
  bride: {
    full: 'Tia Ifawati',
    nick: 'Tia',
    parents: 'Putri dari Bapak Sukirno & Ibu Suyuti',
  },
  groom: {
    full: 'Mohamad Dhany Azar',
    nick: 'Dhany',
    parents: 'Putra dari Bapak Wadi Rochim & Ibu Sri Endah',
  },
  monogram: ['T', 'D'] as const,
  title: 'The Wedding of Tia & Dhany',
};

export const DATE_DOTS = '06.12.2026';
export const DATE_LONG = 'Minggu, 6 Desember 2026';
/** Target hitung mundur: akad, 6 Desember 2026 08.00 WIB */
export const COUNTDOWN_ISO = '2026-12-06T08:00:00+07:00';

export const ADDRESS = 'Jln Sumberbeling Rt 30 Rw 10, Kasin Putuk, Ampeldento, Karangploso, Malang';

/**
 * PLACEHOLDER — link pin asli dari QR "MAPS LOKASI" di undangan cetak belum terbaca.
 * Sementara memakai pencarian alamat. Ganti dengan link pin dari keluarga.
 */
export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Jalan+Sumberbeling+RT+30+RW+10+Kasin+Putuk+Ampeldento+Karangploso+Malang';

export interface EventInfo {
  id: 'akad' | 'resepsi';
  name: string;
  date: string;
  time: string;
  /** Google Calendar: YYYYMMDDTHHMMSS waktu Jakarta */
  calStart: string;
  calEnd: string;
}

export const EVENTS: EventInfo[] = [
  { id: 'akad', name: 'Akad Nikah', date: DATE_LONG, time: '08.00 WIB', calStart: '20261206T080000', calEnd: '20261206T100000' },
  // Undangan menulis "Selesai"; Google Calendar wajib punya jam akhir, jadi entri kalender diberi blok 3 jam.
  { id: 'resepsi', name: 'Resepsi', date: DATE_LONG, time: '10.00 WIB – Selesai', calStart: '20261206T100000', calEnd: '20261206T130000' },
];

export function calendarUrl(e: EventInfo) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${e.name} Tia & Dhany`,
    dates: `${e.calStart}/${e.calEnd}`,
    ctz: 'Asia/Jakarta',
    details: `${e.name} — ${e.date}, pukul ${e.time}.\nThe Wedding of Tia & Dhany`,
    location: ADDRESS,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export const TEXT = {
  salam: 'Assalamualaikum Warahmatullahi Wabarakatuh',
  pembuka:
    'Maha Suci Allah SWT yang telah menciptakan makhluk-Nya berpasang-pasangan. Ya Allah semoga ridho-Mu tercurah mengiringi pernikahan kami:',
  arRuum:
    'Dan diantara tanda-tanda kekuasaan-Nya ialah diciptakan-Nya untuk pasangan hidup dari jenismu sendiri, supaya kamu mendapat ketenangan dan dijadikan-Nya diantara kamu kasih sayang. Sesungguhnya yang demikian itu merupakan tanda-tanda kebesaran-Nya bagi orang-orang yang berfikir.',
  arRuumSrc: 'QS. Ar Ruum : 21',
  anNuur:
    '“Dan kawinkanlah orang-orang yang sendirian diantara kamu, dan orang-orang layak (berkawin) dari hamba-hamba sahayamu yang lelaki dan hamba-hamba sahayamu yang perempuan. Jika mereka miskin, Allah akan memampukan mereka dengan karunia-Nya. Dan Allah Maha luas (pemberian-Nya) lagi Maha Mengetahui.”',
  anNuurSrc: 'QS. An-Nuur 24 : 32',
  dilaksanakan: 'yang Insya Allah akan dilaksanakan pada:',
  kehormatan:
    'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.',
  penutup: 'Wassalamu’alaikum Warahmatullahi Wabarakatuh',
  berbahagia: 'Kami yang berbahagia,',
  keluarga: ['Kel. Bapak Sukirno & Ibu Suyuti', 'Kel. Bapak Wadi Rochim & Ibu Sri Endah'],
  maafNama: 'Mohon maaf apabila ada kesalahan dalam penulisan nama & gelar',
  kepada: 'Kepada Yth. Bapak/Ibu/Saudara/i',
};

/** Musik latar pilihan pemilik (28 Nov 2026); diputar setelah tombol Buka Undangan, berulang. */
export const MUSIC_URL: string | null = '/assets/dani-tia/music.mp3';

/** PLACEHOLDER — undangan cetak tidak mencantumkan rekening; seksi amplop disembunyikan selama kosong. */
export const GIFTS: { bank: string; number: string; holder: string }[] = [];

// ------------------------------------------------------------------ foto
// Semua foto dari sesi prewedding pasangan (Drive @rfx.visual), dikompres WebP tanpa EXIF.
const A = '/assets/dani-tia';
export interface Photo {
  id: string;
  alt: string;
  /** lebar file kecil & besar */
  w: [number, number];
  ratio: number;
  /** titik fokus object-position */
  focus?: string;
}
export const img = (p: Photo, size: 0 | 1 = 0) => `${A}/${p.id}-${p.w[size]}.webp`;
export const srcSet = (p: Photo) => `${A}/${p.id}-${p.w[0]}.webp ${p.w[0]}w, ${A}/${p.id}-${p.w[1]}.webp ${p.w[1]}w`;

const P = (id: string, alt: string, w: [number, number], ratio: number, focus?: string): Photo => ({ id, alt, w, ratio, focus });

export const PHOTOS = {
  cover: P('cover', 'Tia dan Dhany duduk di atas Vespa biru di depan rolling door, malam hari', [720, 1200], 2 / 3, '50% 62%'),
  hands: P('hands', 'Genggaman tangan Tia dan Dhany, Vespa biru di belakang', [720, 1280], 3 / 2, '42% 40%'),
  tia: P('tia', 'Tia Ifawati', [480, 900], 1680 / 3180, '50% 30%'),
  dhany: P('dhany', 'Mohamad Dhany Azar', [480, 900], 1680 / 3180, '50% 30%'),
  ride: P('ride', 'Tia dan Dhany berboncengan Vespa di jalan malam, lampu menyala', [720, 1200], 0.668, '38% 50%'),
  walk: P('walk', 'Tia dan Dhany bergandengan menyeberang jalan malam', [720, 1200], 2 / 3, '50% 55%'),
  helmet: P('helmet', 'Dhany memasangkan helm untuk Tia sebelum berangkat', [720, 1280], 3 / 2, '64% 45%'),
  duo: P('duo', 'Tia dan Dhany berboncengan Vespa dengan helm', [720, 1280], 1.5, '40% 50%'),
  wide: P('g-m1', 'Tia dan Dhany duduk di samping Vespa biru', [720, 1400], 1.5, '50% 60%'),
  field: P('field', 'Tia dan Dhany berjalan di padang rumput di samping motor', [720, 1200], 2 / 3, '60% 70%'),
};

export interface CarouselPhoto {
  id: string;
  alt: string;
  chapter: 'Malam' | 'Jalanan' | 'Padang';
}
/** 12 foto galeri (urutan malam → jalanan → padang, Vespa didahulukan). File: c01-400.webp / c01-760.webp */
export const CAROUSEL: CarouselPhoto[] = [
  { id: 'c01', chapter: 'Malam', alt: 'Tia dan Dhany di atas Vespa biru di depan Toko Djojo' },
  { id: 'c02', chapter: 'Malam', alt: 'Tia memegang mawar putih di samping Vespa' },
  { id: 'c03', chapter: 'Malam', alt: 'Tia dan Dhany tersenyum di samping Vespa' },
  { id: 'c04', chapter: 'Malam', alt: 'Dhany memberi bunga, Tia tersipu' },
  { id: 'c05', chapter: 'Malam', alt: 'Tia duduk di Vespa memakai helm' },
  { id: 'c06', chapter: 'Malam', alt: 'Dhany memeriksa Vespa, Tia menunggu' },
  { id: 'c07', chapter: 'Jalanan', alt: 'Dhany menuntun Vespa, Tia berhelm merah' },
  { id: 'c08', chapter: 'Jalanan', alt: 'Tia dan Dhany bergandengan di jalan malam' },
  { id: 'c09', chapter: 'Jalanan', alt: 'Tia dan Dhany menuntun Vespa di trotoar' },
  { id: 'c10', chapter: 'Padang', alt: 'Tia dan Dhany berdiri di samping motor di padang rumput' },
  { id: 'c11', chapter: 'Padang', alt: 'Tia dan Dhany duduk bersandar pada motor' },
  { id: 'c12', chapter: 'Padang', alt: 'Tia dan Dhany bersandar pada motor di padang' },
];
export const cImg = (c: CarouselPhoto, big = false) => `${A}/${c.id}-${big ? 760 : 400}.webp`;
