import React from 'react';
import { BookOpen, Bell } from 'lucide-react';

export const PublicationsOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              ACADEMIC PUBLICATIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B1D3A]">
            Research & Journal Publications
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-normal">
            Information regarding academic research papers, journals, and scholarly publications issued by MISC faculty and research wings.
          </p>
        </div>

        <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 sm:p-10 shadow-2xs space-y-4 max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#0B1D3A]/5 border border-[#D4AF37]/40 flex items-center justify-center text-[#145DA0]">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block bg-[#0B1D3A] text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              SECRETARIAT DIRECTIVE
            </span>
            <h3 className="font-serif text-xl font-bold text-[#0B1D3A]">
              Academic Journal Listing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Official details of research publications and journals will be published here by the MISC Secretariat as digital archives become available.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
            <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>MISC Secretariat Desk</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationsOverview;
