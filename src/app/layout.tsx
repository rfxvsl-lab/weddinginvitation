import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../hooks/useAuth';
import { ToastProvider } from '../hooks/useToast';
import { AlertModalProvider } from '../hooks/useAlertModal';
import '../index.css';
import GodMode from '../components/GodMode';
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

export const metadata: Metadata = {
  title: 'ruanghadir.net — Buat Undangan Pernikahan Digital yang Elegan',
  description: 'Platform pembuatan undangan pernikahan digital premium. Desain elegan, RSVP digital, dan personalisasi tanpa batas.',
  keywords: ['undangan digital', 'undangan pernikahan', 'wedding invitation', 'undangan online', 'RSVP digital', 'RUANGHADIR'],
  authors: [{ name: 'ruanghadir.net' }],
  icons: {
    icon: '/logo-browser.png',
    apple: '/logo-browser.png',
  },
  openGraph: {
    title: 'ruanghadir.net — Buat Undangan Digital Premium',
    description: 'Platform pembuatan undangan pernikahan digital premium. Desain elegan, RSVP digital, dan personalisasi tanpa batas.',
    siteName: 'ruanghadir.net',
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FBF8F4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${dmSerif.variable} ${dmSans.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <AlertModalProvider>
              <GodMode />
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
