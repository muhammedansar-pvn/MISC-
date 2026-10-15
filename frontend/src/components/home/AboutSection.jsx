'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const corePillars = [
  'Harmonising classical Islamic scholarship with contemporary academic development',
  'Cultivating critical thinking, moral character, and social responsibility',
  'Empowering students to identify and realize their individual intellectual potential',
];

export const AboutSection = () => {
  return (
    <section id="about" className="relative border-b border-[#DCE8F3] bg-white py-16 sm:py-20 lg:py-24 text-[#243447]">
      <div className="misc-container">
        {/* Editorial Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3182CE]" />
          <span>ABOUT MARKAZ SANAVIYYA</span>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Narrative */}
          <div className="space-y-6 lg:col-span-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#173B65] sm:text-3xl lg:text-4xl leading-[1.2]">
              An Institution Rooted in Knowledge and Purpose
            </h2>

            <p className="text-[15px] leading-relaxed text-[#64748B] sm:text-base sm:leading-7">
              Markaz Sanaviyya Academy harmonises traditional Islamic scholarship with contemporary academic development. Established under the auspices of Jamia Markaz, the institution is dedicated to nurturing world-class scholars and empowering responsible professionals grounded in deep ethical principles.
            </p>

            <p className="text-sm leading-relaxed text-[#64748B]">
              Through an integrated educational framework, students are immersed in foundational Islamic tenets alongside modern intellectual disciplines, cultivating the critical insight, moral rectitude, and communicative mastery necessary to address the needs of an evolving global society.
            </p>

            {/* Key Distinctions */}
            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-[#243447]">
              {corePillars.map((pillar) => (
                <li key={pillar} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#3182CE] shrink-0 mt-0.5" />
                  <span className="leading-snug">{pillar}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#173B65] hover:text-[#3182CE] transition-colors"
              >
                <span>Learn More About Us</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#3182CE]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Photograph */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Soft decorative backdrop */}
              <div
                aria-hidden="true"
                className="absolute -inset-3 sm:-inset-4 rounded-3xl bg-[#F5FAFF] border border-[#DCE8F3] transform rotate-1 transition-transform"
              />

              <div className="relative overflow-hidden rounded-2xl border border-[#DCE8F3] bg-white p-2.5 shadow-sm">
                <div className="relative aspect-[4/3] sm:aspect-[1.25] overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src="/campus.webp"
                    alt="Campus of Jamia Markaz, Karanthur"
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-102"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                      Jamia Markaz · Karanthur, Kozhikode
                    </p>
                    <p className="mt-1 font-heading text-base font-semibold text-white">
                      Tradition &amp; Contemporary Excellence in Harmony
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

export default AboutSection;