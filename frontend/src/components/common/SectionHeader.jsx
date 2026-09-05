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
        <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#2563EB] bg-[#EAF4FF] px-3.5 py-1.5 rounded-full border border-[#DCEEFF]">
          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
          <span>{label}</span>
        </span>
      )}
      {title && (
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#172033] tracking-tight leading-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-base text-[#4B5563] font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
