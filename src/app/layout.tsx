import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const notoSansArabic = Noto_Sans_Arabic({
  variable: '--font-noto-sans-arabic',
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'موحسن - Mohassan',
    template: '%s | موحسن',
  },
  description: 'منصة موحسن - مجتمع متكامل للخدمات والتواصل',
  keywords: ['موحسن', 'mohassan', 'مجتمع', 'خدمات'],
  authors: [{ name: 'Mohassan Team' }],
  creator: 'Mohassan',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/brand/logo-180.png', sizes: '180x180', type: 'image/png' },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'موحسن - Mohassan',
    images: [{ url: '/brand/og.png', width: 1200, height: 630, alt: 'Mohassan' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${notoSansArabic.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-transparent text-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
