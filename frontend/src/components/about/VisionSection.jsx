import React from 'react';
import { Eye } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const VisionSection = () => {
  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="bg-white rounded-lg p-8 sm:p-12 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                INSTITUTIONAL VISION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B1D3A]">
                Our Vision
              </h2>
            </div>
          </div>

          <p className="text-base sm:text-xl text-slate-700 font-serif leading-relaxed italic border-l-4 border-[#D4AF37] pl-6 py-2">
            "{miscInfo.vision}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
