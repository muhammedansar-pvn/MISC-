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
    <section className="relative bg-white text-[#132238] py-14 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7F8F5] border border-[#E2E8E0] rounded-xl p-6 space-y-3 hover:border-[#2F7C7A]/40 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-3xl font-bold text-[#2F7C7A]">
                    {item.number}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0]">
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif text-base font-bold text-[#132238] tracking-tight">
                  {item.label}
                </h3>

                <p className="text-xs text-[#475569] font-normal leading-relaxed">
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
