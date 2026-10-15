import React from 'react';
import { Target } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const MissionSection = () => {
  return (
    <section className="relative bg-[#F5FAFF] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#DCE8F3]">
      <div className="relative misc-container z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAF5FF] text-[#3182CE] flex items-center justify-center border border-[#DCE8F3]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#3182CE] uppercase tracking-wider block">
                MISSION FRAMEWORK
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#173B65]">
                Our Mission
              </h2>
            </div>
          </div>

          {/* Approved Mission Text */}
          <div className="rounded-2xl border border-[#DCE8F3] bg-white p-6 sm:p-8 shadow-xs">
            <p className="text-base sm:text-[17px] leading-relaxed text-[#243447]">
              {miscInfo.mission}
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0 m-0">
            {miscInfo.missionBullets.map((bullet, idx) => (
              <li
                key={idx}
                className="bg-white rounded-xl border border-[#DCE8F3] p-5 flex items-start space-x-3.5 shadow-2xs hover:border-[#3182CE]/40 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#173B65] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed">
                  {bullet}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
