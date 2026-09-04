import React from 'react';
import { ClipboardList, Award, Clock, FileCheck } from 'lucide-react';
import { examinationCards } from '../../data/examinationData';

const iconMap = {
  ClipboardList: ClipboardList,
  Award: Award,
  Clock: Clock,
  FileCheck: FileCheck
};

export const ExaminationCategories = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              EXAMINATION CATEGORIES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Official Examination Information Areas
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Discover the central assessment areas governing examination frameworks, grading policies, board circulars, and academic record guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {examinationCards.map((item, idx) => {
            const IconComp = iconMap[item.icon] || ClipboardList;
            const itemNumber = (idx + 1).toString().padStart(2, '0');

            return (
              <div
                key={item.id}
                className="bg-[#F8FAFC] rounded-md border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="font-serif text-xs font-bold text-[#D4AF37] tracking-wider">
                      {itemNumber}
                    </span>
                    <div className="w-8 h-8 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#0B1D3A] tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-[#145DA0] uppercase bg-[#145DA0]/10 px-2.5 py-1 rounded border border-[#145DA0]/20 flex items-center space-x-1">
                    <span>OFFICIAL AREA</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExaminationCategories;
