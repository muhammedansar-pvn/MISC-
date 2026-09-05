import React from 'react';
import { Award, FileText, HelpCircle, BookOpen, Bell } from 'lucide-react';

const resources = [
  {
    title: "Examination Regulations",
    category: "Policy",
    desc: "Centralized guidelines governing candidate conduct and board evaluation.",
    icon: FileText
  },
  {
    title: "Grading Information",
    category: "Assessment",
    desc: "Evaluation criteria and pass mark specifications prescribed by the board.",
    icon: Award
  },
  {
    title: "Examination Guidance",
    category: "Candidate Advice",
    desc: "Instructions for candidates and registered centers prior to examination dates.",
    icon: HelpCircle
  },
  {
    title: "Academic Assessment Information",
    category: "Board Framework",
    desc: "Framework details governing internal and central board mark processing.",
    icon: BookOpen
  }
];

export const ExaminationResources = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              EXAMINATION RESOURCES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Official Assessment Resources
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Resource documents and informational circulars cataloged for member centers and academic administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {resources.map((res, idx) => {
            const Icon = res.icon;
            return (
              <div
                key={idx}
                className="bg-[#F8FAFC] rounded-md border border-slate-200 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      {res.category}
                    </span>
                    <div className="w-8 h-8 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#0B1D3A] tracking-tight">
                    {res.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center space-x-1.5 text-slate-600">
                    <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Document availability published by Secretariat</span>
                  </span>
                  <span className="text-[10px] text-[#0B1D3A] font-semibold bg-[#0B1D3A]/5 px-2 py-0.5 rounded uppercase">
                    OFFICIAL RESOURCE
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

export default ExaminationResources;
