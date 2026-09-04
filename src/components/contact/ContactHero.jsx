import React from 'react';

export const ContactHero = () => {
  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[2px] bg-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
              CONTACT US
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Connect with the <br className="hidden sm:inline" />
            <span className="text-[#D4AF37]">MISC Secretariat</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl font-normal leading-relaxed max-w-3xl">
            Official contact channels for academic stream inquiries, institutional collaboration guidelines, examination directives, and general assistance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
