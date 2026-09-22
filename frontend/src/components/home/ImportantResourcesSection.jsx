'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowUpRight } from 'lucide-react';

export const ImportantResourcesSection = () => {
  const navigate = useNavigate();

  const standards = [
    {
      index: '01',
      title: 'EXAMINATION',
      subtitle: 'Central Board Evaluation & Schedules',
      description: 'Standardized assessment guidelines, center registrations, and evaluation board directives.',
      path: '/examination',
    },
    {
      index: '02',
      title: 'RESULTS',
      subtitle: 'Official Board Verification',
      description: 'Centralized marks evaluation, institutional performance analytics, and authenticated transcripts.',
      path: '/examination',
    },
    {
      index: '03',
      title: 'REGULATIONS',
      subtitle: 'Academic By-laws & Governance',
      description: 'Council statutes, institutional affiliation criteria, faculty mandates, and code of conduct.',
      path: '/downloads',
    },
    {
      index: '04',
      title: 'ACADEMIC CALENDAR',
      subtitle: 'Yearly Schedule & Timeline',
      description: 'Synchronized term dates, assessment intervals, research symposiums, and convocations.',
      path: '/downloads',
    },
  ];

  return (
    <section className="relative bg-[#F7F7F3] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-16 sm:mb-20">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-wider">
              06
            </span>
            <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
              BOARD GOVERNANCE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#132238] leading-tight">
            ACADEMIC STANDARDS
          </h2>

          <p className="text-base sm:text-lg text-[#667085] font-normal leading-relaxed max-w-2xl">
            Centralized academic governance, rigorous board assessments, official institutional statutes, and yearly operational schedules.
          </p>
        </div>

        {/* 4 Large Typography & Border Links — NO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-[rgba(19,34,56,0.12)]">
          {standards.map((item) => (
            <div
              key={item.index}
              onClick={() => navigate(item.path)}
              className="group p-8 sm:p-10 lg:p-12 border-r border-b border-[rgba(19,34,56,0.12)] hover:bg-white transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] relative"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-widest">
                  {item.index}
                </span>

                <div className="w-8 h-8 rounded-full border border-[rgba(19,34,56,0.15)] flex items-center justify-center text-[#132238]/60 group-hover:border-[#2F7C7A] group-hover:text-[#2F7C7A] group-hover:bg-[#E6F2F1] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </div>
              </div>

              <div className="pt-8 space-y-2 transform group-hover:translate-x-1.5 transition-transform duration-300">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] font-normal leading-relaxed max-w-md">
                  {item.description}
                </p>
              </div>

              {/* Bottom Subtle Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2F7C7A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ImportantResourcesSection;
