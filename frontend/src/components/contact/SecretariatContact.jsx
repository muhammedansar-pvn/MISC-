import React from 'react';
import { Mail, Phone, MapPin, Building, Globe } from 'lucide-react';
import { miscInfo } from '../../data/miscInfo';

export const SecretariatContact = () => {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-28 overflow-hidden border-b border-[#E2E8E0]">
      <div className="relative misc-container z-10">
        <div className="max-w-3xl space-y-4 mb-12 sm:mb-16">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#2F7C7A]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#2F7C7A] uppercase">
              SECRETARIAT DETAILS
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight">
            Official Contact Credentials
          </h2>

          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            Verified contact details for the central administrative secretariat of Markaz Integrated Studies Council.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider block">
                EMAIL ADDRESS
              </span>
              <h3 className="font-serif text-lg font-bold text-[#132238] mt-1">
                Official Email Desk
              </h3>
            </div>
            <a
              href={`mailto:${miscInfo.email}`}
              className="text-sm font-mono text-[#2F7C7A] hover:text-[#132238] font-medium transition-colors block"
            >
              {miscInfo.email}
            </a>
          </div>

          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider block">
                TELEPHONE NUMBER
              </span>
              <h3 className="font-serif text-lg font-bold text-[#132238] mt-1">
                Central Line
              </h3>
            </div>
            <a
              href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`}
              className="text-sm font-mono text-[#2F7C7A] hover:text-[#132238] font-medium transition-colors block"
            >
              {miscInfo.phone}
            </a>
          </div>

          <div className="bg-[#F7F8F5] rounded-md border border-[#E2E8E0] p-8 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#E6F2F1] text-[#2F7C7A] flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2F7C7A] uppercase tracking-wider block">
                PHYSICAL ADDRESS
              </span>
              <h3 className="font-serif text-lg font-bold text-[#132238] mt-1">
                Jamia Markaz Campus
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed font-normal">
              {miscInfo.address}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecretariatContact;
