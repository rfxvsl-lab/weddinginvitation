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

/** PLACEHOLDER — musik latar belum dipilih. Isi URL mp3 untuk menampilkan tombol musik. */
export const MUSIC_URL: string | null = null;

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
  tia: P('tia', 'Tia Ifawati', [480, 900], 2 / 3, '50% 30%'),
  dhany: P('dhany', 'Mohamad Dhany Azar', [480, 900], 2 / 3, '50% 30%'),
  ride: P('ride', 'Tia dan Dhany berboncengan Vespa di jalan malam, lampu menyala', [720, 1200], 0.668, '38% 50%'),
  walk: P('walk', 'Tia dan Dhany bergandengan menyeberang jalan malam', [720, 1200], 2 / 3, '50% 55%'),
  helmet: P('helmet', 'Dhany memasangkan helm untuk Tia sebelum berangkat', [720, 1280], 3 / 2, '64% 45%'),
  duo: P('duo', 'Tia dan Dhany berboncengan Vespa dengan helm', [720, 1280], 1.5, '40% 50%'),
  field: P('field', 'Tia dan Dhany berjalan di padang rumput di samping motor', [720, 1200], 2 / 3, '60% 70%'),
};

export interface Chapter {
  id: string;
  title: string;
  photos: Photo[];
}
export const GALLERY: Chapter[] = [
  {
    id: 'malam',
    title: 'Malam',
    photos: [
      P('g-m1', 'Tia dan Dhany duduk di samping Vespa biru', [720, 1400], 1.5),
      P('g-m5', 'Tia memegang mawar putih di samping Vespa', [640, 1100], 2 / 3),
      P('g-m2', 'Tia dan Dhany di atas Vespa di depan toko', [640, 1100], 2 / 3),
      P('g-m3', 'Tia dan Dhany tersenyum di samping Vespa', [640, 1100], 2 / 3),
      P('g-m4', 'Dhany memberi bunga untuk Tia', [640, 1100], 2 / 3),
      P('g-m6', 'Tia duduk di Vespa memakai helm', [640, 1100], 2 / 3),
      P('g-m7', 'Dhany memeriksa Vespa, Tia menunggu', [640, 1100], 2 / 3),
    ],
  },
  {
    id: 'jalanan',
    title: 'Jalanan',
    photos: [
      P('g-j1', 'Tia dan Dhany bergandengan di jalan malam', [640, 1100], 2 / 3),
      P('g-j3', 'Tia membetulkan kerah Dhany di samping Vespa', [720, 1400], 1.5),
      P('g-j2', 'Tia dan Dhany menuntun Vespa di trotoar', [640, 1100], 2 / 3),
      P('g-j4', 'Tia dan Dhany berdiri berdampingan di samping Vespa', [720, 1400], 1.5),
      P('g-j5', 'Tia dan Dhany bercanda di Vespa', [720, 1400], 1.5),
      P('g-j6', 'Tia dan Dhany berboncengan, lensa fisheye', [720, 1400], 1.5),
    ],
  },
  {
    id: 'padang',
    title: 'Padang',
    photos: [
      P('g-p6', 'Tia dan Dhany bergandengan berlari di padang rumput', [720, 1400], 1.5),
      P('g-p1', 'Tia dan Dhany berdiri di samping motor di padang', [640, 1100], 2 / 3),
      P('g-p3', 'Dhany bersandar pada motor, Tia duduk', [720, 1400], 1.5),
      P('g-p2', 'Tia dan Dhany duduk bersandar pada motor', [640, 1100], 2 / 3),
      P('g-p5', 'Tia dan Dhany melompat di padang rumput', [720, 1400], 1.5),
      P('g-p4', 'Tia dan Dhany duduk di rumput, tertawa', [640, 1100], 2 / 3),
      P('g-p7', 'Tia dan Dhany bersandar pada motor di padang', [640, 1100], 2 / 3),
    ],
  },
];
