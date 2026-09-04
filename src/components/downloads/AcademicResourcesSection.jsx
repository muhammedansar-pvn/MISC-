import React from 'react';
import { BookOpen } from 'lucide-react';

export const AcademicResourcesSection = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              ACADEMIC RESOURCES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Academic Manuals & Syllabus Regulations
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Standardized academic manuals, curriculum guidelines, and regulatory frameworks governing MISC programs.
          </p>
        </div>

        <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 sm:p-10 shadow-2xs space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 text-[#0B1D3A]">
            <BookOpen className="w-6 h-6 text-[#145DA0]" />
            <h3 className="font-serif text-xl font-bold">
              Integrated Syllabus Regulations
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Syllabus regulation documents for integrated Islamic and contemporary streams are reviewed annually by the MISC Academic Council. Approved digital copies are distributed directly to registered campus secretariats.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AcademicResourcesSection;
