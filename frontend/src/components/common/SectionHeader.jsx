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
        <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-misc-primary bg-misc-soft-blue px-3.5 py-1.5 rounded-full border border-misc-border">
          <span className="w-2 h-2 rounded-full bg-misc-primary" />
          <span>{label}</span>
        </span>
      )}
      {title && (
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-misc-text tracking-tight leading-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-base text-misc-secondary font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
