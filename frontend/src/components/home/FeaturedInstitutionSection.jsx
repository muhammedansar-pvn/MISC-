'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const FeaturedInstitutionSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-white py-16 text-misc-text sm:py-20 lg:py-24">
      <div className="misc-container">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-misc-border shadow-sm">
              <img
                src="/Diwan.webp"
                alt="Academic architecture at Jamia Markaz"
                className="aspect-[4/3] w-full object-cover object-center sm:aspect-[1.5]"
                loading="lazy"
              />
            </div>
          </div>

          <div className="space-y-5 lg:col-span-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-misc-primary">Institution</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-misc-text sm:text-4xl">
                Jamia Markaz
              </h2>
              <p className="font-serif text-lg italic text-misc-primary sm:text-xl">Karanthur, Kozhikode</p>
            </div>
            <p className="max-w-xl text-sm leading-6 text-misc-muted sm:text-[15px] sm:leading-7">
              Founded in 1978, Jamia Markaz stands as one of the premier Islamic academic and humanitarian institutions in South Asia. As the headquarters and apex authority of MISC, its central campus coordinates integrated curricula, classical dars traditions, and university degree streams for thousands of scholars.
            </p>
            <button
              type="button"
              onClick={() => navigate('/institutions')}
              className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-misc-border bg-white px-4 py-2.5 text-xs font-semibold text-misc-text transition-colors hover:border-misc-primary hover:text-misc-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
            >
              <span>Explore Institution</span>
              <ArrowRight className="h-4 w-4 text-misc-primary transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstitutionSection;
