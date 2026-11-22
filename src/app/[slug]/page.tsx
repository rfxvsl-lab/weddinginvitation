import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getInvitationBySlug, getRSVPsByInvitation, getUserById, validateGuestCode } from '../../lib/db';
import { getSession } from '../../lib/server/auth';
import InvitationClient from './InvitationClient';
import type { Guest } from '../../types';
import { Timer } from 'lucide-react';
import { getWatermarkType } from '../../lib/packageLimits';

// Always fetch fresh data — no caching (important for post-publish updates)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; code?: string }>;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const inv = await getInvitationBySlug(slug);

  if (!inv || !inv.isPublished) {
    return {
      title: 'Undangan Tidak Ditemukan — RuangHadir',
      robots: { index: false, follow: false },
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

  const found = await getInvitationBySlug(slug);
  // Draft hanya boleh dilihat pemiliknya (pratinjau). Publik hanya melihat versi terbit.
  let isOwnerPreview = false;
  if (found && !found.isPublished) {
    const session = await getSession();
    isOwnerPreview = !!session && (session.uid === found.userId || session.role === 'admin');
  }
  const inv = found && (found.isPublished || isOwnerPreview) ? found : null;

  if (!inv) notFound();

  // Check if invitation has expired (masa aktif habis)
  if (inv.isExpired) {
    const groomName = inv.weddingData?.couple?.groom?.nickname || 'Mempelai Pria';
    const brideName = inv.weddingData?.couple?.bride?.nickname || 'Mempelai Wanita';
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
        <div className="max-w-md w-full bg-[#0a0a0e] rounded-3xl p-8 border border-zinc-800/50 flex flex-col items-center relative overflow-hidden">
          {/* Decorative gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500" />

          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
            <Timer className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Masa Aktif Telah Berakhir</h1>
          <p className="text-zinc-400 mb-2 text-sm">
            Undangan pernikahan <span className="text-white font-semibold">{groomName} &amp; {brideName}</span> telah melewati masa aktifnya.
          </p>
          <p className="text-zinc-500 mb-8 text-xs">
            Hubungi pemilik undangan untuk memperpanjang masa aktif, atau buat undangan Anda sendiri.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <a
              href="/"
              className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition text-sm text-center"
            >
              Buat Undangan
            </a>
            <a
              href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20memperpanjang%20undangan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition text-sm text-center"
            >
              Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Hanya data yang diperlukan halaman publik — daftar tamu TIDAK dikirim ke browser.
  const [rsvpsData, userData] = await Promise.all([
    getRSVPsByInvitation(inv.id),
    getUserById(inv.userId),
  ]);

  const watermarkType = getWatermarkType(userData?.packageId || 'free');

  // Tamu personal: dicocokkan lewat kode undangan (bukan daftar lengkap di client)
  let urlGuest: Guest | undefined = undefined;
  if (guestCode) {
    const matched = await validateGuestCode(inv.id, String(guestCode).slice(0, 32));
    if (matched) urlGuest = { ...matched, phoneNumber: '' };
  }
  if (!urlGuest && guestTo) {
    urlGuest = {
      id: '',
      name: String(guestTo).slice(0, 80),
      group: 'Tamu Undangan',
      paxLimit: 2,
      phoneNumber: '',
      status: 'Opened',
      invitationCode: '',
    };
  }

  // JSON-LD structured data (Event details)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': `Pernikahan ${inv.weddingData?.couple?.groom?.fullName} & ${inv.weddingData?.couple?.bride?.fullName}`,
    'startDate': inv.weddingData?.countdownDate || undefined,
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
      {isOwnerPreview && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-[#7A2E3B] text-white text-center text-xs font-medium py-2 px-4">
          Pratinjau draf — hanya Anda yang dapat melihat halaman ini sampai undangan dipublikasikan.
        </div>
      )}
      <div className="relative w-full min-h-screen bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full h-full relative animate-fadeIn">
          <InvitationClient
            invitationId={inv.id}
            weddingData={inv.weddingData}
            themeId={inv.themeId}
            initialRsvps={rsvpsData}
            urlGuest={urlGuest}
            watermarkType={watermarkType}
            slug={slug}
            appUrl={process.env.NEXT_PUBLIC_APP_URL || 'https://ruanghadir.net'}
            serverNow={new Date().toISOString()}
          />
        </div>
      </div>
    </>
  );
}
