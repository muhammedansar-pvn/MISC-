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
      excerpt: 'Official examination schedules and instruction guidelines published for member institutions across all integrated streams under central board governance.',
      icon: FileText,
      path: '/examination',
      featured: true
    },
    {
      category: 'ACADEMIC CIRCULAR',
      date: 'FEBRUARY 2026',
      title: 'Central Academic Secretariat Announces Unified Syllabus Enhancements',
      excerpt: 'Updated curriculum guidelines harmonizing classical scholarship with contemporary university degree subjects.',
      icon: Bell,
      path: '/academics',
      featured: false
    },
    {
      category: 'PUBLICATIONS',
      date: 'JANUARY 2026',
      title: 'Release of MISC Academic Research Journal & Study Materials',
      excerpt: 'New scholarly journal volume and downloadable academic resource packages available for institutions and faculty.',
      icon: BookOpen,
      path: '/downloads',
      featured: false
    },
  ];

  const featuredNotice = updates.find(item => item.featured) || updates[0];
  const supportingNotices = updates.filter(item => item !== featuredNotice);

  return (
    <section className="bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                CIRCULARS & NOTICES
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Official Directives & Announcements
            </h2>
            <p className="text-sm sm:text-base text-[#475569] font-normal leading-relaxed">
              Official Secretariat circulars, examination board notifications, and academic publications.
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/contact')}
              className="group bg-white hover:border-[#2F7C7A]"
            >
              <span>VIEW ALL ANNOUNCEMENTS</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Featured Notice + Supporting List Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Featured Notice (Cols 1-7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 border border-[#E2E8E0] shadow-sm flex flex-col justify-between group hover:border-[#2F7C7A]/50 transition-all">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#E2E8E0]">
                <span className="text-xs font-bold tracking-wider text-[#2F7C7A] uppercase bg-[#E6F2F1] px-3 py-1 rounded border border-[#E2E8E0]">
                  FEATURED NOTICE • {featuredNotice.category}
                </span>
                <div className="flex items-center space-x-1.5 font-mono text-xs text-[#132238] font-bold">
                  <Calendar className="w-4 h-4 text-[#2F7C7A]" />
                  <span>{featuredNotice.date}</span>
                </div>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-snug mb-4">
                {featuredNotice.title}
              </h3>

              <p className="text-sm sm:text-base text-[#475569] leading-relaxed font-normal mb-8">
                {featuredNotice.excerpt}
              </p>
            </div>

            <div className="pt-6 border-t border-[#E2E8E0] flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">MISC Examination Board • Secretariat</span>
              <button
                onClick={() => navigate(featuredNotice.path)}
                className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] cursor-pointer"
              >
                <span>Read Full Directive</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Supporting Notices Stacked List (Cols 8-12) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {supportingNotices.map((item, index) => (
              <div
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-xl p-6 border border-[#E2E8E0] shadow-2xs hover:shadow-sm hover:border-[#2F7C7A]/50 transition-all cursor-pointer flex flex-col justify-between flex-1 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold tracking-wider text-[#2F7C7A] uppercase bg-[#E6F2F1] px-2.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="font-mono text-xs font-medium text-slate-500">
                      {item.date}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-[#E2E8E0]/80 flex items-center justify-between text-xs text-[#2F7C7A] font-bold uppercase tracking-wider">
                  <span>View Update</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};

export default LatestUpdatesSection;
