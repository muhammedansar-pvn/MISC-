'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { Building, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const InstitutionDirectoryNotice = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="bg-misc-navy text-white rounded-lg p-8 sm:p-12 border border-misc-primary/30 shadow-lg relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-misc-primary/20 border border-misc-primary/40 flex items-center justify-center text-misc-dark-muted">
            <Building className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-misc-primary/20 text-misc-dark-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-misc-primary/40">
              OFFICIAL DIRECTORY
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Institutional Listings & Affiliation Records
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Official details of affiliated colleges, dars centers, and direct campus institutions will be published here by the MISC Secretariat.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
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

export default InstitutionDirectoryNotice;
