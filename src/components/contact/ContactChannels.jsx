import React from 'react';
import { BookOpen, Building2, Award, FileText } from 'lucide-react';

const channels = [
  {
    title: "Academic & Curriculum Enquiries",
    desc: "Syllabus frameworks, integrated stream guidelines, and academic moderation.",
    icon: BookOpen
  },
  {
    title: "Institutional Collaboration",
    desc: "Guidelines for collaborating centers, institutes, and dars affiliations.",
    icon: Building2
  },
  {
    title: "Board Examination Desk",
    desc: "Evaluation timetables, board circulars, hall tickets, and mark records.",
    icon: Award
  },
  {
    title: "Resources & Manuals",
    desc: "Access to official publications, document circulars, and academic resources.",
    icon: FileText
  }
];

export const ContactChannels = () => {
  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              ENQUIRY CATEGORIES
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Secretariat Desk Categories
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Select the appropriate department channel for your academic or institutional inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {channels.map((chan, idx) => {
            const Icon = chan.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-md border border-slate-200 p-6 sm:p-8 shadow-2xs hover:shadow-md hover:border-[#D4AF37]/60 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0B1D3A] tracking-tight">
                    {chan.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    {chan.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactChannels;
