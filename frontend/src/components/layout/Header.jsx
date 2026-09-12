import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header 
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        mobileMenuOpen 
          ? 'bg-[#132238] border-slate-800 text-white' 
          : 'bg-white/95 backdrop-blur-sm border-[#E2E8E0] shadow-2xs text-[#132238]'
      }`}
    >
      {/* Clean Navbar */}
      <div className="misc-container flex items-center justify-between py-3 sm:py-3.5">
        {/* Brand / Logo */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0 pr-2" 
          aria-label="MISC Homepage"
        >
          <img
            src="/logo.png"
            alt="MISC Logo"
            className="h-10 sm:h-11 lg:h-[3.15rem] w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02] bg-white p-0.5 rounded-sm"
          />
          <span className={`font-serif font-bold text-xl sm:text-2xl lg:text-[1.75rem] tracking-tight leading-none ${
            mobileMenuOpen ? 'text-white' : 'text-[#132238]'
          }`}>
            {miscInfo.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile Hamburger / Close Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`lg:hidden w-[44px] h-[44px] flex items-center justify-center rounded-md border transition-colors cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#2F7C7A] focus-visible:outline-none ${
            mobileMenuOpen
              ? 'bg-[#132238] border-slate-700 text-white hover:bg-slate-800'
              : 'bg-white border-[#E2E8E0] text-[#132238] hover:bg-[#E6F2F1] hover:text-[#2F7C7A] active:bg-[#E6F2F1]'
          }`}
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

      {/* Mobile Navigation Panel */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;
