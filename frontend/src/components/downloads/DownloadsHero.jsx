import React from 'react';

export const DownloadsHero = () => {
  return (
    <section className="relative bg-white text-[#172033] py-14 sm:py-18 border-b border-[#E5EAF0]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              RESOURCE CENTRE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172033] leading-tight">
            Resources & <br className="hidden sm:inline" />
            <span className="text-[#2563EB]">Academic Documents</span>
          </h1>

          <p className="text-[#4B5563] text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            Official Markaz Integrated Studies Council academic resources, institutional manuals, syllabus regulations, and public information circulars.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DownloadsHero;
