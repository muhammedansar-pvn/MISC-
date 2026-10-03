import React from 'react';
import Card from '../common/Card';
import { academicPillarsData } from '../../data/academicPillarsData';

export const AcademicPillarsSection = () => {
  return (
    <section className="relative bg-misc-page py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-misc-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
              MISSION COMMITMENTS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-misc-text tracking-tight leading-tight">
            The Eight Pillars of MISC
          </h2>

          <p className="text-base sm:text-lg text-misc-secondary font-normal leading-relaxed">
            Derived directly from the SRS, these pillars form the core mission commitments governing academic design, quality evaluation, and student development across all campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {academicPillarsData.map((pillar, idx) => (
            <Card
              key={pillar.id || idx}
              className="hover:border-misc-primary/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-misc-border pb-3">
                  <span className="font-serif text-sm font-bold text-misc-primary tracking-wider">
                    PILLAR {pillar.number}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-misc-primary" />
                </div>
                <h3 className="font-serif text-lg font-bold text-misc-text tracking-tight leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-misc-secondary font-normal leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AcademicPillarsSection;
