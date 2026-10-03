'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Award, BookOpen, Landmark, UsersRound } from 'lucide-react';

const statistics = [
  { value: '50+', label: 'Affiliated institutions', icon: Landmark },
  { value: '20+', label: 'Academic programmes', icon: BookOpen },
  { value: '10K+', label: 'Students & scholars', icon: UsersRound },
  { value: '4+', label: 'Decades of service', icon: Award },
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative isolate overflow-hidden bg-white text-misc-text">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_20%,rgba(30,91,184,0.07),transparent_32%),linear-gradient(135deg,#fff_46%,#f6f9fd_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full border border-misc-primary/5"
      />

      <div className="misc-container relative z-10 pt-24 pb-8 sm:pt-28 sm:pb-10 lg:pt-32 lg:pb-12">
        <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-misc-primary sm:text-[11px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-misc-primary" />
              Markaz Integrated Studies Council
            </div>

            <h1 className="max-w-[17ch] font-serif text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.025em] text-misc-text sm:text-5xl lg:text-[3.55rem] xl:text-[4rem]">
              Rooted in Islamic Heritage,
              <br />
              <span className="text-misc-primary">Prepared for Tomorrow</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-misc-muted sm:mt-6 sm:text-base">
              An academic network harmonizing classical Islamic scholarship with contemporary knowledge for a better tomorrow.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/academics')}
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-misc-primary px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Explore Programmes</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-misc-border bg-white px-5 py-3 text-xs font-semibold text-misc-text transition-colors hover:border-misc-primary hover:text-misc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>About Sanaviyya</span>
                <ArrowRight className="h-4 w-4 text-misc-primary transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <p className="mt-6 text-xs font-medium text-misc-muted">
              <span className="text-misc-text">Jamia Markaz</span>
              <span className="mx-2 text-misc-border">/</span>
              Karanthur, Kozhikode
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-[1.75rem] bg-misc-soft-blue/80 blur-xl sm:-inset-4" />
            <div className="relative overflow-hidden rounded-2xl border border-white shadow-[0_22px_55px_-30px_rgba(18,35,63,0.42)]">
              <img
                src="/campus.webp"
                alt="Academic campus at Jamia Markaz, Karanthur"
                className="aspect-[4/3] w-full object-cover object-center sm:aspect-[1.42]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-misc-navy/70 via-misc-navy/15 to-transparent px-5 pb-5 pt-14 sm:px-6 sm:pb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  Jamia Markaz · Karanthur
                </p>
                <p className="mt-1 text-sm font-medium text-white sm:text-base">
                  A tradition of learning and service
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 rounded-2xl border border-misc-border bg-white px-4 py-5 shadow-[0_12px_32px_-24px_rgba(18,35,63,0.35)] sm:mt-10 sm:px-6 lg:mt-12">
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 md:divide-x md:divide-misc-border md:gap-0">
            {statistics.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex min-w-0 items-center gap-3 md:px-5 first:md:pl-0 last:md:pr-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-misc-soft-blue text-misc-primary sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xl font-semibold leading-tight tracking-tight text-misc-text sm:text-2xl">{value}</span>
                  <span className="mt-1 block text-[9px] font-medium leading-snug text-misc-muted sm:text-[10px]">{label}</span>
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