import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-sm border-b border-[#E2E8E0]/80 shadow-2xs">
      {/* Clean White Navbar */}
      <div className="misc-container flex items-center justify-between py-3.5 sm:py-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group" aria-label="MISC Homepage">
          <img
            src="/logo.png"
            alt="MISC - Markaz Integrated Studies Council Logo"
            className="h-10 sm:h-11 lg:h-12 w-auto object-contain transition-all"
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg xl:text-xl tracking-tight text-[#132238] leading-none">
              {miscInfo.name}
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-[#475569] uppercase mt-0.5">
              Markaz Integrated Studies Council
            </span>
          </div>
        </Link>
        <DesktopNav />

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-md text-[#132238] hover:text-[#2F7C7A] hover:bg-[#F7F8F5] focus:outline-none focus:ring-2 focus:ring-[#132238] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};
export default Header;
