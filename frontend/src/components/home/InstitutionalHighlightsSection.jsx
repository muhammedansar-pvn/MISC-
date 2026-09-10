import React from 'react';
import { Award, Building2, BookOpen, ShieldCheck } from 'lucide-react';

export const InstitutionalHighlightsSection = () => {
  const highlights = [
    {
      metric: 'Integrated',
      label: 'Academic Streams',
      description: 'Alim, Secondary & Higher Secondary Integrated Curricula.',
      icon: BookOpen,
    },
    {
      metric: 'Unified',
      label: 'Examination Board',
      description: 'Centralized evaluation, uniform assessments & syllabus moderation.',
      icon: ShieldCheck,
    },
    {
      metric: 'Network',
      label: 'Institutional Network',
      description: 'Coordinating member institutions & collaborating educational centers.',
      icon: Building2,
    },
    {
      metric: 'Karanthur',
      label: 'Jamia Markaz Headquarters',
      description: 'Central Secretariat governing academic policies & institutional oversight.',
      icon: Award,
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              INSTITUTIONAL GOVERNANCE
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Academic Excellence & Governance Scope
          </h2>
          <p className="text-base text-[#475569] font-normal leading-relaxed">
            Directing educational standards, syllabus guidelines, and examination moderation across member institutions.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className="bg-[#F7F8F5] border border-[#E2E8E0] rounded-2xl p-6 sm:p-8 text-center flex flex-col justify-between shadow-2xs hover:border-[#2F7C7A]/40 transition-colors group"
              >
                <div>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-[#E2E8E0] text-[#2F7C7A] flex items-center justify-center mb-4 group-hover:bg-[#2F7C7A] group-hover:text-white transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-[#132238] mb-2 leading-none">
                    {item.metric}
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#132238] mb-2">
                    {item.label}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default InstitutionalHighlightsSection;
