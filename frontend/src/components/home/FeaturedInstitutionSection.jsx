'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const FeaturedInstitutionSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F7F3] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Editorial Image-Driven Composition (58% Image / 42% Narrative) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
          
          {/* LEFT: Large Editorial Photography (58% of section) */}
          <div className="lg:col-span-7">
            <div className="relative group overflow-hidden border border-[rgba(19,34,56,0.12)] shadow-sm bg-white p-2 sm:p-3">
              <div className="overflow-hidden relative aspect-[16/10] sm:aspect-[16/10] lg:aspect-[4/3] xl:aspect-[16/11]">
                <img
                  src="/gate.jpg.jpeg"
                  alt="Jamia Markaz Iconic Grand Book Gate, Central Campus, Karanthur"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                {/* Subtle contrast gradient at bottom for caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                
                {/* Inset Photo Tag */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-mono tracking-widest uppercase text-white/90">
                    Grand Book Gate • Main Campus
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded text-white hidden sm:inline">
                    Est. 1978
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Editorial Narrative & Route Action (42% of section) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-wider">
                  04
                </span>
                <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
                  INSTITUTION
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl lg:text-[3.25rem] font-normal tracking-tight text-[#132238] leading-[1.12]">
                Jamia Markaz
              </h2>

              <p className="font-serif text-xl sm:text-2xl text-[#2F7C7A] italic font-normal">
                Karanthur, Kozhikode
              </p>
            </div>

            <div className="h-px w-20 bg-[#2F7C7A]/30" />

            <p className="text-base sm:text-lg text-[#132238]/80 font-normal leading-relaxed">
              Founded in 1978, Jamia Markaz stands as one of the premier Islamic academic and humanitarian institutions in South Asia. As the headquarters and apex authority of MISC, its central campus coordinates integrated curricula, classical dars traditions, and university degree streams for thousands of scholars.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/institutions')}
                className="group inline-flex items-center space-x-3 text-xs sm:text-sm font-semibold tracking-widest text-[#132238] uppercase hover:text-[#2F7C7A] transition-colors cursor-pointer py-2 border-b-2 border-[#132238] hover:border-[#2F7C7A]"
              >
                <span>EXPLORE INSTITUTION</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5 text-[#2F7C7A]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturedInstitutionSection;
