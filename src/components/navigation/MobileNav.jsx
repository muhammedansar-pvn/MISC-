import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Mail, Phone } from 'lucide-react';
import { navLinks, applyCta } from '../../data/navigationData';
import { miscInfo } from '../../data/miscInfo';

export const MobileNav = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-[#0B1D3A] text-white">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-lg font-bold tracking-wider text-white">
              {miscInfo.name}
            </span>
            <span className="text-xs text-[#D4AF37] border-l border-slate-600 pl-2">
              Jamia Markaz
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-[#0B1D3A] text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#0B1D3A]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Footer Info & CTA */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              <span>{miscInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#D4AF37]" />
              <span>{miscInfo.phone}</span>
            </div>
          </div>

          <NavLink
            to={applyCta.path}
            onClick={onClose}
            className="block w-full text-center bg-[#0B1D3A] text-white hover:bg-[#145DA0] text-sm font-bold tracking-wider uppercase px-4 py-3 rounded transition-colors"
          >
            {applyCta.name}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
