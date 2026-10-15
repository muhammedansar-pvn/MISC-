'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24 text-[#243447]">
      <div className="misc-container">
        <div className="relative overflow-hidden rounded-3xl border border-[#DCE8F3] bg-[#173B65] text-white shadow-xl">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:col-span-7 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EAF5FF]">
                <Sparkles className="h-3 w-3 text-[#60A5FA]" />
                <span>Markaz Sanaviyya Academy · Jamia Markaz</span>
              </div>

              <h2 className="mt-5 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Begin Your Journey of Knowledge and Leadership
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#DCE8F3] sm:text-base">
                Join an esteemed academic tradition harmonising authentic Islamic scholarship with modern academic excellence, ethical values, and social responsibility.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#3182CE] hover:bg-[#2B6CB0] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.98] sm:text-sm"
                >
                  <span>Admission Enquiry</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/academics"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition-all hover:border-white hover:bg-white/20 sm:text-sm"
                >
                  <span>Explore Academics</span>
                  <ArrowRight className="h-4 w-4 text-[#60A5FA] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="mt-7 text-xs text-[#DCE8F3]/80">
                Admissions open for integrated secondary and higher academic streams at Karanthur and affiliated centres.
              </p>
            </div>

            {/* Right Aerial Visual */}
            <div className="relative min-h-[260px] lg:col-span-5 lg:min-h-full">
              <div className="absolute inset-0 h-full w-full">
                <img
                  src="/markaz-drone.jpg (1).webp"
                  alt="Jamia Markaz campus aerial view"
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173B65] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#173B65] lg:via-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
