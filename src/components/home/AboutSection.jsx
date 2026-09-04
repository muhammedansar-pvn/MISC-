import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Award } from 'lucide-react';
import Button from '../common/Button';

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT SIDE — EDITORIAL CARD Visual CONTAINER (Cols 1-6) */}
          <div className="lg:col-span-6 z-10">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-md">
              {/* Main Visual Image / Graphic Container */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-[#0B1D3A] via-[#145DA0] to-[#091E3A] flex items-center justify-center p-8 text-white overflow-hidden">
                <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-serif text-2xl font-bold text-white tracking-wide block">
                      Markaz Integrated Studies Council
                    </span>
                    <span className="text-xs text-[#D4AF37] font-medium uppercase tracking-widest block">
                      ESTABLISHED UNDER JAMIA MARKAZ
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    Unifying Islamic jurisprudence, university disciplines, and moral leadership across campuses.
                  </p>
                </div>
              </div>

              {/* Decorative Accent Badge */}
              <div className="absolute bottom-4 right-4 z-20">
                <div className="bg-[#0B1D3A] text-white border border-[#D4AF37]/50 rounded px-3.5 py-2 shadow-lg flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                    ACADEMIC SECRETARIAT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — TEXT CONTENT & SRS PURPOSE (Cols 7-12) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            {/* Eyebrow */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                ABOUT MISC
              </span>
            </div>

            {/* Section Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
              Fostering Spiritual Depth & Academic Rigor
            </h2>

            {/* Body Copy */}
            <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Markaz Integrated Studies Council (MISC) serves as the central academic coordinating council of Jamia Markaz, responsible for designing, standardizing, and supervising integrated educational curricula across member institutions.
              </p>
              <p className="text-sm sm:text-base text-slate-500">
                By bridging classical Islamic scholarship with modern academic frameworks, MISC empowers students to excel in contemporary disciplines while remaining deeply rooted in Islamic values.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-3 p-3.5 rounded bg-slate-50 border border-slate-200">
                <Compass className="w-5 h-5 text-[#145DA0] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#0B1D3A]">
                    Integrated Curricula
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Unified Islamic jurisprudence & contemporary university subjects
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded bg-slate-50 border border-slate-200">
                <Award className="w-5 h-5 text-[#145DA0] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#0B1D3A]">
                    Board Moderation
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized examination guidelines and quality control
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/about')}
                className="group"
              >
                <span>READ FULL ABOUT MISC</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
