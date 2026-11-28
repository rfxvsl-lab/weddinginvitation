import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Jost, Pinyon_Script } from 'next/font/google';
import DaniTiaInvitation from './DaniTiaInvitation';

/**
 * Halaman undangan khusus Tia & Dhany — 6 Desember 2026, Karangploso, Malang.
 * Route statis (tanpa akun/DB undangan). RSVP & ucapan lewat /api/custom-pages/dani-tia/rsvp.
 * Nama tamu: /dani-tia?to=Nama+Tamu
 */

const display = Bodoni_Moda({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz'], variable: '--dt-display', display: 'swap' });
const script = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--dt-script', display: 'swap' });
const sans = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--dt-sans', display: 'swap' });

const TITLE = 'The Wedding of Tia & Dhany — 06.12.2026';
const DESC = 'Undangan pernikahan Tia Ifawati & Mohamad Dhany Azar. Minggu, 6 Desember 2026 — Karangploso, Malang.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: 'website',
    images: [{ url: '/assets/dani-tia/og.jpg', width: 1200, height: 630, alt: 'Tia dan Dhany bersama Vespa biru' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: ['/assets/dani-tia/og.jpg'] },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: '#0E110F',
};

function guestFrom(raw: string | string[] | undefined) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return '';
  return v
    .replace(/\+/g, ' ')
    .replace(/[<>{}\u0000-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const guest = guestFrom(sp.to);
  return (
    <div className={`${display.variable} ${script.variable} ${sans.variable}`}>
      <link rel="preload" as="image" href="/assets/dani-tia/cover-720.webp" media="(max-width: 899px)" />
      <DaniTiaInvitation guest={guest} />
    </div>
  );
}
