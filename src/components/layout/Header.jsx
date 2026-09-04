import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Main Single Sticky Navbar matching Figma reference */}
      <div className="misc-container flex items-center justify-between py-3.5 sm:py-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-3 group" aria-label="MISC Homepage">
          <div className="w-10 h-10 bg-[#0B1D3A] text-[#D4AF37] flex items-center justify-center rounded font-serif font-bold text-xl border border-[#D4AF37]/30 shadow-xs group-hover:bg-[#145DA0] transition-colors">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-tight text-[#0B1D3A] leading-none">
              {miscInfo.name}
            </span>
            <span className="text-[11px] font-medium tracking-wider text-slate-500 uppercase mt-0.5">
              Markaz Integrated Council
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-md text-slate-700 hover:text-[#0B1D3A] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
