import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F8F5] text-[#132238] py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0] overflow-hidden min-h-[680px] lg:min-h-[80vh] flex flex-col justify-center">
      
      {/* SCOPED HERO MOTION & REDUCED MOTION STYLES */}
      <style>{`
        @keyframes heroKenBurns {
          0% { transform: scale(1.00); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1.00); }
        }

        @keyframes heroFadeUp {
          0% {
            opacity: 0;
            transform: translateY(var(--fade-y, 16px));
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-hero-kenburns {
          animation: heroKenBurns 26s ease-in-out infinite;
          will-change: transform;
        }

        .animate-hero-fade-up {
          opacity: 0;
          animation: heroFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (max-width: 640px) {
          .animate-hero-kenburns {
            animation-duration: 30s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-hero-kenburns {
            animation: none !important;
            transform: scale(1) !important;
          }
          .animate-hero-fade-up {
            opacity: 1 !important;
            transform: translateY(0) !important;
            animation: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND HERO IMAGE LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#F7F8F5]">
        
        {/* High-Resolution Real Campus Aerial Background Image with Slow Subtle Ken Burns */}
        <img
          src="/markaz-drone.jpg (1).jpeg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center animate-hero-kenburns"
        />

        {/* Single Subtle Left-Side Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 w-full lg:w-2/3 bg-gradient-to-r from-[#F7F8F5] via-[#F7F8F5]/65 to-transparent z-10 pointer-events-none" />
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="misc-container relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE — EDITORIAL HERO TYPOGRAPHY & CTAs */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-6">
            
            {/* 1. Eyebrow Badge */}
            <div 
              className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0] shadow-2xs animate-hero-fade-up"
              style={{ '--fade-y': '12px', animationDelay: '0ms' }}
            >
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                {miscInfo.parentOrganization}, KARANTHUR
              </span>
            </div>

            {/* 2. Main Headline */}
            <h1 
              className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-[#132238] leading-[1.14] animate-hero-fade-up"
              style={{ '--fade-y': '20px', animationDelay: '150ms' }}
            >
              Integrating Islamic Scholarship with <br className="hidden sm:inline" />
              <span className="text-[#2F7C7A]">Contemporary Knowledge</span>
            </h1>

            {/* 3. Supporting Subtitle */}
            <p 
              className="text-[#475569] text-base sm:text-lg font-normal leading-relaxed max-w-2xl animate-hero-fade-up"
              style={{ '--fade-y': '16px', animationDelay: '300ms' }}
            >
              {miscInfo.aboutShort}
            </p>

            {/* 4. Call to Action Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 animate-hero-fade-up"
              style={{ '--fade-y': '12px', animationDelay: '450ms' }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/academics')}
                className="group shadow-sm hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>EXPLORE PROGRAMMES</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/about')}
                className="bg-white/85 backdrop-blur-sm text-[#132238] border-[#E2E8E0] hover:border-[#2F7C7A] hover:-translate-y-0.5 transition-all duration-300"
              >
                ABOUT MISC
              </Button>
            </div>
          </div>

        </div>

        {/* UNIFIED STATISTICS PANEL BELOW HERO */}
        <div 
          className="mt-12 pt-6 border-t border-[#E2E8E0]/80 animate-hero-fade-up"
          style={{ '--fade-y': '16px', animationDelay: '600ms' }}
        >
          <div className="bg-white/85 backdrop-blur-sm border border-[#E2E8E0] rounded-xl shadow-2xs overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8E0]">
            <div className="p-4 sm:p-5 text-left">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#132238]">Integrated</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Academic Streams</div>
            </div>
            <div className="p-4 sm:p-5 text-left">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#132238]">Unified</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Examination Board</div>
            </div>
            <div className="p-4 sm:p-5 text-left">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#132238]">Network</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Institution Network</div>
            </div>
            <div className="p-4 sm:p-5 text-left">
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#132238]">Karanthur</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Jamia Markaz HQ</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
