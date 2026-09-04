import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { academicPillarsData } from '../../data/academicPillarsData';

export const AcademicPillars = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              ACADEMIC FOUNDATION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Eight Pillars of MISC Education
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Derived from the official MISC mission framework, these eight core principles guide integrated curriculum design, board evaluation, and character development across all campuses.
          </p>
        </div>

        {/* 4x2 Grid of 8 Academic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {academicPillarsData.map((pillar, idx) => (
            <Card
              key={pillar.id || idx}
              className="hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Pillar Number Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-serif text-sm font-bold text-[#D4AF37] tracking-wider">
                    PILLAR {pillar.number}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                </div>

                {/* Pillar Title */}
                <h3 className="font-serif text-lg font-bold text-[#0B1D3A] tracking-tight leading-snug">
                  {pillar.title}
                </h3>

                {/* Pillar Description */}
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Section Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center pt-8 border-t border-slate-200">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/academics')}
            className="group"
          >
            <span>DISCOVER ACADEMIC FRAMEWORK</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AcademicPillars;
