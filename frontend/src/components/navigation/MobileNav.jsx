import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Phone, ArrowRight, ChevronRight } from 'lucide-react';
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
    <div 
      id="mobile-navigation-menu" 
      className="fixed inset-x-0 top-[61px] sm:top-[69px] bottom-0 z-40 lg:hidden bg-[#132238] text-white flex flex-col overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div className="flex-1 flex flex-col justify-between misc-container py-6 space-y-8 min-h-full">
        
        {/* Navigation Links */}
        <nav className="space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between min-h-[50px] px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2F7C7A] text-white font-semibold shadow-2xs'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span>{link.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </NavLink>
          ))}
        </nav>

        {/* Footer Info & CTA Area in Normal Document Flow */}
        <div className="pt-6 border-t border-slate-800 space-y-5">
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-[#2F7C7A] shrink-0" />
              <span className="font-mono text-xs">{miscInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-[#2F7C7A] shrink-0" />
              <span className="font-mono text-xs">{miscInfo.phone}</span>
            </div>
          </div>

          <NavLink
            to={applyCta.path}
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full text-center bg-[#2F7C7A] text-white hover:bg-[#256664] text-xs font-bold tracking-wider uppercase px-4 py-3.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <span>ENQUIRY</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default MobileNav;
