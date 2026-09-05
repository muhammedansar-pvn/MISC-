import React from 'react';
import { FileText, Bell } from 'lucide-react';

export const ExaminationRegulations = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              EXAMINATION REGULATIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Examination Regulations & Policy
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Central examination regulations governing candidate assessment, evaluation policy, and academic standards.
          </p>
        </div>

        <div className="bg-white rounded-md border border-[#E2E8E0] p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F2F1] border border-[#2F7C7A]/40 flex items-center justify-center text-[#2F7C7A]">
            <FileText className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#132238] text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              OFFICIAL REGULATIONS
            </span>

            <h3 className="font-serif text-2xl font-bold text-[#132238]">
              Academic Examination Policy Guidelines
            </h3>

            <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
              Official examination regulations will be published here when made available by the MISC Secretariat prior to each evaluation cycle.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8E0] flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
            <Bell className="w-3.5 h-3.5 text-[#2F7C7A]" />
            <span>Markaz Integrated Studies Council Secretariat</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExaminationRegulations;
