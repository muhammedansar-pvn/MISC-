'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const Footer = () => {
  return (
    <footer className="relative bg-[#132238] text-white pt-20 pb-12 border-t border-slate-800">
      <div className="misc-container">
        
        {/* Brand Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-14 border-b border-white/10 gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center space-x-3.5">
              <img
                src="/logo.png"
                alt="MISC Logo"
                className="h-10 sm:h-12 w-auto object-contain bg-white p-1 rounded shrink-0"
              />
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-tight">
                  {miscInfo.name}
                </h3>
                <p className="text-[10px] sm:text-xs font-mono tracking-widest text-[#2F7C7A] uppercase">
                  {miscInfo.parentOrganization}, Karanthur
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 font-normal leading-relaxed">
              Markaz Integrated Studies Council coordinates unified educational streams, academic standards, and board evaluations across a federation of over 50 institutions.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={miscInfo.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#2F7C7A] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={miscInfo.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#2F7C7A] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={miscInfo.socialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#2F7C7A] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/10"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* 6 Structured Academic Editorial Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 py-14 border-b border-white/10">
          
          {/* Column 1: MISC */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              MISC
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Council</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Vision & Mandate</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Central Secretariat</Link>
              </li>
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors">Jamia Markaz</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Academics */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              Academics
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">Islamic Studies</Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">Contemporary Studies</Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">Integrated Streams</Link>
              </li>
              <li>
                <Link href="/academics" className="hover:text-white transition-colors">Stream Syllabi</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutions */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              Institutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors">Direct Campuses</Link>
              </li>
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors">Academic Collaborations</Link>
              </li>
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors">Affiliation By-Laws</Link>
              </li>
              <li>
                <Link href="/institutions" className="hover:text-white transition-colors">Campus Directory</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Examination */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              Examination
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <li>
                <Link href="/examination" className="hover:text-white transition-colors">Board Regulations</Link>
              </li>
              <li>
                <Link href="/examination" className="hover:text-white transition-colors">Examination Timetable</Link>
              </li>
              <li>
                <Link href="/examination" className="hover:text-white transition-colors">Results Verification</Link>
              </li>
              <li>
                <Link href="/examination" className="hover:text-white transition-colors">Hall Ticket Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Resources */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <li>
                <Link href="/downloads" className="hover:text-white transition-colors">Academic Calendar</Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-white transition-colors">Secretariat Circulars</Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-white transition-colors">Official Forms</Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-white transition-colors">Research Publications</Link>
              </li>
            </ul>
          </div>

          {/* Column 6: Contact */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#2F7C7A]">
              Contact
            </h4>
            <div className="space-y-2.5 text-xs sm:text-[13px] text-slate-300">
              <p className="leading-relaxed text-slate-400">
                Jamia Markaz, Karanthur, Kozhikode, Kerala 673573
              </p>
              <p>
                <a href={`mailto:${miscInfo.email}`} className="hover:text-[#2F7C7A] transition-colors font-mono">
                  {miscInfo.email}
                </a>
              </p>
              <p>
                <a href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`} className="hover:text-[#2F7C7A] transition-colors font-mono">
                  {miscInfo.phone}
                </a>
              </p>
              <div className="pt-1">
                <Link href="/contact" className="text-[#2F7C7A] hover:text-white transition-colors font-semibold">
                  Contact Helpdesk →
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal / Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MISC • Markaz Integrated Studies Council. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Secretariat</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
