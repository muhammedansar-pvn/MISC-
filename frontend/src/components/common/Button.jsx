'use client';

import React from 'react';

/**
 * Button Component - Reusable buttons with Premium Clean White / Light Blue / Dark Charcoal variants
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick = undefined,
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wider uppercase";

  const variants = {
    primary: "bg-misc-primary text-white hover:bg-misc-primary-dark focus:ring-misc-primary border border-misc-primary shadow-2xs",
    secondary: "bg-white text-misc-deep-blue border border-slate-300 hover:bg-misc-soft-blue hover:border-misc-primary focus:ring-misc-primary",
    outline: "bg-white text-misc-deep-blue border border-slate-300 hover:bg-misc-soft-blue hover:border-misc-primary focus:ring-misc-primary",
    miscBlue: "bg-misc-primary text-white hover:bg-misc-primary-dark border border-misc-primary shadow-2xs focus:ring-misc-primary",
    lightBlue: "bg-misc-soft-blue text-misc-text border border-misc-border hover:bg-misc-soft-blue hover:text-misc-primary focus:ring-misc-primary",
    outlineDark: "bg-transparent text-misc-text border border-misc-text hover:bg-misc-navy hover:text-white focus:ring-misc-text",
    outlineLight: "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white focus:ring-white"
  };

  const sizes = {
    sm: "px-3.5 py-2 text-[12.5px] sm:text-xs",
    md: "px-5 py-2.5 sm:py-3 text-[13.5px] sm:text-[14.5px]",
    lg: "px-6 py-3.5 text-[14.5px] sm:text-[16px]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
