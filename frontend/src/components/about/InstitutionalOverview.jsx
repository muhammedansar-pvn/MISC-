'use client';

import React from 'react';
import { ShieldCheck, Compass } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';
import ScrollReveal from '../common/ScrollReveal';

export const InstitutionalOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* LEFT SIDE — EDITORIAL VISUAL CARD (Cols 1-6) */}
          <div className="lg:col-span-6 z-10">
            <ScrollReveal delay={150} yOffset={25}>
              <div className="relative rounded-lg overflow-hidden border border-misc-border shadow-md group">
                <div className="relative aspect-[4/3] bg-misc-navy overflow-hidden">
                  <img
                    src="/gate.jpg.jpeg"
                    alt="Jamia Markaz Gateway - Central Academic Governance Landmark"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/20 to-transparent flex items-end p-6">
                    <div className="text-white space-y-1">
                      <span className="font-serif text-xl font-bold text-white tracking-wide block drop-shadow-xs">
                        {miscInfo.fullName}
                      </span>
                      <span className="text-xs text-misc-dark-muted font-medium uppercase tracking-widest block">
                        ACADEMIC GOVERNANCE BODY
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="bg-misc-navy text-white border border-misc-primary/50 rounded px-3.5 py-2 shadow-lg flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-misc-primary" />
                    <span className="text-xs font-bold tracking-widest text-misc-dark-muted uppercase">
                      JAMIA MARKAZ
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT SIDE — CONTENT (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-misc-primary" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
                INSTITUTIONAL OVERVIEW
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-misc-text tracking-tight leading-tight">
              Standardized Curriculum & Academic Oversight
            </h2>

            <div className="space-y-4 text-misc-secondary text-[15.5px] sm:text-[17px] leading-relaxed font-normal">
              <p>
                The Markaz Integrated Studies Council operates as the premier academic council of Jamia Markaz, responsible for curriculum design, quality assurance, and examination moderation across member institutions.
              </p>
              <p className="text-[14.5px] sm:text-[15.5px] text-slate-500">
                The Council establishes unified syllabus regulations, conducts central board evaluations, and issues academic guidelines to maintain high standards of scholarship across direct campuses and collaborating centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-misc-border">
              <div className="bg-misc-page p-4 rounded border border-misc-border space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-misc-primary" />
                  <h4 className="font-serif text-base font-bold text-misc-text">
                    Academic Quality
                  </h4>
                </div>
                <p className="text-xs sm:text-[13.5px] text-misc-secondary leading-relaxed pl-6">
                  Standardized syllabus guidelines & board moderation
                </p>
              </div>

              <div className="bg-misc-page p-4 rounded border border-misc-border space-y-1">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-misc-primary" />
                  <h4 className="font-serif text-base font-bold text-misc-text">
                    Dual Integration
                  </h4>
                </div>
                <p className="text-xs sm:text-[13.5px] text-misc-secondary leading-relaxed pl-6">
                  Classical jurisprudence & university disciplines
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InstitutionalOverview;
