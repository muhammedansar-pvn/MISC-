import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import Button from '../common/Button';

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-[#E2E8E0]">
      <div className="misc-container">
        <div className="bg-[#F7F8F5] border border-[#E2E8E0] rounded-3xl p-8 sm:p-12 lg:p-14 text-center max-w-4xl mx-auto shadow-2xs relative overflow-hidden space-y-6">
          
          {/* Subtle Accent Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2F7C7A_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F2F1] border border-[#E2E8E0] relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#2F7C7A]" />
            <span className="text-xs font-semibold tracking-wider text-[#2F7C7A] uppercase">
              JOIN THE MISC NETWORK
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132238] tracking-tight leading-tight relative z-10 max-w-2xl mx-auto">
            Explore the MISC Ecosystem
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-[#475569] font-normal leading-relaxed max-w-xl mx-auto relative z-10">
            Discover how Markaz Integrated Studies Council integrates classical scholarship with modern academic governance and university programs.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/about')}
              className="group shadow-sm w-full sm:w-auto"
            >
              <span>EXPLORE MISC</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/contact')}
              className="group bg-white text-[#132238] border-[#E2E8E0] hover:border-[#2F7C7A] w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 mr-2 text-[#2F7C7A]" />
              <span>CONTACT US</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
