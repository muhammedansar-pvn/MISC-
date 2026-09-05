import React from 'react';
import { Landmark, Building2, CheckCircle2 } from 'lucide-react';

export const InstitutionalCoordination = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              COORDINATION ROLE
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238]">
            Institutional Network & Governance
          </h2>
          <p className="text-base text-[#475569] leading-relaxed font-normal">
            MISC oversees both direct campus institutions functioning under Jamia Markaz and collaborating educational centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <Landmark className="w-6 h-6 text-[#2F7C7A]" />
              <h3 className="font-serif text-xl font-bold text-[#132238]">
                Direct Institutions
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
              Campus institutions and dars systems operating directly under the administrative and academic oversight of Jamia Markaz.
            </p>
          </div>

          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-6 h-6 text-[#2F7C7A]" />
              <h3 className="font-serif text-xl font-bold text-[#132238]">
                Academic Collaboration
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
              Collaborating colleges and centers functioning under unified MISC curriculum guidelines and board evaluation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionalCoordination;
