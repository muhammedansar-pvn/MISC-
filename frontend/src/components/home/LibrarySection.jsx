'use client';

import React from 'react';
import { BookOpen, Languages, Sparkles } from 'lucide-react';

const islamicSciences = [
  { name: 'Tafseer', arabic: 'التفسير', desc: 'Quranic Exegesis & Hermeneutics' },
  { name: 'Aqeedah', arabic: 'العقيدة', desc: 'Islamic Creed & Theology' },
  { name: 'Nahw', arabic: 'النحو', desc: 'Arabic Syntax & Classical Grammar' },
  { name: 'Fiqh', arabic: 'الفقه', desc: 'Islamic Jurisprudence & Legal Principles' },
];

export const LibrarySection = () => {
  return (
    <section id="library" className="relative border-b border-[#DCE8F3] bg-white py-16 sm:py-20 lg:py-24 text-[#243447]">
      <div className="misc-container">
        {/* Editorial Eyebrow */}
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
          <BookOpen className="h-4 w-4 text-[#3182CE]" />
          <span>RESEARCH &amp; SCHOLARLY RESOURCES</span>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Approved Library Narrative & Editorial Details */}
          <div className="space-y-6 lg:col-span-7">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#173B65] sm:text-3xl lg:text-4xl leading-[1.2]">
              A Gateway to Knowledge
            </h2>

            <p className="text-[15px] leading-relaxed text-[#64748B] sm:text-base sm:leading-7">
              The library of our institution has been functioning actively, offering a priceless reading experience to students thirsty for knowledge. The operations of our library are structured in a way that continuously guides readers toward new insights and expansive worlds. A collection of 500+ books in Malayalam, English, and Arabic has been curated here.
            </p>

            <p className="text-[15px] leading-relaxed text-[#64748B] sm:text-base sm:leading-7">
              The rich works across various branches foster the critical thinking skills of readers. Alongside this, opportunities are provided for students to read foundational texts of traditional sciences that help in deeply studying Islamic tenets and sciences, such as Tafseer, Aqeedah, Nahw, and Fiqh. The services of the library, arranged in this silent and enlightening sacred atmosphere, help us conquer new heights of knowledge by making maximum use of them.
            </p>

            {/* Curated Traditional Sciences Highlights */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#173B65] mb-3">
                Foundational Islamic Sciences Curated:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {islamicSciences.map((sci) => (
                  <div key={sci.name} className="rounded-xl border border-[#DCE8F3] bg-[#F5FAFF] p-3 text-center transition-colors hover:border-[#3182CE]/40">
                    <span className="font-heading text-sm font-bold text-[#173B65] block">{sci.name}</span>
                    <span className="font-arabic text-xs text-[#3182CE] block my-0.5">{sci.arabic}</span>
                    <span className="text-[10px] text-[#64748B] block leading-tight">{sci.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trilingual Collection Indicator */}
            <div className="rounded-xl border border-[#DCE8F3] bg-[#EAF5FF] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Languages className="h-5 w-5 text-[#3182CE] shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#173B65]">
                  Trilingual Research Collection
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#173B65]">
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#DCE8F3]">Malayalam</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#DCE8F3]">English</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-[#DCE8F3]">Arabic</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Statistic & Genuine Reading Photograph */}
          <div className="lg:col-span-5 space-y-6">
            {/* Key Statistic Feature */}
            <div className="rounded-2xl border border-[#DCE8F3] bg-[#F5FAFF] p-6 text-center sm:text-left flex items-center justify-between">
              <div>
                <span className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight text-[#173B65] block">
                  500+
                </span>
                <span className="text-sm font-bold text-[#3182CE] block mt-0.5">
                  Curated Volumes &amp; Foundational Texts
                </span>
                <span className="text-xs text-[#64748B] block">
                  Classical manuscripts and contemporary academic reference works
                </span>
              </div>
              <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-[#EAF5FF] border border-[#DCE8F3] items-center justify-center shrink-0">
                <BookOpen className="h-7 w-7 text-[#3182CE]" />
              </div>
            </div>

            {/* Real Educational Photograph */}
            <div className="relative overflow-hidden rounded-2xl border border-[#DCE8F3] bg-white p-2.5 shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src="/DSC00390.webp"
                  alt="Students reading foundational classical Islamic texts in the library"
                  className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-102"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    Silent &amp; Enlightening Atmosphere
                  </p>
                  <p className="font-heading text-sm font-semibold text-white">
                    Textual Study, Deliberation &amp; Critical Inquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LibrarySection;
