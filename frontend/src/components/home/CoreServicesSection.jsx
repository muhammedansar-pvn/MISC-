'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Clock, GraduationCap, ArrowUpRight } from 'lucide-react';

const flagshipProgramme = {
  title: 'Sanaviyya Secondary & Higher Secondary',
  category: 'Integrated Foundational Stream',
  duration: '5 Years Continuous',
  eligibility: 'Post-Primary Students',
  description: 'The core integrated model of Jamia Markaz: a synchronized 5-year curriculum combining classical Islamic sciences (Hadith, Fiqh, Quranic Arabic) with state-accredited Secondary (SSLC) and Higher Secondary (+2) education.',
  image: '/MKZ01377.webp',
  path: '/academics',
};

const collegiateProgrammes = [
  {
    title: 'Muthawwal Programme',
    category: 'Advanced Classical & Degree Stream',
    duration: '3 Years Full-Time',
    eligibility: 'Higher Secondary / Sanaviyya Graduates',
    description: 'Advanced mastery in Islamic jurisprudence, Usul al-Fiqh, and Quranic exegesis coordinated with accredited University Bachelor of Arts degree programmes.',
    path: '/academics',
  },
  {
    title: 'Alimiyya Postgraduate Stream',
    category: 'Theological Specialization & Research',
    duration: '2 Years Intensive',
    eligibility: 'Muthawwal Scholars',
    description: 'Postgraduate immersion in Hadith textual criticism, comparative law, thesis research, and community leadership, culminating in the prestigious Alim degree.',
    path: '/academics',
  },
  {
    title: 'Pedagogical & Arabic Diplomas',
    category: 'Faculty Development & Da‘wah Training',
    duration: '1 Year Certification',
    eligibility: 'Faculty & Senior Scholars',
    description: 'Intensive diplomas in modern instructional psychology, Arabic rhetoric, English public oratory, and administrative institutional governance.',
    path: '/academics',
  },
];

export const CoreServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="programmes" className="border-b border-misc-border bg-misc-page py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="programmes-heading">
      <div className="misc-container">
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-misc-primary" />
              <span>04 · Academic Catalogues</span>
            </div>
            <h2 id="programmes-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              Programmes for a Balanced Tomorrow
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/academics')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>View Full Curricula</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Editorial Programme Composition: 1 Featured Lead + 3 Horizontal Rows */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          {/* Featured Flagship Lead (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-misc-border bg-white shadow-xs transition-all hover:border-misc-primary/40 hover:shadow-md">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={flagshipProgramme.image}
                  alt={flagshipProgramme.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 inline-flex items-center rounded-sm bg-misc-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <span>Flagship Stream</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <span className="text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                  {flagshipProgramme.category}
                </span>

                <h3 className="mt-2 font-serif text-2xl font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors">
                  {flagshipProgramme.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-misc-secondary">
                  {flagshipProgramme.description}
                </p>

                <div className="mt-5 pt-4 border-t border-misc-border/70 flex flex-wrap gap-4 text-xs text-misc-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-misc-primary" />
                    <span>Duration: <strong className="text-misc-text">{flagshipProgramme.duration}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-misc-primary" />
                    <span>Eligibility: <strong className="text-misc-text">{flagshipProgramme.eligibility}</strong></span>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => navigate(flagshipProgramme.path)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>Curriculum Syllabus</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Horizontal Programme Strips (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {collegiateProgrammes.map((prog) => (
              <div
                key={prog.title}
                className="group flex flex-1 flex-col justify-between rounded-xl border border-misc-border bg-white p-6 transition-all duration-200 hover:border-misc-primary/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-sm bg-misc-soft-blue px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                      {prog.category}
                    </span>
                    <span className="text-[11px] font-mono text-misc-muted">
                      {prog.duration}
                    </span>
                  </div>

                  {/* Programme Name as visual focus */}
                  <h4 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-misc-text group-hover:text-misc-primary transition-colors">
                    {prog.title}
                  </h4>

                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-misc-secondary">
                    {prog.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-misc-border/60 flex items-center justify-between text-xs">
                  <span className="text-misc-muted">
                    Eligibility: <strong className="text-misc-text font-medium">{prog.eligibility}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(prog.path)}
                    className="inline-flex items-center gap-1 font-semibold text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>Curriculum Details</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreServicesSection;
