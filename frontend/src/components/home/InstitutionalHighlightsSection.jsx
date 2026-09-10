import React from 'react';
import { Award, Building2, BookOpen, ShieldCheck, ArrowRight, GitFork } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InstitutionalHighlightsSection = () => {
  const navigate = useNavigate();

  const highlights = [
    {
      metric: 'Integrated',
      label: 'Academic Streams',
      description: 'Alim, Secondary & Higher Secondary Integrated Curricula harmonizing classical scholarship with university education.',
      icon: BookOpen,
      badge: '01 / CURRICULUM',
      accent: 'border-[#2F7C7A]'
    },
    {
      metric: 'Unified',
      label: 'Examination Board',
      description: 'Centralized board evaluation, standardized examinations, uniform assessments, and quality assurance moderation.',
      icon: ShieldCheck,
      badge: '02 / ASSESSMENT',
      accent: 'border-slate-300'
    },
    {
      metric: 'Network',
      label: 'Institutional Network',
      description: 'Coordinating member institutions, direct campus dars systems, and collaborating educational centers globally.',
      icon: Building2,
      badge: '03 / FEDERATION',
      accent: 'border-slate-300'
    },
    {
      metric: 'Karanthur',
      label: 'Jamia Markaz Headquarters',
      description: 'Central Academic Secretariat operating under the governance of Jamia Markaz, Kozhikode, Kerala.',
      icon: Award,
      badge: '04 / SECRETARIAT',
      accent: 'border-[#2F7C7A]'
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24 border-b border-[#E2E8E0] relative overflow-hidden">
      <div className="misc-container relative z-10">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 gap-6 pb-6 border-b border-[#E2E8E0]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                THE MISC ECOSYSTEM
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Academic Excellence & Governance Scope
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#475569] max-w-md font-normal leading-relaxed">
            Four interconnected pillars forming the premier academic coordination body of Jamia Markaz across member campuses.
          </p>
        </div>

        {/* Asymmetric Editorial Ecosystem Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Featured Core Identity Block */}
          <div className="lg:col-span-5 bg-[#132238] text-white rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-md relative overflow-hidden group">
            {/* Background Texture Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#2F7C7A]/30 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#2F7C7A] text-white flex items-center justify-center shadow-2xs">
                  <GitFork className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#E6F2F1]">
                  UNIFIED ACADEMIC SYSTEM
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-white">
                A Synchronized Governance Network
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                MISC provides institutional synergy by linking central curriculum standards with board examinations, affiliated institutions, and Secretariat moderation under Jamia Markaz.
              </p>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-700/80 relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono text-[#E6F2F1]">Jamia Markaz • Karanthur</span>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-white hover:text-[#E6F2F1] transition-colors cursor-pointer"
              >
                <span>Discover System</span>
                <ArrowRight className="w-4 h-4 text-[#2F7C7A]" />
              </button>
            </div>
          </div>

          {/* Right Column: 4 Interconnected Relationship Cards (2x2 Asymmetric Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {highlights.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className={`bg-[#F7F8F5] hover:bg-white border ${item.accent} hover:border-[#2F7C7A] rounded-xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-sm group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E0]">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-[#2F7C7A] uppercase">
                        {item.badge}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="font-serif text-2xl font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                      {item.metric}
                    </div>

                    <h4 className="font-serif text-base font-bold text-[#132238] tracking-tight">
                      {item.label}
                    </h4>

                    <p className="text-xs text-[#475569] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default InstitutionalHighlightsSection;
