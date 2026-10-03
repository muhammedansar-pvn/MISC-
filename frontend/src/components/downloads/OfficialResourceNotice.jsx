'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, Download, Calendar, User, Quote } from 'lucide-react';
import Button from '../common/Button';

export const OfficialResourceNotice = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-misc-page py-14 sm:py-18 border-b border-misc-border">
      <div className="misc-container">
        
        {/* Featured Resource Card */}
        <div className="bg-white border border-misc-border rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Document Cover Preview */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="relative w-44 sm:w-48 aspect-[3/4] bg-misc-navy rounded-xl shadow-md overflow-hidden border border-misc-border p-4 flex flex-col justify-between text-white group">
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="MISC" className="h-6 w-auto bg-white p-0.5 rounded shrink-0" />
                  <span className="text-[9px] font-mono text-misc-primary font-bold uppercase tracking-wider">OFFICIAL MANUAL</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-white leading-tight">
                    Manual for Collaborating Institutions
                  </h4>
                  <span className="text-[10px] text-slate-300 block">2026 Academic Edition</span>
                </div>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Jamia Markaz</span>
                  <span>MISC</span>
                </div>
              </div>
            </div>

            {/* Center: Details & Metadata */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-misc-soft-blue border border-misc-border">
                <span className="w-2 h-2 rounded-full bg-misc-primary" />
                <span className="text-[11px] font-bold tracking-wider text-misc-primary uppercase">
                  FEATURED RESOURCE
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-misc-text leading-tight">
                Manual for Collaborating Institutions
              </h3>

              <p className="text-xs sm:text-sm text-misc-secondary leading-relaxed font-normal">
                Official guidelines, accreditation criteria, and operational procedures for institutions affiliated with MISC under Jamia Markaz governance.
              </p>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-misc-secondary font-medium pt-2 border-t border-misc-border">
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-misc-primary" />
                  <span>Published by Secretariat</span>
                </span>
                <span className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-misc-primary" />
                  <span>Jan 2026</span>
                </span>
                <span className="bg-misc-soft-blue text-misc-primary px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase border border-misc-border">
                  Official Resource
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/contact')}
                  className="group"
                >
                  <span>VIEW DOCUMENT</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/contact')}
                  className="group bg-misc-page"
                >
                  <Download className="w-4 h-4 mr-1.5 text-misc-primary" />
                  <span>DOWNLOAD PDF</span>
                </Button>
              </div>
            </div>

            {/* Right: Inspirational Brand Note */}
            <div className="lg:col-span-3 hidden lg:block border-l border-misc-border pl-6 space-y-3">
              <div className="w-8 h-8 rounded bg-misc-soft-blue text-misc-primary flex items-center justify-center">
                <Quote className="w-4 h-4" />
              </div>
              <blockquote className="font-serif text-sm italic font-semibold text-misc-text leading-relaxed">
                “A unified academic framework for a stronger tomorrow.”
              </blockquote>
              <span className="text-[10px] uppercase font-bold tracking-widest text-misc-primary block">
                — MISC GOVERNANCE
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default OfficialResourceNotice;
