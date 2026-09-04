import React from 'react';

/**
 * SectionHeader - Standardized section header with category label and editorial heading
 */
export const SectionHeader = ({
  label,
  title,
  subtitle,
  centered = false,
  className = ""
}) => {
  return (
    <div className={`space-y-3 ${centered ? 'text-center max-w-3xl mx-auto' : ''} ${className}`}>
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#D4AF37] bg-[#0B1D3A]/5 px-3 py-1 rounded-full border border-[#D4AF37]/30">
          {label}
        </span>
      )}
      {title && (
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B1D3A] tracking-tight leading-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
