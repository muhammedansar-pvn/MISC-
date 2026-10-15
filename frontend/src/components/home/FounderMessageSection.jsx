'use client';

import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

export const FounderMessageSection = () => {
  return (
    <section className="relative border-b border-[#DCE8F3] bg-[#EAF5FF]/60 py-16 sm:py-20 lg:py-24 text-[#243447]">
      {/* Subtle geometric pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-islamic-pattern opacity-40"
      />

      <div className="misc-container relative z-10">
        <div className="mx-auto max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
            <Sparkles className="h-4 w-4 text-[#3182CE]" />
            <span>FOUNDER&apos;S REFLECTION</span>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#173B65] sm:text-3xl lg:text-4xl">
            A Vision for Generations
          </h2>

          <div className="mt-8 relative rounded-2xl border border-[#DCE8F3] bg-white p-8 sm:p-12 lg:p-14 shadow-sm">
            {/* Elegant Quotation Mark */}
            <Quote className="h-10 w-10 sm:h-12 sm:w-12 text-[#3182CE]/30 mb-6 -scale-x-100" />

            <blockquote className="font-heading text-xl sm:text-2xl lg:text-[1.65rem] font-medium leading-relaxed sm:leading-snug text-[#173B65]">
              &ldquo;Markaz Sanaviyya Academy envisions itself as a center of advanced Islamic education, dedicated to cultivating scholars and leaders grounded in ethical principles and a commitment to the betterment of society. Beyond knowledge, it seeks to inspire reflection, purpose, and action, preparing individuals to become beacons of positive change in an evolving world.&rdquo;
            </blockquote>

            <div className="mt-8 pt-6 border-t border-[#DCE8F3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="block font-heading text-xl font-bold tracking-tight text-[#173B65]">
                  Sheikh Abubakar Ahmad
                </span>
                <span className="text-xs font-medium text-[#64748B]">
                  Founder &amp; Patron · Jamia Markaz
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8F3] bg-[#F5FAFF] px-4 py-1.5 text-xs font-semibold text-[#3182CE]">
                <span>Founding Vision</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderMessageSection;
