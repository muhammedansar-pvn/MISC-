import React from 'react';
import { ClipboardList, Award, Scale, FileSpreadsheet } from 'lucide-react';

const frameworkPillars = [
  {
    number: "01",
    title: "Centralized Assessment",
    description: "Structured examination processes coordinated through the central board academic framework.",
    icon: ClipboardList
  },
  {
    number: "02",
    title: "Grading Mechanisms",
    description: "Academic performance is evaluated through defined grading criteria and evaluation metrics.",
    icon: Award
  },
  {
    number: "03",
    title: "Assessment Moderation",
    description: "The examination framework includes structured moderation as part of mark processing.",
    icon: Scale
  },
  {
    number: "04",
    title: "Academic Records",
    description: "Examination outcomes support formal academic mark sheets and record generation.",
    icon: FileSpreadsheet
  }
];

export const ExaminationFramework = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              ASSESSMENT MECHANISM
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            The Four Pillars of Board Evaluation
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Key evaluation principles governing centralized board assessment and academic record generation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {frameworkPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.number}
                className="bg-white rounded-md border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-3">
                    <span className="font-serif text-xs font-bold text-[#2F7C7A] tracking-wider">
                      {pillar.number}
                    </span>
                    <div className="w-8 h-8 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#132238] tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#132238] text-white rounded-md border border-[#2F7C7A]/40 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto relative overflow-hidden">
          <div className="space-y-1 text-center sm:text-left z-10">
            <span className="text-[10px] font-bold text-[#E6F2F1] uppercase tracking-widest bg-[#2F7C7A]/20 px-2.5 py-0.5 rounded border border-[#2F7C7A]/40">
              SRS EVALUATION RULE
            </span>
            <h4 className="font-serif text-xl font-bold text-white pt-1">
              Minimum Pass Requirement
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              The MISC examination framework specifies 35 as the minimum pass mark for academic evaluation.
            </p>
          </div>

          <div className="bg-[#2F7C7A] border border-[#E6F2F1]/50 px-6 py-3 rounded text-center z-10 shrink-0">
            <span className="font-serif text-3xl font-bold text-white block leading-none">
              35
            </span>
            <span className="text-[10px] text-slate-100 uppercase font-semibold tracking-wider block mt-1">
              PASS MARK
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExaminationFramework;
