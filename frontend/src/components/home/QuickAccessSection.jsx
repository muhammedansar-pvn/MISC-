import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const QuickAccessSection = () => {
  const navigate = useNavigate();

  const items = [
    { title: 'Academics', subtitle: 'Integrated Curricula', icon: BookOpen, path: '/academics' },
    { title: 'Programmes', subtitle: 'Alim & Degree Streams', icon: GraduationCap, path: '/academics' },
    { title: 'Admissions', subtitle: 'Guidelines & Process', icon: Award, path: '/academics' },
    { title: 'Examination', subtitle: 'Board Regulations', icon: FileText, path: '/examination' },
    { title: 'Results', subtitle: 'Central Evaluation', icon: CheckCircle2, path: '/examination' },
  ];

  return (
    <section className="bg-white border-b border-[#E2E8E0] relative z-30 py-4 sm:py-5 shadow-2xs">
      <div className="misc-container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Label */}
          <div className="flex items-center space-x-2.5 shrink-0 pr-4 lg:border-r border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
              QUICK ACCESS
            </span>
          </div>

          {/* Inline Compact Links Grid / Flex */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between flex-1 gap-2 sm:gap-3">
            {items.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="group flex items-center space-x-3 p-2.5 sm:px-3.5 sm:py-2 rounded-lg bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0]/80 hover:border-[#2F7C7A]/40 transition-all cursor-pointer text-left w-full lg:w-auto"
                >
                  <div className="w-7 h-7 rounded bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors truncate">
                        {item.title}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-[#475569] group-hover:text-[#2F7C7A] transition-transform group-hover:translate-x-0.5 shrink-0 hidden sm:inline" />
                    </div>
                    <span className="text-[10.5px] text-[#475569] font-normal block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default QuickAccessSection;
