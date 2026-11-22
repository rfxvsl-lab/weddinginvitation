import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans, Caveat } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { AlertModalProvider } from '../hooks/useAlertModal';
import '../index.css';
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

const caveat = Caveat({
  variable: "--font-hand",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'RuangHadir — Platform Undangan Pernikahan Digital Gratis & Elegan',
  description: 'Buat undangan pernikahan digital modern secara gratis di ruanghadir.net. Dilengkapi 9 tema elegan, link personal nama tamu, RSVP real-time, amplop digital, dan QR check-in.',
  keywords: ['undangan digital gratis', 'undangan pernikahan gratis', 'undangan online gratis', 'wedding invitation', 'RSVP digital', 'ruanghadir'],
  authors: [{ name: 'ruanghadir.net' }],
  icons: {
    icon: '/logo-browser.png',
    apple: '/logo-browser.png',
  },
  openGraph: {
    title: 'RuangHadir — Platform Undangan Pernikahan Digital Gratis & Elegan',
    description: 'Buat undangan pernikahan digital modern secara gratis. 9 tema elegan, link personal nama tamu, RSVP real-time, amplop digital, dan QR check-in.',
    siteName: 'ruanghadir.net',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#FAF7F2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FAF7F2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${dmSerif.variable} ${dmSans.variable} ${caveat.variable} antialiased bg-background text-foreground`}>
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
