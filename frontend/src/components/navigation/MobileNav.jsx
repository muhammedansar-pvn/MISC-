import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Mail, Phone, ArrowRight } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';
import { miscInfo } from '../../data/miscInfo';

export const MobileNav = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#172033]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5EAF0] bg-[#172033] text-white">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="MISC Logo"
              className="h-7 w-auto object-contain bg-white p-0.5 rounded"
            />
            <span className="font-serif text-lg font-bold tracking-wider text-white">
              {miscInfo.name}
            </span>
            <span className="text-xs text-slate-300 border-l border-slate-700 pl-2">
              Jamia Markaz
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
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
                    ? 'bg-[#EAF4FF] text-[#2563EB] font-semibold border-l-4 border-[#2563EB]'
                    : 'text-[#172033] hover:bg-[#F8FAFC] hover:text-[#2563EB]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Footer Info & CTA */}
        <div className="p-4 border-t border-[#E5EAF0] bg-[#F8FAFC] space-y-4">
          <div className="space-y-2 text-xs text-[#64748B]">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#2563EB]" />
              <span className="font-mono">{miscInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#2563EB]" />
              <span className="font-mono">{miscInfo.phone}</span>
            </div>
          </div>

          <NavLink
            to={applyCta.path}
            onClick={onClose}
            className="flex items-center justify-center space-x-1.5 w-full text-center bg-[#172033] text-white hover:bg-[#2563EB] text-xs font-bold tracking-wider uppercase px-4 py-3 rounded transition-colors shadow-2xs"
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
