'use client';

import React from 'react';

const principles = [
  {
    number: '01',
    title: 'Scholarship',
    description: 'Preserving classical Islamic sciences alongside rigorous contemporary academic disciplines.',
  },
  {
    number: '02',
    title: 'Character',
    description: 'Cultivating spiritual grounding, moral integrity, and deep social responsibility.',
  },
  {
    number: '03',
    title: 'Excellence',
    description: 'Maintaining uncompromising standards in curriculum design, faculty training, and examinations.',
  },
  {
    number: '04',
    title: 'Leadership',
    description: 'Preparing visionary thinkers capable of guiding institutions and communities into the future.',
  },
];

export const AcademicPillars = () => (
  <section className="border-b border-misc-border bg-white py-16 sm:py-20 lg:py-24">
    <div className="misc-container">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">Our academic vision</p>
          <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-misc-text sm:text-4xl">
            To develop a generation of scholars and professionals who harmoniously combine Islamic values with contemporary knowledge.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-misc-muted sm:text-[15px] sm:leading-7">
            The foundational guiding principle governing all affiliated colleges, academic streams, and educational research councils under Jamia Markaz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-7">
          {principles.map((item) => (
            <article key={item.number} className="border-t border-misc-border py-5 sm:py-6">
              <div className="flex items-start gap-4">
                <span className="pt-1 text-[11px] font-semibold tracking-wide text-misc-primary">{item.number}</span>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-misc-text sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-misc-muted">{item.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AcademicPillars;
