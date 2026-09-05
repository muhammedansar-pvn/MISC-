import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';
import { miscInfo } from '../../data/miscInfo';

export const MobileNav = ({ isOpen, onClose }) => {
  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div id="mobile-navigation-menu" className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#132238]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-[320px] sm:max-w-xs bg-white shadow-2xl flex flex-col h-full z-50 transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E2E8E0] bg-[#132238] text-white shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
            <img
              src="/logo.png"
              alt="MISC Logo"
              className="h-7 w-auto object-contain bg-white p-0.5 rounded shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base font-bold tracking-wider text-white leading-none truncate">
                {miscInfo.name}
              </span>
              <span className="text-[10px] text-slate-300 uppercase tracking-widest mt-0.5 truncate">
                Jamia Markaz
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E6F2F1] text-[#2F7C7A] font-semibold border-l-4 border-[#2F7C7A]'
                    : 'text-[#132238] hover:bg-[#F7F8F5] hover:text-[#2F7C7A]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Footer Info & CTA */}
        <div className="p-4 border-t border-[#E2E8E0] bg-[#F7F8F5] space-y-4 shrink-0">
          <div className="space-y-2 text-xs text-[#475569]">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#2F7C7A] shrink-0" />
              <span className="font-mono text-[11px] truncate">{miscInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#2F7C7A] shrink-0" />
              <span className="font-mono text-[11px]">{miscInfo.phone}</span>
            </div>
          </div>

          <NavLink
            to={applyCta.path}
            onClick={onClose}
            className="flex items-center justify-center space-x-1.5 w-full text-center bg-[#2F7C7A] text-white hover:bg-[#256664] text-xs font-bold tracking-wider uppercase px-4 py-3 rounded-md transition-colors shadow-2xs"
          >
            <span>Enquiry</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
