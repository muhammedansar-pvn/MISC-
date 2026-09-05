import React from 'react';

/**
 * Button Component - Reusable buttons with Premium Clean White / Light Blue / Dark Charcoal variants
 */
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wider text-xs sm:text-sm uppercase";

  const variants = {
    primary: "bg-[#172033] text-white hover:bg-[#2563EB] focus:ring-[#172033] border border-[#172033] shadow-2xs",
    secondary: "bg-white text-[#172033] border border-[#E5EAF0] hover:bg-[#F8FAFC] hover:border-[#172033] focus:ring-[#172033]",
    miscBlue: "bg-[#2563EB] text-white hover:bg-[#172033] border border-[#2563EB] shadow-2xs focus:ring-[#2563EB]",
    lightBlue: "bg-[#EAF4FF] text-[#172033] border border-[#DCEEFF] hover:bg-[#DCEEFF] hover:text-[#2563EB] focus:ring-[#2563EB]",
    outlineDark: "bg-transparent text-[#172033] border border-[#172033] hover:bg-[#172033] hover:text-white focus:ring-[#172033]",
    outlineLight: "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white focus:ring-white"
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 sm:py-3 text-xs sm:text-sm",
    lg: "px-6 py-3.5 text-sm sm:text-base"
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
