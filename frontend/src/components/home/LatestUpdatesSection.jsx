import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, FileText, Bell, BookOpen } from 'lucide-react';
import Button from '../common/Button';

export const LatestUpdatesSection = () => {
  const navigate = useNavigate();

  const updates = [
    {
      category: 'EXAMINATION BOARD',
      date: 'MARCH 2026',
      title: 'Annual Board Examination Timetable & Regulations Released',
      excerpt: 'Official examination schedules and instruction guidelines published for member institutions across all integrated streams.',
      icon: FileText,
      path: '/examination',
    },
    {
      category: 'ACADEMIC CIRCULAR',
      date: 'FEBRUARY 2026',
      title: 'Central Academic Secretariat Announces Unified Syllabus Enhancements',
      excerpt: 'Updated curriculum guidelines harmonizing classical scholarship with contemporary university degree subjects.',
      icon: Bell,
      path: '/academics',
    },
    {
      category: 'PUBLICATIONS',
      date: 'JANUARY 2026',
      title: 'Release of MISC Academic Research Journal & Study Materials',
      excerpt: 'New scholarly journal volume and downloadable academic resource packages available for institutions and faculty.',
      icon: BookOpen,
      path: '/downloads',
    },
  ];

  return (
    <section className="bg-[#F7F8F5] py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                LATEST UPDATES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Notices & Academic Circulars
            </h2>
            <p className="text-[15.5px] sm:text-[16.5px] text-[#475569] font-normal leading-relaxed">
              Official directives, examination announcements, and Secretariat circulars.
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/contact')}
              className="group bg-white"
            >
              <span>VIEW ALL UPDATES</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* 3 Featured Updates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {updates.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#E2E8E0] shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#475569] pb-4 mb-4 border-b border-[#E2E8E0]/80">
                    <span className="text-[10px] font-bold tracking-wider text-[#2F7C7A] uppercase bg-[#E6F2F1] px-2.5 py-1 rounded">
                      {item.category}
                    </span>
                    <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#2F7C7A]" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-snug mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-[14.5px] text-[#475569] leading-relaxed font-normal mb-6">
                    {item.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E8E0]/80">
                  <button
                    onClick={() => navigate(item.path)}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default LatestUpdatesSection;
