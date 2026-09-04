import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, ArrowRight } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';
import { navLinks, applyCta } from '../../data/navigationData';

export const Footer = () => {
  return (
    <footer className="relative bg-[#0B1D3A] text-white pt-16 pb-8 overflow-hidden border-t border-[#D4AF37]/20">
      <div className="relative misc-container">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Institutional Description & Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#D4AF37] text-[#0B1D3A] font-serif font-bold text-xl flex items-center justify-center rounded shadow-xs">
                M
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-white leading-tight">
                  {miscInfo.name}
                </h3>
                <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider">
                  {miscInfo.parentOrganization}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {miscInfo.aboutShort}
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={miscInfo.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded bg-slate-800/80 hover:bg-[#D4AF37] hover:text-[#0B1D3A] text-slate-300 flex items-center justify-center transition-colors border border-slate-700"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={miscInfo.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded bg-slate-800/80 hover:bg-[#D4AF37] hover:text-[#0B1D3A] text-slate-300 flex items-center justify-center transition-colors border border-slate-700"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={miscInfo.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded bg-slate-800/80 hover:bg-[#D4AF37] hover:text-[#0B1D3A] text-slate-300 flex items-center justify-center transition-colors border border-slate-700"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#D4AF37]/30 pb-2 inline-block">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2"
                  >
                    <span className="text-[#D4AF37] text-xs">›</span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Academic Portals & Downloads */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#D4AF37]/30 pb-2 inline-block">
              Academic Wings
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/academics" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2">
                  <span className="text-[#D4AF37] text-xs">›</span>
                  <span>Integrated Programmes</span>
                </Link>
              </li>
              <li>
                <Link to="/institutions" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2">
                  <span className="text-[#D4AF37] text-xs">›</span>
                  <span>Collaborating Institutions</span>
                </Link>
              </li>
              <li>
                <Link to="/downloads" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2">
                  <span className="text-[#D4AF37] text-xs">›</span>
                  <span>Resource Guidelines</span>
                </Link>
              </li>
              <li>
                <Link to="/examination" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-2">
                  <span className="text-[#D4AF37] text-xs">›</span>
                  <span>Board Examinations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info & Apply CTA */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white border-b border-[#D4AF37]/30 pb-2 inline-block">
              Contact Secretariat
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-1 shrink-0" />
                <span>{miscInfo.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href={`mailto:${miscInfo.email}`} className="hover:text-[#D4AF37] transition-colors font-mono">
                  {miscInfo.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <a href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`} className="hover:text-[#D4AF37] transition-colors font-mono">
                  {miscInfo.phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to={applyCta.path}
                className="inline-flex items-center justify-center w-full bg-[#D4AF37] text-[#0B1D3A] hover:bg-[#B89628] font-bold text-xs uppercase tracking-wider px-4 py-3 rounded shadow-sm transition-colors space-x-2"
              >
                <span>{applyCta.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} {miscInfo.fullName} ({miscInfo.name}). All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Council</Link>
            <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Help Desk</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
