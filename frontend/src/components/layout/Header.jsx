import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E2E8E0] shadow-2xs">
      {/* Clean White Navbar */}
      <div className="misc-container flex items-center justify-between py-3 sm:py-3.5">
        {/* Brand / Logo */}
        <Link 
          to="/" 
          className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 pr-2" 
          aria-label="MISC Homepage"
        >
          <img
            src="/logo.png"
            alt="MISC - Markaz Integrated Studies Council Logo"
            className="h-9 sm:h-10 lg:h-12 w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02]"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-base sm:text-lg xl:text-xl tracking-tight text-[#132238] leading-none truncate">
              {miscInfo.name}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider sm:tracking-widest text-[#475569] uppercase mt-0.5 truncate">
              Markaz Integrated Studies Council
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile Hamburger / Close Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden w-[44px] h-[44px] flex items-center justify-center rounded-md bg-white border border-[#E2E8E0] text-[#132238] hover:bg-[#E6F2F1] hover:text-[#2F7C7A] active:bg-[#E6F2F1] transition-colors focus-visible:ring-2 focus-visible:ring-[#2F7C7A] focus-visible:outline-none cursor-pointer shrink-0"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {mobileMenuOpen ? (
            <X className="w-[22px] h-[22px] stroke-[2.2]" />
          ) : (
            <Menu className="w-[22px] h-[22px] stroke-[2.2]" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
