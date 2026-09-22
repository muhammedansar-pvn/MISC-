'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F7F3] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Editorial Two-Column Asymmetric Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* LEFT COLUMN: Section Index & Label */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-4">
            <div className="flex items-baseline space-x-3">
              <span className="font-mono text-sm sm:text-base font-semibold text-[#2F7C7A] tracking-wider">
                01
              </span>
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
                ABOUT MISC
              </span>
            </div>
            
            <div className="h-px w-16 bg-[#2F7C7A]/40" />

            <div className="pt-2 text-xs text-[#667085] font-mono uppercase tracking-wider leading-relaxed">
              Markaz Integrated Studies Council <br />
              Jamia Markaz • Karanthur
            </div>
          </div>

          {/* RIGHT COLUMN: Large Editorial Statement & Narrative */}
          <div className="lg:col-span-8 space-y-8 lg:space-y-10">
            {/* Very Large Editorial Statement */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-[3.35rem] font-normal leading-[1.18] tracking-tight text-[#132238]">
              “An academic coordination body connecting Islamic scholarship, contemporary education and institutional excellence.”
            </h2>

            {/* Concise Academic Paragraph */}
            <div className="space-y-5 text-[#132238]/80 text-base sm:text-lg lg:text-[1.125rem] font-normal leading-relaxed max-w-3xl border-l-2 border-[#2F7C7A]/30 pl-6 sm:pl-8">
              <p>
                Established under the governance of Jamia Markaz in Karanthur, MISC oversees a network of direct institutions and affiliated academic centers. Through centralized curriculum development, faculty development, uniform assessments, and quality assurance, the Council nurtures scholars and professionals equipped for contemporary society while remaining firmly rooted in Islamic heritage.
              </p>
            </div>

            {/* Clean Minimalist Editorial Link */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="group inline-flex items-center space-x-3 text-xs sm:text-sm font-semibold tracking-widest text-[#132238] uppercase hover:text-[#2F7C7A] transition-colors cursor-pointer py-2 border-b-2 border-[#132238] hover:border-[#2F7C7A]"
              >
                <span>DISCOVER MISC</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5 text-[#2F7C7A]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutSection;
