import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication — Markaz Integrated Studies Council (MISC)',
  description: 'Sign in to access the Markaz Integrated Studies Council (MISC) educational and administrative portal.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-between antialiased font-sans text-slate-800">
      {/* Top Header Branding Bar */}
      <header className="w-full py-4 px-6 sm:px-10 border-b border-[#E2E8E0] bg-white/80 backdrop-blur-xs flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#2F7C7A] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[#256361] transition-colors">
            M
          </div>
          <div>
            <span className="font-serif font-bold text-base sm:text-lg text-[#132238] tracking-tight block leading-none">
              MISC
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mt-0.5">
              Integrated Studies Council
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-[#2F7C7A] transition-colors"
        >
          &larr; Back to Website
        </Link>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full py-4 px-6 border-t border-[#E2E8E0] bg-white text-center text-xs text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Markaz Integrated Studies Council (MISC). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
