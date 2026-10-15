'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const AboutCTA = () => {
  return (
    <section className="relative bg-[#173B65] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#DCE8F3]/20">
      <div className="relative misc-container z-10 text-center max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <span className="w-8 h-[2px] bg-[#3182CE]" />
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#DCE8F3] uppercase">
            CONNECT WITH MARKAZ SANAVIYYA
          </span>
          <span className="w-8 h-[2px] bg-[#3182CE]" />
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Discover Academic Programmes
        </h2>

        <p className="text-[#DCE8F3] text-base sm:text-lg font-normal leading-relaxed">
          Explore our integrated academic streams, syllabus guidelines, and scholarly community under Jamia Markaz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/academics"
            className="group inline-flex items-center justify-center rounded-md bg-[#3182CE] hover:bg-[#2B6CB0] text-white px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all"
          >
            <span>Explore Academics</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/contact"
            className="group inline-flex items-center justify-center rounded-md border border-white/25 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider backdrop-blur-xs transition-all"
          >
            <span>Contact Secretariat</span>
            <ArrowRight className="w-4 h-4 ml-2 text-[#60A5FA] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
