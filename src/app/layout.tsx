import type { Metadata, Viewport } from 'next';
import ZoomLock from '@/components/system/ZoomLock';
import { DM_Serif_Display, DM_Sans, Manrope } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { AlertModalProvider } from '../hooks/useAlertModal';
import '../index.css';
import '../styles/product.css';
import { Toaster } from "../components/ui/toaster";

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Tipografi aplikasi (landing, auth, dashboard): satu keluarga huruf — Manrope
// (aturan ai-design-skills/landing-page-design B1: satu typeface, tanpa italic, maks. bold).
const manrope = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'RuangHadir — Platform Undangan Pernikahan Digital Gratis & Elegan',
  description: 'Buat undangan pernikahan digital di RuangHadir dengan tema pilihan, tautan bernama tamu, RSVP, amplop digital, dan QR check-in.',
  keywords: ['undangan digital gratis', 'undangan pernikahan gratis', 'undangan online gratis', 'wedding invitation', 'RSVP digital', 'ruanghadir'],
  authors: [{ name: 'ruanghadir.net' }],
  icons: {
    icon: '/logo-browser.png',
    apple: '/logo-browser.png',
  },
  openGraph: {
    title: 'RuangHadir — Platform Undangan Pernikahan Digital Gratis & Elegan',
    description: 'Buat undangan pernikahan digital dengan tema pilihan, tautan bernama tamu, RSVP, amplop digital, dan QR check-in.',
    siteName: 'ruanghadir.net',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: '#F8F5F0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${dmSerif.variable} ${dmSans.variable} ${manrope.variable} antialiased bg-background text-foreground`}>
        <ZoomLock />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <AlertModalProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </AlertModalProvider>
          </ToastProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
