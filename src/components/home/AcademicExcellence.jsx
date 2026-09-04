import React from 'react';
import { BookOpen, ShieldCheck, Landmark, Users } from 'lucide-react';

export const AcademicExcellence = () => {
  const highlights = [
    {
      number: "3",
      label: "Major Programme Streams",
      description: "Alim, Secondary & Higher Secondary Integrated Streams",
      icon: BookOpen
    },
    {
      number: "6+",
      label: "Campus Institutions",
      description: "Direct Campus Institutions & Collaborating Centers Network",
      icon: Landmark
    },
    {
      number: "1400+",
      label: "Students Enrolled",
      description: "Pursuing Integrated Islamic & University Disciplines",
      icon: Users
    },
    {
      number: "25+",
      label: "Years of Excellence",
      description: "Educational Leadership Under Jamia Markaz Management",
      icon: ShieldCheck
    }
  ];

  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-20 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-md p-6 sm:p-8 space-y-3 hover:border-[#D4AF37]/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-[#D4AF37]">
                    {item.number}
                  </span>
                  <div className="w-10 h-10 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                  {item.label}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AcademicExcellence;
