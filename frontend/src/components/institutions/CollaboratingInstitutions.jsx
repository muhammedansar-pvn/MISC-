import React from 'react';
import { Building2, Bell } from 'lucide-react';
import { institutionsData } from '../../data/institutionsData';

export const CollaboratingInstitutions = () => {
  const collaboratingList = institutionsData.collaborating || institutionsData.affiliated || [];

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              ACADEMIC COLLABORATION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Institutions Working Through Academic Collaboration
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Institutions, colleges, and dars systems operating under unified MISC curriculum guidelines and academic evaluation.
          </p>
        </div>

        {collaboratingList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {collaboratingList.map((inst) => (
              <div
                key={inst.id}
                className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E2E8E0]/80 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                      {inst.category || "Collaborating Center"}
                    </span>
                    <span className="text-[10px] text-[#2F7C7A] font-semibold bg-[#E6F2F1] px-2 py-0.5 rounded uppercase border border-[#E2E8E0]">
                      COLLABORATING
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#132238] tracking-tight">
                    {inst.name}
                  </h3>
                  {inst.location && (
                    <p className="text-xs sm:text-sm text-slate-500">{inst.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F2F1] border border-[#2F7C7A]/40 flex items-center justify-center text-[#2F7C7A]">
              <Building2 className="w-6 h-6" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="inline-block bg-[#132238] text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                OFFICIAL DIRECTORY
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#132238]">
                Academic Collaboration Directory
              </h3>

              <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
                Details of institutions operating through academic collaboration will be published here by the MISC Secretariat.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2E8E0]/80 flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
              <Bell className="w-3.5 h-3.5 text-[#2F7C7A]" />
              <span>Markaz Integrated Studies Council Secretariat</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CollaboratingInstitutions;
