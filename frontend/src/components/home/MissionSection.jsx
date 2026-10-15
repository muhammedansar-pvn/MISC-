'use client';

import React from 'react';
import { Compass, Target, ArrowUpRight } from 'lucide-react';
import { miscInfo } from '@/data/miscInfo';

export const MissionSection = () => {
  return (
    <section id="mission" className="relative border-b border-[#DCE8F3] bg-[#F5FAFF] py-18 sm:py-24 text-[#243447]">
      {/* Subtle Islamic pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-islamic-pattern opacity-50"
      />

      <div className="misc-container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE8F3] bg-white px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
            <Compass className="h-3.5 w-3.5 text-[#3182CE]" />
            <span>INSTITUTIONAL PURPOSE</span>
          </div>

          {/* Heading */}
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#173B65] sm:text-4xl lg:text-[2.65rem]">
            Our Mission
          </h2>

          {/* Approved Mission Text in generous whitespace & comfortable reading width */}
          <div className="mt-8 rounded-2xl border border-[#DCE8F3] bg-white p-8 sm:p-12 shadow-xs text-left md:text-center">
            <p className="text-base sm:text-lg lg:text-[1.15rem] leading-relaxed text-[#243447] font-normal">
              Markaz Sanaviyya is committed to shaping world-class Islamic scholars and empowering responsible professionals through quality education. By integrating academic excellence, ethical values, and leadership development, the institution aims to nurture dedicated scholars and critical thinkers who can make a meaningful impact on society. It strives to provide every student with opportunities to identify and enhance their individual abilities, interests, and potential. Through a holistic approach to education, Markaz Sanaviyya seeks to prepare knowledgeable, principled, and socially conscious individuals who can respond effectively to global challenges and contribute to the intellectual, moral, and social advancement of the community.
            </p>

            {/* Core Mission Anchor Points */}
            <div className="mt-8 pt-8 border-t border-[#DCE8F3] grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-xl bg-[#F5FAFF] border border-[#DCE8F3]/70">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#3182CE]">
                  Scholarly Mastery
                </span>
                <span className="mt-1 block text-sm font-medium text-[#173B65]">
                  World-class Islamic scholarship and critical thinking
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FAFF] border border-[#DCE8F3]/70">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#3182CE]">
                  Ethical Leadership
                </span>
                <span className="mt-1 block text-sm font-medium text-[#173B65]">
                  Principled, socially conscious individuals
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F5FAFF] border border-[#DCE8F3]/70">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#3182CE]">
                  Societal Impact
                </span>
                <span className="mt-1 block text-sm font-medium text-[#173B65]">
                  Intellectual, moral, and social advancement
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
