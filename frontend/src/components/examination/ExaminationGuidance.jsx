import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

const guidancePoints = [
  "Candidates must adhere strictly to examination timetables issued by the Central Board.",
  "Registered centers must ensure hall arrangements conform to board moderation regulations.",
  "Re-evaluation and mark verification procedures follow formal Secretariat timelines.",
  "Mark sheets and academic records are generated under verified board moderation."
];

export const ExaminationGuidance = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              CANDIDATE GUIDANCE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Board Examination Instructions & Guidance
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Essential directives for candidate registration, examination hall standards, and evaluation verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {guidancePoints.map((point, idx) => (
            <div
              key={idx}
              className="bg-white rounded-md border border-[#E2E8E0] p-6 flex items-start space-x-4 shadow-2xs"
            >
              <CheckCircle2 className="w-5 h-5 text-[#2F7C7A] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExaminationGuidance;
