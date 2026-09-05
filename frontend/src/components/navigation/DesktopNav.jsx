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
              `text-xs xl:text-sm font-medium transition-colors duration-200 py-1.5 border-b-2 ${
                isActive
                  ? 'text-[#172033] border-[#2563EB] font-semibold'
                  : 'text-[#64748B] border-transparent hover:text-[#2563EB]'
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="h-5 w-px bg-[#E5EAF0]" />

      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-[#172033] hover:text-[#2563EB] bg-[#F8FAFC] border border-[#E5EAF0] px-2.5 py-1.5 rounded transition-colors"
          aria-expanded={showLangMenu}
          aria-label="Select Language"
        >
          <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{lang}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E5EAF0] rounded shadow-md py-1 z-50">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLang(item.code);
                  setShowLangMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  lang === item.code ? 'bg-[#EAF4FF] text-[#2563EB] font-semibold' : 'text-[#172033] hover:bg-[#F8FAFC]'
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
        className="bg-[#172033] text-white hover:bg-[#2563EB] text-xs font-bold tracking-wider uppercase px-4 py-2 rounded shadow-2xs transition-colors duration-200 flex items-center space-x-1.5 shrink-0"
      >
        <span>Enquiry</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </NavLink>
    </div>
  );
};

export default DesktopNav;
