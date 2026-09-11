import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Calendar, ShieldCheck, ChevronRight, ArrowRight } from 'lucide-react';

export const AcademicResourcesSection = () => {
  const navigate = useNavigate();

  const academicDocs = [
    {
      title: 'Manual for Collaborating Institutions',
      description: 'Official guidelines and governance standards for affiliated institutions.',
      type: 'Official Manual',
      icon: BookOpen,
      path: '/contact'
    },
    {
      title: 'Integrated Syllabus Regulations',
      description: 'Curriculum framework harmonizing classical scholarship with university subjects.',
      type: 'Regulation',
      icon: FileText,
      path: '/academics'
    },
    {
      title: 'Academic Guidelines',
      description: 'Policies, credit requirements, and academic standards.',
      type: 'Guideline',
      icon: ShieldCheck,
      path: '/academics'
    },
    {
      title: 'Academic Calendar',
      description: 'Important academic dates, term schedules, and examination periods.',
      type: 'Calendar',
      icon: Calendar,
      path: '/academics'
    }
  ];

  return (
    <section id="academic-documents" className="relative bg-white py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#E2E8E0]">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                ACADEMIC RESOURCES
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#132238]">
              Academic Documents
            </h2>
          </div>
          <button
            onClick={() => navigate('/academics')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] cursor-pointer"
          >
            <span>View all academic documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clean List Rows */}
        <div className="space-y-3">
          {academicDocs.map((doc, idx) => {
            const IconComp = doc.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(doc.path)}
                className="group bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0]/80 hover:border-[#2F7C7A]/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-start sm:items-center space-x-4">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-tight">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-[#475569] font-normal mt-0.5 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 border-t sm:border-t-0 border-[#E2E8E0]/60 pt-2 sm:pt-0">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#2F7C7A] bg-white px-2.5 py-1 rounded border border-[#E2E8E0]">
                    {doc.type}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#2F7C7A] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AcademicResourcesSection;
