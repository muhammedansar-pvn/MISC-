'use client';

import React from 'react';

export const AcademicPillars = () => {
  const principles = [
    {
      number: '01',
      title: 'SCHOLARSHIP',
      description: 'Preserving classical Islamic sciences alongside rigorous contemporary academic disciplines.',
    },
    {
      number: '02',
      title: 'CHARACTER',
      description: 'Cultivating spiritual grounding, moral integrity, and deep social responsibility.',
    },
    {
      number: '03',
      title: 'EXCELLENCE',
      description: 'Maintaining uncompromising standards in curriculum design, faculty training, and examinations.',
    },
    {
      number: '04',
      title: 'LEADERSHIP',
      description: 'Preparing visionary thinkers capable of guiding institutions and communities into the future.',
    },
  ];

  return (
    <section className="relative bg-[#FFFFFF] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Asymmetric Composition: Left Large Vision Statement, Right Vertical Principles Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* LEFT: Very Large Italic Serif Vision Statement */}
          <div className="lg:col-span-6 lg:sticky lg:top-36 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm sm:text-base font-semibold text-[#2F7C7A] tracking-wider">
                02
              </span>
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
                VISION
              </span>
            </div>

            <blockquote className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] italic font-normal text-[#132238] leading-[1.18] tracking-tight">
              “To develop a generation of scholars and professionals who harmoniously combine Islamic values with contemporary knowledge.”
            </blockquote>

            <p className="text-sm sm:text-base text-[#667085] font-normal leading-relaxed pt-2 max-w-lg">
              The foundational guiding principle governing all affiliated colleges, academic streams, and educational research councils under Jamia Markaz.
            </p>
          </div>

          {/* RIGHT: Minimal Vertical Timeline / Principles — NO CARDS */}
          <div className="lg:col-span-6 space-y-0 divide-y divide-[rgba(19,34,56,0.12)] border-y border-[rgba(19,34,56,0.12)]">
            {principles.map((item) => (
              <div
                key={item.number}
                className="py-8 sm:py-10 group transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-widest shrink-0 sm:pt-1">
                    {item.number}
                  </span>

                  <div className="flex-1 sm:pl-8 space-y-2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#667085] font-normal leading-relaxed max-w-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default AcademicPillars;
