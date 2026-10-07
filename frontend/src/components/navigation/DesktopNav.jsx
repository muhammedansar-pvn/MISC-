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
      <nav className="flex items-center space-x-3.5 xl:space-x-5" aria-label="Main Navigation">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative text-[13px] xl:text-[13.5px] font-medium tracking-wide py-1.5 transition-colors duration-150 group whitespace-nowrap ${
                isActive
                  ? 'text-misc-primary font-semibold'
                  : 'text-misc-secondary hover:text-misc-primary'
              }`}
            >
              <span>{link.name}</span>
              <span
                className={`absolute left-0 bottom-0 w-full h-[1.5px] transition-transform duration-200 origin-left ${
                  isActive
                    ? 'scale-x-100 bg-misc-primary'
                    : 'scale-x-0 group-hover:scale-x-100 bg-misc-primary'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Thin Separator */}
      <div className="h-4 w-px bg-misc-border shrink-0" aria-hidden="true" />

      {/* Right Controls: Portal Access & Admissions */}
      <div className="flex items-center space-x-2.5 xl:space-x-3 shrink-0">
        <Link
          href="/auth/login"
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-misc-border text-misc-text hover:border-misc-primary/50 hover:text-misc-primary hover:bg-misc-soft-blue/60 transition-all whitespace-nowrap"
          aria-label="Portal Access"
        >
          <span>Portal Access</span>
        </Link>

        <Link
          href={applyCta.path}
          className="bg-misc-primary text-white hover:bg-misc-primary-dark active:bg-misc-deep-blue text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-md transition-all duration-150 flex items-center space-x-1.5 shrink-0 shadow-xs hover:translate-x-0.5 whitespace-nowrap"
        >
          <span>{applyCta.name}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default DesktopNav;
