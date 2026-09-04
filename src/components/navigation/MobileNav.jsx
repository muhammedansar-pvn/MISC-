import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Mail, Phone } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';
import { miscInfo } from '../../data/miscInfo';

export const MobileNav = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
    <button className="absolute inset-0 bg-[var(--misc-deep-blue)]/70" onClick={onClose} aria-label="Close navigation overlay" />
    <aside className="absolute inset-y-0 right-0 flex w-[min(88vw,24rem)] flex-col bg-[var(--misc-card-bg)] shadow-2xl">
      <div className="flex items-center justify-between bg-[var(--misc-deep-blue)] p-5 text-[var(--misc-card-bg)]"><span className="font-serif text-xl font-bold">{miscInfo.name}</span><button onClick={onClose} className="flex size-9 items-center justify-center border border-[var(--misc-gold)] text-[var(--misc-gold)]" aria-label="Close menu"><X /></button></div>
      <nav className="flex flex-1 flex-col gap-1 p-5" aria-label="Mobile primary navigation">{navLinks.map((link) => <NavLink key={link.path} to={link.path} onClick={onClose} className={({ isActive }) => `border-b px-3 py-4 text-sm font-semibold uppercase tracking-[0.12em] ${isActive ? 'border-[var(--misc-gold)] text-[var(--misc-blue)]' : 'border-[var(--misc-border)] text-[var(--misc-text)]'}`}>{link.name}</NavLink>)}</nav>
      <div className="flex flex-col gap-4 border-t bg-[var(--misc-bg)] p-5 text-xs text-[var(--misc-text-muted)]"><div className="flex items-center gap-3"><Mail className="size-4 text-[var(--misc-gold)]" />{miscInfo.email}</div><div className="flex items-center gap-3"><Phone className="size-4 text-[var(--misc-gold)]" />{miscInfo.phone}</div><NavLink to={applyCta.path} onClick={onClose} className="bg-[var(--misc-deep-blue)] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.12em] text-[var(--misc-card-bg)]">{applyCta.name}</NavLink></div>
    </aside>
  </div>;
};
export default MobileNav;
