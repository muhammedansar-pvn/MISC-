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
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              EDUCATIONAL MODEL
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B1D3A]">
            Integrated Educational Framework
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            MISC harmonizes traditional Islamic learning with contemporary university education under a single, cohesive academic structure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {streams.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-md border border-slate-200 p-8 shadow-2xs space-y-4"
              >
                <div className="w-12 h-12 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0B1D3A]">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
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
