import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, DM_Sans, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
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

// Tipografi aplikasi (landing, auth, dashboard)
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-ui",
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F8F5F0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${dmSerif.variable} ${dmSans.variable} ${playfair.variable} ${jakarta.variable} antialiased bg-background text-foreground`}>
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
