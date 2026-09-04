import React from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const ContactNotice = () => {
  return (
    <section className="relative bg-[#F8FAFC] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="bg-[#0B1D3A] text-white rounded-lg p-8 sm:p-12 border border-[#D4AF37]/30 shadow-lg relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-[#D4AF37]/40">
              OFFICIAL SECRETARIAT DESK
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Official Communication Policy
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              All official administrative and academic correspondence must be directed to <span className="text-[#D4AF37] font-mono">{miscInfo.email}</span> or submitted in writing to the Jamia Markaz campus office.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-center text-xs text-slate-400">
            <span>Operating Hours: Monday – Saturday (Office Hours)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactNotice;
