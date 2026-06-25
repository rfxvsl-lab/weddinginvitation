/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * API Route: /api/music-search
 * Proxy untuk iTunes Search API agar menghindari batasan CORS di browser.
 * Pencarian lagu gratis tanpa autentikasi.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get('term');

  if (!term || term.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const itunesUrl = new URL('https://itunes.apple.com/search');
    itunesUrl.searchParams.set('term', term);
    itunesUrl.searchParams.set('media', 'music');
    itunesUrl.searchParams.set('entity', 'song');
    itunesUrl.searchParams.set('limit', '8');
    itunesUrl.searchParams.set('country', 'ID');

    const response = await fetch(itunesUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache 5 menit
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data = await response.json();

    // Hanya kirim field yang dibutuhkan ke klien
    const results = (data.results || []).map((track: any) => ({
      trackId: track.trackId,
      trackName: track.trackName,
      artistName: track.artistName,
      collectionName: track.collectionName,
      artworkUrl100: track.artworkUrl100,
      previewUrl: track.previewUrl,
      trackTimeMillis: track.trackTimeMillis,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Gagal mengambil data dari iTunes:', error);
    return NextResponse.json({ results: [], error: 'Gagal menghubungi layanan musik' }, { status: 500 });
  }
}
