import React from 'react';
import { FileText, ShieldCheck, Folder } from 'lucide-react';

export const ResourceCentreIntro = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              RESOURCE CENTRE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Official Information, In One Place
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            The Central Resource Repository provides member institutions, faculty, and students with verified academic manuals, syllabus guidelines, and official board circulars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0B1D3A]">
              Academic Guidelines
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Official manuals and regulatory guidelines for integrated streams and dars systems.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0B1D3A]">
              Syllabus Regulations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Standardized curriculum frameworks and board evaluation regulations.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <Folder className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#0B1D3A]">
              Secretariat Circulars
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Official announcements, administrative circulars, and institutional forms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceCentreIntro;
