import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const OfficialResourceNotice = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="bg-[#132238] text-white rounded-lg p-8 sm:p-12 border border-[#2F7C7A]/30 shadow-lg relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#2F7C7A]/20 border border-[#2F7C7A]/40 flex items-center justify-center text-[#E6F2F1]">
            <FileCheck className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#2F7C7A]/20 text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-[#2F7C7A]/40">
              OFFICIAL RESOURCES
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Published by the MISC Secretariat
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Official academic guidelines, affiliation manuals, and regulatory updates are cataloged and issued directly through the Secretariat.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
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

export default OfficialResourceNotice;
