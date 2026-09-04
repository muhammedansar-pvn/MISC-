import React from 'react';
import { BookOpen, ShieldCheck, Award } from 'lucide-react';

const roles = [
  { title: "Unified Curriculum", desc: "Standardizing academic curricula across integrated streams.", icon: BookOpen },
  { title: "Central Board Evaluation", desc: "Conducting board examinations & mark processing.", icon: ShieldCheck },
  { title: "Quality Assurance", desc: "Regular academic audits and faculty coordination.", icon: Award }
];

export const CoordinationRole = () => {
  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              COORDINATION ROLE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            One Framework. Connected Institutions.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            How MISC provides academic governance, examination moderation, and educational supervision across member centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-3"
              >
                <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0B1D3A]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoordinationRole;
