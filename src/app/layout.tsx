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
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    siteName: 'موحسن - Mohassan',
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
          <div className="min-h-screen flex flex-col bg-gray-950 text-white">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
