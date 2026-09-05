import React from 'react';
import { Award } from 'lucide-react';

export const ExaminationResourcesSection = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              EXAMINATION RESOURCES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Central Board Examination Guidelines
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Examination circulars, board guidelines, and evaluation manuals issued by the Central Examination Board.
          </p>
        </div>

        <div className="bg-white rounded-md border border-[#E2E8E0] p-8 sm:p-10 shadow-2xs space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 text-[#132238]">
            <Award className="w-6 h-6 text-[#2F7C7A]" />
            <h3 className="font-serif text-xl font-bold">
              Board Examination Regulations
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
            Board examination regulations, timetable schedules, and candidate instructions are issued prior to each evaluation cycle by the Central Examination Board.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExaminationResourcesSection;
