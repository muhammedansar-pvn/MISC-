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
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              EXAMINATION CATEGORIES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Official Examination Information Areas
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
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
                className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-6 shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8E0]/80 pb-3">
                    <span className="font-serif text-xs font-bold text-[#2F7C7A] tracking-wider">
                      {itemNumber}
                    </span>
                    <div className="w-8 h-8 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#132238] tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#E2E8E0]/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-[#2F7C7A] uppercase bg-[#E6F2F1] px-2.5 py-1 rounded border border-[#E2E8E0] flex items-center space-x-1">
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
