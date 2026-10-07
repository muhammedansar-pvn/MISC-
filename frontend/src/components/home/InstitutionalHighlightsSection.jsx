'use client';

import React from 'react';
import Link from 'next/link';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowUpRight, BookOpen, GraduationCap, Languages, Microscope, HeartHandshake, ShieldCheck } from 'lucide-react';

export const InstitutionalHighlightsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="framework-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-misc-primary" />
            <span>03 · The Integrated Framework</span>
          </div>
          <h2 id="framework-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
            The Academic Ecosystem
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-misc-secondary sm:text-base">
            Connecting classical theology, university disciplines, linguistic fluency, and moral leadership into an integrated educational architecture.
          </p>
        </div>

        {/* Asymmetrical Academic Framework Composition (Not 6 Identical Cards) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-stretch">
          {/* Left: Large Primary Core (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex flex-1 flex-col justify-between rounded-2xl border border-misc-border bg-misc-page p-7 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-misc-primary text-white shadow-xs">
                    <BookOpen className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-misc-soft-blue px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                    Theological Core
                  </span>
                </div>

                <h3 className="mt-6 font-serif text-2xl sm:text-3xl font-bold leading-tight text-misc-text">
                  Classical Islamic Sciences
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-misc-secondary">
                  The foundational core of Sanaviyya: systematic mastery of Quranic exegesis (Tafsir), Hadith sciences, Islamic jurisprudence (Fiqh), Usul, and Arabic morphology under authentic scholarly lineages.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-misc-border/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/academics')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-misc-primary hover:text-misc-primary-dark transition-colors"
                >
                  <span>Explore Theological Curricula</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Supporting Disciplines (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            {/* Top Row: Two Primary Supporting Streams */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Stream 1 */}
              <Link
                href="/academics"
                className="group flex flex-col justify-between rounded-xl border border-misc-border bg-white p-6 text-left transition-all hover:border-misc-primary/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary group-hover:bg-misc-primary group-hover:text-white transition-colors">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-misc-muted">
                      Contemporary
                    </span>
                  </div>
                  <h4 className="mt-4 font-serif text-xl font-bold text-misc-text group-hover:text-misc-primary transition-colors">
                    University Degree Studies
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-misc-secondary">
                    Accredited Bachelor of Arts and degree tracks in Humanities, Social Sciences, and Commerce.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-misc-border/50 flex items-center justify-between text-xs font-semibold text-misc-primary">
                  <span>Degree Tracks</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>

              {/* Stream 2 */}
              <Link
                href="/academics"
                className="group flex flex-col justify-between rounded-xl border border-misc-border bg-white p-6 text-left transition-all hover:border-misc-primary/40 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-misc-soft-blue text-misc-primary group-hover:bg-misc-primary group-hover:text-white transition-colors">
                      <Languages className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-misc-muted">
                      Linguistics
                    </span>
                  </div>
                  <h4 className="mt-4 font-serif text-xl font-bold text-misc-text group-hover:text-misc-primary transition-colors">
                    Multilingual Proficiency
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-misc-secondary">
                    Fluency and formal rhetoric across Arabic, English composition, Urdu literature, and regional languages.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-misc-border/50 flex items-center justify-between text-xs font-semibold text-misc-primary">
                  <span>Language Labs</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </div>

            {/* Bottom Row: 3 Framework Supporting Pillars (Minimal Strip) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-misc-border/70 bg-misc-page/50 p-4">
              <div className="flex items-start gap-3 p-2">
                <Microscope className="h-4 w-4 text-misc-primary shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-misc-text">Research Rigor</h5>
                  <p className="text-[11px] text-misc-secondary">Methodology, comparative law &amp; thesis studies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2">
                <HeartHandshake className="h-4 w-4 text-misc-primary shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-misc-text">Moral Tarbiyah</h5>
                  <p className="text-[11px] text-misc-secondary">Spiritual grounding &amp; social character formation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2">
                <ShieldCheck className="h-4 w-4 text-misc-primary shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-misc-text">Examination Board</h5>
                  <p className="text-[11px] text-misc-secondary">Central assessment &amp; verified certification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstitutionalHighlightsSection;
