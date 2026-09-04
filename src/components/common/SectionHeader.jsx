import React from 'react';

export const SectionHeader = ({ label, title, subtitle, centered = false, className = '' }) => <div className={`${centered ? 'mx-auto max-w-3xl text-center' : ''} ${className}`}>
  {label && <span className="mb-4 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--misc-blue)]"><span className="h-px w-7 bg-[var(--misc-gold)]" />{label}</span>}
  {title && <h2 className="section-rule max-w-3xl font-serif text-3xl font-bold leading-tight text-[var(--misc-deep-blue)] sm:text-5xl">{title}</h2>}
  {subtitle && <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--misc-text-muted)] sm:text-lg">{subtitle}</p>}
</div>;
export default SectionHeader;
