import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const DownloadsHero = () => {
  const scrollToGateway = () => {
    const el = document.getElementById('resource-gateway');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#132238] text-white py-16 sm:py-24 border-b border-[#2F7C7A]/30 overflow-hidden min-h-[440px] flex items-center">
      {/* Background aerial image with dark overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/markaz-drone.jpg (1).jpeg"
          alt="Jamia Markaz Aerial Campus View"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#132238] via-[#132238]/90 to-[#132238]/70" />
      </div>

      <div className="misc-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Title & Description */}
          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-widest text-[#E6F2F1] uppercase">
                RESOURCE CENTRE
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Resources & <br className="hidden sm:inline" />
              <span className="text-[#2F7C7A]">Academic Documents</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              Official Markaz Integrated Studies Council academic resources, institutional manuals, syllabus regulations, and public information circulars.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToGateway}
                className="group shadow-md"
              >
                <span>EXPLORE RESOURCES</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right: Institutional Brand Quote Card */}
          <div className="lg:col-span-4 hidden lg:flex justify-end">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-8 max-w-xs text-right space-y-3">
              <span className="text-3xl font-serif text-[#2F7C7A] block leading-none">“</span>
              <p className="font-serif text-xl italic font-semibold text-white leading-snug">
                Knowledge Organizes. <br />
                Institutions Thrive.
              </p>
              <span className="text-xs uppercase font-bold tracking-widest text-[#2F7C7A] block">
                — MISC SECRETARIAT
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DownloadsHero;
