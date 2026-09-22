'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = ({ isTransparent = false }) => {
  const pathname = usePathname();
  const [lang, setLang] = useState('EN');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'ML', label: 'Malayalam' },
    { code: 'AR', label: 'العربية' },
  ];

  return (
    <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
      {/* Primary Navigation Links */}
      <nav className="flex items-center space-x-5 xl:space-x-7">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`relative text-[13.5px] xl:text-[14px] font-medium tracking-wide py-1.5 transition-colors duration-200 group ${
                isTransparent
                  ? isActive
                    ? 'text-white font-semibold'
                    : 'text-white/85 hover:text-white'
                  : isActive
                  ? 'text-[#132238] font-semibold'
                  : 'text-[#132238]/80 hover:text-[#2F7C7A]'
              }`}
            >
              <span>{link.name}</span>
              <span
                className={`absolute left-0 bottom-0 w-full h-[1.5px] transition-transform duration-300 origin-left ${
                  isActive
                    ? 'scale-x-100 bg-[#2F7C7A]'
                    : isTransparent
                    ? 'scale-x-0 group-hover:scale-x-100 bg-white/70'
                    : 'scale-x-0 group-hover:scale-x-100 bg-[#2F7C7A]'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Thin Separator */}
      <div
        className={`h-4 w-px transition-colors duration-300 ${
          isTransparent ? 'bg-white/25' : 'bg-[rgba(19,34,56,0.15)]'
        }`}
      />

      {/* Right Controls: Search, Language, Enquiry */}
      <div className="flex items-center space-x-4">
        {/* Search Icon Button */}
        <Link
          href="/downloads"
          className={`p-1.5 transition-colors cursor-pointer ${
            isTransparent ? 'text-white/80 hover:text-white' : 'text-[#132238]/80 hover:text-[#2F7C7A]'
          }`}
          aria-label="Search MISC Portal"
        >
          <Search className="w-4 h-4 stroke-[1.8]" />
        </Link>

        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className={`flex items-center space-x-1 text-xs font-mono font-medium px-2 py-1 transition-all cursor-pointer ${
              isTransparent
                ? 'text-white/90 hover:text-white'
                : 'text-[#132238] hover:text-[#2F7C7A]'
            }`}
            aria-expanded={showLangMenu}
            aria-label="Select Language"
          >
            <span>{lang}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-[rgba(19,34,56,0.12)] rounded-xs shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLang(item.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                    lang === item.code
                      ? 'bg-[#E6F2F1] text-[#2F7C7A] font-semibold'
                      : 'text-[#132238] hover:bg-[#F7F7F3]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ENQUIRY → Button (Teal filled, rectangular with small border radius) */}
        <Link
          href={applyCta.path}
          className="bg-[#2F7C7A] text-white hover:bg-[#256664] active:bg-[#1d504e] text-xs font-semibold tracking-wider uppercase px-4 py-2 rounded-xs transition-all duration-200 flex items-center space-x-1.5 shrink-0 shadow-2xs hover:translate-x-0.5"
        >
          <span>ENQUIRY</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default DesktopNav;
