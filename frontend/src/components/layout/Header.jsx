'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isHome && !isScrolled && !mobileMenuOpen;

  return (
    <header
      className={`${
        isHome ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      } z-50 w-full transition-all duration-300 ${
        mobileMenuOpen
          ? 'bg-[#0D1B2A] text-white border-b border-white/10'
          : isTransparent
          ? 'bg-gradient-to-b from-[#0D1B2A]/70 via-[#0D1B2A]/30 to-transparent text-white border-b border-transparent py-2.5'
          : 'bg-white/95 backdrop-blur-md text-[#132238] border-b border-[rgba(19,34,56,0.12)] shadow-xs py-1.5'
      }`}
    >
      <div className="misc-container flex items-center justify-between transition-all duration-300">
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-3.5 group min-w-0 pr-3"
          aria-label="MISC Homepage"
        >
          <img
            src="/logo.png"
            alt="MISC - Markaz Integrated Studies Council"
            className={`h-10 sm:h-11 lg:h-12 w-auto object-contain shrink-0 transition-all duration-300 ${
              isTransparent
                ? 'brightness-0 invert drop-shadow-md'
                : 'bg-white p-0.5 rounded-xs'
            }`}
          />
          <div className="flex flex-col text-left">
            <span className={`font-serif text-lg sm:text-xl font-bold tracking-tight leading-none transition-colors ${
              isTransparent ? 'text-white' : 'text-[#132238]'
            }`}>
              MISC
            </span>
            <span className={`text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase mt-1 transition-colors ${
              isTransparent ? 'text-[#F7F5EF]/80' : 'text-[#667085]'
            }`}>
              JAMIA MARKAZ, KARANTHUR
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav isTransparent={isTransparent} />

        {/* Mobile Hamburger / Close Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xs border transition-all cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#2F7C7A] focus-visible:outline-none ${
            mobileMenuOpen
              ? 'bg-[#0D1B2A] border-white/20 text-white'
              : isTransparent
              ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20'
              : 'bg-white border-[rgba(19,34,56,0.12)] text-[#132238] hover:bg-[#F7F7F3]'
          }`}
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 stroke-[2]" />
          ) : (
            <Menu className="w-5 h-5 stroke-[2]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Panel */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
