import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const MissionSection = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider block">
                MISSION FRAMEWORK
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
                Our Mission Commitments
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {miscInfo.missionBullets.map((bullet, idx) => (
              <div
                key={idx}
                className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-6 flex items-start space-x-4 shadow-2xs"
              >
                <CheckCircle2 className="w-5 h-5 text-[#2F7C7A] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
