import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sanaviyya-site flex min-h-screen flex-col bg-white font-sans text-[#243447] antialiased selection:bg-[#3182CE]/20 selection:text-[#173B65]">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

