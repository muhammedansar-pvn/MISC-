import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ArrowUpRight } from 'lucide-react';
import DesktopNav from '../navigation/DesktopNav';
import MobileNav from '../navigation/MobileNav';
import { miscInfo } from '../../data/miscInfo';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-[var(--misc-card-bg)]/95 backdrop-blur-sm">
      <div className="bg-[var(--misc-deep-blue)] text-[var(--misc-card-bg)]">
        <div className="misc-container flex min-h-8 items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em]">
          <span className="hidden sm:inline">An academic initiative of {miscInfo.parentOrganization}</span>
          <span className="ml-auto text-[var(--misc-gold)]">Knowledge · Character · Service</span>
        </div>
      </div>
      <div className="misc-container flex items-center justify-between gap-6 py-4 sm:py-5">
        <Link to="/" className="group flex items-center gap-3" aria-label="MISC Homepage">
          <span className="motif-grid flex size-11 items-center justify-center border border-[var(--misc-gold)] bg-[var(--misc-deep-blue)] font-serif text-xl font-bold text-[var(--misc-gold)] shadow-sm">M</span>
          <span className="flex flex-col">
            <span className="font-serif text-xl font-bold leading-none tracking-tight text-[var(--misc-deep-blue)] sm:text-2xl">{miscInfo.name}</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-[var(--misc-text-muted)]">Markaz Integrated Studies Council</span>
          </span>
        </Link>
        <DesktopNav />
        <button type="button" onClick={() => setMobileMenuOpen(true)} className="flex size-10 items-center justify-center border border-[var(--misc-border)] text-[var(--misc-deep-blue)] hover:border-[var(--misc-gold)] lg:hidden" aria-label="Open navigation menu"><Menu /></button>
      </div>
      <div className="hidden border-t bg-[var(--misc-bg)] lg:block"><div className="misc-container flex items-center justify-end gap-2 py-2 text-xs text-[var(--misc-text-muted)]"><span>Explore the council</span><ArrowUpRight className="size-3 text-[var(--misc-gold)]" /></div></div>
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};
export default Header;
