import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Bell } from 'lucide-react';
import Button from '../common/Button';

export const AdmissionsOverview = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              ADMISSION GUIDANCE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132238]">
            Admission Criteria & Guidelines
          </h2>

          <p className="text-base text-[#475569] leading-relaxed font-normal">
            Information regarding eligibility criteria, admission procedures, and enrollment circulars for integrated streams.
          </p>
        </div>

        <div className="bg-white rounded-md border border-[#E2E8E0] p-8 sm:p-10 shadow-2xs space-y-6 max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E6F2F1] border border-[#2F7C7A]/40 flex items-center justify-center text-[#2F7C7A]">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="inline-block bg-[#132238] text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
              OFFICIAL ANNOUNCEMENT
            </span>
            <h3 className="font-serif text-xl font-bold text-[#132238]">
              Admission Notification & Circulars
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] font-normal leading-relaxed">
              Official admission notifications and application schedules are published by the MISC Secretariat prior to each academic session.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E2E8E0] flex justify-center">
            <Button
              variant="miscBlue"
              size="md"
              onClick={() => navigate('/contact')}
              className="group"
            >
              <span>CONTACT SECRETARIAT</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsOverview;
