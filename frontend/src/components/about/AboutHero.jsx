import React from 'react';
import { miscInfo } from '../../data/miscInfo';

export const AboutHero = () => {
  return (
    <section className="relative bg-white text-[#243447] py-16 sm:py-20 border-b border-[#DCE8F3]">
      <div className="misc-container">
        <div className="max-w-4xl space-y-5">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF5FF] border border-[#DCE8F3]">
            <span className="w-2 h-2 rounded-full bg-[#3182CE]" />
            <span className="text-xs font-semibold tracking-wider text-[#173B65] uppercase">
              ABOUT MARKAZ SANAVIYYA ACADEMY
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-[#173B65] leading-tight">
            An Institution Rooted in Knowledge &amp; Purpose
          </h1>

          {/* Supporting Copy */}
          <div className="space-y-4 text-[#64748B] text-base sm:text-lg leading-relaxed max-w-3xl">
            <p>
              Markaz Sanaviyya Academy harmonises traditional Islamic scholarship with contemporary academic development. Operating under the central governance of Jamia Markaz, the institution is dedicated to nurturing world-class Islamic scholars and empowering responsible professionals through quality education.
            </p>
            <p>
              Through a unified educational framework combining Islamic tenets, critical thinking, and modern disciplines, Markaz Sanaviyya prepares principled, socially conscious graduates who contribute meaningfully to the intellectual, moral, and social advancement of the community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
