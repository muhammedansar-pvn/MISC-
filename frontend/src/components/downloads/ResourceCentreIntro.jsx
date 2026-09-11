import React from 'react';
import { BookOpen, FileText, FileCheck, Calendar, GraduationCap, Folder, ArrowRight } from 'lucide-react';

export const ResourceCentreIntro = () => {
  const categories = [
    { title: 'Academic Guidelines', icon: BookOpen, targetId: 'academic-documents' },
    { title: 'Syllabus Regulations', icon: FileText, targetId: 'academic-documents' },
    { title: 'Secretariat Circulars', icon: FileCheck, targetId: 'examination-documents' },
    { title: 'Academic Calendar', icon: Calendar, targetId: 'academic-documents' },
    { title: 'Research Publications', icon: GraduationCap, targetId: 'academic-documents' },
    { title: 'Other Resources', icon: Folder, targetId: 'examination-documents' },
  ];

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="resource-gateway" className="relative bg-white py-12 sm:py-16 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#E2E8E0]">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                QUICK ACCESS
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#132238]">
              Resource Gateway
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-[#475569] font-medium">
            Direct access to key resource categories
          </span>
        </div>

        {/* 6 Category Gateway Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleScroll(cat.targetId)}
                className="group bg-[#F7F8F5] hover:bg-[#E6F2F1] border border-[#E2E8E0] hover:border-[#2F7C7A]/40 rounded-xl p-4 sm:p-5 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-full shadow-2xs"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <IconComponent className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-snug">
                    {cat.title}
                  </h3>
                </div>
                <div className="pt-3 mt-3 border-t border-[#E2E8E0]/60 flex items-center justify-end">
                  <ArrowRight className="w-3.5 h-3.5 text-[#475569] group-hover:text-[#2F7C7A] group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ResourceCentreIntro;
