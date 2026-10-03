'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { Bell, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const EventsOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-misc-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
              NOTICES & ANNOUNCEMENTS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-misc-text tracking-tight leading-tight">
            Events & Important Updates
          </h2>

          <p className="text-base sm:text-lg text-misc-secondary font-normal leading-relaxed">
            Official announcements, academic notices, examination schedules, and Secretariat directives for member institutions.
          </p>
        </div>

        {/* Official Directory Notice Panel */}
        <div className="bg-misc-page rounded-md border border-misc-border p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-full bg-misc-soft-blue border border-misc-primary/40 flex items-center justify-center text-misc-primary">
            <Bell className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-misc-navy text-misc-dark-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              SECRETARIAT DIRECTIVE
            </span>

            <h3 className="font-serif text-2xl font-bold text-misc-text">
              Official Notices & Academic Circulars
            </h3>

            <p className="text-xs sm:text-sm text-misc-secondary font-normal leading-relaxed">
              Official announcements, examination schedules, and academic circulars will be published here by the MISC Secretariat.
            </p>
          </div>

          <div className="pt-4 border-t border-misc-border/80 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="miscBlue"
              size="md"
              onClick={() => navigate('/contact')}
              className="group"
            >
              <span>CONTACT SECRETARIAT</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsOverview;
