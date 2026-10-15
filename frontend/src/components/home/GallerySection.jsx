'use client';

import React from 'react';
import { Camera, MapPin } from 'lucide-react';

const galleryItems = [
  {
    image: '/gate.webp',
    title: 'Iconic Grand Entrance Gate',
    category: 'Campus Architecture',
    location: 'Jamia Markaz, Karanthur',
    alt: 'Grand iconic entrance gate of Jamia Markaz campus in Karanthur',
  },
  {
    image: '/Diwan.webp',
    title: 'Diwan Al-Markaz Architectural Quadrangle',
    category: 'Institutional Heritage',
    location: 'Central Campus',
    alt: 'Traditional Islamic architectural courtyard of Diwan Al-Markaz',
  },
  {
    image: '/DSC00390.webp',
    title: 'Classical Textual Inquiries & Research',
    category: 'Sacred Sciences',
    location: 'Central Library',
    alt: 'Students studying classical Islamic texts and manuscripts in the library',
  },
  {
    image: '/MKZ01377.webp',
    title: 'Scholarly Assembly & Discourse',
    category: 'Academic Life',
    location: 'Diwan Auditorium',
    alt: 'Scholarly assembly and lecture session with students and faculty',
  },
  {
    image: '/campus.webp',
    title: 'Expansive Educational Campus',
    category: 'Academic Grounds',
    location: 'Karanthur, Kozhikode',
    alt: 'Panoramic view of the university academic campus at Jamia Markaz',
  },
  {
    image: '/vision.webp',
    title: 'Interactive Pedagogy & Modern Classrooms',
    category: 'Contemporary Learning',
    location: 'Academic Classrooms',
    alt: 'Modern interactive learning classroom with students engaged in study',
  },
];

export const GallerySection = () => {
  return (
    <section id="gallery" className="border-b border-[#DCE8F3] bg-[#F5FAFF] py-16 sm:py-20 lg:py-24 text-[#243447]" aria-labelledby="gallery-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3182CE]">
            <Camera className="h-4 w-4" />
            <span>INSTITUTIONAL GALLERY</span>
          </div>
          <h2 id="gallery-heading" className="mt-2.5 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#173B65]">
            Visual Chronicle of Markaz Sanaviyya
          </h2>
          <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#64748B]">
            Authentic photographs capturing the sacred environment, scholarly pursuits, and prestigious campus architecture of Markaz Sanaviyya Academy.
          </p>
        </div>

        {/* Refined Balanced Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-[#DCE8F3] bg-white p-2 shadow-xs transition-all duration-300 hover:border-[#3182CE]/50 hover:shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173B65]/85 via-[#173B65]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="inline-block rounded-xs bg-[#3182CE] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    {item.category}
                  </span>
                  <h3 className="mt-1.5 font-heading text-sm sm:text-base font-bold leading-snug text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-200">
                    <MapPin className="h-3 w-3 text-[#60A5FA] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
