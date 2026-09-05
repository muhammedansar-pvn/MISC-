import React from 'react';
import { Award, CheckCircle2, ShieldCheck, FileCheck2, ScrollText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export const ExaminationOverview = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: FileCheck2,
      title: "Board Examination Results",
      desc: "Access centralized evaluation results, mark sheets, and academic performance records."
    },
    {
      icon: ScrollText,
      title: "Hall Ticket & Registration",
      desc: "Download official examination hall tickets, admit cards, and candidate verification passes."
    },
    {
      icon: UserCheck,
      title: "Academic Regulations",
      desc: "Review standardized board guidelines, grading metrics, and examination protocols."
    }
  ];

  return (
    <section className="relative bg-white py-16 sm:py-24 border-b border-[#E5EAF0]" id="examination-framework">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#EAF4FF] border border-[#DCEEFF]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span className="text-xs font-semibold tracking-wider text-[#2563EB] uppercase">
              EXAMINATION HUB
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            Central Board Examination & Assessment Services
          </h2>

          <p className="text-base text-[#4B5563]">
            Unified evaluation procedures, hall ticket verification, and official academic record processing for all affiliated campuses.
          </p>
        </div>

        {/* 3 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div 
                key={idx}
                className="bg-[#F8FAFC] p-6 rounded-xl border border-[#E5EAF0] shadow-xs hover:border-[#3B82F6]/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EAF4FF] text-[#2563EB] flex items-center justify-center border border-[#DCEEFF]">
                    <IconComp className="w-5 h-5" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#172033]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#E5EAF0]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/examination')}
                    className="w-full text-xs"
                  >
                    ACCESS PORTAL
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ExaminationOverview;
