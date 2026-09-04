import React from 'react';
import { BookOpen, ShieldCheck, Compass } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const InstitutionalOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT SIDE — EDITORIAL VISUAL CARD (Cols 1-6) */}
          <div className="lg:col-span-6 z-10">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0B1D3A] via-[#145DA0] to-[#091E3A] flex items-center justify-center p-8 text-white overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-2xl font-bold text-white tracking-wide block">
                      {miscInfo.fullName}
                    </span>
                    <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-widest block">
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
                <div className="bg-[#0B1D3A] text-white border border-[#D4AF37]/50 rounded px-3.5 py-2 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                    JAMIA MARKAZ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — CONTENT (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                INSTITUTIONAL OVERVIEW
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
              Standardized Curriculum & Academic Oversight
            </h2>

            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                The Markaz Integrated Studies Council operates as the premier academic council of Jamia Markaz, responsible for curriculum design, quality assurance, and examination moderation across member institutions.
              </p>
              <p className="text-sm sm:text-base text-slate-500">
                The Council establishes unified syllabus regulations, conducts central board evaluations, and issues academic guidelines to maintain high standards of scholarship across direct campuses and collaborating centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#145DA0]" />
                  <h4 className="font-serif text-base font-bold text-[#0B1D3A]">
                    Academic Quality
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                  Standardized syllabus guidelines & board moderation
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-[#145DA0]" />
                  <h4 className="font-serif text-base font-bold text-[#0B1D3A]">
                    Dual Integration
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
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
