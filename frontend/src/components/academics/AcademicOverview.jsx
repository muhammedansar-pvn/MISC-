import React from 'react';
import { BookOpen, Compass, ShieldCheck, Award } from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';
import ImageCrossfade from '../common/ImageCrossfade';

const pillars = [
  { title: "Islamic Sciences", desc: "Classical Quranic exegesis, jurisprudence & theology", icon: BookOpen },
  { title: "Modern Education", desc: "University humanities, commerce & sciences", icon: Compass },
  { title: "Board Oversight", desc: "Standardized examinations & syllabus regulations", icon: ShieldCheck },
  { title: "Moral Leadership", desc: "Character development & community leadership", icon: Award }
];

export const AcademicOverview = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-12 sm:mb-16">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[2px] bg-[#2F7C7A]" />
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
                  ACADEMIC PHILOSOPHY
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
                Harmonizing Tradition with Modern Scholarship
              </h2>

              <p className="text-[15.5px] sm:text-[17px] text-[#475569] font-normal leading-relaxed">
                The academic framework of MISC harmonizes classical Islamic jurisprudence with modern university disciplines, ensuring that students develop spiritual depth alongside contemporary competence.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-[#E2E8E0] shadow-md bg-white p-2">
                <ImageCrossfade
                  images={["/DSC00390.JPG.jpeg", "/MKZ01377.JPG.jpeg"]}
                  alt={[
                    "MISC Students engaged in collaborative library study",
                    "MISC Scholars conducting manuscript research in library"
                  ]}
                  imgClassName="rounded-lg h-64 sm:h-72"
                  interval={4500}
                  transitionDuration={500}
                  caption={(idx) => (
                    <div className="pt-2 px-1 pb-0.5 flex items-center justify-between text-xs text-[#475569]">
                      <span className="font-serif font-bold text-[#132238]">
                        {idx === 0 ? "Collaborative Library Study" : "Scholarly Manuscript Research"}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#2F7C7A] bg-[#E6F2F1] px-2 py-0.5 rounded border border-[#E2E8E0]">
                        {idx === 0 ? "STUDENT LEARNING" : "RESEARCH WING"}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/60 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#132238]">
                  {item.title}
                </h3>
                <p className="text-[13.5px] sm:text-[14.5px] text-[#475569] leading-relaxed font-normal mt-2">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AcademicOverview;
