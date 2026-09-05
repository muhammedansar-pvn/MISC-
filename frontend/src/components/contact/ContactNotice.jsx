import React from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const ContactNotice = () => {
  return (
    <section className="relative bg-[#F7F8F5] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="bg-[#132238] text-white rounded-lg p-8 sm:p-12 border border-[#2F7C7A]/30 shadow-lg relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#2F7C7A]/20 border border-[#2F7C7A]/40 flex items-center justify-center text-[#E6F2F1]">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <span className="inline-block bg-[#2F7C7A]/20 text-[#E6F2F1] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-[#2F7C7A]/40">
              OFFICIAL SECRETARIAT DESK
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Official Communication Policy
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              All official administrative and academic correspondence must be directed to <span className="text-[#E6F2F1] font-mono">{miscInfo.email}</span> or submitted in writing to the Jamia Markaz campus office.
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
