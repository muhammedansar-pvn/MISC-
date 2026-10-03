'use client';

import React from 'react';
import { Landmark, Bell } from 'lucide-react';
import { institutionsData } from '../../data/institutionsData';
import ScrollReveal from '../common/ScrollReveal';

export const DirectInstitutions = () => {
  const ownList = institutionsData.own || [];

  return (
    <section className="relative bg-misc-page py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[2px] bg-misc-primary" />
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
                  DIRECT INSTITUTIONS
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-misc-text tracking-tight leading-tight">
                Institutions Under Jamia Markaz
              </h2>

              <p className="text-[15.5px] sm:text-[17px] text-misc-secondary font-normal leading-relaxed">
                Campus institutions and dars systems functioning directly under the central management and academic oversight of Jamia Markaz.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-misc-border shadow-md bg-white p-2 group">
                <div className="overflow-hidden rounded-lg">
                  <img
                    src="/campus.png"
                    alt="Markaz Shari'yya Academy Campus Building"
                    className="w-full h-60 sm:h-64 object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pt-2 px-1 pb-0.5 flex items-center justify-between text-xs text-misc-secondary">
                  <span className="font-serif font-bold text-misc-text">Markaz Shari'yya Academy</span>
                  <span className="text-[10px] uppercase font-bold text-misc-primary bg-misc-soft-blue px-2 py-0.5 rounded border border-misc-border">
                    FLAGSHIP CAMPUS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {ownList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {ownList.map((inst) => (
              <div
                key={inst.id}
                className="bg-white rounded-md border border-misc-border p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-misc-primary/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-misc-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-misc-primary">
                      {inst.category || "Direct Campus"}
                    </span>
                    <span className="text-[10px] text-misc-text font-semibold bg-slate-100 px-2 py-0.5 rounded uppercase">
                      DIRECT
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-misc-text tracking-tight">
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
          <div className="bg-white rounded-md border border-misc-border p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-full bg-misc-soft-blue border border-misc-primary/40 flex items-center justify-center text-misc-primary">
              <Landmark className="w-6 h-6" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="inline-block bg-misc-navy text-misc-dark-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                OFFICIAL DIRECTORY
              </span>

              <h3 className="font-serif text-2xl font-bold text-misc-text">
                Direct Campus Directory
              </h3>

              <p className="text-xs sm:text-sm text-misc-secondary font-normal leading-relaxed">
                Official details of institutions and dars systems functioning directly under Jamia Markaz will be published here by the MISC Secretariat.
              </p>
            </div>

            <div className="pt-4 border-t border-misc-border flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
              <Bell className="w-3.5 h-3.5 text-misc-primary" />
              <span>Markaz Integrated Studies Council Secretariat</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DirectInstitutions;
