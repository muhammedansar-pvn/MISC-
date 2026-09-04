import React from 'react';
import { Landmark, Bell } from 'lucide-react';
import { institutionsData } from '../../data/institutionsData';

export const DirectInstitutions = () => {
  const ownList = institutionsData.own || [];

  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              DIRECT INSTITUTIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Institutions Under Jamia Markaz
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Campus institutions and dars systems functioning directly under the central management and academic oversight of Jamia Markaz.
          </p>
        </div>

        {ownList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {ownList.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                      {inst.category || "Direct Campus"}
                    </span>
                    <span className="text-[10px] text-[#0B1D3A] font-semibold bg-slate-100 px-2 py-0.5 rounded uppercase">
                      DIRECT
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0B1D3A] tracking-tight">
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
          <div className="bg-white rounded-md border border-slate-200 p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#0B1D3A]/5 border border-[#D4AF37]/40 flex items-center justify-center text-[#145DA0]">
              <Landmark className="w-6 h-6" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="inline-block bg-[#0B1D3A] text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                OFFICIAL DIRECTORY
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#0B1D3A]">
                Direct Campus Directory
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Official details of institutions and dars systems functioning directly under Jamia Markaz will be published here by the MISC Secretariat.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
              <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Markaz Integrated Studies Council Secretariat</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DirectInstitutions;
