'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Users, MessageSquare, BookOpen, HeartHandshake } from 'lucide-react';

const activitiesList = [
  {
    title: 'Scholarly Halaqas & Textual Study',
    description: 'Traditional study circles focused on foundational classical texts under scholarly guidance.',
    icon: BookOpen,
  },
  {
    title: 'Multilingual Rhetoric & Debates',
    description: 'Cultivating eloquence, public speaking, and intellectual discourse in Arabic, English, and Malayalam.',
    icon: MessageSquare,
  },
  {
    title: 'Character Development & Mentorship',
    description: 'Tarbiyah programs instilling ethical grounding, spiritual mindfulness, and moral discipline.',
    icon: HeartHandshake,
  },
  {
    title: 'Social Responsibility & Community Engagement',
    description: 'Preparing proactive graduates to serve community advancement and positive societal leadership.',
    icon: Users,
  },
];

export const CampusLifeSection = () => {
  return (
    <section id="activities" className="border-b border-[#DCE8F3] bg-white py-16 sm:py-20 lg:py-24 text-[#243447]" aria-labelledby="activities-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
              <Sparkles className="h-4 w-4 text-[#3182CE]" />
              <span>STUDENT EXPERIENCES &amp; ENRICHMENT</span>
            </div>
            <h2 id="activities-heading" className="mt-2.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#173B65]">
              Student Activities &amp; Intellectual Life
            </h2>
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#64748B]">
              Fostering an inspiring educational environment where rigorous study, eloquent communication, and moral character thrive together.
            </p>
          </div>

          <Link
            href="/contact"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-[#DCE8F3] bg-[#F5FAFF] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#173B65] transition-all hover:border-[#3182CE] hover:bg-[#EAF5FF] hover:text-[#3182CE]"
          >
            <span>Enquire for Admissions</span>
          </Link>
        </div>

        {/* Visual Documentary Composition */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          {/* Main Visual Feature */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-[#DCE8F3] bg-white p-2.5 shadow-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/MKZ01377.webp"
                  alt="Student assemblies and intellectual activities at Markaz Sanaviyya Academy"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/85 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="rounded-xs bg-[#3182CE] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                    Scholarly Convocations
                  </span>
                  <h3 className="mt-2 font-heading text-xl sm:text-2xl font-bold text-white">
                    Cultivating Eloquent Scholars &amp; Leaders
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-200">
                    Assemblies, seminars, and academic symposiums addressing contemporary challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Pillars Grid */}
          <div className="lg:col-span-5 space-y-4">
            {activitiesList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#DCE8F3] bg-[#F5FAFF] p-4.5 sm:p-5 transition-colors hover:border-[#3182CE]/40 hover:bg-[#EAF5FF]/40"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#3182CE] border border-[#DCE8F3]">
                      <Icon className="h-4.5 w-4.5 text-[#3182CE]" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-[#173B65]">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CampusLifeSection;
