import React from 'react';
import { Eye } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const VisionSection = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="bg-white rounded-lg p-8 sm:p-12 border border-[#E2E8E0] shadow-xs max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider block">
                INSTITUTIONAL VISION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
                Our Vision
              </h2>
            </div>
          </div>

          <p className="text-base sm:text-xl text-[#475569] font-serif leading-relaxed italic border-l-4 border-[#2F7C7A] pl-6 py-2">
            "{miscInfo.vision}"
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
