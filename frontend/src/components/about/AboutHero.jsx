import React from 'react';
import { miscInfo } from '../../data/miscInfo';

export const AboutHero = () => {
  return (
    <section className="relative bg-white text-misc-text py-14 sm:py-18 border-b border-misc-border">
      <div className="misc-container">
        <div className="max-w-4xl space-y-4">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-misc-soft-blue border border-misc-border">
            <span className="w-2 h-2 rounded-full bg-misc-primary" />
            <span className="text-xs font-semibold tracking-wider text-misc-primary uppercase">
              ABOUT MISC
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-misc-text leading-tight">
            About MISC
          </h1>

          {/* Supporting Copy */}
          <div className="space-y-4 text-misc-secondary text-base sm:text-lg font-normal leading-relaxed max-w-3xl">
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
