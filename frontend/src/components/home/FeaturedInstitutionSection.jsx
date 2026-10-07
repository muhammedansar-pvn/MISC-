'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowDown, ArrowRight, Building, CheckCircle2, ChevronRight, Landmark, Network, ShieldCheck } from 'lucide-react';

const governanceTiers = [
  {
    level: '01',
    name: 'Jamia Markaz Headquarters',
    subtitle: 'Apex Institutional & Spiritual Authority · Estd. 1978',
    location: 'Karanthur, Kozhikode, Kerala',
    role: 'Supreme governance, institutional trusteeship, and foundational vision for higher education.',
  },
  {
    level: '02',
    name: 'Markaz Integrated Studies Council (MISC)',
    subtitle: 'Central Academic Secretariat & Governance Body',
    location: 'Central Secretariat, Karanthur',
    role: 'Central curriculum harmonization, standardized syllabi, faculty recruitment standards, and autonomous examination oversight.',
  },
  {
    level: '03',
    name: 'Direct Colleges & Campus Departments',
    subtitle: 'Markaz Premier Residential Institutions',
    location: 'Central Campus & Regional Campuses',
    role: 'Directly managed colleges providing full residential scholarship, senior Alim faculties, and post-graduate specialized councils.',
  },
  {
    level: '04',
    name: 'Affiliated Collegiate Network & Dars Systems',
    subtitle: '50+ Partner Institutions Across Kerala & National Centers',
    location: 'Pan-Kerala & Interstate Locations',
    role: 'Participating colleges adhering to the unified MISC academic calendar, board assessments, and verified degree certifications.',
  },
];

export const FeaturedInstitutionSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="network-heading">
      <div className="misc-container">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Context & Imagery */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
                <Network className="h-4 w-4" />
                <span>05 · Institutional Network</span>
              </div>
              <h2 id="network-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl">
                A Unified Academic Federation Under Jamia Markaz
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-misc-secondary sm:text-base">
                Sanaviyya enforces academic standardization across more than 50 institutions through an authoritative centralized hierarchy of governance.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-misc-border bg-misc-page p-2 shadow-xs">
              <div className="relative aspect-[4/3] sm:aspect-[1.3] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/Diwan.webp"
                  alt="Academic architecture at Jamia Markaz Karanthur"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Karanthur, Kozhikode</span>
                  <h3 className="mt-1 font-serif text-xl font-bold">Diwan Al-Markaz</h3>
                  <p className="text-xs text-slate-200">The Central Administrative &amp; Academic Seat</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/institutions')}
                className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-misc-primary px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-misc-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
              >
                <span>Browse All 50+ Institutions</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Authoritative Vertical Governance Flow (Not Ordinary Cards) */}
          <div className="lg:col-span-7">
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-misc-border">
              {governanceTiers.map((tier, idx) => (
                <div key={tier.name} className="relative group">
                  {/* Flowchart Node Indicator */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-misc-primary text-[10px] font-mono font-bold text-misc-primary shadow-xs">
                    {tier.level}
                  </div>

                  {/* Tier Content Block */}
                  <div className="rounded-xl border border-misc-border/80 bg-misc-page/40 p-5 transition-colors group-hover:border-misc-primary/40 group-hover:bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-semibold uppercase tracking-wider text-misc-primary">
                        {tier.subtitle}
                      </span>
                      <span className="font-mono text-misc-muted">
                        {tier.location}
                      </span>
                    </div>

                    <h4 className="mt-1.5 font-serif text-lg sm:text-xl font-bold text-misc-text">
                      {tier.name}
                    </h4>

                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-misc-secondary">
                      {tier.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstitutionSection;
