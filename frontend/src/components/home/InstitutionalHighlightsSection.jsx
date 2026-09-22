'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowUpRight } from 'lucide-react';

export const InstitutionalHighlightsSection = () => {
  const navigate = useNavigate();

  const ecosystemItems = [
    {
      number: '01',
      title: 'INSTITUTIONS',
      description: 'Network of 50+ affiliated collegiate institutions and campus centers across states.',
      path: '/institutions',
    },
    {
      number: '02',
      title: 'PROGRAMMES',
      description: 'Secondary, Higher Secondary, and Alim integrated curricula accredited with degrees.',
      path: '/academics',
    },
    {
      number: '03',
      title: 'FACULTY',
      description: 'Central pedagogical standards, continuous faculty empowerment, and scholar mentorship.',
      path: '/about',
    },
    {
      number: '04',
      title: 'STUDENTS',
      description: 'Over 10,000 enrolled scholars receiving holistic religious and contemporary education.',
      path: '/academics',
    },
    {
      number: '05',
      title: 'EXAMINATION',
      description: 'Independent central examination board managing unified evaluation and schedules.',
      path: '/examination',
    },
    {
      number: '06',
      title: 'RESULTS',
      description: 'Centralized board verification, authentic transcript issuance, and student records.',
      path: '/examination',
    },
  ];

  return (
    <section className="relative bg-[#132238] text-white py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-slate-800 overflow-hidden">
      {/* Background Architectural Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#2F7C7A]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="misc-container relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 sm:mb-20 lg:mb-24">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-wider">
              03
            </span>
            <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#E6F2F1] uppercase">
              THE MISC FRAMEWORK
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            AN ACADEMIC ECOSYSTEM
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Connecting institutions, programmes, scholars and learners through a unified academic framework.
          </p>
        </div>

        {/* Large Typography-Based Asymmetric Grid (01–06) with Thin Borders — NO ROUNDED CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-white/10">
          {ecosystemItems.map((item) => (
            <div
              key={item.number}
              onClick={() => navigate(item.path)}
              className="group p-8 sm:p-10 lg:p-12 border-r border-b border-white/10 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative"
            >
              {/* Top Row: Large Number + Arrow Indicator */}
              <div className="flex items-start justify-between">
                <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-light text-white/30 group-hover:text-[#2F7C7A] transition-colors duration-300">
                  {item.number}
                </span>

                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 group-hover:border-[#2F7C7A] group-hover:text-[#2F7C7A] group-hover:bg-[#2F7C7A]/10 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>

              {/* Bottom: Typography Title + Description with slight movement on hover */}
              <div className="pt-8 space-y-3 transform group-hover:translate-x-1.5 transition-transform duration-300">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-white group-hover:text-[#E6F2F1] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed max-w-sm">
                  {item.description}
                </p>
              </div>

              {/* Bottom Subtle Teal Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2F7C7A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default InstitutionalHighlightsSection;
