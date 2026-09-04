import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqList = [
  {
    id: "faq-1",
    question: "How can institutions obtain official MISC affiliation guidelines?",
    answer: "Official affiliation guidelines and manuals are published by the MISC Secretariat. Member institutions and applicants can request digital copies through the Secretariat Help Desk."
  },
  {
    id: "faq-2",
    question: "Are syllabus regulations uniform across all collaborating centers?",
    answer: "Yes. MISC provides a unified academic framework and syllabus regulations to maintain consistent educational standards across all direct campuses and collaborating centers."
  },
  {
    id: "faq-3",
    question: "Where are board examination schedules and circulars published?",
    answer: "Board examination timetables, circulars, and evaluation guidelines are published by the Central Examination Board and communicated directly to registered centers."
  }
];

export const DownloadsFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(index);
    }
  };

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Resources & Documentation FAQs
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Common enquiries regarding academic manuals, document access, and Secretariat publishing procedures.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqList.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const headerId = `faq-header-${index}`;

            return (
              <div
                key={faq.id}
                className="bg-[#F8FAFC] rounded-md border border-slate-200 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleFaq(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between space-x-4 focus:outline-none focus:ring-2 focus:ring-[#0B1D3A] cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#0B1D3A]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#D4AF37] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-200/80 pt-4"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DownloadsFAQ;
