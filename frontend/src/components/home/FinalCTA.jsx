import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#132238] text-white py-16 sm:py-20 overflow-hidden">
      <div className="misc-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* LEFT SIDE — CTA COPY & BUTTONS (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
              <span className="text-xs font-semibold tracking-wider text-white uppercase">
                JOIN THE NETWORK
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Connect with Markaz Integrated Studies Council
            </h2>

            <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
              For enquiries regarding academic stream integration, institutional collaboration guidelines, board examinations, or general Secretariat directives, reach out to our team.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contact')}
                className="group shadow-md"
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
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 space-y-6 shadow-lg">
              <div className="border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2F7C7A]">
                  OFFICIAL SECRETARIAT
                </span>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  Central Help Desk
                </h3>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-[#2F7C7A] mt-1 shrink-0" />
                  <span className="leading-relaxed">{miscInfo.address}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#2F7C7A] shrink-0" />
                  <a href={`mailto:${miscInfo.email}`} className="hover:text-white transition-colors font-mono">
                    {miscInfo.email}
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#2F7C7A] shrink-0" />
                  <a href={`tel:${miscInfo.phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors font-mono">
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
