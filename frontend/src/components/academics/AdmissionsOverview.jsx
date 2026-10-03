'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { GraduationCap, ArrowRight, Bell } from 'lucide-react';
import Button from '../common/Button';

export const AdmissionsOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-misc-page py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-misc-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
              ADMISSION GUIDANCE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-misc-text">
            Admission Criteria & Guidelines
          </h2>

          <p className="text-base text-misc-secondary leading-relaxed font-normal">
            Information regarding eligibility criteria, admission procedures, and enrollment circulars for integrated streams.
          </p>
        </div>

        <div className="bg-white rounded-md border border-misc-border p-8 sm:p-10 shadow-2xs space-y-6 max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-misc-soft-blue border border-misc-primary/40 flex items-center justify-center text-misc-primary">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block bg-misc-navy text-misc-dark-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              OFFICIAL ANNOUNCEMENT
            </span>
            <h3 className="font-serif text-xl font-bold text-misc-text">
              Admission Notification & Circulars
            </h3>
            <p className="text-xs sm:text-sm text-misc-secondary font-normal leading-relaxed">
              Official admission notifications and application schedules are published by the MISC Secretariat prior to each academic session.
            </p>
          </div>

          <div className="pt-4 border-t border-misc-border flex justify-center">
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

export default AdmissionsOverview;
