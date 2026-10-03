import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sanaviyya-site flex min-h-screen flex-col bg-misc-page font-sans text-misc-text antialiased selection:bg-misc-primary/30 selection:text-misc-text">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
