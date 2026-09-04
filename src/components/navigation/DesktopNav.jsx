import React from 'react';
import { NavLink } from 'react-router-dom';
import { navLinks, applyCta } from '../../data/navigationData';

export const DesktopNav = () => {
  return (
    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
      {navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `text-sm font-medium transition-colors duration-200 py-1 border-b-2 ${
              isActive
                ? 'text-[#0B1D3A] border-[#D4AF37] font-semibold'
                : 'text-slate-700 border-transparent hover:text-[#145DA0] hover:border-slate-300'
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}

      <NavLink
        to={applyCta.path}
        className="bg-[#0B1D3A] text-white hover:bg-[#145DA0] text-xs font-bold tracking-wider uppercase px-4 py-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B1D3A] border border-[#0B1D3A]"
      >
        {applyCta.name}
      </NavLink>
    </nav>
  );
};

export default DesktopNav;
