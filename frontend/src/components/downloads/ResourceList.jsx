import React from 'react';
import { Bell } from 'lucide-react';
import { downloadsList } from '../../data/downloadsData';

export const ResourceList = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              DOCUMENT DIRECTORY
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Official Resource Listings
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Verified academic manuals, syllabus regulations, and institutional guidelines cataloged by the Secretariat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {downloadsList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-md border border-[#E2E8E0] p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#2F7C7A]/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8E0] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                    {item.category}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-sans text-[10px] font-semibold text-[#132238] uppercase">
                    {item.documentType}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#132238] tracking-tight">
                  {item.title}
                </h3>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E2E8E0] flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center space-x-1.5 text-[#475569]">
                  <Bell className="w-3.5 h-3.5 text-[#2F7C7A]" />
                  <span>{item.status || "Published by Secretariat"}</span>
                </span>
                <span className="text-[10px] text-[#132238] font-semibold bg-[#E6F2F1] px-2 py-0.5 rounded uppercase">
                  OFFICIAL RESOURCE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourceList;
