'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden border-b border-misc-border bg-misc-page py-16 text-misc-text sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full border border-misc-primary/5"
      />
      <div className="misc-container relative">
        <div className="grid grid-cols-1 items-center gap-9 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-5 lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider text-misc-primary">01.</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-muted">About Sanaviyya</span>
            </div>

            <h2 className="max-w-xl font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-misc-text sm:text-4xl lg:text-[2.75rem]">
              An Academic Network for Institutional Excellence
            </h2>

            <p className="max-w-xl text-sm leading-6 text-misc-muted sm:text-[15px] sm:leading-7">
              Established under the governance of Jamia Markaz in Karanthur, MISC oversees a network of direct institutions and affiliated academic centres. Through centralized curriculum development, faculty development, uniform assessments, and quality assurance, the Council nurtures scholars and professionals equipped for contemporary society while remaining firmly rooted in Islamic heritage.
            </p>

            <button
              type="button"
              onClick={() => navigate('/about')}
              className="group inline-flex min-h-10 items-center gap-2 rounded-md bg-misc-primary px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2"
            >
              <span>Learn More</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-white bg-white p-1.5 shadow-[0_18px_45px_-30px_rgba(18,35,63,0.42)] sm:p-2">
              <img
                src="/DSC00390.webp"
                alt="Students studying together at Jamia Markaz"
                className="aspect-[4/3] w-full rounded-xl object-cover object-center sm:aspect-[1.55]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;