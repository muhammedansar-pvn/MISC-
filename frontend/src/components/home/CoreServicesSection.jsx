'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, BookOpen, Layers3, GraduationCap, FileText } from 'lucide-react';

const programmes = [
  {
    title: 'Sanaviyya',
    stream: 'Islamic Studies',
    description: 'Classical Sharia, Hadith, Usul & Quranic Sciences',
    image: '/MKZ01377.webp',
    icon: BookOpen,
  },
  {
    title: 'Muthawwal',
    stream: 'Contemporary Studies',
    description: 'University Arts, Commerce, Science & Humanities',
    image: '/vision.webp',
    icon: Layers3,
  },
  {
    title: 'Special Programmes',
    stream: 'Integrated Programmes',
    description: 'Dual-Track Alim & Secondary / Higher Secondary Degrees',
    image: '/DSC00390.webp',
    icon: GraduationCap,
  },
  {
    title: 'Certificate Courses',
    stream: 'Professional Programmes',
    description: 'Leadership, Pedagogical Training, Research & Languages',
    image: '/Diwan.webp',
    icon: FileText,
  },
];

export const CoreServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-misc-page py-16 text-misc-text sm:py-20 lg:py-24">
      <div className="misc-container">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">02 · Academic programmes</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.75rem]">
              Programmes for a Balanced Tomorrow
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-misc-muted sm:text-[15px]">
              Our programmes bring classical Islamic scholarship together with contemporary academic disciplines.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/academics')}
            className="group inline-flex min-h-10 shrink-0 items-center gap-2 text-xs font-semibold text-misc-primary transition-colors hover:text-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>View All Programmes</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programmes.map(({ title, stream, description, image, icon: Icon }) => (
            <button
              key={title}
              type="button"
              onClick={() => navigate('/academics')}
              className="group overflow-hidden rounded-[14px] border border-misc-border bg-white text-left shadow-[0_8px_24px_-22px_rgba(18,35,63,0.5)] transition-all hover:-translate-y-1 hover:border-misc-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
            >
              <span className="block overflow-hidden">
                <img
                  src={image}
                  alt=""
                  className="aspect-[1.7] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </span>
              <span className="flex min-h-48 flex-col p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="mt-3 block text-[9px] font-semibold uppercase tracking-[0.12em] text-misc-primary">{stream}</span>
                <span className="mt-1 block font-serif text-xl font-semibold leading-tight text-misc-text">{title}</span>
                <span className="mt-2 block text-xs leading-5 text-misc-muted">{description}</span>
                <span className="mt-auto flex justify-end pt-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-misc-border text-misc-text transition-colors group-hover:border-misc-primary group-hover:bg-misc-primary group-hover:text-white">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreServicesSection;
