import React from 'react';
import { NavLink } from 'react-router-dom';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = () => (
  <nav className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Primary navigation">
    {navLinks.map((link) => (
      <NavLink key={link.path} to={link.path} className={({ isActive }) => `relative py-3 text-[11px] font-semibold uppercase tracking-[0.13em] transition-colors after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-[var(--misc-gold)] after:transition-transform ${isActive ? 'text-[var(--misc-deep-blue)] after:scale-x-100' : 'text-[var(--misc-text-muted)] after:scale-x-0 hover:text-[var(--misc-blue)] hover:after:scale-x-100'}`}>
        {link.name}
      </NavLink>
    ))}
    <NavLink to={applyCta.path} className="ml-2 border border-[var(--misc-deep-blue)] bg-[var(--misc-deep-blue)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--misc-card-bg)] transition-colors hover:border-[var(--misc-blue)] hover:bg-[var(--misc-blue)]">
      {applyCta.name}
    </NavLink>
  </nav>
);
export default DesktopNav;
