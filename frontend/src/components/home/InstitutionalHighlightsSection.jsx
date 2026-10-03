'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowUpRight, Building2, BookOpen, UsersRound, GraduationCap, ClipboardCheck, FileCheck2 } from 'lucide-react';

const ecosystemItems = [
  {
    title: 'Institutions',
    description: 'Network of 50+ affiliated collegiate institutions and campus centers across states.',
    path: '/institutions',
    icon: Building2,
  },
  {
    title: 'Programmes',
    description: 'Secondary, Higher Secondary, and Alim integrated curricula accredited with degrees.',
    path: '/academics',
    icon: BookOpen,
  },
  {
    title: 'Faculty',
    description: 'Central pedagogical standards, continuous faculty empowerment, and scholar mentorship.',
    path: '/about',
    icon: UsersRound,
  },
  {
    title: 'Students',
    description: 'Over 10,000 enrolled scholars receiving holistic religious and contemporary education.',
    path: '/academics',
    icon: GraduationCap,
  },
  {
    title: 'Examination',
    description: 'Independent central examination board managing unified evaluation and schedules.',
    path: '/examination',
    icon: ClipboardCheck,
  },
  {
    title: 'Results',
    description: 'Centralized board verification, authentic transcript issuance, and student records.',
    path: '/examination',
    icon: FileCheck2,
  },
];

export const InstitutionalHighlightsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-misc-page py-16 sm:py-20 lg:py-24">
      <div className="misc-container">
        <div className="mb-8 max-w-2xl sm:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">The MISC framework</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-misc-text sm:text-4xl">
            An Academic Ecosystem
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-misc-muted sm:text-[15px]">
            Connecting institutions, programmes, scholars and learners through a unified academic framework.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ecosystemItems.map(({ title, description, path, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate(path)}
              className="group flex min-h-28 items-start gap-4 rounded-xl border border-misc-border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-misc-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary sm:p-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 font-serif text-lg font-semibold text-misc-text sm:text-xl">
                  {title}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-misc-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="mt-1.5 block text-xs leading-5 text-misc-muted sm:text-sm">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstitutionalHighlightsSection;
