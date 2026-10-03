'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="misc-container">
        <div className="grid overflow-hidden rounded-2xl border border-misc-border bg-misc-soft-blue lg:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-9 lg:col-span-6 lg:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-misc-primary">Jamia Markaz · Karanthur</p>
            <h2 className="mt-3 max-w-lg font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-misc-text sm:text-4xl">
              Be a Part of the Academic Journey
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-misc-muted">
              Join a legacy of knowledge, character, and service.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-misc-primary px-5 py-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary focus-visible:ring-offset-2 sm:text-sm"
              >
                <span>Enquire Now</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/academics')}
                className="group ml-0 mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-misc-border bg-white/80 px-4 py-2.5 text-xs font-semibold text-misc-text transition-colors hover:border-misc-primary hover:text-misc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary sm:ml-3 sm:mt-0"
              >
                <span>Explore Academics</span>
                <ArrowRight className="h-4 w-4 text-misc-primary transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
          <div className="relative min-h-48 sm:min-h-64 lg:col-span-6 lg:min-h-[300px]">
            <img
              src="/markaz-drone.jpg (1).webp"
              alt="Jamia Markaz campus in Karanthur"
              className="absolute inset-0 h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-misc-soft-blue/30 via-transparent to-misc-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
