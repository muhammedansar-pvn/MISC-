'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        mobileMenuOpen
          ? 'bg-misc-navy text-white border-b border-white/10'
          : 'bg-white/95 backdrop-blur-md text-misc-text border-b border-misc-border shadow-2xs py-2'
      }`}
    >
      <div className="misc-container flex items-center justify-between transition-all duration-300">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex min-w-0 items-center space-x-3.5 pr-3"
          aria-label="MISC Homepage"
        >
          <img
            src="/logo.png"
            alt="MISC - Markaz Integrated Studies Council"
            className="h-10 w-auto shrink-0 rounded-xs bg-white p-0.5 object-contain sm:h-11 lg:h-12"
          />
          <div className="flex flex-col text-left">
            <span
              className={
                mobileMenuOpen
                  ? 'font-serif text-lg font-bold leading-none tracking-tight text-white sm:text-xl'
                  : 'font-serif text-lg font-bold leading-none tracking-tight text-misc-text sm:text-xl'
              }
            >
              SANAVIYYA
            </span>
            <span
              className={
                mobileMenuOpen
                  ? 'mt-1 text-[9px] uppercase tracking-[0.2em] text-slate-300 sm:text-[10px]'
                  : 'mt-1 text-[9px] uppercase tracking-[0.2em] text-misc-muted sm:text-[10px]'
              }
            >
              JAMIA MARKAZ, KARANTHUR
            </span>
          </div>
        </Link>

        <DesktopNav />

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xs border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary lg:hidden ${
            mobileMenuOpen
              ? 'border-white/20 bg-misc-navy text-white'
              : 'border-misc-border bg-white text-misc-text hover:bg-misc-page'
          }`}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 stroke-[2]" />
          ) : (
            <Menu className="h-5 w-5 stroke-[2]" />
          )}
        </button>
      </div>

      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
