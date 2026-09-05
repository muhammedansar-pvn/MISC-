import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Compass, Award, Building2, ShieldCheck, GraduationCap } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const AboutSection = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: Compass,
      title: 'Integrated Curricula',
      desc: 'Seamless blend of Islamic scholarship and university academic subjects.',
    },
    {
      icon: ShieldCheck,
      title: 'Board Moderation',
      desc: 'Centralized evaluation, uniform examinations, and academic standards.',
    },
    {
      icon: Building2,
      title: 'Network Coordination',
      desc: 'Supervising direct campuses and collaborating partner centers.',
    },
    {
      icon: BookOpen,
      title: 'Research & Journals',
      desc: 'Academic publications, scholarly research, and journal archives.',
    },
    {
      icon: Award,
      title: 'Syllabus Governance',
      desc: 'Standardized curriculum guidelines updated for modern requirements.',
    },
    {
      icon: GraduationCap,
      title: 'Moral Leadership',
      desc: 'Nurturing ethical values, discipline, and community development.',
    },
  ];

  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-24 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* LEFT SIDE — EDITORIAL TEXT CONTENT (Cols 1-6) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                WHO WE ARE
              </span>
            </div>

            {/* Section Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Fostering Spiritual Depth & Academic Rigor
            </h2>

            {/* Body Copy */}
            <div className="space-y-4 text-[#475569] text-base leading-relaxed font-normal">
              <p>
                Markaz Integrated Studies Council (MISC) serves as the central academic governing body of Jamia Markaz, responsible for designing, standardizing, and supervising integrated educational curricula across member institutions.
              </p>
              <p className="text-sm text-[#475569]">
                By bridging classical Islamic scholarship with modern academic frameworks, MISC empowers students to excel in contemporary university disciplines while remaining deeply rooted in authentic Islamic values.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/about')}
                className="group shadow-sm"
              >
                <span>DISCOVER OUR VISION</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE — 6 CAPABILITY CARDS (Cols 7-12) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {capabilities.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#E2E8E0] shadow-sm hover:border-[#2F7C7A]/40 transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0] mb-3 group-hover:bg-[#2F7C7A] group-hover:text-white transition-colors">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-[#132238] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
