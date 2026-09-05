import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const HeroSection = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // State for video playback & accessibility reduced motion check
  const [shouldPlayVideo, setShouldPlayVideo] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldPlayVideo(false);
      return;
    }

    const videoEl = videoRef.current;
    if (videoEl) {
      if (videoEl.readyState >= 2) {
        setIsVideoLoaded(true);
      }
      videoEl.play().catch(() => {
        if (videoEl) {
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        }
      });
    }
  }, [shouldPlayVideo]);

  const handleVideoError = () => {
    setHasError(true);
    setShouldPlayVideo(false);
  };

  return (
    <section className="relative bg-[#F7F8F5] text-[#132238] py-16 sm:py-20 lg:py-24 border-b border-[#E2E8E0] overflow-hidden min-h-[760px] lg:min-h-[85vh] flex flex-col justify-center">
      
      {/* BACKGROUND CINEMATIC VIDEO LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#F7F8F5]">
        
        {/* Single Subtle Left-Side Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 w-full lg:w-2/3 bg-gradient-to-r from-[#F7F8F5]/80 via-[#F7F8F5]/30 to-transparent z-10 pointer-events-none" />

        {/* Video Element — Clear, 100% Opacity Campus Footage */}
        {shouldPlayVideo && !hasError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
            onLoadedData={() => setIsVideoLoaded(true)}
            onCanPlay={() => setIsVideoLoaded(true)}
            onLoadedMetadata={() => setIsVideoLoaded(true)}
            onError={handleVideoError}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src="/Markaz Foundation Day - Empowering Generations Since 1978..mp4" type="video/mp4" />
          </video>
        ) : null}

        {/* Fallback Poster Background (when video fails, slow network, or reduced motion) */}
        {(!shouldPlayVideo || hasError || !isVideoLoaded) && (
          <div className="absolute inset-0 w-full h-full bg-[#F7F8F5] z-0">
            {/* Architectural Campus Grid / Vector Pattern Fallback */}
            <div className="w-full h-full bg-[radial-gradient(#2F7C7A_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          </div>
        )}
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="misc-container relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE — EDITORIAL HERO TYPOGRAPHY & CTAs */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-6">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                {miscInfo.parentOrganization}, KARANTHUR
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[#132238] leading-[1.12]">
              Integrating Islamic Scholarship with <br className="hidden sm:inline" />
              <span className="text-[#2F7C7A]">Contemporary Knowledge</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-[#475569] text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              {miscInfo.aboutShort}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/academics')}
                className="group shadow-sm"
              >
                <span>EXPLORE PROGRAMMES</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/about')}
                className="bg-white/85 backdrop-blur-sm text-[#132238] border-[#E2E8E0] hover:border-[#2F7C7A]"
              >
                ABOUT MISC
              </Button>
            </div>
          </div>

        </div>

        {/* UNIFIED STATISTICS PANEL BELOW HERO */}
        <div className="mt-14 pt-8 border-t border-[#E2E8E0]/80">
          <div className="bg-white/85 backdrop-blur-sm border border-[#E2E8E0] rounded-xl shadow-2xs overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8E0]">
            <div className="p-5 sm:p-6 text-left">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#132238]">3+</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Integrated Streams</div>
            </div>
            <div className="p-5 sm:p-6 text-left">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#132238]">Unified</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Examination Board</div>
            </div>
            <div className="p-5 sm:p-6 text-left">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#132238]">Multi-Campus</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Institution Network</div>
            </div>
            <div className="p-5 sm:p-6 text-left">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#132238]">Karanthur</div>
              <div className="text-xs text-[#475569] font-semibold mt-1 uppercase tracking-wider">Jamia Markaz HQ</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
