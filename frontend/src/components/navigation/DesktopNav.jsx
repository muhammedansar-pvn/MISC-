'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = () => {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
      {/* Primary Navigation Links */}
      <nav className="flex items-center space-x-3 xl:space-x-4" aria-label="Main Navigation">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.name}
              href={link.path}
              className={`relative text-[13px] xl:text-[14px] font-medium tracking-normal py-1.5 transition-colors duration-150 group whitespace-nowrap ${
                isActive
                  ? 'text-[#173B65] font-semibold'
                  : 'text-[#64748B] hover:text-[#173B65]'
              }`}
            >
              <span>{link.name}</span>
              <span
                className={`absolute left-0 bottom-0 w-full h-[2px] transition-transform duration-200 origin-left ${
                  isActive
                    ? 'scale-x-100 bg-[#3182CE]'
                    : 'scale-x-0 group-hover:scale-x-100 bg-[#3182CE]'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Thin Separator */}
      <div className="h-4 w-px bg-[#DCE8F3] shrink-0" aria-hidden="true" />

      {/* Right Controls: Portal Access & Admissions */}
      <div className="flex items-center space-x-2.5 xl:space-x-3 shrink-0">
        <Link
          href="/auth/login"
          className="text-xs font-semibold px-3.5 py-2 rounded-md border border-[#DCE8F3] text-[#173B65] bg-white hover:border-[#3182CE]/40 hover:text-[#3182CE] hover:bg-[#EAF5FF] transition-all whitespace-nowrap"
          aria-label="Portal Access"
        >
          <span>Portal Access</span>
        </Link>

        <Link
          href={applyCta.path}
          className="bg-[#173B65] hover:bg-[#3182CE] text-white text-xs font-semibold tracking-wide px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-1.5 shrink-0 shadow-xs hover:shadow-sm whitespace-nowrap"
        >
          <span>{applyCta.name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};

export default DesktopNav;
