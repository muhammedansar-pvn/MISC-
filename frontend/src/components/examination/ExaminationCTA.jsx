import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const ExaminationCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#132238] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#2F7C7A]/20">
      <div className="relative misc-container z-10 text-center max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <span className="w-8 h-[2px] bg-[#2F7C7A]" />
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#E6F2F1] uppercase">
            EXAMINATION ENQUIRIES
          </span>
          <span className="w-8 h-[2px] bg-[#2F7C7A]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          Questions About Board Assessment?
        </h2>

        <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
          For enquiries regarding examination schedules, center regulations, or academic records, connect with the Examination Secretariat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="miscBlue"
            size="lg"
            onClick={() => navigate('/contact')}
            className="group w-full sm:w-auto"
          >
            <span>CONTACT SECRETARIAT</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <Button
            variant="outlineLight"
            size="lg"
            onClick={() => navigate('/downloads')}
            className="group w-full sm:w-auto"
          >
            <span>VIEW DOWNLOADS</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExaminationCTA;
