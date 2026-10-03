import React from 'react';
import { Network, Landmark, Building2 } from 'lucide-react';

export const InstitutionalNetwork = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-misc-border">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-misc-primary" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-misc-primary uppercase">
              NETWORK ARCHITECTURE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-misc-text tracking-tight leading-tight">
            Institutional Coordination Framework
          </h2>

          <p className="text-base sm:text-lg text-misc-secondary font-normal leading-relaxed">
            MISC maintains a central academic governance structure connecting direct campuses and collaborating educational centers.
          </p>
        </div>

        {/* Governance Tree Node */}
        <div className="bg-misc-navy text-white rounded-lg p-8 sm:p-12 border border-misc-primary/30 shadow-md max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 bg-misc-primary/10 border border-misc-primary/40 px-3.5 py-1 rounded text-xs font-bold text-misc-dark-muted uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>CENTRAL GOVERNANCE</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white pt-2">
              MISC ACADEMIC COUNCIL
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Central Academic Board & Quality Assurance Secretariat
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-px h-8 bg-misc-primary/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-700 p-6 rounded text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-misc-primary/10 text-misc-dark-muted flex items-center justify-center border border-misc-primary/30">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-misc-dark-muted">
                DIRECT INSTITUTIONS
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Campus institutions functioning directly under Jamia Markaz management
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 p-6 rounded text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-misc-primary/10 text-misc-dark-muted flex items-center justify-center border border-misc-primary/30">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-misc-dark-muted">
                ACADEMIC COLLABORATION
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Collaborating colleges operating under unified MISC curriculum guidelines
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionalNetwork;
