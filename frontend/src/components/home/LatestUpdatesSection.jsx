'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Newspaper, CalendarDays, Clock, Tag } from 'lucide-react';

const featuredLead = {
  category: 'Curricular Harmonization',
  date: 'March 2026',
  title: 'MISC Secretariat Concludes Harmonized Syllabi for Higher Secondary Integrated Streams',
  excerpt: 'The central academic council has finalized comprehensive syllabus updates integrating classical Shariah sciences, Hadith traditions, and Arabic rhetoric directly with accredited university higher secondary curricula.',
  image: '/MKZ01377.webp',
  path: '/academics',
  author: 'Central Academic Council',
};

const secondaryStories = [
  {
    category: 'Examination Directive',
    date: 'February 2026',
    title: 'Central Examination Board Releases Annual Assessment Framework & Regulations',
    excerpt: 'Unified timetable directives, hall ticket protocols, and internal assessment guidelines distributed to 50+ affiliated centers.',
    path: '/examination',
  },
  {
    category: 'Secretariat Convocation',
    date: 'January 2026',
    title: 'Annual Council of Principals & Institutional Deans Assembly Convened at Karanthur',
    excerpt: 'Over 50 institutional heads gathered at Jamia Markaz to ratify educational standards and academic quality benchmarks.',
    path: '/institutions',
  },
  {
    category: 'Faculty Development',
    date: 'December 2025',
    title: 'Specialized Workshop on Classical Arabic Hermeneutics & Contemporary Pedagogy',
    excerpt: 'Senior scholars and faculty members completed intensive training in modern instructional methodologies and research supervision.',
    path: '/about',
  },
];

export const LatestUpdatesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="news" className="border-b border-misc-border bg-misc-page py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="news-heading">
      <div className="misc-container">
        {/* Editorial Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <Newspaper className="h-4 w-4" />
              <span>06 · Institutional Dispatches</span>
            </div>
            <h2 id="news-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              News &amp; Academic Circulars
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/downloads')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>All Circulars Archive</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Editorial Layout: Left Large Story + Right 3 Announcements */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          {/* Featured Large Article (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <article className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-misc-border bg-white shadow-xs transition-all hover:border-misc-primary/40 hover:shadow-md">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <img
                  src={featuredLead.image}
                  alt={featuredLead.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/70 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-misc-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                  <Tag className="h-3 w-3" />
                  <span>{featuredLead.category}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex items-center gap-3 text-xs font-semibold text-misc-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-misc-primary" />
                    {featuredLead.date}
                  </span>
                  <span>·</span>
                  <span>{featuredLead.author}</span>
                </div>

                <h3 className="mt-3 font-serif text-2xl font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors sm:text-3xl">
                  {featuredLead.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-misc-secondary">
                  {featuredLead.excerpt}
                </p>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-misc-border/70">
                  <button
                    type="button"
                    onClick={() => navigate(featuredLead.path)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>Read Full Dispatch</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[11px] font-mono text-misc-muted">Official Release</span>
                </div>
              </div>
            </article>
          </div>

          {/* Secondary Announcements List (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {secondaryStories.map((story) => (
              <article
                key={story.title}
                className="group flex flex-1 flex-col justify-between rounded-xl border border-misc-border bg-white p-5 sm:p-6 transition-all hover:border-misc-primary/30 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                    <span>{story.category}</span>
                    <span className="text-misc-muted font-normal">· {story.date}</span>
                  </div>

                  <h4 className="mt-2 font-serif text-base sm:text-lg font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors">
                    {story.title}
                  </h4>

                  <p className="mt-2 text-xs leading-relaxed text-misc-secondary line-clamp-2">
                    {story.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-misc-border/50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(story.path)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>Read Directive</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[10px] font-mono uppercase text-misc-muted">CIRCULAR</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestUpdatesSection;
