import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const AboutCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10 text-center max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <span className="w-8 h-[2px] bg-[#D4AF37]" />
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
            CONNECT WITH MISC
          </span>
          <span className="w-8 h-[2px] bg-[#D4AF37]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Discover Academic Programmes
        </h2>

        <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
          Explore our integrated academic streams, syllabus guidelines, and institutional coordination framework.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="miscBlue"
            size="lg"
            onClick={() => navigate('/academics')}
            className="group w-full sm:w-auto"
          >
            <span>EXPLORE ACADEMICS</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outlineLight"
            size="lg"
            onClick={() => navigate('/contact')}
            className="group w-full sm:w-auto"
          >
            <span>CONTACT SECRETARIAT</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
