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
    <section className="relative bg-white py-14 sm:py-18 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-[#E2E8E0]">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                SUPPORT
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#132238]">
              Frequently Asked Questions
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-[#475569] font-medium">
            Common queries about academic resources
          </span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqList.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${index}`;
            const headerId = `faq-header-${index}`;

            return (
              <div
                key={faq.id}
                className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={() => toggleFaq(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between space-x-4 focus:outline-none focus:ring-2 focus:ring-[#2F7C7A] cursor-pointer"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#132238]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#2F7C7A] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#475569] leading-relaxed font-normal border-t border-[#E2E8E0]/80 pt-4"
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
