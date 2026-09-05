import React from 'react';

export const DownloadsHero = () => {
  return (
    <section className="relative bg-white text-[#132238] py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              RESOURCE CENTRE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#132238] leading-tight">
            Resources & <br className="hidden sm:inline" />
            <span className="text-[#2F7C7A]">Academic Documents</span>
          </h1>

          <p className="text-[#475569] text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            Official Markaz Integrated Studies Council academic resources, institutional manuals, syllabus regulations, and public information circulars.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DownloadsHero;
