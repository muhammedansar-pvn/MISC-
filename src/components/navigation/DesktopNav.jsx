import React from 'react';
import { NavLink } from 'react-router-dom';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = () => (
  <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary navigation">
    {navLinks.map((link) => (
      <NavLink key={link.path} to={link.path} className={({ isActive }) => `border-b-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${isActive ? 'border-[var(--misc-gold)] text-[var(--misc-deep-blue)]' : 'border-transparent text-[var(--misc-text-muted)] hover:border-[var(--misc-gold)] hover:text-[var(--misc-blue)]'}`}>
        {link.name}
      </NavLink>
    ))}
    <NavLink to={applyCta.path} className="bg-[var(--misc-deep-blue)] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--misc-card-bg)] hover:bg-[var(--misc-blue)]">{applyCta.name}</NavLink>
  </nav>
);
export default DesktopNav;
