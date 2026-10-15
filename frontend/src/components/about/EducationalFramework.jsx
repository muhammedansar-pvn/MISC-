import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

const streams = [
  {
    title: "Classical Islamic Sciences",
    description: "Foundational Quranic exegesis (Tafseer), Hadith textual inquiry, jurisprudence (Fiqh), Arabic grammar (Nahw), and theology (Aqeedah).",
    icon: BookOpen
  },
  {
    title: "Contemporary Disciplines",
    description: "Rigorous modern humanities, languages, communication rhetoric, and contemporary academic development.",
    icon: GraduationCap
  },
  {
    title: "Ethical Leadership & Tarbiyah",
    description: "Spiritual grounding, moral integrity, critical thinking, and proactive social responsibility.",
    icon: ShieldCheck
  }
];

export const EducationalFramework = () => {
  return (
    <section className="relative bg-[#F5FAFF] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#DCE8F3]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#3182CE]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#3182CE] uppercase">
              EDUCATIONAL MODEL
            </span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#173B65]">
            Integrated Educational Framework
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed font-normal">
            Markaz Sanaviyya Academy harmonizes traditional Islamic scholarship with contemporary intellectual disciplines under a cohesive academic model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {streams.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#DCE8F3] p-6 sm:p-8 space-y-4 shadow-xs hover:border-[#3182CE]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EAF5FF] text-[#3182CE] flex items-center justify-center border border-[#DCE8F3]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#173B65]">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
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
