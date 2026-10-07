'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-14 sm:py-18 lg:py-20 text-misc-text">
      <div className="misc-container">
        <div className="relative overflow-hidden rounded-3xl border border-misc-border bg-misc-navy text-white shadow-xl">
          <div className="grid grid-cols-1 items-center lg:grid-cols-12">
            {/* Left Content */}
            <div className="p-8 sm:p-12 lg:col-span-7 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-200">
                <Sparkles className="h-3 w-3 text-misc-primary" />
                <span>Markaz Integrated Studies Council · Karanthur</span>
              </div>

              <h2 className="mt-5 font-serif text-3xl font-medium leading-[1.14] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
                Begin Your Academic Journey at Sanaviyya
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
                Join an esteemed academic tradition harmonizing classical Islamic scholarship with accredited university degree pathways and moral leadership under Jamia Markaz.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/academics')}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-misc-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-misc-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
                >
                  <span>Explore Programmes</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-xs transition-all hover:border-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
                >
                  <span>Contact Secretariat</span>
                  <ArrowRight className="h-4 w-4 text-misc-primary transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <p className="mt-7 text-xs text-slate-400">
                Admissions open annually for secondary, higher secondary, and Muthawwal degree streams across all affiliated institutions.
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
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy via-transparent to-transparent lg:bg-gradient-to-r lg:from-misc-navy lg:via-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
