'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Compass, Camera } from 'lucide-react';

export const CampusLifeSection = () => {
  const navigate = useNavigate();

  return (
    <section id="campus-life" className="border-b border-misc-border bg-misc-page py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="campus-life-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <Camera className="h-4 w-4" />
              <span>08 · Student Experience</span>
            </div>
            <h2 id="campus-life-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              Life at Sanaviyya: Scholarship &amp; Tarbiyah
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-misc-secondary sm:text-base">
              A visual documentary of daily scholarship, spiritual nurturing, and intellectual brotherhood at Jamia Markaz.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/about')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>Explore Campus Culture</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Visual Documentary Layout: 1 Large Image + 2 Supporting Images (Not a Card Grid) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* Main Cinematic Image (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="group relative flex-1 overflow-hidden rounded-2xl border border-misc-border bg-white shadow-xs">
              <div className="relative aspect-[16/11] sm:aspect-[16/10] h-full w-full overflow-hidden bg-slate-100">
                <img
                  src="/DSC00390.webp"
                  alt="Scholars studying together in halaqas"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/25 to-transparent" />
                
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                  <span className="rounded-xs bg-misc-primary px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                    Halaqas &amp; Study Circles
                  </span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold leading-snug text-white">
                    Textual Hermeneutics &amp; Scholarly Circles
                  </h3>
                  <p className="mt-2 max-w-lg text-xs sm:text-sm text-slate-200 line-clamp-2">
                    Daily immersion in classical Hadith, Fiqh, and Arabic morphology under direct scholarly mentorship.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2 Supporting Documentary Images (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {/* Supporting Image 1 */}
            <div className="group relative flex-1 overflow-hidden rounded-xl border border-misc-border bg-white shadow-xs">
              <div className="relative aspect-[16/9] h-full w-full overflow-hidden bg-slate-100">
                <img
                  src="/MKZ01377.webp"
                  alt="Student assemblies and debates"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-misc-light-accent">
                    Public Oratory &amp; Debates
                  </span>
                  <h4 className="mt-1 font-serif text-lg font-bold text-white">
                    Multilingual Rhetoric &amp; Discourse
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Cultivating eloquent speech in Arabic, English, and Urdu.
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Image 2 */}
            <div className="group relative flex-1 overflow-hidden rounded-xl border border-misc-border bg-white shadow-xs">
              <div className="relative aspect-[16/9] h-full w-full overflow-hidden bg-slate-100">
                <img
                  src="/vision.webp"
                  alt="Modern classroom seminars"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-misc-light-accent">
                    Academic Research &amp; Seminars
                  </span>
                  <h4 className="mt-1 font-serif text-lg font-bold text-white">
                    Classrooms &amp; Contemporary Inquiries
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Rigorous university curricula combined with ethical guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampusLifeSection;
