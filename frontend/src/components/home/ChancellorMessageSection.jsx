'use client';

import React from 'react';
import { Quote, Award } from 'lucide-react';
import { miscInfo } from '@/data/miscInfo';

export const ChancellorMessageSection = () => {
  return (
    <section className="relative border-b border-[#DCE8F3] bg-white py-16 sm:py-20 lg:py-24 text-[#243447]">
      <div className="misc-container">
        <div className="mx-auto max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
            <Award className="h-4 w-4 text-[#3182CE]" />
            <span>INSTITUTIONAL LEADERSHIP</span>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#173B65] sm:text-3xl lg:text-4xl">
            A Message from the Chancellor
          </h2>

          <div className="mt-8 relative rounded-2xl border border-[#DCE8F3] bg-[#F5FAFF] p-8 sm:p-12 lg:p-14 shadow-xs">
            {/* Elegant Quotation Mark */}
            <Quote className="h-10 w-10 sm:h-12 sm:w-12 text-[#3182CE]/30 mb-6 -scale-x-100" />

            <blockquote className="font-heading text-xl sm:text-2xl lg:text-[1.65rem] font-medium leading-relaxed sm:leading-snug text-[#173B65]">
              &ldquo;Markaz Sanaviyya Academy harmonises authentic Islamic scholarship with modern academic excellence, nurturing individuals of faith, knowledge, and noble character. We strive to develop eloquent speakers, effective preachers, and responsible leaders who uphold Islamic values and serve society with wisdom and integrity.&rdquo;
            </blockquote>

            <div className="mt-8 pt-6 border-t border-[#DCE8F3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="block font-heading text-lg font-bold text-[#173B65]">
                  Office of the Chancellor
                </span>
                <span className="text-xs text-[#64748B]">
                  Markaz Sanaviyya Academy · Jamia Markaz
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8F3] bg-white px-4 py-1.5 text-xs font-semibold text-[#173B65]">
                <span>Verified Institutional Message</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChancellorMessageSection;
