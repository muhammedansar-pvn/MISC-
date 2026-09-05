import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import Button from '../common/Button';
import { academicPillarsData } from '../../data/academicPillarsData';

export const AcademicPillars = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 border-b border-[#E5EAF0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              VISION & MISSION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            Academic Framework & Institutional Pillars
          </h2>
          <p className="text-base text-[#4B5563]">
            Eight core principles guiding integrated curriculum design, board evaluation, and character development.
          </p>
        </div>

        {/* 2-Column Layout: Left Vision Blockquote, Right 8 Numbered Mission Points */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: VISION STATEMENT BLOCKQUOTE */}
          <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E5EAF0] rounded-xl p-8 shadow-xs space-y-6 lg:sticky lg:top-24">
            <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#2563EB] flex items-center justify-center border border-[#DCEEFF]">
              <Quote className="w-5 h-5" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                OUR VISION
              </span>
              <blockquote className="font-serif text-xl sm:text-2xl font-semibold text-[#172033] leading-snug">
                "To synthesize authentic Islamic jurisprudence with contemporary academic disciplines, producing scholars who lead society with wisdom, integrity, and intellectual rigor."
              </blockquote>
            </div>

            <p className="text-sm text-[#6B7280] leading-relaxed border-t border-[#E5EAF0] pt-4">
              Under the auspices of Jamia Markaz, MISC establishes a standardized national model for integrated Islamic higher education.
            </p>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/about')}
              className="w-full justify-between group mt-2"
            >
              <span>EXPLORE FULL MISSION</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* RIGHT: 8 NUMBERED MISSION ITEMS (01-08) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {academicPillarsData.map((pillar) => (
              <div
                key={pillar.id || pillar.number}
                className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E5EAF0] hover:border-[#3B82F6]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-2.5">
                    <span className="font-serif text-sm font-bold text-[#2563EB] tracking-wider">
                      {String(pillar.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280]">
                      PILLAR
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#172033]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default AcademicPillars;
