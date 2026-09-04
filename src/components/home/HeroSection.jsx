import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Button from '../common/Button';

const glanceStats = [
  ['3', 'Major Programme Streams'],
  ['6+', 'Campus Institutions'],
  ['1400+', 'Students Enrolled'],
  ['25+', 'Years of Excellence']
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden bg-[var(--misc-deep-blue)] text-[var(--misc-card-bg)] lg:min-h-[calc(100vh-88px)]">
      <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('/misc-campus-hero.png')" }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[var(--misc-deep-blue)]/85" aria-hidden="true" />
      <div className="motif-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-[var(--misc-deep-blue)]/60 to-transparent" aria-hidden="true" />

      <div className="misc-container relative grid gap-14 py-20 sm:py-28 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-32">
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--misc-gold)] sm:text-xs"><span className="h-px w-10 bg-[var(--misc-gold)]" />Markaz Integrated Studies Council</div>
          <h1 className="max-w-3xl font-serif text-5xl font-bold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-[5.25rem]">Where Islamic Scholarship Meets <span className="text-[var(--misc-gold)]">Contemporary Excellence</span></h1>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">Integrating Islamic scholarship, contemporary knowledge, skill development and character formation — preparing scholars and professionals for a global world.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Button variant="gold" size="lg" onClick={() => navigate('/academics')} className="group">Explore programmes <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" /></Button><Button variant="outlineLight" size="lg" onClick={() => navigate('/contact')}>Apply for admission <ArrowRight className="ml-2 size-4" /></Button></div>
        </div>

        <div className="lg:col-span-5 xl:col-start-9">
          <div className="border border-white/25 bg-[var(--misc-deep-blue)]/55 p-6 backdrop-blur-md sm:p-8">
            <div className="border-b border-white/20 pb-5"><span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--misc-gold)]">At a glance</span><h2 className="mt-3 font-serif text-2xl font-bold sm:text-3xl">A tradition of excellence</h2></div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-white/15 border-b border-white/15"><>{glanceStats.map(([value, label], index) => <div key={label} className={`py-6 ${index % 2 === 0 ? 'pr-5' : 'pl-5'}`}><dt className="font-serif text-3xl font-bold text-[var(--misc-gold)] sm:text-4xl">{value}</dt><dd className="mt-2 text-[10px] uppercase leading-relaxed tracking-[0.1em] text-slate-300 sm:text-xs">{label}</dd></div>)}</></dl>
            <p className="pt-5 text-xs leading-relaxed text-slate-300">One connected academic vision, shaped for a changing world.</p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-slate-300 sm:flex"><span className="h-px w-8 bg-[var(--misc-gold)]" />Scroll to explore<ChevronDown className="size-3 text-[var(--misc-gold)]" /></div>
    </section>
  );
};
export default HeroSection;
