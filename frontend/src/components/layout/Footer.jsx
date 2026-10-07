'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, ArrowRight, ShieldCheck } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Sanaviyya', href: '/about' },
  { label: 'Academic Framework', href: '/academics' },
  { label: 'Affiliated Institutions', href: '/institutions' },
  { label: 'Student & Campus Life', href: '/#campus-life' },
  { label: 'News & Announcements', href: '/#news' },
  { label: 'Central Examination', href: '/examination' },
  { label: 'Resources & Downloads', href: '/downloads' },
  { label: 'Secretariat Contact', href: '/contact' },
];

const programmeLinks = [
  { label: 'Sanaviyya Secondary (SSLC)', href: '/academics' },
  { label: 'Sanaviyya Higher Secondary (+2)', href: '/academics' },
  { label: 'Muthawwal Degree Stream', href: '/academics' },
  { label: 'Alimiyya Postgraduate Stream', href: '/academics' },
  { label: 'Arabic & Pedagogical Diplomas', href: '/academics' },
];

const governanceLinks = [
  { label: 'Central Examination Board', href: '/examination' },
  { label: 'Standardized Assessment Guidelines', href: '/examination' },
  { label: 'Transcript & Result Verification', href: '/examination' },
  { label: 'Affiliation Regulations', href: '/institutions' },
  { label: 'Portal Login (Student & Faculty)', href: '/auth/login' },
];

export const Footer = () => (
  <footer className="bg-misc-navy text-white border-t border-white/10" aria-labelledby="footer-heading">
    <h2 id="footer-heading" className="sr-only">Footer</h2>
    
    <div className="misc-container py-14 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12 pb-12 border-b border-white/10">
        {/* Column 1: Identity & Heritage (Col 4) */}
        <div className="sm:col-span-2 lg:col-span-4 space-y-5">
          <Link href="/" className="inline-flex items-center gap-3.5 group" aria-label="Sanaviyya Homepage">
            <img
              src="/logo.png"
              alt="Sanaviyya Crest"
              className="h-12 w-auto rounded-md bg-white p-1 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-misc-light-accent transition-colors">
                SANAVIYYA
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                Jamia Markaz · Karanthur
              </span>
            </div>
          </Link>

          <p className="max-w-sm text-xs leading-relaxed text-slate-300">
            Markaz Integrated Studies Council (MISC) is the academic coordination council of Jamia Markaz, harmonizing classical Islamic scholarship with contemporary university education across over 50 affiliated institutions.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={miscInfo.socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={miscInfo.socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={miscInfo.socialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-300 transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links (Col 2) */}
        <div className="lg:col-span-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Navigation
          </h3>
          <ul className="mt-4 space-y-2.5">
            {navigationLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-slate-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Programmes (Col 3) */}
        <div className="lg:col-span-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Programmes &amp; Streams
          </h3>
          <ul className="mt-4 space-y-2.5">
            {programmeLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-slate-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Academic Governance
          </h3>
          <ul className="mt-3 space-y-2">
            {governanceLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-xs text-slate-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Contact & Secretariat (Col 3) */}
        <div className="lg:col-span-3">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white">
            Secretariat &amp; Central Office
          </h3>
          <address className="mt-4 space-y-3.5 not-italic text-xs leading-relaxed text-slate-300">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-misc-primary" />
              <span>{miscInfo.address}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-misc-primary" />
              <a href={'tel:' + miscInfo.phone.replace(/\s+/g, '')} className="transition-colors hover:text-white">
                {miscInfo.phone}
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-misc-primary" />
              <a href={'mailto:' + miscInfo.email} className="transition-colors hover:text-white">
                {miscInfo.email}
              </a>
            </p>
          </address>

          {/* Portal Access Quick Box */}
          <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-xs">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-misc-primary" />
              <span>Academic Portal</span>
            </span>
            <p className="mt-1 text-[11px] text-slate-400">
              Authorized access for students, faculty asatitha, and institutional administrators.
            </p>
            <Link
              href="/auth/login"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-misc-light-accent hover:text-white transition-colors"
            >
              <span>Portal Login</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Terms */}
      <div className="mt-8 flex flex-col gap-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p suppressHydrationWarning>© {new Date().getFullYear()} Markaz Integrated Studies Council (MISC), Jamia Markaz. All rights reserved.</p>
        <div className="flex flex-wrap gap-5 text-xs">
          <Link href="/about" className="transition-colors hover:text-white">Privacy Policy</Link>
          <Link href="/about" className="transition-colors hover:text-white">Terms of Governance</Link>
          <Link href="/examination" className="transition-colors hover:text-white">Examination Code</Link>
          <Link href="/contact" className="transition-colors hover:text-white">Secretariat</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
