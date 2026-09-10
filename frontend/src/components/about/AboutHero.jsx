import React from 'react';
import { miscInfo } from '../../data/miscInfo';

export const AboutHero = () => {
  return (
    <section className="relative bg-white text-[#132238] py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              ABOUT MISC
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#132238] leading-tight">
            About MISC
          </h1>

          {/* Supporting Copy */}
          <div className="space-y-4 text-[#475569] text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
            <p>
              Markaz Integrated Studies Council (MISC) is the academic coordination body of Jamia Markaz, established to integrate and oversee institutions and dars systems functioning directly under Jamia Markaz as well as those operating through academic collaboration. MISC provides a unified educational framework that combines Islamic scholarship, modern education, skill development, and character formation.
            </p>
            <p>
              Through a centralized system of curriculum design, teacher training, examinations, quality assurance, and student development programs, MISC ensures academic excellence and holistic growth across all affiliated institutions. The council is committed to nurturing knowledgeable, competent, and socially responsible graduates who can contribute meaningfully to their communities and the wider world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
