import React from 'react';
import ScrollReveal from '../common/ScrollReveal';
import ImageCrossfade from '../common/ImageCrossfade';

export const InstitutionsHero = () => {
  return (
    <section className="relative bg-white text-[#132238] py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
                <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
                <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                  OUR INSTITUTIONS
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#132238] leading-tight">
                An Integrated Network of <br className="hidden sm:inline" />
                <span className="text-[#2F7C7A]">Campus Institutions</span>
              </h1>

              <p className="text-[#475569] text-[15.5px] sm:text-[17px] font-normal leading-relaxed max-w-3xl">
                MISC oversees and coordinates campus institutions functioning directly under Jamia Markaz management as well as institutions operating through academic collaboration.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8E0] shadow-md bg-white p-2">
                <ImageCrossfade
                  images={["/markaz-drone.jpg (1).jpeg", "/campus.png"]}
                  alt={[
                    "Jamia Markaz Campus Institutional Aerial Overview",
                    "Markaz Shari'yya Academy Direct Campus Building"
                  ]}
                  imgClassName="rounded-xl h-64 sm:h-72"
                  interval={5000}
                  transitionDuration={500}
                  caption={(idx) => (
                    <div className="pt-2 px-1 pb-0.5 flex items-center justify-between text-xs text-[#475569]">
                      <span className="font-serif font-bold text-[#132238]">
                        {idx === 0 ? "Central Campus Aerial View" : "Markaz Shari'yya Academy"}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#2F7C7A] bg-[#E6F2F1] px-2 py-0.5 rounded border border-[#E2E8E0]">
                        {idx === 0 ? "INSTITUTION NETWORK" : "DIRECT CAMPUS"}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default InstitutionsHero;
