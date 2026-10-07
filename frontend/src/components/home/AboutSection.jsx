'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, CheckCircle2, ShieldCheck, GraduationCap, Award } from 'lucide-react';

const coreHighlights = [
  'Centralized governance overseeing curriculum standards and faculty credentials',
  'Dual-track integration of classical Islamic disciplines with university degree pathways',
  'Autonomous examination board ensuring academic parity and verified certifications',
];

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="relative border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text">
      <div className="misc-container">
        {/* Section Heading & Category */}
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-misc-primary" />
          <span>01 · The Institution</span>
        </div>

        {/* Split Editorial Composition */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Narrative */}
          <div className="space-y-5 lg:col-span-6">
            <h2 className="font-serif text-3xl font-medium leading-[1.18] tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              An Academic Network for Holistic Scholarship, Moral Character &amp; Leadership
            </h2>

            <p className="text-[15px] leading-relaxed text-misc-secondary sm:text-base sm:leading-7">
              Established under the esteemed governance of Jamia Markaz in Karanthur, the Markaz Integrated Studies Council (MISC) oversees an extensive academic federation of direct institutions and affiliated collegiate centres across South Asia.
            </p>

            <p className="text-sm leading-relaxed text-misc-muted">
              Through unified curriculum formulation, rigorous faculty empowerment, standardized evaluation protocols, and ongoing quality assurance, Sanaviyya nurtures scholars and professionals equipped for contemporary leadership while remaining firmly anchored in Islamic heritage.
            </p>

            {/* Clean checkmark list instead of repetitive cards */}
            <ul className="pt-2 space-y-2.5 text-xs sm:text-sm text-misc-secondary">
              {coreHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-misc-primary shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="group inline-flex min-h-11 items-center gap-2.5 rounded-md bg-misc-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-misc-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Discover Sanaviyya</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Supporting Visual with Clean Border and No Negative Margins */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-misc-border bg-misc-page p-2 shadow-xs">
              <div className="relative aspect-[4/3] sm:aspect-[1.3] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/DSC00390.webp"
                  alt="Students engaged in scholarly study at Jamia Markaz"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                    Jamia Markaz · Karanthur, Kozhikode
                  </p>
                  <p className="mt-1 font-serif text-base sm:text-lg font-medium text-white">
                    &ldquo;Knowledge with integrity, scholarship with service.&rdquo;
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

export default AboutSection;