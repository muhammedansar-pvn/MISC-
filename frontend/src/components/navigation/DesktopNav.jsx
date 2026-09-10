import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, ArrowRight, ChevronDown } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = () => {
  const [lang, setLang] = useState('EN');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'EN', label: 'English' },
    { code: 'ML', label: 'Malayalam' },
    { code: 'AR', label: 'العربية (Arabic)' }
  ];

  return (
    <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
      {/* Primary Navigation Links */}
      <nav className="flex items-center space-x-5 xl:space-x-7">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `text-[14px] lg:text-[14.5px] xl:text-[15px] font-medium transition-colors duration-200 py-1.5 border-b-2 ${
                isActive
                  ? 'text-[#132238] border-[#2F7C7A] font-semibold'
                  : 'text-[#475569] border-transparent hover:text-[#2F7C7A]'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="h-5 w-px bg-[#E2E8E0]" />

      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-[#132238] hover:text-[#2F7C7A] bg-[#F7F8F5] border border-[#E2E8E0] px-2.5 py-1.5 rounded transition-colors cursor-pointer"
          aria-expanded={showLangMenu}
          aria-label="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#2F7C7A]" />
          <span>{lang}</span>
          <ChevronDown className="w-3 h-3 text-[#475569]" />
        </button>

        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E2E8E0] rounded shadow-md py-1 z-50">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code);
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer ${
                  lang === item.code ? 'bg-[#E6F2F1] text-[#2F7C7A] font-semibold' : 'text-[#132238] hover:bg-[#F7F8F5]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact Enquiry CTA */}
      <NavLink
        to={applyCta.path}
        className="bg-[#2F7C7A] text-white hover:bg-[#256664] text-xs font-bold tracking-wider uppercase px-4 py-2 rounded shadow-2xs transition-colors duration-200 flex items-center space-x-1.5 shrink-0"
      >
        <span>Enquiry</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </NavLink>
    </div>
  );
};

export default DesktopNav;
