import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck, Layers, FileText } from 'lucide-react';
import Card from '../common/Card';
import { academicCategories } from '../../data/academicsData';

const iconMap = {
  BookOpen: BookOpen,
  GraduationCap: GraduationCap,
  ShieldCheck: ShieldCheck,
  Layers: Layers,
  FileText: FileText
};

export const AcademicInformationHub = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              PROGRAMME STREAMS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Academic Information Hub
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Detailed breakdown of the five major academic streams offered across MISC direct campuses and collaborating centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {academicCategories.map((cat, idx) => {
            const IconComp = iconMap[cat.icon] || BookOpen;
            return (
              <Card
                key={cat.id}
                className="hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      STREAM 0{idx + 1}
                    </span>
                    <div className="w-9 h-9 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#0B1D3A] tracking-tight">
                    {cat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AcademicInformationHub;
