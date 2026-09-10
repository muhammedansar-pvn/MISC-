import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const QuickAccessSection = () => {
  const navigate = useNavigate();

  const items = [
    {
      title: 'Academics',
      subtitle: 'Integrated Curricula',
      icon: BookOpen,
      path: '/academics',
    },
    {
      title: 'Programmes',
      subtitle: 'Alim & Academic Streams',
      icon: GraduationCap,
      path: '/academics',
    },
    {
      title: 'Admissions',
      subtitle: 'Guidelines & Process',
      icon: Award,
      path: '/academics',
    },
    {
      title: 'Examination',
      subtitle: 'Board Regulations',
      icon: FileText,
      path: '/examination',
    },
    {
      title: 'Results',
      subtitle: 'Central Evaluation',
      icon: CheckCircle2,
      path: '/examination',
    },
  ];

  return (
    <section className="bg-white border-b border-[#E2E8E0] relative z-30 shadow-2xs">
      <div className="misc-container py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E2E8E0]/60">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
              QUICK ACCESS GATEWAY
            </span>
          </div>
          <span className="text-xs text-[#475569] font-medium hidden md:inline">
            Direct navigation to essential MISC portals & resources
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="group relative bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0] hover:border-[#2F7C7A]/40 rounded-xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-full shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#475569] group-hover:text-[#2F7C7A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-1 font-normal leading-snug">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickAccessSection;
