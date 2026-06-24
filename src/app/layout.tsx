import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import '../index.css';
import GodMode from '../components/GodMode';

export const metadata = {
  title: 'UndanganKita — Buat Undangan Digital Premium',
  description: 'Platform pembuatan undangan pernikahan digital premium. Desain elegan, RSVP digital, dan personalisasi tanpa batas.',
  keywords: ['undangan digital', 'undangan pernikahan', 'wedding invitation', 'undangan online', 'RSVP digital'],
  authors: [{ name: 'UndanganKita' }],
  openGraph: {
    title: 'UndanganKita — Buat Undangan Digital Premium',
    description: 'Platform pembuatan undangan pernikahan digital premium. Desain elegan, RSVP digital, dan personalisasi tanpa batas.',
    siteName: 'UndanganKita',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#FBF8F4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#FBF8F4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#FBF8F4] text-[#2D2A26] antialiased font-sans">
        <GodMode />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
