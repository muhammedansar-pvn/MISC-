'use client';

import React from 'react';
import { ShieldCheck, Compass } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';
import ScrollReveal from '../common/ScrollReveal';

export const InstitutionalOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#DCE8F3]">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT SIDE — EDITORIAL VISUAL CARD (Cols 1-6) */}
          <div className="lg:col-span-6 z-10">
            <ScrollReveal delay={150} yOffset={25}>
              <div className="relative rounded-2xl overflow-hidden border border-[#DCE8F3] shadow-sm group">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src="/gate.webp"
                    alt="Jamia Markaz Gateway - Central Academic Governance Landmark"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/85 via-[#173B65]/20 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <span className="font-heading text-xl font-bold text-white tracking-wide block">
                        Markaz Sanaviyya Academy
                      </span>
                      <span className="text-xs text-[#DCE8F3] font-medium uppercase tracking-widest block">
                        Jamia Markaz · Karanthur
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="bg-[#173B65] text-white border border-[#3182CE]/50 rounded-lg px-3.5 py-2 shadow-lg flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#3182CE]" />
                    <span className="text-xs font-bold tracking-widest text-[#DCE8F3] uppercase">
                      JAMIA MARKAZ
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT SIDE — CONTENT (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#3182CE]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#3182CE] uppercase">
                INSTITUTIONAL FOUNDATION
              </span>
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#173B65] tracking-tight leading-tight">
              An Academic Model of Integrity &amp; Leadership
            </h2>

            <div className="space-y-4 text-[#64748B] text-[15.5px] sm:text-[17px] leading-relaxed font-normal">
              <p>
                Markaz Sanaviyya Academy operates under the central academic leadership of Jamia Markaz, responsible for curriculum design, quality assurance, and character formation.
              </p>
              <p className="text-[14.5px] sm:text-[15.5px] text-[#64748B]">
                The Academy provides a unified educational framework that combines traditional Islamic scholarship, modern education, and moral tarbiyah, preparing students to become eloquent leaders and critical thinkers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#DCE8F3]">
              <div className="bg-[#F5FAFF] p-4 rounded-xl border border-[#DCE8F3] space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#3182CE]" />
                  <h4 className="font-heading text-base font-bold text-[#173B65]">
                    Academic Quality
                  </h4>
                </div>
                <p className="text-xs sm:text-[13.5px] text-[#64748B] leading-relaxed pl-6">
                  Standardized curriculum &amp; continuous assessment
                </p>
              </div>

              <div className="bg-[#F5FAFF] p-4 rounded-xl border border-[#DCE8F3] space-y-1">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-[#3182CE]" />
                  <h4 className="font-heading text-base font-bold text-[#173B65]">
                    Harmonious Dual Model
                  </h4>
                </div>
                <p className="text-xs sm:text-[13.5px] text-[#64748B] leading-relaxed pl-6">
                  Sacred sciences alongside contemporary disciplines
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InstitutionalOverview;
