'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#132238] text-white py-28 sm:py-36 lg:py-40 overflow-hidden border-t border-slate-800">
      {/* Subtle Architectural Drone Imagery Background with High-End Blend */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/markaz-drone.jpg (1).jpeg"
          alt="Jamia Markaz Sprawling Campus at Karanthur"
          className="w-full h-full object-cover object-center opacity-15 filter grayscale contrast-125 scale-105"
        />
        {/* Dark Navy Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1726] via-[#132238]/85 to-[#0d1726]" />
      </div>

      <div className="misc-container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-3">
            <span className="h-px w-8 bg-[#2F7C7A]" />
            <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#E6F2F1] uppercase">
              ACADEMIC COUNCIL
            </span>
            <span className="h-px w-8 bg-[#2F7C7A]" />
          </div>

          {/* Large Statement */}
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight leading-[1.12] text-white">
            Explore the academic <br className="hidden sm:inline" />
            <span className="italic text-[#2F7C7A]">world of MISC.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Connect with the central Secretariat to discover curriculum frameworks, affiliation pathways, examinations, and integrated academic streams.
          </p>

          {/* Editorial CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => navigate('/academics')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#2F7C7A] hover:bg-[#256664] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase px-8 py-4 rounded transition-all duration-200 cursor-pointer shadow-sm hover:translate-x-0.5 group"
            >
              <span>EXPLORE ACADEMICS</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 text-xs sm:text-sm font-semibold tracking-wider uppercase px-8 py-4 rounded backdrop-blur-xs transition-all duration-200 cursor-pointer group"
            >
              <span>CONTACT SECRETARIAT</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-slate-300" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
