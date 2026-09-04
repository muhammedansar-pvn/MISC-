import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ShieldCheck, Award } from 'lucide-react';
import Button from '../common/Button';
import { miscInfo } from '../../data/miscInfo';

export const HeroSection = () => {
  const navigate = useNavigate();
  const facts = [[BookOpen, 'Three integrated streams', 'Alim, Secondary and Higher Secondary'], [ShieldCheck, 'Central evaluation', 'Unified syllabus and examinations'], [Award, 'A connected network', 'Direct and collaborating institutions']];
  return <section className="relative overflow-hidden border-b border-[var(--misc-gold)]/30 bg-[var(--misc-deep-blue)] text-[var(--misc-card-bg)]">
    <div className="motif-grid absolute inset-y-0 right-0 hidden w-2/5 opacity-40 lg:block" />
    <div className="misc-container relative grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-28">
      <div className="lg:col-span-7"><div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--misc-gold)]"><span className="h-px w-10 bg-[var(--misc-gold)]" />{miscInfo.parentOrganization}</div><h1 className="max-w-3xl font-serif text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Integrating Islamic & <span className="text-[var(--misc-gold)]">Contemporary Education</span></h1><p className="mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{miscInfo.aboutShort}</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button variant="miscBlue" size="lg" onClick={() => navigate('/academics')} className="group"><span>Explore programmes</span><ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" /></Button><Button variant="outlineLight" size="lg" onClick={() => navigate('/about')}>About MISC</Button></div></div>
      <div className="relative lg:col-span-5"><div className="border border-white/20 bg-white/[0.06] p-6 sm:p-8"><div className="border-b border-white/15 pb-5"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--misc-gold)]">MISC at a glance</span><h2 className="mt-2 font-serif text-2xl font-bold">Academic framework</h2></div><div className="flex flex-col divide-y divide-white/10">{facts.map(([Icon, title, text]) => <div key={title} className="flex gap-4 py-5"><Icon className="mt-1 size-5 shrink-0 text-[var(--misc-gold)]" /><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-300">{text}</p></div></div>)}</div><div className="flex justify-between border-t border-white/10 pt-5 text-xs uppercase tracking-wider text-slate-400"><span>Central Secretariat</span><span className="text-[var(--misc-gold)]">Jamia Markaz</span></div></div></div>
    </div>
  </section>;
};
export default HeroSection;
