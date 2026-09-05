import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const EventsOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              NOTICES & ANNOUNCEMENTS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Events & Important Updates
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Official announcements, academic notices, examination schedules, and Secretariat directives for member institutions.
          </p>
        </div>

        {/* Official Directory Notice Panel */}
        <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 sm:p-12 shadow-2xs text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E6F2F1] border border-[#2F7C7A]/40 flex items-center justify-center text-[#2F7C7A]">
            <Bell className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#132238] text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              SECRETARIAT DIRECTIVE
            </span>

            <h3 className="font-serif text-2xl font-bold text-[#132238]">
              Official Notices & Academic Circulars
            </h3>

            <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
              Official announcements, examination schedules, and academic circulars will be published here by the MISC Secretariat.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8E0]/80 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="miscBlue"
              size="md"
              onClick={() => navigate('/contact')}
              className="group"
            >
              <span>CONTACT SECRETARIAT</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsOverview;
