import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ShieldCheck, Award } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE — HERO TEXT CONTENT (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Eyebrow Label with Gold Accent Line */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                {miscInfo.parentOrganization}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Integrating Islamic & <br className="hidden sm:inline" />
              <span className="text-[#D4AF37]">Contemporary Education</span>
            </h1>

            {/* Supporting Subtitle */}
            <p className="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-2xl">
              {miscInfo.aboutShort}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="miscBlue"
                size="lg"
                onClick={() => navigate('/academics')}
                className="group"
              >
                <span>EXPLORE PROGRAMMES</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outlineLight"
                size="lg"
                onClick={() => navigate('/about')}
              >
                ABOUT MISC
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE — AT A GLANCE PANEL (Cols 8-12) */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 backdrop-blur-xs shadow-lg space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  MISC AT A GLANCE
                </span>
                <h3 className="font-serif text-xl font-bold text-white mt-1">
                  Academic Framework
                </h3>
              </div>

              {/* 3 Metric Summary Items */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      3 Major Streams
                    </span>
                    <span className="text-xs text-slate-300 font-light">
                      Alim, Secondary & Higher Secondary Integrated Streams
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Central Evaluation
                    </span>
                    <span className="text-xs text-slate-300 font-light">
                      Unified Examination Board & Syllabus Guidelines
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/30 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Direct & Collaborating
                    </span>
                    <span className="text-xs text-slate-300 font-light">
                      Campus Institutions & Collaborating Centers Network
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>Central Secretariat</span>
                <span className="text-[#D4AF37] font-semibold">Jamia Markaz</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
