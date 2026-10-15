import React from 'react';

export const AcademicsHero = () => {
  return (
    <section className="relative bg-white text-[#243447] py-16 sm:py-20 border-b border-[#DCE8F3]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF5FF] border border-[#DCE8F3]">
            <span className="w-2 h-2 rounded-full bg-[#3182CE]" />
            <span className="text-xs font-semibold tracking-wider text-[#173B65] uppercase">
              ACADEMIC EXCELLENCE &amp; SCHOLARSHIP
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[#173B65] leading-tight">
            Academic Identity &amp; <br className="hidden sm:inline" />
            <span className="text-[#3182CE]">Educational Excellence</span>
          </h1>

          <p className="text-[#64748B] text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            Markaz Sanaviyya Academy harmonises traditional Islamic scholarship with modern academic excellence, ethical values, and leadership development under Jamia Markaz.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AcademicsHero;
