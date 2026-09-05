import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const ExaminationHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white text-[#132238] py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              EXAMINATION BOARD
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#132238] leading-tight">
            Centralized Examination & <br className="hidden sm:inline" />
            <span className="text-[#2F7C7A]">Academic Assessment</span>
          </h1>

          <p className="text-[#475569] text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            MISC provides a structured examination framework supporting academic assessment, standardized grading, and centralized evaluation across its educational network.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('examination-framework');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group shadow-sm"
            >
              <span>EXAMINATION GUIDANCE</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
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
