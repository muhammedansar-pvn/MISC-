import React from 'react';
import { FileText, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

const resources = [
  { title: "Syllabus Regulations", desc: "Unified curriculum guidelines and academic framework manuals.", icon: FileText },
  { title: "Board Examination Directives", desc: "Standardized examination schedules, moderation rules & grading criteria.", icon: ShieldCheck },
  { title: "Academic Circulars", desc: "Official Secretariat circulars issued to registered member centers.", icon: BookOpen }
];

export const AcademicResources = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              ACADEMIC RESOURCES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Curriculum & Regulation Framework
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Centralized academic resources provided by the MISC Secretariat to ensure uniform educational quality across institutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {resources.map((res, idx) => {
            const Icon = res.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-md border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs space-y-4"
              >
                <div className="w-10 h-10 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#132238]">
                  {res.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                  {res.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AcademicResources;
