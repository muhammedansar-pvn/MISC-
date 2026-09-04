import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#0B1D3A] text-white py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-[#D4AF37]/20">
      <div className="relative misc-container z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* LEFT SIDE — CTA COPY & BUTTONS (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[2px] bg-[#D4AF37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">
                JOIN THE NETWORK
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Connect with Markaz Integrated Studies Council
            </h2>

            <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed max-w-2xl">
              For enquiries regarding academic stream integration, institutional collaboration guidelines, board examinations, or general Secretariat directives, reach out to our team.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="miscBlue"
                size="lg"
                onClick={() => navigate('/contact')}
                className="group"
              >
                <span>CONTACT SECRETARIAT</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outlineLight"
                size="lg"
                onClick={() => navigate('/about')}
              >
                ABOUT THE COUNCIL
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE — SECRETARIAT INFORMATION PANEL (Cols 8-12) */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 backdrop-blur-xs space-y-6 shadow-lg">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  OFFICIAL SECRETARIAT
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Central Help Desk
                </h3>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] mt-1 shrink-0" />
                  <span className="leading-relaxed">{miscInfo.address}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <a href={`mailto:${miscInfo.email}`} className="hover:text-[#D4AF37] transition-colors font-mono">
                    {miscInfo.email}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <a href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`} className="hover:text-[#D4AF37] transition-colors font-mono">
                    {miscInfo.phone}
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-xs text-slate-400">
                <p>Secretariat Operating Hours: Mon – Sat (Office Hours)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
