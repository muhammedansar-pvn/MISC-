'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, BookOpenCheck, User } from 'lucide-react';

const journalLead = {
  journal: 'Sanaviyya Academic Review',
  volume: 'Vol. 14, Issue 2 · Peer-Reviewed Inquiry',
  title: 'Harmonizing Classical Legal Hermeneutics with Contemporary Ethical Challenges',
  abstract: 'An analytical paper examining the methodological continuum between traditional Usul al-Fiqh frameworks and modern socio-ethical imperatives, highlighting the educational synthesis championed by Jamia Markaz over four decades.',
  author: 'Central Faculty Research Directorate, Jamia Markaz',
  readTime: '14 min read',
  path: '/downloads',
};

const journalArticles = [
  {
    category: 'Pedagogy & Linguistics',
    title: 'Transformative Approaches to Classical Arabic Grammar in Secondary Madrasa Systems',
    author: 'Department of Arabic Rhetoric',
    readTime: '9 min read',
    path: '/downloads',
  },
  {
    category: 'Social History',
    title: 'The Historical Trajectory of Dars Education in Kerala and Institutional Evolution',
    author: 'Center for Markaz Heritage Studies',
    readTime: '12 min read',
    path: '/downloads',
  },
  {
    category: 'Epistemology',
    title: 'Integrating Modern University Disciplines within Traditional Islamic Curricula',
    author: 'Curriculum Harmonization Commission',
    readTime: '11 min read',
    path: '/academics',
  },
];

export const ArticlesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="articles-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
              <BookOpenCheck className="h-4 w-4" />
              <span>09 · Research &amp; Publications</span>
            </div>
            <h2 id="articles-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
              Scholarly Discourse &amp; Faculty Inquiries
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/downloads')}
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-misc-border bg-misc-page px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-misc-primary transition-all hover:border-misc-primary hover:bg-misc-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-misc-primary"
          >
            <span>Explore All Monographs</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Academic Journal Broadsheet Composition (Typographic, Not Boxy Cards) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-stretch">
          {/* Main Monograph Feature (7 Cols) */}
          <article className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-misc-border bg-misc-page/40 p-7 sm:p-9">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-misc-border/70 pb-3 text-xs">
                <span className="font-serif font-bold uppercase tracking-wider text-misc-primary text-[11px]">
                  {journalLead.journal}
                </span>
                <span className="font-mono text-misc-muted text-[11px]">
                  {journalLead.volume}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-2xl sm:text-3xl font-bold leading-snug text-misc-text">
                {journalLead.title}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-misc-secondary">
                {journalLead.abstract}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-misc-border/70 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-misc-muted">
                <User className="h-3.5 w-3.5 text-misc-primary" />
                <span className="font-medium text-misc-text">{journalLead.author}</span>
                <span>·</span>
                <span>{journalLead.readTime}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(journalLead.path)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-misc-primary hover:text-misc-primary-dark transition-colors"
              >
                <span>Read Monograph</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </article>

          {/* Typographic Journal List (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-misc-border">
            {journalArticles.map((article, index) => (
              <article
                key={article.title}
                className={`flex flex-col justify-between ${index === 0 ? 'pb-6' : 'py-6'} group`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-misc-primary">
                    {article.category}
                  </span>
                  <h4 className="mt-2 font-serif text-lg font-bold leading-snug text-misc-text group-hover:text-misc-primary transition-colors">
                    {article.title}
                  </h4>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-misc-muted">
                  <span className="truncate max-w-[200px]">{article.author}</span>
                  <button
                    type="button"
                    onClick={() => navigate(article.path)}
                    className="inline-flex items-center gap-1 font-semibold text-misc-primary hover:text-misc-primary-dark transition-colors"
                  >
                    <span>Read Paper</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
