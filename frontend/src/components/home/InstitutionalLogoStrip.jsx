import React from 'react';

const institutionalAreas = [
  'Affiliated Institutions',
  'Academic Centres',
  'Academic Programmes',
  'Examination Board',
  'Library & Publications',
];

export const InstitutionalLogoStrip = () => (
  <section className="border-y border-misc-border bg-white py-5 sm:py-6" aria-label="Jamia Markaz academic network">
    <div className="misc-container">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-6">
        <div className="flex shrink-0 items-center gap-3">
          <img src="/logo.png" alt="Markaz" className="h-10 w-10 object-contain" loading="lazy" />
          <span className="font-serif text-base font-semibold text-misc-text">Jamia Markaz</span>
        </div>
        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-center sm:w-auto sm:grid-cols-3 lg:flex lg:items-center lg:gap-6">
          {institutionalAreas.map((area) => (
            <span key={area} className="text-[9px] font-semibold uppercase tracking-[0.08em] text-misc-muted sm:text-[10px]">
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default InstitutionalLogoStrip;