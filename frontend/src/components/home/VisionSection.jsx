'use client';

import React from 'react';
import { Eye, Sparkles, Check, ArrowRight } from 'lucide-react';
import { miscInfo } from '@/data/miscInfo';

export const VisionSection = () => {
  return (
    <section id="vision" className="relative border-b border-[#DCE8F3] bg-white py-18 sm:py-24 text-[#243447]">
      {/* Subtle geometric star backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-[#EAF5FF]/60 rounded-full blur-3xl"
      />

      <div className="misc-container relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Heading and Distinct Academic Accent Rail */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
              <Eye className="h-4 w-4 text-[#3182CE]" />
              <span>ACADEMIC HORIZON</span>
            </div>

            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#173B65] sm:text-4xl lg:text-[2.65rem] leading-[1.15]">
              Our Vision
            </h2>

            <p className="text-base leading-relaxed text-[#64748B]">
              Elevating Islamic education to an unprecedented academic standard, rooted firmly in authentic tradition while actively engaging the intellectual demands of a dynamic global landscape.
            </p>

            {/* Strategic Pillars in Light Blue Accent Card */}
            <div className="rounded-xl border border-[#DCE8F3] bg-[#EAF5FF] p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173B65] text-[11px] font-bold text-white">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#173B65]">High Academic Standard</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Rigorous curriculum integrating classical tenets with contemporary rigor.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3182CE] text-[11px] font-bold text-white">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#173B65]">Action-Oriented Scholarship</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Translating deep sacred knowledge into meaningful societal action.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173B65] text-[11px] font-bold text-white">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#173B65]">Adaptive Contemporary Response</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">Responding proactively to global intellectual and ethical challenges.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Approved Vision Statement */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-[#DCE8F3] bg-[#F5FAFF] p-8 sm:p-12 shadow-xs">
              <div className="absolute top-6 right-6 text-[#3182CE]/20 font-heading text-6xl select-none">
                “
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3182CE]">
                Vision Mandate
              </span>

              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#243447] font-normal relative z-10">
                Markaz Sanaviyya aspires to elevate Islamic education to a higher academic standard while nurturing a generation of scholars who uphold strong moral values and remain committed to the betterment of society. The institution seeks to develop individuals who embody not only knowledge but also a strong sense of responsibility, a clear sense of purpose, critical thinking, and the ability to translate their knowledge into meaningful action. This vision stems from the need to adapt to the changing world and to advance Islamic education in ways that respond effectively to contemporary challenges while remaining firmly rooted in Islamic principles. Through this approach, Markaz Sanaviyya aims to cultivate scholars who contribute meaningfully to the intellectual, moral, and social advancement of society.
              </p>

              <div className="mt-8 pt-6 border-t border-[#DCE8F3] flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-semibold text-[#173B65]">Markaz Sanaviyya Academy</span>
                <span>Jamia Markaz · Karanthur</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
