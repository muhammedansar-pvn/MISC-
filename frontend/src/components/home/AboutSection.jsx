import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import ScrollReveal from '../common/ScrollReveal';

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F8F5] py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0] overflow-hidden">
      <div className="misc-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT SIDE — EDITORIAL TEXT (Cols 1-6) */}
          <div className="lg:col-span-6 space-y-6">
            <ScrollReveal delay={100}>
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
                <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                  ABOUT MISC
                </span>
              </div>
              
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight mb-4">
                About MISC
              </h2>

              <div className="space-y-4 text-[#475569] text-[15.5px] sm:text-[16.5px] leading-relaxed font-normal mb-6">
                <p>
                  Markaz Integrated Studies Council (MISC) is the academic coordination body of Jamia Markaz, established to integrate and oversee institutions and dars systems functioning directly under Jamia Markaz as well as those operating through academic collaboration. MISC provides a unified educational framework that combines Islamic scholarship, modern education, skill development, and character formation.
                </p>
                <p>
                  Through a centralized system of curriculum design, teacher training, examinations, quality assurance, and student development programs, MISC ensures academic excellence and holistic growth across all affiliated institutions. The council is committed to nurturing knowledgeable, competent, and socially responsible graduates who can contribute meaningfully to their communities and the wider world.
                </p>
              </div>

              <div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/about')}
                  className="group shadow-sm hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span>DISCOVER MISC</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT SIDE — ELEGANT VISUAL & INSTITUTION STATEMENT (Cols 7-12) */}
          <div className="lg:col-span-6 relative">
            <ScrollReveal delay={250} yOffset={25}>
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8E0] shadow-md bg-white p-3 group">
                <div className="overflow-hidden rounded-xl">
                  <img
                    src="/Diwan.JPG.jpeg"
                    alt="Diwan - MISC Central Secretariat, Jamia Markaz, Karanthur"
                    className="w-full h-80 sm:h-96 object-cover rounded-xl transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-[#E2E8E0] shadow-sm flex items-center justify-between z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center border border-[#E2E8E0]">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A] block">
                        CENTRAL SECRETARIAT
                      </span>
                      <span className="font-serif text-sm font-bold text-[#132238]">
                        Jamia Markaz, Karanthur
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-xs text-[#475569] font-medium block">Established</span>
                    <span className="font-serif text-sm font-bold text-[#132238]">Global Network</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
