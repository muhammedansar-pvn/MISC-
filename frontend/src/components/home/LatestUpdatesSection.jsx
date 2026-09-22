'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const LatestUpdatesSection = () => {
  const navigate = useNavigate();

  const featuredStory = {
    category: 'EXAMINATION DIRECTIVE',
    date: 'MARCH 2026',
    title: 'MISC Central Examination Board Releases Annual Assessment Framework & Regulations for 2026',
    excerpt: 'Comprehensive official directive specifying unified scheduling, hall ticket verification guidelines, and evaluation rubrics across all 50+ affiliated collegiate streams under Jamia Markaz.',
    image: '/Diwan.JPG.jpeg',
    path: '/examination',
  };

  const secondaryStories = [
    {
      category: 'ACADEMIC CIRCULAR',
      date: 'FEBRUARY 2026',
      title: 'Secretariat Concludes Curricular Modernization for Higher Secondary Integrated Streams',
      excerpt: 'Harmonized syllabus integrating classical Islamic studies with accredited university degree pathways.',
      image: '/MKZ01377.JPG.jpeg',
      path: '/academics',
    },
    {
      category: 'SECRETARIAT CONVOCATION',
      date: 'JANUARY 2026',
      title: 'Annual Council of Principals & Institutional Deans Assembly Convened at Karanthur',
      excerpt: 'Over 50 institutional heads gathered to ratify academic policies and institutional quality standards.',
      image: '/markaz-drone.jpg (1).jpeg',
      path: '/contact',
    },
  ];

  return (
    <section className="relative bg-[#FFFFFF] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6 pb-6 border-b border-[rgba(19,34,56,0.12)]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-wider">
                07
              </span>
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
                DISPATCHES
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#132238] leading-tight">
              NEWS & NOTICES
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#667085] font-normal leading-relaxed max-w-md">
            Official announcements, examination board directives, circulars, and academic dispatches from the MISC Secretariat.
          </p>
        </div>

        {/* Asymmetric Editorial Composition: 1 Large Feature + 2 Sub-Features */}
        <div className="space-y-12 sm:space-y-16">
          
          {/* 1. LARGE FEATURED STORY */}
          <div
            onClick={() => navigate(featuredStory.path)}
            className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border border-[rgba(19,34,56,0.12)] bg-[#F7F7F3] p-4 sm:p-6 lg:p-8 hover:border-[#2F7C7A]/50 transition-all duration-300"
          >
            {/* Image (7 cols) */}
            <div className="lg:col-span-7 overflow-hidden aspect-[16/10] bg-slate-100 relative">
              <img
                src={featuredStory.image}
                alt={featuredStory.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute top-4 left-4 bg-[#132238]/90 backdrop-blur-xs text-white text-[10px] font-mono tracking-widest px-3 py-1 uppercase">
                FEATURED DISPATCH
              </div>
            </div>

            {/* Narrative (5 cols) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:py-4">
              <div className="flex items-center space-x-3 text-[11px] font-mono tracking-widest uppercase text-[#2F7C7A]">
                <span>{featuredStory.date}</span>
                <span>•</span>
                <span className="text-[#667085]">{featuredStory.category}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#132238] leading-[1.18] group-hover:text-[#2F7C7A] transition-colors">
                {featuredStory.title}
              </h3>

              <p className="text-sm sm:text-base text-[#132238]/80 font-normal leading-relaxed">
                {featuredStory.excerpt}
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-[#132238] uppercase group-hover:text-[#2F7C7A] transition-colors">
                  <span>READ DIRECTIVE</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform text-[#2F7C7A]" />
                </span>
              </div>
            </div>
          </div>

          {/* 2. TWO SMALLER STORIES (Asymmetric 2-Column Split) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {secondaryStories.map((story, idx) => (
              <div
                key={idx}
                onClick={() => navigate(story.path)}
                className="group cursor-pointer border border-[rgba(19,34,56,0.12)] bg-[#F7F7F3] p-5 sm:p-7 hover:border-[#2F7C7A]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="overflow-hidden aspect-[16/9] bg-slate-100 mb-5">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center space-x-2.5 text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#2F7C7A]">
                    <span>{story.date}</span>
                    <span>•</span>
                    <span className="text-[#667085]">{story.category}</span>
                  </div>

                  <h4 className="font-serif text-xl sm:text-2xl font-normal text-[#132238] leading-snug group-hover:text-[#2F7C7A] transition-colors">
                    {story.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#667085] font-normal leading-relaxed">
                    {story.excerpt}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[rgba(19,34,56,0.08)] flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#132238] uppercase group-hover:text-[#2F7C7A] transition-colors">
                    READ STORY
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2F7C7A] transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default LatestUpdatesSection;
