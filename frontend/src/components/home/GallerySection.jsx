'use client';

import React from 'react';
import { Camera, MapPin } from 'lucide-react';

const galleryItems = [
  {
    image: '/gate.webp',
    title: 'Iconic Grand Entrance Gate',
    category: 'Campus Architecture',
    location: 'Jamia Markaz, Karanthur',
    span: 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 min-h-[300px] sm:min-h-0',
  },
  {
    image: '/MKZ01377.webp',
    title: 'Scholarly Assembly & Convocation',
    category: 'Academic Moments',
    location: 'Central Diwan Hall',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1 aspect-[4/3] sm:aspect-auto',
  },
  {
    image: '/DSC00390.webp',
    title: 'Library Research & Textual Study',
    category: 'Student Scholarship',
    location: 'Central Library',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1 aspect-[4/3] sm:aspect-auto',
  },
  {
    image: '/Diwan.webp',
    title: 'Diwan Al-Markaz Architectural Splendor',
    category: 'Institutional Heritage',
    location: 'Main Quadrangle',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1 aspect-[4/3] sm:aspect-auto',
  },
  {
    image: '/vision.webp',
    title: 'Modern Classrooms & Seminar Sessions',
    category: 'Pedagogy',
    location: 'Academic Blocks',
    span: 'col-span-1 sm:col-span-1 lg:col-span-1 aspect-[4/3] sm:aspect-auto',
  },
];

export const GallerySection = () => {
  return (
    <section className="border-b border-misc-border bg-white py-14 sm:py-18 lg:py-20 text-misc-text" aria-labelledby="gallery-heading">
      <div className="misc-container">
        {/* Header */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-misc-primary">
            <Camera className="h-4 w-4" />
            <span>10 · Campus Moments</span>
          </div>
          <h2 id="gallery-heading" className="mt-2.5 font-serif text-3xl font-medium leading-tight tracking-tight text-misc-text sm:text-4xl lg:text-[2.65rem]">
            A Visual Journey Through Sanaviyya
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-misc-secondary sm:text-base">
            Moments of scholarship, classical architecture, academic convocations, and student fellowship at Jamia Markaz.
          </p>
        </div>

        {/* Asymmetrical Masonry Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:auto-rows-[220px]">
          {galleryItems.map((item) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl border border-misc-border bg-slate-100 shadow-2xs ${item.span}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-misc-navy/85 via-misc-navy/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <span className="inline-block rounded-xs bg-misc-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {item.category}
                </span>
                <h3 className="mt-1.5 font-serif text-base sm:text-lg font-bold leading-snug text-white">
                  {item.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-300">
                  <MapPin className="h-3 w-3 text-misc-primary shrink-0" />
                  <span className="truncate">{item.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
