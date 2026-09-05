import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ShieldCheck, Award } from 'lucide-react';
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
    }
  }, []);

  const handleVideoError = () => {
    setHasError(true);
    setShouldPlayVideo(false);
  };

  return (
    <section className="relative bg-[#F8FAFC] text-[#172033] py-16 sm:py-20 lg:py-24 border-b border-[#E2E8F0] overflow-hidden min-h-[640px] flex flex-col justify-center">
      
      {/* BACKGROUND CINEMATIC VIDEO LAYER */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#F8FAFC]">
        
        {/* Single Subtle Left-Side Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/30 to-transparent z-10 pointer-events-none" />

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
          <div className="absolute inset-0 w-full h-full bg-[#F8FAFC] z-0">
            {/* Architectural Campus Grid / Vector Pattern Fallback */}
            <div className="w-full h-full bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
          </div>
        )}
      </div>

      {/* MAIN HERO CONTENT */}
      <div className="misc-container relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE — EDITORIAL HERO TYPOGRAPHY & CTAs (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EEF6FF] border border-[#DBEAFE] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
                {miscInfo.parentOrganization}, KARANTHUR
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172033] leading-tight">
              Integrating Islamic Scholarship with <br className="hidden sm:inline" />
              <span className="text-[#2563EB]">Contemporary Knowledge</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-[#64748B] text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
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
                className="bg-white/80 backdrop-blur-xs text-[#172033] border-[#DBEAFE] hover:border-[#2563EB]"
              >
                ABOUT MISC
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE — AT A GLANCE ACADEMIC FRAMEWORK (Cols 8-12) */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 backdrop-blur-sm border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#E2E8F0] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  MISC AT A GLANCE
                </span>
                <h3 className="font-serif text-xl font-bold text-[#172033] mt-1">
                  Academic Framework
                </h3>
              </div>

              {/* Metric Summary Items */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE] mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#172033] block">
                      3 Major Streams
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Alim, Secondary & Higher Secondary Integrated Streams
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE] mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#172033] block">
                      Central Evaluation
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Unified Examination Board & Syllabus Guidelines
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EEF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE] mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#172033] block">
                      Direct & Collaborating
                    </span>
                    <span className="text-xs text-[#64748B]">
                      Campus Institutions & Collaborating Centers Network
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span>Central Secretariat</span>
                <span className="text-[#2563EB] font-semibold">Jamia Markaz</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4-STAT METRIC BAR BELOW HERO */}
        <div className="mt-14 pt-10 border-t border-[#E2E8F0] grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0]">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#172033]">3+</div>
            <div className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wider">Integrated Streams</div>
          </div>
          <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0]">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#172033]">Unified</div>
            <div className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wider">Examination Board</div>
          </div>
          <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0]">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#172033]">Multi-Campus</div>
            <div className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wider">Institution Network</div>
          </div>
          <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-[#E2E8F0]">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#172033]">Karanthur</div>
            <div className="text-xs text-[#64748B] font-medium mt-1 uppercase tracking-wider">Jamia Markaz HQ</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
