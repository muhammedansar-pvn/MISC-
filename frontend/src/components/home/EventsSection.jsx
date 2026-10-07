'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react';

const mainEvent = {
  day: '18',
  month: 'APR',
  year: '2026',
  title: 'Annual Central Convocation & Principals Academic Conclave',
  category: 'Apex Institutional Event',
  time: '09:30 AM – 04:30 PM IST',
  location: 'Diwan Al-Markaz Auditorium, Karanthur, Kozhikode',
  description: 'Annual gathering of all institutional deans, senior asatitha, and academic fellows to confer graduating degrees and review institutional quality frameworks.',
  image: '/Diwan.webp',
  path: '/examination',
};

const upcomingEvents = [
  {
    day: '05',
    month: 'MAY',
    title: 'Central Examination Registration & Verification Deadline',
    category: 'Board Evaluation',
    location: 'Central Examination Secretariat, Karanthur',
    time: 'Portal Closes 05:00 PM IST',
    path: '/examination',
  },
  {
    day: '22',
    month: 'MAY',
    title: 'National Symposium on Islamic Epistemology & Modern Thought',
    category: 'Academic Research',
    location: 'Markaz Knowledge City & Central Campus',
    time: 'Two-Day Residential Symposium',
    path: '/downloads',
  },
  {
    day: '10',
    month: 'JUN',
    title: 'Academic Orientation & Tarbiyah Induction for Incoming Cohorts',
    category: 'Student Onboarding',
    location: 'Participating Collegiate Centers',
    time: 'Full-Day Campus Program',
    path: '/academics',
  },
];

export const EventsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="events" className="border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="events-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <CalendarDays className="h-4 w-4" />
              <span>07 · Key Academic Dates</span>
            </div>
            <h2 id="events-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              Convocations, Symposiums &amp; Schedules
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/downloads')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-misc-page px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>Download Annual Calendar</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Distinct Events Composition: 1 Large Spotlight + Date-Focused Timeline List */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-stretch">
          {/* Spotlight Event (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-misc-border bg-misc-page/40 shadow-xs transition-all hover:border-misc-primary/40 hover:shadow-md">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={mainEvent.image}
                  alt={mainEvent.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/20 to-transparent" />

                {/* Big Date Badge */}
                <div className="absolute top-4 left-4 flex flex-col items-center justify-center rounded-xl bg-white px-4 py-2.5 shadow-md">
                  <span className="font-serif text-2xl font-bold leading-none text-misc-text">{mainEvent.day}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-misc-primary">{mainEvent.month}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-block rounded-xs bg-misc-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {mainEvent.category}
                  </span>
                  <h3 className="mt-2 font-serif text-xl sm:text-2xl font-bold leading-snug text-white">
                    {mainEvent.title}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-4 text-xs text-misc-secondary">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-misc-primary" />
                    {mainEvent.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-misc-primary" />
                    {mainEvent.location}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-misc-secondary">
                  {mainEvent.description}
                </p>

                <div className="mt-auto pt-5 flex items-center justify-between border-t border-misc-border/70">
                  <button
                    type="button"
                    onClick={() => navigate(mainEvent.path)}
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>View Event Guidelines</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <span className="text-[11px] font-mono text-misc-muted">Academic Session {mainEvent.year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date-Focused Timeline List (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.title}
                className="group flex items-start gap-4 rounded-xl border border-misc-border bg-white p-5 transition-all hover:border-misc-primary/30 hover:shadow-xs"
              >
                {/* Prominent Date Box */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-misc-soft-blue border border-misc-primary/20 text-center">
                  <span className="font-serif text-2xl font-bold leading-none text-misc-primary">{evt.day}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-misc-text mt-0.5">{evt.month}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                    {evt.category}
                  </span>
                  <h4 className="mt-1 font-serif text-base font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors">
                    {evt.title}
                  </h4>
                  <div className="mt-2 space-y-0.5 text-xs text-misc-muted">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3 w-3 text-misc-primary shrink-0" />
                      <span>{evt.location}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Clock className="h-3 w-3 text-misc-primary shrink-0" />
                      <span>{evt.time}</span>
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => navigate(evt.path)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-misc-primary hover:text-misc-primary-dark transition-colors"
                    >
                      <span>Details &amp; Schedule</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
