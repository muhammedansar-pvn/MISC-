import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const ExaminationHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              EXAMINATION
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Centralized Examination & <br className="hidden sm:inline" />
            <span className="text-[#D4AF37]">Academic Assessment</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl">
            MISC provides a structured examination framework supporting academic assessment, standardized grading, and centralized evaluation across its educational network.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Button
              variant="miscBlue"
              size="lg"
              onClick={() => {
                const el = document.getElementById('examination-framework');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group"
            >
              <span>EXAMINATION GUIDANCE</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outlineLight"
              size="lg"
              onClick={() => navigate('/contact')}
            >
              CONTACT MISC
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExaminationHero;
