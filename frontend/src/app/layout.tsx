import type { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://misc.markaz.in'),
  title: 'Markaz Sanaviyya Academy | Jamia Markaz',
  description:
    'Markaz Sanaviyya Academy harmonises authentic Islamic scholarship with modern academic excellence, nurturing individuals of faith, knowledge, and noble character.',
  keywords: [
    'Markaz Sanaviyya Academy',
    'Sanaviyya',
    'MISC',
    'Jamia Markaz',
    'Islamic Scholarship',
    'Integrated Education',
    'Karanthur',
    'Kozhikode',
  ],
  authors: [{ name: 'Markaz Sanaviyya Academy' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Markaz Sanaviyya Academy | Jamia Markaz',
    description:
      'Harmonising authentic Islamic scholarship with modern academic excellence under the central academic management of Jamia Markaz.',
    type: 'website',
    url: 'https://misc.markaz.in',
    images: [{ url: '/logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markaz Sanaviyya Academy | Jamia Markaz',
    description:
      'Harmonising authentic Islamic scholarship with modern academic excellence under the central academic management of Jamia Markaz.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-[#243447] antialiased selection:bg-[#3182CE]/20 selection:text-[#173B65]" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

