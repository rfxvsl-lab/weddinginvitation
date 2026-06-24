import React from 'react';
import { Metadata } from 'next';
import { getInvitationBySlug, getGuestsByInvitation, getRSVPsByInvitation } from '../../lib/api';
import InvitationClient from './InvitationClient';
import type { Guest } from '../../types';
import { Globe } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; code?: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const inv = await getInvitationBySlug(slug);

  if (!inv) {
    return {
      title: 'Undangan Tidak Ditemukan - RFX VISUAL',
      description: 'Halaman undangan pernikahan tidak dapat ditemukan.',
    };
  }

  const groomName = inv.weddingData?.couple?.groom?.nickname || 'Mempelai Pria';
  const brideName = inv.weddingData?.couple?.bride?.nickname || 'Mempelai Wanita';
  const title = `Pernikahan ${groomName} & ${brideName} | Undangan Digital`;
  const description = `Selamat datang di undangan pernikahan digital ${inv.weddingData?.couple?.groom?.fullName} & ${inv.weddingData?.couple?.bride?.fullName}. Bergabunglah bersama kami merayakan hari bahagia ini.`;
  const ogImage = inv.weddingData?.ogImageUrl || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { to: guestTo, code: guestCode } = await searchParams;

  const inv = await getInvitationBySlug(slug);

  if (!inv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
        <div className="max-w-md w-full bg-[#0a0a0e] rounded-3xl p-8 border border-zinc-800/50 flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <Globe className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Undangan Tidak Ditemukan</h1>
          <p className="text-zinc-400 mb-8 text-sm">
            Maaf, halaman undangan yang Anda cari tidak dapat ditemukan. Pastikan URL atau slug yang Anda masukkan sudah benar.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition text-sm"
          >
            Buat Undangan Sendiri
          </a>
        </div>
      </div>
    );
  }

  // Load guests and RSVPs on server
  const [guestsData, rsvpsData] = await Promise.all([
    getGuestsByInvitation(inv.id),
    getRSVPsByInvitation(inv.id),
  ]);

  // Match urlGuest
  let urlGuest: Guest | undefined = undefined;
  if (guestTo) {
    const matched = guestsData.find(
      g => g.name.toLowerCase() === guestTo.toLowerCase() || g.invitationCode === guestCode
    );

    if (matched) {
      urlGuest = matched;
    } else {
      urlGuest = {
        id: `tg-${Date.now()}`,
        name: guestTo,
        group: 'Tamu Berharga',
        paxLimit: 2,
        phoneNumber: '081234567890',
        status: 'Opened',
        invitationCode: guestCode || 'W-TEMP'
      };
    }
  }

  // JSON-LD structured data (Event details)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': `Pernikahan ${inv.weddingData?.couple?.groom?.fullName} & ${inv.weddingData?.couple?.bride?.fullName}`,
    'startDate': inv.weddingData?.countdownDate || '2026-08-08T08:00:00+07:00',
    'location': {
      '@type': 'Place',
      'name': inv.weddingData?.events?.akad?.venueName || 'Venue Akad',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': inv.weddingData?.events?.akad?.address || 'Alamat Akad',
      },
    },
    'description': `Undangan pernikahan digital untuk ${inv.weddingData?.couple?.groom?.fullName} & ${inv.weddingData?.couple?.bride?.fullName}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative w-full min-h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full h-full relative animate-fadeIn">
          <InvitationClient
            invitationId={inv.id}
            weddingData={inv.weddingData}
            themeId={inv.themeId}
            guests={guestsData}
            initialRsvps={rsvpsData}
            urlGuest={urlGuest}
          />
        </div>
      </div>
    </>
  );
}
