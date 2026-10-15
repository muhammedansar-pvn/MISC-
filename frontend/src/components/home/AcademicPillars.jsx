'use client';

import React from 'react';
import { BookOpen, Award, ShieldCheck, Compass, Users } from 'lucide-react';

const academicThemes = [
  {
    number: '01',
    title: 'Authentic Islamic Scholarship',
    arabic: 'العلم والتحقيق',
    icon: BookOpen,
    description: 'Deeply anchored in classical Islamic disciplines, foundational textual inquiry, and sacred sciences preserved through traditional scholarship.',
  },
  {
    number: '02',
    title: 'Academic Excellence',
    arabic: 'الإتقان والجودة',
    icon: Award,
    description: 'Rigorous intellectual standards combining traditional scholarship with contemporary academic methodologies and pedagogical precision.',
  },
  {
    number: '03',
    title: 'Ethical Values and Character',
    arabic: 'الأخلاق والتزكية',
    icon: ShieldCheck,
    description: 'Cultivating spiritual integrity, noble character, humility, and moral rectitude as the essential compass for personal and scholarly life.',
  },
  {
    number: '04',
    title: 'Critical Thinking',
    arabic: 'الفكر النقدي',
    icon: Compass,
    description: 'Guiding students to engage contemporary intellectual challenges through balanced inquiry, critical reflection, and principled discernment.',
  },
  {
    number: '05',
    title: 'Leadership & Social Responsibility',
    arabic: 'القيادة والخدمة',
    icon: Users,
    description: 'Preparing eloquent speakers, effective preachers, and dedicated leaders committed to the betterment and moral advancement of society.',
  },
];

export const AcademicPillars = () => (
  <section id="academics" className="border-b border-[#DCE8F3] bg-[#F5FAFF] py-16 sm:py-20 lg:py-24 text-[#243447]">
    <div className="misc-container">
      {/* Editorial Header */}
      <div className="mb-12 max-w-2xl">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3182CE]" />
          <span>EDUCATIONAL PHILOSOPHY</span>
        </div>
        <h2 className="mt-2.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#173B65]">
          Academic Identity &amp; Educational Experience
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
          The educational philosophy of Markaz Sanaviyya Academy integrates classical Islamic learning with modern intellectual rigor.
        </p>
      </div>

      {/* 5 Themes: Restrained Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {academicThemes.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.number}
              className={`rounded-2xl border border-[#DCE8F3] bg-white p-6 sm:p-8 shadow-xs transition-all duration-200 hover:border-[#3182CE]/50 hover:shadow-sm ${
                index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#3182CE] tracking-wider">
                  {item.number}
                </span>
                <span className="font-arabic text-xs text-[#64748B]">
                  {item.arabic}
                </span>
              </div>

              <div className="mt-4 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF5FF] text-[#173B65]">
                <Icon className="h-5 w-5 text-[#3182CE]" />
              </div>

              <h3 className="font-heading text-lg font-bold text-[#173B65] tracking-tight">
                {item.title}
              </h3>

              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#64748B]">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default AcademicPillars;
