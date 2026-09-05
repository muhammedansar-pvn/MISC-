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
    <section className="relative bg-[#F7F8F5] py-16 sm:py-24 border-b border-[#E2E8E0]">
      <div className="misc-container">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              EXPLORE ACADEMICS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238] tracking-tight leading-tight">
            Integrated Streams & Board Curricula
          </h2>

          <p className="text-base text-[#475569]">
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
                className="bg-white p-6 rounded-xl border border-[#E2E8E0] shadow-xs hover:border-[#2F7C7A]/40 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                aria-label={`Explore ${cat.title}`}
              >
                <div className="space-y-4">
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F7C7A]">
                      STREAM 0{idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0] group-hover:bg-[#2F7C7A] group-hover:text-white transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="font-serif text-xl font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                    {cat.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Affordance */}
                <div className="pt-4 mt-6 border-t border-[#E2E8E0] flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#2F7C7A] uppercase flex items-center space-x-1">
                    <span>EXPLORE STREAM</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom Action */}
        <div className="mt-12 text-center pt-8 border-t border-[#E2E8E0]">
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
