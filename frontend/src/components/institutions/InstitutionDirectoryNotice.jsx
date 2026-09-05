import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const InstitutionDirectoryNotice = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="bg-[#0B1D3A] text-white rounded-lg p-8 sm:p-12 border border-[#D4AF37]/30 shadow-lg relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <Building className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-[#D4AF37]/40">
              OFFICIAL DIRECTORY
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Institutional Listings & Affiliation Records
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Official details of affiliated colleges, dars centers, and direct campus institutions will be published here by the MISC Secretariat.
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

export default InstitutionDirectoryNotice;
