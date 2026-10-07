import type { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F7F7F3] text-[#132238] antialiased selection:bg-[#2F7C7A]/30 selection:text-[#132238]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
