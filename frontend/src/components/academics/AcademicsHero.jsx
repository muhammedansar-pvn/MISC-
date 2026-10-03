import React from 'react';

export const AcademicsHero = () => {
  return (
    <section className="relative bg-white text-misc-text py-14 sm:py-18 border-b border-misc-border">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-misc-soft-blue border border-misc-border">
            <span className="w-2 h-2 rounded-full bg-misc-primary" />
            <span className="text-xs font-semibold tracking-wider text-misc-primary uppercase">
              ACADEMIC FRAMEWORK
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-misc-text leading-tight">
            Integrated Streams & <br className="hidden sm:inline" />
            <span className="text-misc-primary">Academic Excellence</span>
          </h1>

          <p className="text-misc-secondary text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            A comprehensive academic framework integrating classical Islamic scholarship, contemporary university education, vocational skill development, and character formation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AcademicsHero;
