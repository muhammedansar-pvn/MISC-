import React from 'react';
import { BookOpen, ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export const PublicationsOverview = () => {
  const navigate = useNavigate();

  const publications = [
    {
      category: "ISLAMIC JURISPRUDENCE",
      title: "Synthesizing Classical Fiqh Principles with Modern Administrative Law",
      author: "MISC Academic Research Cell",
      date: "August 2026",
      snippet: "An analytical study on the contemporary application of Usul al-Fiqh in institutional governance."
    },
    {
      category: "INTEGRATED PEDAGOGY",
      title: "Curriculum Synergy: Islamic Scholarship in University Higher Education",
      author: "Jamia Markaz Faculty Board",
      date: "July 2026",
      snippet: "Evaluating dual-track curriculum models and academic outcomes across affiliated campuses."
    },
    {
      category: "HERITAGE & METHODOLOGY",
      title: "The Legacy of Traditional Dars Curriculum in Contemporary Contexts",
      author: "Secretariat Research Wing",
      date: "June 2026",
      snippet: "Documenting the historical evolution and modern relevance of Markaz integrated study modules."
    }
  ];

  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-24 border-b border-[#E5EAF0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              FROM THE JOURNAL
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            Academic Research & Scholarly Publications
          </h2>

          <p className="text-base text-[#4B5563]">
            Peer-reviewed research papers, journal articles, and curriculum monographs issued by MISC research wings.
          </p>
        </div>

        {/* 3 Journal Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publications.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-xl border border-[#E5EAF0] shadow-xs hover:border-[#3B82F6]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-wider text-[#2563EB] bg-[#EAF4FF] border border-[#DCEEFF] px-2.5 py-1 rounded-full uppercase inline-block">
                  {item.category}
                </span>

                <h3 className="font-serif text-lg font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E5EAF0] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-[#2563EB]" />
                    <span>{item.author}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-[#6B7280]" />
                    <span>{item.date}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PublicationsOverview;
