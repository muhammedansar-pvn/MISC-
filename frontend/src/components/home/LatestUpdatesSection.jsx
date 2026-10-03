'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, CalendarDays, Bell } from 'lucide-react';

const stories = [
  {
    category: 'EXAMINATION DIRECTIVE',
    date: 'MARCH 2026',
    title: 'MISC Central Examination Board Releases Annual Assessment Framework & Regulations for 2026',
    excerpt: 'Comprehensive official directive specifying unified scheduling, hall ticket verification guidelines, and evaluation rubrics across all 50+ affiliated collegiate streams under Jamia Markaz.',
    image: '/Diwan.JPG.jpeg',
    path: '/examination',
  },
  {
    category: 'ACADEMIC CIRCULAR',
    date: 'FEBRUARY 2026',
    title: 'Secretariat Concludes Curricular Modernization for Higher Secondary Integrated Streams',
    excerpt: 'Harmonized syllabus integrating classical Islamic studies with accredited university degree pathways.',
    image: '/MKZ01377.JPG.jpeg',
    path: '/academics',
  },
  {
    category: 'SECRETARIAT CONVOCATION',
    date: 'JANUARY 2026',
    title: 'Annual Council of Principals & Institutional Deans Assembly Convened at Karanthur',
    excerpt: 'Over 50 institutional heads gathered to ratify academic policies and institutional quality standards.',
    image: '/markaz-drone.jpg (1).jpeg',
    path: '/contact',
  },
];

export const LatestUpdatesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-misc-page py-16 text-misc-text sm:py-20 lg:py-24">
      <div className="misc-container">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">03 · Latest updates</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-misc-text sm:text-4xl">
              News &amp; Announcements
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-misc-muted">
            Official announcements, examination board directives, circulars, and academic updates from the MISC Secretariat.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:col-span-8">
            {stories.map((story) => (
              <button
                key={story.title}
                type="button"
                onClick={() => navigate(story.path)}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-misc-border bg-white text-left shadow-[0_8px_24px_-24px_rgba(18,35,63,0.5)] transition-all hover:-translate-y-0.5 hover:border-misc-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
              >
                <img
                  src={story.image}
                  alt=""
                  className="aspect-[1.72] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="flex flex-1 flex-col p-4 sm:p-5">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-misc-muted">{story.date} · {story.category}</span>
                  <span className="mt-2 font-serif text-lg font-semibold leading-snug text-misc-text transition-colors group-hover:text-misc-primary">{story.title}</span>
                  <span className="mt-2 text-xs leading-5 text-misc-muted">{story.excerpt}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wide text-misc-primary">
                    Read More
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            ))}
          </div>

          <aside className="rounded-xl border border-misc-border bg-white p-5 sm:p-6 lg:col-span-4" aria-labelledby="upcoming-events-heading">
            <div className="flex items-center gap-2 text-misc-primary">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Upcoming events</p>
            </div>
            <h3 id="upcoming-events-heading" className="mt-4 font-serif text-xl font-semibold leading-snug text-misc-text">
              Official notices &amp; academic circulars
            </h3>
            <div className="mt-5 flex gap-3 border-t border-misc-border pt-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-misc-soft-blue text-misc-primary">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-xs leading-5 text-misc-muted">
                Event dates and examination schedules are published by the MISC Secretariat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="group mt-5 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-misc-primary transition-colors hover:text-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
            >
              <span>Contact Secretariat</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default LatestUpdatesSection;
