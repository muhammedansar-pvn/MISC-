import React from 'react';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ExaminationOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200" id="examination-framework">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          <div className="lg:col-span-6 z-10">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0B1D3A] via-[#145DA0] to-[#091E3A] flex items-center justify-center p-8 text-white overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-2xl font-bold text-white tracking-wide block">
                      MISC Examination Board
                    </span>
                    <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-widest block">
                      Central Academic Assessment Board
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    Ensuring standardized examination, unified evaluation, and consistent academic record processing across member centers.
                  </p>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-20">
                <div className="bg-[#0B1D3A] text-white border border-[#D4AF37]/50 rounded px-3.5 py-2 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                    BOARD EVALUATION
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                EXAMINATION FRAMEWORK
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
              Structured Assessment. Consistent Academic Standards.
            </h2>

            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                The Markaz Integrated Studies Council operates a centralized examination board designed to evaluate student performance through standardized assessment methodologies.
              </p>
              <p className="text-sm sm:text-base text-slate-500">
                The framework governs board examination schedules, evaluation procedures, moderation processes, and academic record generation for affiliated programs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#145DA0]" />
                  <h4 className="font-serif text-base font-bold text-[#0B1D3A]">
                    Standardized Board
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                  Unified examination schedules & question guidelines
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#145DA0]" />
                  <h4 className="font-serif text-base font-bold text-[#0B1D3A]">
                    Moderated Grading
                  </h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">
                  Structured assessment evaluation & mark sheets
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ExaminationOverview;
