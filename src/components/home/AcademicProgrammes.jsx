import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, ShieldCheck, Layers, FileText } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { academicCategories } from '../../data/academicsData';

const iconMap = {
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  ShieldCheck: ShieldCheck,
  Layers: Layers,
  FileText: FileText
};

export const AcademicProgrammes = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              ACADEMIC PROGRAMMES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Integrated Streams & Board Curricula
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Discover our comprehensive academic framework integrating classical Islamic scholarship, modern university streams, and standardized board curricula.
          </p>
        </div>

        {/* 5 SRS Academic Categories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {academicCategories.map((cat, idx) => {
            const IconComp = iconMap[cat.icon] || BookOpen;
            return (
              <Card
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
                className="hover:border-[#D4AF37]/60 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] focus:ring-offset-2 transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                aria-label={`Explore ${cat.title}`}
              >
                <div className="space-y-4">
                  {/* Category Badge & Icon */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      STREAM 0{idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center group-hover:bg-[#0B1D3A] group-hover:text-[#D4AF37] transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Category Title */}
                  <h3 className="font-serif text-xl font-bold text-[#0B1D3A] tracking-tight group-hover:text-[#145DA0] transition-colors">
                    {cat.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Affordance */}
                <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#145DA0] group-hover:text-[#D4AF37] uppercase transition-colors flex items-center space-x-1">
                    <span>EXPLORE STREAM</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Section Bottom Action */}
        <div className="mt-12 sm:mt-16 text-center pt-8 border-t border-slate-200">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/academics')}
            className="group"
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
