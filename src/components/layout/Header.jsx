import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--misc-border)] bg-[var(--misc-card-bg)]/95 backdrop-blur-md">
      <div className="misc-container flex min-h-[76px] items-center justify-between gap-5 lg:min-h-[88px]">
        <Link to="/" className="group flex min-w-0 items-center gap-3" aria-label="MISC Homepage">
          <span className="motif-grid flex size-10 shrink-0 items-center justify-center border border-[var(--misc-gold)] bg-[var(--misc-deep-blue)] font-serif text-lg font-bold text-[var(--misc-gold)] transition-colors group-hover:bg-[var(--misc-blue)] sm:size-11">M</span>
          <span className="flex min-w-0 flex-col">
            <span className="font-serif text-lg font-bold leading-none tracking-tight text-[var(--misc-deep-blue)] sm:text-xl">{miscInfo.name}</span>
            <span className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--misc-text-muted)] sm:text-[10px] sm:tracking-[0.17em]">{miscInfo.fullName}</span>
          </span>
        </Link>
        <DesktopNav />
        <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex size-10 shrink-0 items-center justify-center border border-[var(--misc-border)] text-[var(--misc-deep-blue)] transition-colors hover:border-[var(--misc-gold)] hover:text-[var(--misc-blue)] lg:hidden" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
          <Menu aria-hidden="true" />
        </button>
      </div>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};
export default Header;
