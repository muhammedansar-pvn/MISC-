import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

const streams = [
  {
    title: "Islamic Jurisprudence & Sciences",
    description: "Classical Quranic exegesis, Hadith studies, jurisprudence, Arabic language, and moral theology.",
    icon: BookOpen
  },
  {
    title: "University Disciplines",
    description: "University humanities, commerce, sciences, and contemporary academic disciplines.",
    icon: GraduationCap
  },
  {
    title: "Board Evaluation Framework",
    description: "Centralized examination, standardized syllabus guidelines, and quality assurance moderation.",
    icon: ShieldCheck
  }
];

export const EducationalFramework = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              EDUCATIONAL MODEL
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238]">
            Integrated Educational Framework
          </h2>
          <p className="text-base text-[#475569] leading-relaxed font-normal">
            MISC harmonizes traditional Islamic learning with contemporary university education under a single, cohesive academic structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {streams.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-md border border-[#E2E8E0] p-8 shadow-2xs space-y-4"
              >
                <div className="w-12 h-12 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#132238]">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
                  {st.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EducationalFramework;
