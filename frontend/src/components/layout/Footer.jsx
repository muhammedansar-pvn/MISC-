'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Examination', href: '/examination' },
  { label: 'Contact', href: '/contact' },
];

const programmeLinks = [
  'Islamic Studies',
  'Contemporary Studies',
  'Integrated Streams',
  'Stream Syllabi',
];

export const Footer = () => (
  <footer className="bg-misc-navy text-white">
    <div className="misc-container py-10 sm:py-12 lg:py-14">
      <div className="grid grid-cols-1 gap-9 border-b border-white/10 pb-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:pb-10">
        <div className="sm:col-span-2 lg:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Sanaviyya homepage">
            <img src="/logo.png" alt="Markaz" className="h-11 w-11 rounded bg-white p-1 object-contain" />
            <span>
              <span className="block font-serif text-xl font-semibold tracking-wide text-white">SANAVIYYA</span>
              <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.17em] text-slate-300">Jamia Markaz, Karanthur</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-xs leading-5 text-slate-300">
            Markaz Integrated Studies Council coordinates unified educational streams, academic standards, and board evaluations across a federation of over 50 institutions.
          </p>
          <div className="mt-5 flex items-center gap-2.5">
            <a href={miscInfo.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-misc-primary hover:bg-misc-primary hover:text-white">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={miscInfo.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-misc-primary hover:bg-misc-primary hover:text-white">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={miscInfo.socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-misc-primary hover:bg-misc-primary hover:text-white">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div id="site-map" className="lg:col-span-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Quick Links</h2>
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-xs text-slate-300 transition-colors hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Programmes</h2>
          <ul className="mt-4 space-y-2.5">
            {programmeLinks.map((label) => (
              <li key={label}>
                <Link href="/academics" className="text-xs text-slate-300 transition-colors hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Contact</h2>
          <address className="mt-4 space-y-3 not-italic text-xs leading-5 text-slate-300">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-misc-primary" />
              <span>{miscInfo.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-misc-primary" />
              <a href={'tel:' + miscInfo.phone.replace(/\s+/g, '')} className="transition-colors hover:text-white">{miscInfo.phone}</a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-misc-primary" />
              <a href={'mailto:' + miscInfo.email} className="transition-colors hover:text-white">{miscInfo.email}</a>
            </p>
          </address>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Markaz Integrated Studies Council. All rights reserved.</p>
        <div className="flex gap-5">
          <Link href="/about" className="transition-colors hover:text-white">Privacy Policy</Link>
          <Link href="/about" className="transition-colors hover:text-white">Terms of Service</Link>
          <Link href="/#site-map" className="transition-colors hover:text-white">Sitemap</Link>
          <Link href="/contact" className="transition-colors hover:text-white">Secretariat</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
