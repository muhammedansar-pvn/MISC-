'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Calendar, FileText, Scale } from 'lucide-react';

const officialResources = [
  {
    title: 'Sanaviyya Academic Prospectus 2026–27',
    category: 'Admissions & Curricula',
    description: 'Detailed course structures, eligibility criteria, admission guidelines, and collegiate code for all integrated levels.',
    path: '/downloads',
    icon: BookOpen,
    format: 'PDF · Official Gazette',
  },
  {
    title: 'Central Examination Regulations & Framework',
    category: 'Board Governance',
    description: 'Autonomous assessment directives, evaluation schemes, hall ticket protocols, and verification bylaws.',
    path: '/examination',
    icon: Scale,
    format: 'PDF · Board Directive',
  },
  {
    title: 'Annual Academic Calendar & Key Schedules',
    category: 'Schedules & Milestones',
    description: 'Synchronized term dates, assessment intervals, research convocations, and institutional holidays.',
    path: '/downloads',
    icon: Calendar,
    format: 'PDF · Secretariat Schedule',
  },
  {
    title: 'Collegiate Affiliation & Governance Statutes',
    category: 'Institutional Mandates',
    description: 'Criteria for collaborative institutions, faculty qualification standards, and central quality assurance mandates.',
    path: '/institutions',
    icon: FileText,
    format: 'PDF · Council Statute',
  },
];

export const ImportantResourcesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-misc-page py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="resources-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <ArrowDownToLine className="h-4 w-4" />
              <span>11 · Institutional Documents</span>
            </div>
            <h2 id="resources-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              Official Resources &amp; Downloads
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/downloads')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>All Downloads Archive</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Minimal Document/List Layout (Not 4 Large Generic Cards) */}
        <div className="rounded-2xl border border-misc-border bg-white divide-y divide-misc-border overflow-hidden shadow-2xs">
          {officialResources.map(({ title, category, description, path, icon: Icon, format }) => (
            <Link
              key={title}
              href={path}
              className="group flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-misc-page/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary group-hover:bg-misc-primary group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                      {category}
                    </span>
                    <span className="text-[10px] font-mono text-misc-muted">
                      · {format}
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-base sm:text-lg font-bold text-misc-text group-hover:text-misc-primary transition-colors">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-misc-secondary max-w-2xl line-clamp-1 sm:line-clamp-none">
                    {description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-misc-primary shrink-0 self-end sm:self-center">
                <span>Access File</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImportantResourcesSection;
