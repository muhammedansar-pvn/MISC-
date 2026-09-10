import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';
import Button from '../common/Button';
import { academicPillarsData } from '../../data/academicPillarsData';
import { miscInfo } from '../../data/miscInfo';

export const AcademicPillars = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-24 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              VISION & MISSION
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238] tracking-tight leading-tight">
            Vision & Mission Framework
          </h2>
          <p className="text-base text-[#475569]">
            Official institutional Vision and Mission of Markaz Integrated Studies Council.
          </p>
        </div>

        {/* 2-Column Layout: Left Vision Blockquote, Right 8 Numbered Mission Points */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: VISION STATEMENT BLOCKQUOTE */}
          <div className="lg:col-span-5 bg-[#F7F8F5] border border-[#E2E8E0] rounded-xl p-8 shadow-xs space-y-6 lg:sticky lg:top-24">
            <div className="w-10 h-10 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0]">
              <Quote className="w-5 h-5" />
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider">
                VISION
              </span>
              <blockquote className="font-serif text-lg sm:text-xl font-semibold text-[#132238] leading-relaxed italic border-l-4 border-[#2F7C7A] pl-4">
                "{miscInfo.vision}"
              </blockquote>
            </div>

            <p className="text-sm text-[#475569] leading-relaxed border-t border-[#E2E8E0] pt-4">
              Under the auspices of Jamia Markaz, MISC establishes a standardized framework for integrated higher education.
            </p>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/about')}
              className="w-full justify-between group mt-2"
            >
              <span>EXPLORE ABOUT MISC</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* RIGHT: 8 NUMBERED MISSION ITEMS (01-08) */}
          <ol className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
            {academicPillarsData.map((pillar) => (
              <li
                key={pillar.id || pillar.number}
                className="bg-[#F7F8F5] p-5 rounded-xl border border-[#E2E8E0] hover:border-[#2F7C7A]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-2.5">
                    <span className="font-serif text-sm font-bold text-[#2F7C7A] tracking-wider">
                      {String(pillar.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#475569]">
                      MISSION POINT
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-[#132238]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

        </div>

      </div>
    </section>
  );
};

export default AcademicPillars;
