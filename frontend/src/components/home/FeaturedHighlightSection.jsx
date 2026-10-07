'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Bell, Calendar, ChevronRight, FileText, Sparkles } from 'lucide-react';

const supportingDispatches = [
  {
    tag: 'Admissions 2026',
    date: 'March 2026',
    title: 'Integrated Secondary & Higher Secondary Application Window Announced',
    description: 'Admissions open across all 50+ affiliated institutions for the upcoming academic session with combined Islamic and university studies.',
    path: '/contact',
    icon: Calendar,
  },
  {
    tag: 'Academic Directive',
    date: 'February 2026',
    title: 'Secretariat Harmonizes Language & Research Curricula for Muthawwal Stream',
    description: 'Modernized modules in Arabic literature, English rhetoric, and structured thesis methodology integrated into standard syllabi.',
    path: '/academics',
    icon: FileText,
  },
  {
    tag: 'Examination Board',
    date: 'January 2026',
    title: 'Unified Term-End Examination Guidelines & Verification Protocol Released',
    description: 'Autonomous central evaluation board issues instructions for institutional centers and hall ticket distribution.',
    path: '/examination',
    icon: Bell,
  },
];

export const FeaturedHighlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-misc-page py-12 sm:py-16 lg:py-20" aria-label="Institutional Highlights">
      <div className="misc-container">
        {/* Editorial Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end sm:mb-10">
          <div>
            <div className="flex items-center gap-2 text-misc-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Institutional Spotlight</span>
            </div>
            <h2 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-misc-text sm:text-3xl lg:text-4xl">
              Academic Dispatches &amp; Featured Gazettes
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-misc-secondary">
            Continuous academic developments, central secretariat directives, and institutional milestones from Jamia Markaz.
          </p>
        </div>

        {/* Editorial Composition: Large Feature + Supporting Rail */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* Main Editorial Feature */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-misc-border bg-white shadow-sm transition-all hover:border-misc-primary/40 hover:shadow-md">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src="/Diwan.webp"
                  alt="Diwan architecture at Jamia Markaz"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/30 to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-misc-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  <span>Apex Council Dispatch</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-misc-muted">
                  <span className="text-misc-primary">ACADEMIC SESSION 2026–27</span>
                  <span>·</span>
                  <span>CENTRAL SECRETARIAT</span>
                </div>

                <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors sm:text-3xl">
                  Central Academic Council Ratifies Unified Assessment Framework &amp; Revised Syllabi
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-misc-secondary line-clamp-3">
                  Jamia Markaz&apos;s governing academic council has formally ratified the standardized evaluation criteria across all affiliated colleges, synchronizing the dual-track theological and contemporary higher secondary curriculum with state-of-the-art pedagogical benchmarks.
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-misc-border/60">
                  <button
                    type="button"
                    onClick={() => navigate('/examination')}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-misc-primary transition-colors hover:text-misc-primary-dark"
                  >
                    <span>Read Full Gazette</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[11px] text-misc-muted">Document Ref: MISC-SEC-2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting News Rail */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {supportingDispatches.map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className="group flex flex-1 flex-col justify-between rounded-xl border border-misc-border bg-white p-5 text-left transition-all hover:border-misc-primary/30 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-misc-muted">
                    <span className="rounded-sm bg-misc-soft-blue px-2 py-0.5 text-misc-primary font-bold">{item.tag}</span>
                    <span>{item.date}</span>
                  </div>
                  <h4 className="mt-2.5 font-serif text-lg font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-misc-secondary line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-misc-primary pt-3 border-t border-misc-border/40">
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHighlightSection;
