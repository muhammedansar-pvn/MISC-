'use client';

import React from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight, ArrowDown } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#0D1B2A] text-white">
      
      {/* SCOPED ENTRANCE ANIMATION & PARALLAX STYLES */}
      <style>{`
        @keyframes heroFadeUp {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .hero-reveal-eyebrow {
          animation: heroFadeUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .hero-reveal-title-1 {
          animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.22s both;
        }

        .hero-reveal-title-2 {
          animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.34s both;
        }

        .hero-reveal-desc {
          animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.46s both;
        }

        .hero-reveal-buttons {
          animation: heroFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.58s both;
        }

        .hero-reveal-quote {
          animation: heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
        }

        .hero-reveal-stats {
          animation: heroFadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-reveal-eyebrow,
          .hero-reveal-title-1,
          .hero-reveal-title-2,
          .hero-reveal-desc,
          .hero-reveal-buttons,
          .hero-reveal-quote,
          .hero-reveal-stats {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* 1. CINEMATIC FULL-VIEWPORT REAL STUDENT-STUDY PHOTOGRAPH */}
      {/* Students and their faces on the RIGHT remain bright, sharp, and natural */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0D1B2A]">
        <img
          src="/DSC00390.JPG.jpeg"
          alt="Scholars studying classical texts in Jamia Markaz library"
          className="h-full w-full object-cover object-[65%_35%] sm:object-[68%_36%] lg:object-[70%_38%]"
        />

        {/* Left-only text readability gradient (becomes completely transparent before reaching students' faces) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/65 via-[38%] to-transparent pointer-events-none" />

        {/* Subtle bottom gradient for statistics readability without darkening faces */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/65 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Header Clearance Spacer */}
      <div className="pt-24 sm:pt-28 lg:pt-32" />

      {/* 2. MAIN HERO BODY (Left Content + Right Subtle Floating Quote) */}
      <div className="misc-container relative z-10 my-auto py-6 sm:py-8 lg:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE CONTENT: Occupies approximately 50% of the hero width */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-8 max-w-2xl lg:max-w-none">
            
            {/* Small Eyebrow with Thin Teal Horizontal Line Beside It */}
            <div className="flex items-center space-x-3.5 hero-reveal-eyebrow">
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#F7F5EF] uppercase font-medium">
                MARKAZ INTEGRATED STUDIES COUNCIL
              </span>
              <span className="h-[1.5px] w-12 sm:w-16 bg-[#2F7C7A] shrink-0" />
            </div>

            {/* Main Editorial Headline (72–96px on desktop, line height 0.95–1.0, medium weight) */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="font-serif text-[44px] sm:text-[62px] md:text-[72px] lg:text-[78px] xl:text-[88px] 2xl:text-[94px] font-normal tracking-[-0.025em] leading-[0.98] text-[#FFFFFF]">
                <span className="block hero-reveal-title-1">
                  Integrating
                </span>
                <span className="block hero-reveal-title-1">
                  Islamic Scholarship
                </span>
                <span className="block hero-reveal-title-2">
                  with <span className="text-[#2F7C7A] italic font-normal">Contemporary</span>
                </span>
                <span className="block hero-reveal-title-2 text-[#2F7C7A] italic font-normal">
                  Knowledge
                </span>
              </h1>
            </div>

            {/* Description (approx 2 lines, 17–19px, soft/warm white) */}
            <p className="text-[16px] sm:text-[18px] lg:text-[19px] text-[#F7F5EF]/90 font-normal leading-relaxed max-w-xl hero-reveal-desc">
              An academic network harmonizing classical Islamic scholarship with contemporary knowledge for a better tomorrow.
            </p>

            {/* CTA Buttons: Rectangular with small border radius, NO pill shapes */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 hero-reveal-buttons">
              <button
                type="button"
                onClick={() => navigate('/academics')}
                className="inline-flex items-center justify-center space-x-2 bg-[#2F7C7A] hover:bg-[#256664] text-white text-xs sm:text-[13px] font-semibold tracking-wider uppercase px-7 py-3.5 rounded-xs transition-all duration-200 cursor-pointer shadow-sm hover:translate-x-0.5 group"
              >
                <span>EXPLORE PROGRAMMES</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/about')}
                className="inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-white/10 text-[#F7F5EF] border border-white/40 hover:border-white text-xs sm:text-[13px] font-semibold tracking-wider uppercase px-7 py-3.5 rounded-xs backdrop-blur-2xs transition-all duration-200 cursor-pointer group"
              >
                <span>DISCOVER MISC</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-slate-300" />
              </button>
            </div>

          </div>

          {/* FAR RIGHT SIDE: Subtle Vertical Quote (Non-competing, visible on large screens) */}
          <div className="hidden lg:flex lg:col-span-5 justify-end hero-reveal-quote">
            <div className="border-l border-white/20 pl-6 space-y-3 max-w-xs backdrop-blur-2xs py-2 bg-black/10 rounded-xs">
              <blockquote className="font-serif italic text-base lg:text-[1.1rem] xl:text-[1.2rem] text-[#F7F5EF]/80 leading-snug">
                “Knowledge <br />
                People <br />
                Communities <br />
                A Brighter <br />
                Tomorrow”
              </blockquote>
              <div className="pt-2 border-t border-white/10">
                <span className="font-mono text-[9.5px] tracking-[0.25em] text-[#F7F5EF]/60 uppercase block">
                  JAMIA MARKAZ
                </span>
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#2F7C7A] uppercase block font-semibold">
                  KARANTHUR
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM STATISTICS RAIL & SCROLL INDICATOR */}
      {/* NO CARDS. NO ROUNDED BOXES. Thin vertical separators. */}
      <div className="relative z-10 w-full border-t border-white/15 bg-[#0D1B2A]/85 backdrop-blur-sm hero-reveal-stats">
        <div className="misc-container py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Horizontal Statistics Rail */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x lg:divide-white/15 w-full lg:w-auto flex-1">
              
              <div className="lg:pr-8 xl:pr-10">
                <div className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-none text-white">
                  50<span className="text-[#2F7C7A]">+</span>
                </div>
                <div className="text-[11px] sm:text-[12px] font-mono tracking-[0.12em] text-[#F7F5EF]/80 uppercase mt-2">
                  AFFILIATED INSTITUTIONS
                </div>
              </div>

              <div className="lg:px-8 xl:px-10">
                <div className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-none text-white">
                  20<span className="text-[#2F7C7A]">+</span>
                </div>
                <div className="text-[11px] sm:text-[12px] font-mono tracking-[0.12em] text-[#F7F5EF]/80 uppercase mt-2">
                  ACADEMIC PROGRAMMES
                </div>
              </div>

              <div className="lg:px-8 xl:px-10">
                <div className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-none text-white">
                  10K<span className="text-[#2F7C7A]">+</span>
                </div>
                <div className="text-[11px] sm:text-[12px] font-mono tracking-[0.12em] text-[#F7F5EF]/80 uppercase mt-2">
                  STUDENTS & SCHOLARS
                </div>
              </div>

              <div className="lg:pl-8 xl:pl-10">
                <div className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-none text-white">
                  4<span className="text-[#2F7C7A]">+</span> DECADES
                </div>
                <div className="text-[11px] sm:text-[12px] font-mono tracking-[0.12em] text-[#F7F5EF]/80 uppercase mt-2">
                  OF ACADEMIC SERVICE
                </div>
              </div>

            </div>

            {/* Bottom-Right Minimal Scroll Indicator */}
            <div className="hidden lg:flex items-center space-x-3 text-[#F7F5EF]/80 hover:text-white transition-colors shrink-0 pl-6">
              <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-[#2F7C7A] group-hover:border-[#2F7C7A] transition-colors">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <div className="text-left font-mono text-[9px] tracking-[0.2em] leading-tight uppercase">
                SCROLL <br />
                <span className="text-[#2F7C7A]">TO EXPLORE</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
