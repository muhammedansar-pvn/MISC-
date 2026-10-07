'use client';

import React from 'react';

const principles = [
  {
    number: '01',
    title: 'Scholarship',
    arabic: 'العلم والتحقيق',
    description: 'Preserving classical Islamic sciences alongside rigorous contemporary academic disciplines and research methodologies.',
  },
  {
    number: '02',
    title: 'Character',
    arabic: 'الأخلاق والتزكية',
    description: 'Cultivating spiritual grounding, moral integrity, ethical consciousness, and deep social dedication to the community.',
  },
  {
    number: '03',
    title: 'Excellence',
    arabic: 'الإتقان والجودة',
    description: 'Maintaining uncompromising standards in curriculum formulation, faculty enablement, and centralized evaluation.',
  },
  {
    number: '04',
    title: 'Leadership',
    arabic: 'القيادة والخدمة',
    description: 'Preparing visionary thinkers and educators capable of guiding institutions and society into a dynamic future.',
  },
];

export const AcademicPillars = () => (
  <section className="border-b border-misc-border bg-misc-page py-14 sm:py-18 lg:py-20 text-misc-text">
    <div className="misc-container">
      {/* Editorial Vision Mandate Banner */}
      <div className="mb-12 rounded-xl border border-misc-border/80 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              02 · Academic Philosophy &amp; Vision
            </span>
            <blockquote className="mt-2 font-serif text-xl sm:text-2xl font-medium leading-snug text-misc-text">
              &ldquo;To develop a generation of scholars and professionals who harmoniously combine Islamic values with contemporary knowledge.&rdquo;
            </blockquote>
          </div>
          <div className="shrink-0 lg:text-right border-t lg:border-t-0 lg:border-l border-misc-border pt-4 lg:pt-0 lg:pl-6">
            <span className="block text-xs font-bold uppercase tracking-wider text-misc-primary">
              Jamia Markaz Mandate
            </span>
            <span className="text-[11px] text-misc-muted">
              Founding Academic Principle
            </span>
          </div>
        </div>
      </div>

      {/* 4 Pillars: Open Editorial Typography Strip (Not Boxy Cards) */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-misc-border">
        {principles.map((item) => (
          <div key={item.number} className="space-y-3 lg:px-6 first:lg:pl-0 last:lg:pr-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-misc-primary">
                {item.number}
              </span>
              <span className="font-serif text-xs text-misc-muted">
                {item.arabic}
              </span>
            </div>

            <h3 className="font-serif text-2xl font-medium tracking-tight text-misc-text">
              {item.title}
            </h3>

            <p className="text-xs sm:text-sm leading-relaxed text-misc-secondary">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AcademicPillars;
