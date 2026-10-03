'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, HelpCircle } from 'lucide-react';
import Button from '../common/Button';

export const DownloadsCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-misc-navy text-white py-16 sm:py-20 overflow-hidden border-b border-misc-primary/30">
      {/* Background aerial image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/markaz-drone.jpg (1).jpeg"
          alt="Jamia Markaz Aerial View"
          className="w-full h-full object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-misc-navy via-misc-navy/95 to-misc-navy" />
      </div>

      <div className="misc-container relative z-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 backdrop-blur-sm max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-misc-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-misc-primary">
                NEED MORE HELP?
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
              Can't find what you're looking for?
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Contact the MISC Secretariat for assistance with academic documents and resources.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/contact')}
              className="group shadow-md"
            >
              <span>CONTACT US</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadsCTA;
