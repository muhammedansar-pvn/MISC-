import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileCheck2, Download, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';

export const ImportantResourcesSection = () => {
  const navigate = useNavigate();

  const academicResources = [
    { title: 'Academic Calendar', path: '/downloads' },
    { title: 'Integrated Stream Syllabi', path: '/academics' },
    { title: 'Journals & Research Publications', path: '/downloads' },
    { title: 'Official Forms & Application Downloads', path: '/downloads' },
  ];

  const examResources = [
    { title: 'Central Exam Registration', path: '/examination' },
    { title: 'Hall Ticket Verification Portal', path: '/examination' },
    { title: 'Syllabus & Examination Portion Guidelines', path: '/examination' },
    { title: 'Timetable Scheduling & Board Results', path: '/examination' },
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
                RESOURCE GATEWAY
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Essential Resources & Portals
            </h2>
            <p className="text-base text-[#475569] font-normal leading-relaxed">
              Quick access to syllabus guidelines, examination board schedules, and official downloadable documentation.
            </p>
          </div>
        </div>

        {/* 2 Grouped Gateway Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Column 1: Academic & Publication Resources */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8E0] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E2E8E0]">
                <div className="w-10 h-10 rounded-xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0] shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#132238]">
                    Academic & Publications
                  </h3>
                  <span className="text-xs text-[#475569]">Curriculum & Downloadable Material</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {academicResources.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-3.5 rounded-lg bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0]/70 hover:border-[#2F7C7A]/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-[#2F7C7A] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#475569] group-hover:text-[#2F7C7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8E0]">
              <button
                onClick={() => navigate('/downloads')}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] cursor-pointer"
              >
                <span>OPEN RESOURCE CENTRE</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

          {/* Column 2: Examination & Board Portals */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8E0] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E2E8E0]">
                <div className="w-10 h-10 rounded-xl bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0] shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#132238]">
                    Examination & Board Portals
                  </h3>
                  <span className="text-xs text-[#475569]">Evaluations & Results Governance</span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {examResources.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-3.5 rounded-lg bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0]/70 hover:border-[#2F7C7A]/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-[#2F7C7A] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-[#132238] group-hover:text-[#2F7C7A] transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#475569] group-hover:text-[#2F7C7A] group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8E0]">
              <button
                onClick={() => navigate('/examination')}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] cursor-pointer"
              >
                <span>OPEN EXAMINATION BOARD</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ImportantResourcesSection;
