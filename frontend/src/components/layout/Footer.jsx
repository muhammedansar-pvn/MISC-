'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, ArrowRight, ShieldCheck } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

const primaryLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Library', href: '/#library' },
  { label: 'Activities', href: '/#activities' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact', href: '/contact' },
];

const academicGovernanceLinks = [
  { label: 'Central Examination', href: '/examination' },
  { label: 'Affiliated Institutions', href: '/institutions' },
  { label: 'Official Downloads & Regulations', href: '/downloads' },
  { label: 'Secretariat Contact', href: '/contact' },
  { label: 'Portal Login (Student & Faculty)', href: '/auth/login' },
];

export const Footer = () => (
  <footer className="bg-[#173B65] text-white border-t border-[#DCE8F3]/20" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">Footer</h2>
    
    <div className="misc-container py-14 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12 pb-12 border-b border-white/10">
        {/* Column 1: Institutional Identity & Values */}
        <div className="sm:col-span-2 lg:col-span-5 space-y-5">
          <Link href="/" className="inline-flex items-center gap-3.5 group" aria-label="Markaz Sanaviyya Academy Homepage">
            <img
              src="/logo.png"
              alt="Markaz Sanaviyya Academy Crest"
              className="h-12 w-auto rounded-md bg-white p-1 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#60A5FA] transition-colors">
                MARKAZ SANAVIYYA ACADEMY
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#DCE8F3]">
                Jamia Markaz · Karanthur, Kozhikode
              </span>
            </div>
          </Link>

          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-[#DCE8F3]">
            Markaz Sanaviyya Academy is committed to shaping world-class Islamic scholars and empowering responsible professionals through quality education. Harmonising authentic Islamic scholarship with modern academic excellence, ethical values, and social responsibility.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={miscInfo.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#DCE8F3] transition-all hover:border-[#3182CE] hover:bg-[#3182CE] hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={miscInfo.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#DCE8F3] transition-all hover:border-[#3182CE] hover:bg-[#3182CE] hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={miscInfo.socialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#DCE8F3] transition-all hover:border-[#3182CE] hover:bg-[#3182CE] hover:text-white"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="lg:col-span-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5">
            {primaryLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs sm:text-sm text-[#DCE8F3] transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact & Secretariat */}
        <div className="sm:col-span-2 lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
            Secretariat &amp; Contact
          </h3>
          <address className="space-y-3 not-italic text-xs sm:text-sm leading-relaxed text-[#DCE8F3]">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#60A5FA]" />
              <span>{miscInfo.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-[#60A5FA]" />
              <a href={'tel:' + miscInfo.phone.replace(/\s+/g, '')} className="transition-colors hover:text-white">
                {miscInfo.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[#60A5FA]" />
              <a href={'mailto:' + miscInfo.email} className="transition-colors hover:text-white">
                {miscInfo.email}
              </a>
            </p>
          </address>

          {/* Academic Portal Box */}
          <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <ShieldCheck className="h-4 w-4 text-[#60A5FA]" />
              <span>Academic Portal Access</span>
            </span>
            <p className="mt-1 text-[11px] text-[#DCE8F3]">
              Authorized login for enrolled students, faculty asatitha, and affiliated administrations.
            </p>
            <Link
              href="/auth/login"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#60A5FA] hover:text-white transition-colors"
            >
              <span>Portal Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Verified Links */}
      <div className="mt-8 flex flex-col gap-4 text-xs text-[#DCE8F3] sm:flex-row sm:items-center sm:justify-between">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} Markaz Sanaviyya Academy · Jamia Markaz. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <Link href="/about" className="transition-colors hover:text-white">About Academy</Link>
          <Link href="/academics" className="transition-colors hover:text-white">Academics</Link>
          <Link href="/examination" className="transition-colors hover:text-white">Examination Code</Link>
          <Link href="/contact" className="transition-colors hover:text-white">Secretariat</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
