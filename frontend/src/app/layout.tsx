import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope, Noto_Naskh_Arabic, Noto_Sans_Malayalam } from 'next/font/google';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const notoArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
});

const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-malayalam',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://misc.markaz.in'),
  title: 'MISC - Markaz Integrated Studies Council',
  description:
    'Markaz Integrated Studies Council (MISC) is the academic coordination council of Jamia Markaz, overseeing integrated educational streams, standardized curricula, and board evaluations.',
  keywords: [
    'MISC',
    'Markaz Integrated Studies Council',
    'Jamia Markaz',
    'Integrated Education',
    'Islamic Studies',
    'Academic Board',
    'Karanthur',
    'Kozhikode',
  ],
  authors: [{ name: 'Markaz Integrated Studies Council' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'MISC - Markaz Integrated Studies Council',
    description:
      'Integrating Islamic & Contemporary Education under the central academic management of Jamia Markaz.',
    type: 'website',
    url: 'https://misc.markaz.in',
    images: [{ url: '/favicon.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MISC - Markaz Integrated Studies Council',
    description:
      'Integrating Islamic & Contemporary Education under the central academic management of Jamia Markaz.',
    images: ['/favicon.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} ${notoArabic.variable} ${notoMalayalam.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-white text-[#132238] antialiased selection:bg-[#2F7C7A]/30 selection:text-[#132238]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
