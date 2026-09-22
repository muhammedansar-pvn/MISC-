'use client';

import React, { useState } from 'react';
import { useNavigate } from '@/hooks/useNavigate';
import { ArrowRight } from 'lucide-react';

export const CoreServicesSection = () => {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState('/MKZ01377.JPG.jpeg');

  const programmes = [
    {
      number: '01',
      title: 'Islamic Studies',
      tagline: 'Classical Sharia, Hadith, Usul & Quranic Sciences',
      image: '/MKZ01377.JPG.jpeg',
      path: '/academics',
    },
    {
      number: '02',
      title: 'Contemporary Studies',
      tagline: 'University Arts, Commerce, Science & Humanities',
      image: '/campus.png',
      path: '/academics',
    },
    {
      number: '03',
      title: 'Integrated Programmes',
      tagline: 'Dual-Track Alim & Secondary / Higher Secondary Degrees',
      image: '/DSC00390.JPG.jpeg',
      path: '/academics',
    },
    {
      number: '04',
      title: 'Professional Programmes',
      tagline: 'Leadership, Pedagogical Training, Research & Languages',
      image: '/Diwan.JPG.jpeg',
      path: '/academics',
    },
  ];

  return (
    <section className="relative bg-[#FFFFFF] text-[#132238] py-24 sm:py-32 lg:py-36 xl:py-40 border-b border-[rgba(19,34,56,0.12)]">
      <div className="misc-container">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 sm:mb-20 gap-6 pb-6 border-b border-[rgba(19,34,56,0.12)]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-wider">
                05
              </span>
              <span className="text-xs sm:text-[13px] font-mono tracking-[0.25em] text-[#667085] uppercase">
                ACADEMIC STREAMS
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#132238] leading-tight">
              PROGRAMMES
            </h2>
          </div>

          <p className="font-serif text-xl sm:text-2xl text-[#2F7C7A] italic font-normal max-w-md">
            “Education shaped for scholarship and the future.”
          </p>
        </div>

        {/* Two-Column Composition: Left Interactive Horizontal Rows, Right Floating Dynamic Image Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Large Horizontal Editorial Rows */}
          <div className="lg:col-span-7 divide-y divide-[rgba(19,34,56,0.12)] border-y border-[rgba(19,34,56,0.12)]">
            {programmes.map((item) => (
              <div
                key={item.number}
                onMouseEnter={() => setActiveImage(item.image)}
                onClick={() => navigate(item.path)}
                className="group py-7 sm:py-9 lg:py-10 cursor-pointer flex items-center justify-between transition-all duration-300 relative"
              >
                <div className="flex items-baseline space-x-6 sm:space-x-10 transform group-hover:translate-x-3 transition-transform duration-300">
                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#2F7C7A] tracking-widest shrink-0">
                    {item.number}
                  </span>

                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#132238] group-hover:text-[#2F7C7A] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#667085] font-normal mt-1 hidden sm:block">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                <div className="pl-4">
                  <div className="w-10 h-10 rounded-full border border-[rgba(19,34,56,0.15)] group-hover:border-[#2F7C7A] group-hover:bg-[#2F7C7A] flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-[#132238] group-hover:text-white transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: High-Editorial Photographic Preview Container */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative overflow-hidden border border-[rgba(19,34,56,0.12)] shadow-sm bg-[#F7F7F3] p-3 aspect-[4/3] group">
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={activeImage}
                  alt="MISC Academic Stream Preview"
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-white text-[11px] font-mono tracking-widest uppercase">
                  Academic Framework • Jamia Markaz
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CoreServicesSection;
