import React from 'react';

const institutionalAreas = [
  'Authentic Islamic Scholarship',
  'Academic Excellence',
  'Ethical Values & Character',
  'Critical Thinking',
  'Leadership & Social Responsibility',
];

export const InstitutionalLogoStrip = () => (
  <section className="border-y border-[#DCE8F3] bg-white py-6" aria-label="Markaz Sanaviyya Academy Academic Network">
    <div className="misc-container">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-6">
        <div className="flex shrink-0 items-center gap-3">
          <img src="/logo.png" alt="Markaz Sanaviyya Academy" className="h-10 w-auto object-contain" loading="lazy" />
          <div className="text-left">
            <span className="font-heading text-sm font-bold text-[#173B65] block leading-tight">Markaz Sanaviyya Academy</span>
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">Jamia Markaz · Karanthur</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
          {institutionalAreas.map((area) => (
            <span key={area} className="text-[11px] font-semibold text-[#64748B]">
              • {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default InstitutionalLogoStrip;