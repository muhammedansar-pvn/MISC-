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
    <section className="relative bg-[#F8FAFC] py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              OUR INSTITUTIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            An Integrated Network of Institutions
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            MISC oversees and coordinates campus institutions and educational systems functioning directly under Jamia Markaz as well as through academic collaboration.
          </p>
        </div>

        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">

          {/* LEFT SIDE — CONCEPTUAL NETWORK COMPOSITION (Cols 1-5) */}
          <div className="lg:col-span-5 bg-[#0B1D3A] text-white rounded-md p-8 sm:p-10 border border-[#D4AF37]/30 shadow-md relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10 space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 px-3 py-1 rounded text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                <Network className="w-3.5 h-3.5" />
                <span>ACADEMIC COORDINATION NETWORK</span>
              </div>

              {/* Conceptual Node Tree Diagram */}
              <div className="pt-4 space-y-6">
                {/* Central Root Node */}
                <div className="bg-[#145DA0] border border-[#D4AF37]/50 rounded p-4 text-center shadow-xs">
                  <span className="font-serif font-bold text-base tracking-wide text-white block">
                    MISC ACADEMIC COUNCIL
                  </span>
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-semibold block mt-0.5">
                    Central Board
                  </span>
                </div>

                {/* Connecting Lines */}
                <div className="flex items-center justify-center space-x-12 relative my-2">
                  <div className="w-px h-6 bg-[#D4AF37]/50" />
                </div>

                {/* Child Nodes */}
                <div className="grid grid-cols-2 gap-4 text-center text-xs font-semibold">
                  <div className="bg-slate-900/80 border border-slate-700 p-3 rounded text-slate-200">
                    <span className="text-[#D4AF37] block font-serif font-bold">DIRECT</span>
                    <span>Institutions</span>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-700 p-3 rounded text-slate-200">
                    <span className="text-[#D4AF37] block font-serif font-bold">COLLABORATING</span>
                    <span>Institutions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtext */}
            <p className="relative z-10 text-xs text-slate-400 font-normal leading-relaxed pt-8 mt-6 border-t border-white/10">
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
                  className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:ring-offset-2 transition-all duration-200 group cursor-pointer flex flex-col justify-between flex-1"
                  aria-label={`Explore ${cat.title}`}
                >
                  <div className="space-y-4">
                    {/* Top Bar: Category Number & Icon */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-serif text-sm font-bold text-[#D4AF37] tracking-wider">
                          {cat.number}
                        </span>
                        <span className="w-6 h-[1.5px] bg-[#D4AF37] group-hover:w-10 transition-all duration-300" />
                      </div>
                      <div className="w-8 h-8 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center group-hover:bg-[#0B1D3A] group-hover:text-[#D4AF37] transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-serif text-xl font-bold text-[#0B1D3A] tracking-tight group-hover:text-[#145DA0] transition-colors">
                      {cat.title}
                    </h3>

                    {/* Category Description */}
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Footer Affordance */}
                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-[#145DA0] group-hover:text-[#D4AF37] uppercase transition-colors flex items-center space-x-1.5">
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
        <div className="mt-12 sm:mt-16 text-center pt-8 border-t border-slate-200">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/institutions')}
            className="group"
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
