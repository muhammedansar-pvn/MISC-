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
    <section className="relative bg-[#F7F8F5] py-16 sm:py-24 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header with Visual Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                FROM THE JOURNAL
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238] tracking-tight leading-tight">
              Academic Research & Scholarly Publications
            </h2>

            <p className="text-base text-[#475569]">
              Peer-reviewed research papers, journal articles, and curriculum monographs issued by MISC research wings.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-[#E2E8E0] shadow-sm bg-white p-2">
              <img
                src="/MKZ01377.JPG.jpeg"
                alt="MISC Scholars conducting manuscript research in library"
                className="w-full h-56 sm:h-64 object-cover object-center rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 3 Journal Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publications.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 rounded-xl border border-[#E2E8E0] shadow-xs hover:border-[#2F7C7A]/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-semibold tracking-wider text-[#2F7C7A] bg-[#E6F2F1] border border-[#E2E8E0] px-2.5 py-1 rounded-full uppercase inline-block">
                  {item.category}
                </span>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#132238] group-hover:text-[#2F7C7A] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-[#475569] font-normal leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E2E8E0] space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#475569]">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-[#2F7C7A]" />
                    <span>{item.author}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#475569]" />
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
