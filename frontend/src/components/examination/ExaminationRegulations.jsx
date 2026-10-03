import React from 'react';
import { FileText, Bell } from 'lucide-react';

export const ExaminationRegulations = () => {
  return (
    <section className="relative bg-misc-page py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-misc-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
              EXAMINATION REGULATIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-misc-text tracking-tight leading-tight">
            Examination Regulations & Policy
          </h2>

          <p className="text-base sm:text-lg text-misc-secondary font-normal leading-relaxed">
            Central examination regulations governing candidate assessment, evaluation policy, and academic standards.
          </p>
        </div>

        <div className="bg-white rounded-md border border-misc-border p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-full bg-misc-soft-blue border border-misc-primary/40 flex items-center justify-center text-misc-primary">
            <FileText className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-misc-navy text-misc-dark-muted text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              OFFICIAL REGULATIONS
            </span>

            <h3 className="font-serif text-2xl font-bold text-misc-text">
              Academic Examination Policy Guidelines
            </h3>

            <p className="text-xs sm:text-sm text-misc-secondary font-normal leading-relaxed">
              Official examination regulations will be published here when made available by the MISC Secretariat prior to each evaluation cycle.
            </p>
          </div>

          <div className="pt-4 border-t border-misc-border flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
            <Bell className="w-3.5 h-3.5 text-misc-primary" />
            <span>Markaz Integrated Studies Council Secretariat</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExaminationRegulations;
