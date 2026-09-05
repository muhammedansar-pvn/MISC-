import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, ShieldCheck, Layers, FileText, Calendar, Compass, ScrollText } from 'lucide-react';
import Button from '../common/Button';
import { academicCategories } from '../../data/academicsData';

const iconMap = {
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  ShieldCheck: ShieldCheck,
  Layers: Layers,
  FileText: FileText,
  Calendar: Calendar,
  Compass: Compass,
  ScrollText: ScrollText
};

export const AcademicProgrammes = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-24 border-b border-[#E5EAF0]">
      <div className="misc-container">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              EXPLORE ACADEMICS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            Integrated Streams & Board Curricula
          </h2>

          <p className="text-base text-[#4B5563]">
            Discover our comprehensive academic framework integrating classical Islamic scholarship, modern university streams, and standardized board curricula.
          </p>
        </div>

        {/* 5 SRS Academic Categories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {academicCategories.map((cat, idx) => {
            const IconComp = iconMap[cat.icon] || BookOpen;
            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate('/academics')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/academics');
                  }
                }}
                className="bg-white p-6 rounded-xl border border-[#E5EAF0] shadow-xs hover:border-[#3B82F6]/40 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                aria-label={`Explore ${cat.title}`}
              >
                <div className="space-y-4">
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                      STREAM 0{idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] text-[#2563EB] flex items-center justify-center border border-[#DCEEFF] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="font-serif text-xl font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">
                    {cat.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Affordance */}
                <div className="pt-4 mt-6 border-t border-[#E5EAF0] flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#2563EB] uppercase flex items-center space-x-1">
                    <span>EXPLORE STREAM</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom Action */}
        <div className="mt-12 text-center pt-8 border-t border-[#E5EAF0]">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/academics')}
            className="group shadow-sm"
          >
            <span>VIEW ALL ACADEMIC PROGRAMMES</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AcademicProgrammes;
