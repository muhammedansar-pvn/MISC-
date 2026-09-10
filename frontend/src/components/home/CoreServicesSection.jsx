import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Building2, Download, ArrowRight } from 'lucide-react';

export const CoreServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: BookOpen,
      title: 'Integrated Academics',
      category: 'CURRICULUM & STREAMS',
      description: 'Blending classical Islamic scholarship with accredited university degree programs.',
      linkText: 'Explore Academics',
      path: '/academics',
      badge: 'Integrated Streams',
    },
    {
      icon: ShieldCheck,
      title: 'Central Examination',
      category: 'EVALUATION & GOVERNANCE',
      description: 'Centralized examination board managing standardized assessments and unified certification.',
      linkText: 'View Examination Board',
      path: '/examination',
      badge: 'Unified Board',
    },
    {
      icon: Building2,
      title: 'Institution Network',
      category: 'INSTITUTIONAL COORDINATION',
      description: 'Coordinating member institutions and collaborating centers under Jamia Markaz governance.',
      linkText: 'Explore Network',
      path: '/institutions',
      badge: 'Institutional Network',
    },
    {
      icon: Download,
      title: 'Resource Centre',
      category: 'DOWNLOADS & PUBLICATIONS',
      description: 'Access academic calendars, stream syllabi, research journals, and official documentation.',
      linkText: 'Access Downloads',
      path: '/downloads',
      badge: 'Official Resources',
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0]">
      <div className="misc-container">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0]">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
                CORE PILLARS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
              Academic Infrastructure & Governance
            </h2>
            <p className="text-[15.5px] sm:text-[16.5px] text-[#475569] font-normal leading-relaxed">
              Centralized educational administration empowering member institutions, faculty, and students.
            </p>
          </div>
        </div>

        {/* Editorial 4-Card Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const IconComp = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-[#F7F8F5] hover:bg-white border border-[#E2E8E0] hover:border-[#2F7C7A]/40 rounded-2xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#E2E8E0] text-[#2F7C7A] group-hover:bg-[#2F7C7A] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-[#2F7C7A] bg-[#E6F2F1] px-3 py-1 rounded-full uppercase border border-[#E2E8E0]">
                      {service.badge}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#475569] block mb-1">
                    {service.category}
                  </span>

                  <h3 className="font-serif text-2xl font-bold text-[#132238] mb-2 group-hover:text-[#2F7C7A] transition-colors leading-snug">
                    {service.title}
                  </h3>

                  <p className="text-sm sm:text-[14.5px] text-[#475569] leading-relaxed font-normal mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E8E0]">
                  <button
                    onClick={() => navigate(service.path)}
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2F7C7A] hover:text-[#256664] group-hover:translate-x-1 transition-all cursor-pointer"
                  >
                    <span>{service.linkText}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CoreServicesSection;
