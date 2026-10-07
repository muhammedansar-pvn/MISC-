'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Award, BookOpen, Landmark, UsersRound, Sparkles } from 'lucide-react';

const statistics = [
  { value: '50+', label: 'Affiliated Institutions', detail: 'Colleges & Dars systems' },
  { value: '20+', label: 'Academic Programmes', detail: 'Integrated curricula' },
  { value: '10,000+', label: 'Enrolled Scholars', detail: 'Across collegiate streams' },
  { value: '4+', label: 'Decades of Excellence', detail: 'Established in 1978' },
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white text-misc-text border-b border-misc-border">
      {/* Background subtle radial gradient contained strictly within section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(47,124,122,0.05),transparent_40%),linear-gradient(180deg,#FFFFFF_0%,#F8FAFC_100%)]"
      />

      <div className="misc-container relative z-10 pt-10 pb-12 sm:pt-14 sm:pb-14 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-misc-primary/20 bg-misc-soft-blue px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">
              <Sparkles className="h-3 w-3 text-misc-primary" />
              <span>Jamia Markaz · Markaz Integrated Studies Council</span>
            </div>

            <h1 className="font-serif text-[2.65rem] font-medium leading-[1.08] tracking-[-0.02em] text-misc-text sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              Rooted in Islamic Heritage,{' '}
              <span className="italic font-normal text-misc-primary block sm:inline">
                Prepared for Tomorrow.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-misc-secondary sm:text-[17px]">
              Sanaviyya is the central academic coordination body of Jamia Markaz, Karanthur. We unite over 50 collegiate institutions and dars systems under a standardized curriculum integrating classical Islamic scholarship with accredited university degree pathways.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/academics')}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-misc-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-misc-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Explore Programmes</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-misc-border bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-misc-text transition-all hover:border-misc-primary hover:text-misc-primary hover:bg-misc-soft-blue/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>About Sanaviyya</span>
                <ArrowRight className="h-4 w-4 text-misc-primary transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Institutional Credentials Marker */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-misc-muted">
              <div>
                <span className="block font-serif text-sm font-semibold text-misc-text">Jamia Markaz Headquarters</span>
                <span className="text-[11px] text-misc-secondary">Karanthur, Kozhikode · Estd. 1978</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-misc-border" />
              <div>
                <span className="block font-serif text-sm font-semibold text-misc-text">Autonomous Examination Board</span>
                <span className="text-[11px] text-misc-secondary">Central Assessment &amp; Certification</span>
              </div>
            </div>
          </div>

          {/* Right Photographic Visual */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-misc-border bg-misc-page p-2 shadow-sm">
              <div className="relative aspect-[4/3] sm:aspect-[1.3] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/campus.webp"
                  alt="Academic campus at Jamia Markaz, Karanthur"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  priority="true"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="inline-block rounded-xs bg-white/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest backdrop-blur-xs">
                    Central Campus
                  </span>
                  <h3 className="mt-1.5 font-serif text-lg sm:text-xl font-medium text-white">
                    Jamia Markaz, Karanthur
                  </h3>
                  <p className="text-xs text-slate-200">
                    A premier center for higher Islamic learning &amp; research
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Horizontal Statistics Strip */}
        <div className="mt-12 pt-8 border-t border-misc-border/80">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-misc-border">
            {statistics.map(({ value, label, detail }) => (
              <div key={label} className="min-w-0 md:px-6 first:md:pl-0 last:md:pr-0">
                <span className="block font-serif text-3xl sm:text-4xl font-bold tracking-tight text-misc-primary">
                  {value}
                </span>
                <span className="mt-1 block text-xs sm:text-sm font-semibold text-misc-text">
                  {label}
                </span>
                <span className="block text-[11px] text-misc-muted">
                  {detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;