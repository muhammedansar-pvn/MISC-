'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowUpRight, CalendarDays, ClipboardCheck, FileCheck2, Scale } from 'lucide-react';

const standards = [
  {
    title: 'Examination',
    subtitle: 'Central Board Evaluation & Schedules',
    description: 'Standardized assessment guidelines, center registrations, and evaluation board directives.',
    path: '/examination',
    icon: ClipboardCheck,
  },
  {
    title: 'Results',
    subtitle: 'Official Board Verification',
    description: 'Centralized marks evaluation, institutional performance analytics, and authenticated transcripts.',
    path: '/examination',
    icon: FileCheck2,
  },
  {
    title: 'Regulations',
    subtitle: 'Academic By-laws & Governance',
    description: 'Council statutes, institutional affiliation criteria, faculty mandates, and code of conduct.',
    path: '/downloads',
    icon: Scale,
  },
  {
    title: 'Academic Calendar',
    subtitle: 'Yearly Schedule & Timeline',
    description: 'Synchronized term dates, assessment intervals, research symposiums, and convocations.',
    path: '/downloads',
    icon: CalendarDays,
  },
];

export const ImportantResourcesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-white py-16 text-misc-text sm:py-20 lg:py-24">
      <div className="misc-container">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">Board governance</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-misc-text sm:text-4xl">
            Academic standards and resources
          </h2>
          <p className="mt-3 text-sm leading-6 text-misc-muted sm:text-[15px]">
            Centralized academic governance, board assessments, official institutional statutes, and yearly schedules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {standards.map(({ title, subtitle, description, path, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(path)}
              className="group flex min-h-44 flex-col rounded-xl border border-misc-border bg-misc-page p-5 text-left transition-all hover:border-misc-primary/30 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary sm:p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-4 flex items-center justify-between gap-2 font-serif text-lg font-semibold text-misc-text">
                {title}
                <ArrowUpRight className="h-4 w-4 shrink-0 text-misc-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-misc-muted">{subtitle}</span>
              <span className="mt-2 text-xs leading-5 text-misc-muted">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportantResourcesSection;
