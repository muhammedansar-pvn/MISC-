import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8F5] font-sans text-[#132238] antialiased selection:bg-[#2F7C7A]/30 selection:text-[#132238]">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
