'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white text-[#243447] border-b border-[#DCE8F3]">
      {/* Subtle light-blue geometric background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-islamic-pattern opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] rounded-full bg-[#EAF5FF]/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/4 h-[320px] w-[320px] rounded-full bg-[#F5FAFF] blur-2xl"
      />

      <div className="misc-container relative z-10 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Institutional Narrative & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8F3] bg-[#EAF5FF] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#173B65]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3182CE]" />
              <span>MARKAZ SANAVIYYA ACADEMY</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#173B65] sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] leading-[1.12]">
              Nurturing Knowledge.{' '}
              <span className="text-[#3182CE] block sm:inline">
                Inspiring Leadership.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="max-w-xl text-base leading-relaxed text-[#64748B] sm:text-[17px]">
              Committed to authentic Islamic scholarship, academic excellence, ethical values, and social responsibility. Markaz Sanaviyya Academy harmonises traditional sacred sciences with contemporary intellectual development, preparing principled scholars and visionary leaders for society.
            </p>

            {/* Call-to-Action Buttons */}
            <div className="pt-2 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  const element = document.getElementById('about');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/about');
                  }
                }}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#173B65] hover:bg-[#3182CE] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182CE] focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Discover Our Academy</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const element = document.getElementById('academics');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate('/academics');
                  }
                }}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#DCE8F3] bg-white hover:bg-[#EAF5FF] hover:border-[#3182CE]/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#173B65] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3182CE] focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Explore Academics</span>
                <ArrowRight className="h-4 w-4 text-[#3182CE] transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Refined Academic Indicators */}
            <div className="pt-4 border-t border-[#DCE8F3] grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div>
                <span className="block font-heading text-lg font-bold text-[#173B65]">Jamia Markaz</span>
                <span className="text-xs text-[#64748B]">Karanthur, Kozhikode</span>
              </div>
              <div>
                <span className="block font-heading text-lg font-bold text-[#3182CE]">500+ Books</span>
                <span className="text-xs text-[#64748B]">Curated Research Library</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-heading text-lg font-bold text-[#173B65]">Integrated</span>
                <span className="text-xs text-[#64748B]">Sacred &amp; Modern Studies</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic Editorial Photograph */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Subtle light-blue geometric decorative background backing */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-[#EAF5FF] border border-[#DCE8F3] transform -rotate-1 transition-transform"
              />

              {/* Photograph Card */}
              <div className="relative overflow-hidden rounded-2xl border border-[#DCE8F3] bg-white p-2.5 shadow-sm">
                <div className="relative aspect-[4/3] sm:aspect-[1.25] overflow-hidden rounded-xl bg-[#F5FAFF]">
                  <img
                    src="/DSC00390.webp"
                    alt="Students engaged in scholarly learning at Markaz Sanaviyya Academy"
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-102"
                    priority="true"
                  />
                  {/* Subtle editorial bottom caption overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="inline-block rounded-xs bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-xs">
                      Authentic Islamic Scholarship
                    </span>
                    <p className="mt-1.5 font-heading text-base font-semibold text-white">
                      Students in Focused Scholarly Study &amp; Deliberation
                    </p>
                    <p className="text-xs text-slate-200">
                      Markaz Sanaviyya Academy · Jamia Markaz
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;