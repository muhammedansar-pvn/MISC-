import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Landmark, ArrowRight, Network } from 'lucide-react';
import Button from '../common/Button';
import { institutionTabs } from '../../data/institutionsData';

export const InstitutionsOverview = () => {
  const navigate = useNavigate();

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  const categories = [
    {
      number: "01",
      id: "own",
      title: institutionTabs[0]?.label || "Direct Institutions",
      description: "Institutions and educational systems operating directly under the central administrative and academic management of Jamia Markaz.",
      icon: Landmark
    },
    {
      number: "02",
      id: "collaborating",
      title: institutionTabs[1]?.label || "Academic Collaboration",
      description: "Collaborative colleges, institutes, and dars systems functioning under the unified MISC academic coordination and evaluation framework.",
      icon: Building2
    }
  ];

  return (
    <section className="relative bg-white py-16 sm:py-24 border-b border-[#E5EAF0]">
      <div className="misc-container">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              INSTITUTION NETWORK
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            An Integrated Network of Institutions
          </h2>

          <p className="text-base text-[#4B5563]">
            MISC oversees and coordinates campus institutions and educational systems functioning directly under Jamia Markaz as well as through academic collaboration.
          </p>
        </div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* LEFT SIDE — CONCEPTUAL NETWORK COMPOSITION (Cols 1-5) */}
          <div className="lg:col-span-5 bg-[#F8FAFC] text-[#172033] rounded-xl p-8 border border-[#E5EAF0] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#EAF4FF] border border-[#DCEEFF] px-3 py-1 rounded-full text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                <Network className="w-3.5 h-3.5" />
                <span>ACADEMIC COORDINATION NETWORK</span>
              </div>

              {/* Conceptual Node Tree Diagram */}
              <div className="pt-4 space-y-5">
                {/* Central Root Node */}
                <div className="bg-[#2563EB] text-white rounded-lg p-4 text-center shadow-xs">
                  <span className="font-serif font-bold text-base tracking-wide block">
                    MISC ACADEMIC COUNCIL
                  </span>
                  <span className="text-[10px] text-white/80 uppercase tracking-widest font-semibold block mt-0.5">
                    Jamia Markaz Central Secretariat
                  </span>
                </div>

                {/* Connecting Lines */}
                <div className="flex items-center justify-center space-x-12 relative my-2">
                  <div className="w-px h-6 bg-[#3B82F6]" />
                </div>

                {/* Child Nodes */}
                <div className="grid grid-cols-2 gap-4 text-center text-xs font-semibold">
                  <div className="bg-white border border-[#E5EAF0] p-3 rounded-lg text-[#172033]">
                    <span className="text-[#2563EB] block font-serif font-bold">DIRECT</span>
                    <span className="text-[#6B7280]">Campus Systems</span>
                  </div>
                  <div className="bg-white border border-[#E5EAF0] p-3 rounded-lg text-[#172033]">
                    <span className="text-[#2563EB] block font-serif font-bold">COLLABORATING</span>
                    <span className="text-[#6B7280]">Partner Centers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtext */}
            <p className="relative z-10 text-xs text-[#6B7280] font-normal leading-relaxed pt-6 mt-6 border-t border-[#E5EAF0]">
              Standardized examination, curriculum guidelines, and quality assurance across all member centers.
            </p>
          </div>

          {/* RIGHT SIDE — TWO INSTITUTIONAL CATEGORIES (Cols 6-12) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate('/institutions')}
                  onKeyDown={(e) => handleKeyDown(e, '/institutions')}
                  className="bg-[#F8FAFC] rounded-xl border border-[#E5EAF0] p-6 sm:p-8 shadow-xs hover:border-[#3B82F6]/40 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all duration-200 group cursor-pointer flex flex-col justify-between flex-1"
                  aria-label={`Explore ${cat.title}`}
                >
                  <div className="space-y-4">
                    {/* Top Bar: Category Number & Icon */}
                    <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-serif text-sm font-bold text-[#2563EB] tracking-wider">
                          {cat.number}
                        </span>
                        <span className="w-6 h-[1.5px] bg-[#2563EB] group-hover:w-10 transition-all duration-300" />
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] text-[#2563EB] flex items-center justify-center border border-[#DCEEFF] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-serif text-xl font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">
                      {cat.title}
                    </h3>

                    {/* Category Description */}
                    <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Footer Affordance */}
                  <div className="pt-4 mt-6 border-t border-[#E5EAF0] flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#2563EB] uppercase flex items-center space-x-1.5">
                      <span>EXPLORE {cat.title.toUpperCase()}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Section Bottom CTA */}
        <div className="mt-12 text-center pt-8 border-t border-[#E5EAF0]">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/institutions')}
            className="group shadow-sm"
          >
            <span>VIEW ALL INSTITUTIONS</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstitutionsOverview;
