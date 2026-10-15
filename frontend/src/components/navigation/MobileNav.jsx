'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, ArrowRight, ChevronRight } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';
import { miscInfo } from '../../data/miscInfo';

export const MobileNav = ({ isOpen, onClose }) => {
  const pathname = usePathname();

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
      className="fixed inset-x-0 top-[61px] sm:top-[69px] bottom-0 z-40 lg:hidden bg-white text-[#243447] flex flex-col overflow-y-auto border-t border-[#DCE8F3] shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      <div className="flex-1 flex flex-col justify-between misc-container py-6 space-y-8 min-h-full">
        
        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={onClose}
                className={`flex items-center justify-between min-h-[48px] px-4 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EAF5FF] text-[#173B65] font-semibold border border-[#DCE8F3]'
                    : 'text-[#243447] hover:bg-[#F5FAFF] hover:text-[#3182CE]'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>
            );
          })}
        </nav>

        {/* Footer Info & CTA Area */}
        <div className="pt-6 border-t border-[#DCE8F3] space-y-3.5">
          <Link
            href="/auth/login"
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full text-center bg-[#F5FAFF] hover:bg-[#EAF5FF] text-[#173B65] text-[13px] font-semibold tracking-wide px-4 py-3 rounded-lg border border-[#DCE8F3] transition-colors"
          >
            <span>Portal Access (Student / Faculty)</span>
          </Link>

          <Link
            href={applyCta.path}
            onClick={onClose}
            className="flex items-center justify-center space-x-2 w-full text-center bg-[#173B65] hover:bg-[#3182CE] text-white text-[14px] font-semibold tracking-wide px-4 py-3.5 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <span>{applyCta.name}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="pt-3 space-y-2 text-xs text-[#64748B] border-t border-[#DCE8F3]/60">
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-[#3182CE] shrink-0" />
              <span className="font-mono text-xs">{miscInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-[#3182CE] shrink-0" />
              <span className="font-mono text-xs">{miscInfo.phone}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MobileNav;
