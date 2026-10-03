'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';
import ScrollReveal from '../common/ScrollReveal';

export const VisionSection = () => {
  return (
    <section className="relative bg-misc-page py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10 max-w-5xl">
        <ScrollReveal delay={150} yOffset={20}>
          <div className="bg-white rounded-xl border border-misc-border shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center group">
            <div className="md:col-span-7 p-8 sm:p-12 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-misc-soft-blue text-misc-primary flex items-center justify-center border border-misc-border">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-misc-primary uppercase tracking-wider block">
                    INSTITUTIONAL VISION
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-misc-text">
                    Vision
                  </h2>
                </div>
              </div>

              <p className="text-base sm:text-lg text-misc-secondary font-serif leading-relaxed italic border-l-4 border-misc-primary pl-6 py-2">
                "{miscInfo.vision}"
              </p>
            </div>

            <div className="md:col-span-5 h-full min-h-[260px] relative bg-misc-navy border-t md:border-t-0 md:border-l border-misc-border overflow-hidden">
              <img
                src="/vision.png"
                alt="MISC Institutional Vision"
                className="w-full h-full object-cover object-center min-h-[260px] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default VisionSection;
