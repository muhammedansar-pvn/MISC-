import React from 'react';
import { BookOpen, ShieldCheck, Compass } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const InstitutionalOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT SIDE — EDITORIAL VISUAL CARD (Cols 1-6) */}
          <div className="lg:col-span-6 z-10">
            <div className="relative rounded-lg overflow-hidden border border-[#E2E8E0] shadow-md">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#132238] via-[#2F7C7A] to-[#132238] flex items-center justify-center p-8 text-white overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#2F7C7A]/20 border border-[#2F7C7A]/40 flex items-center justify-center text-[#E6F2F1] shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-2xl font-bold text-white tracking-wide block">
                      {miscInfo.fullName}
                    </span>
                    <span className="text-xs text-[#E6F2F1] font-medium uppercase tracking-widest block">
                      ACADEMIC GOVERNANCE BODY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    Under the central leadership and educational management of {miscInfo.parentOrganization}.
                  </p>
                </div>
              </div>

              {/* Badge */}
              <div className="absolute bottom-4 right-4 z-20">
                <div className="bg-[#132238] text-white border border-[#2F7C7A]/50 rounded px-3.5 py-2 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
                  <span className="text-xs font-bold tracking-widest text-[#E6F2F1] uppercase">
                    JAMIA MARKAZ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — CONTENT (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#2F7C7A]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
                INSTITUTIONAL OVERVIEW
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238] tracking-tight leading-tight">
              Standardized Curriculum & Academic Oversight
            </h2>

            <div className="space-y-4 text-[#475569] text-base sm:text-lg leading-relaxed font-normal">
              <p>
                The Markaz Integrated Studies Council operates as the premier academic council of Jamia Markaz, responsible for curriculum design, quality assurance, and examination moderation across member institutions.
              </p>
              <p className="text-sm sm:text-base text-slate-500">
                The Council establishes unified syllabus regulations, conducts central board evaluations, and issues academic guidelines to maintain high standards of scholarship across direct campuses and collaborating centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8E0]">
              <div className="bg-[#F7F8F5] p-4 rounded border border-[#E2E8E0] space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#2F7C7A]" />
                  <h4 className="font-serif text-base font-bold text-[#132238]">
                    Academic Quality
                  </h4>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed pl-6">
                  Standardized syllabus guidelines & board moderation
                </p>
              </div>

              <div className="bg-[#F7F8F5] p-4 rounded border border-[#E2E8E0] space-y-1">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-[#2F7C7A]" />
                  <h4 className="font-serif text-base font-bold text-[#132238]">
                    Dual Integration
                  </h4>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed pl-6">
                  Classical jurisprudence & university disciplines
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
