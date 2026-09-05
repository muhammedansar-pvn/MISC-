import React from 'react';
import { Mail, Phone, MapPin, Building, Globe } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const SecretariatContact = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-slate-200">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              SECRETARIAT DETAILS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B1D3A] tracking-tight leading-tight">
            Official Contact Credentials
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Verified contact details for the central administrative secretariat of Markaz Integrated Studies Council.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                EMAIL ADDRESS
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0B1D3A] mt-1">
                Official Email Desk
              </h3>
            </div>
            <a
              href={`mailto:${miscInfo.email}`}
              className="text-sm font-mono text-[#145DA0] hover:text-[#0B1D3A] font-medium transition-colors block"
            >
              {miscInfo.email}
            </a>
          </div>

          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                TELEPHONE NUMBER
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0B1D3A] mt-1">
                Central Line
              </h3>
            </div>
            <a
              href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`}
              className="text-sm font-mono text-[#145DA0] hover:text-[#0B1D3A] font-medium transition-colors block"
            >
              {miscInfo.phone}
            </a>
          </div>

          <div className="bg-[#F8FAFC] rounded-md border border-slate-200 p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#0B1D3A]/5 text-[#145DA0] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                PHYSICAL ADDRESS
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0B1D3A] mt-1">
                Jamia Markaz Campus
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {miscInfo.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecretariatContact;
