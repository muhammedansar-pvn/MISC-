import React from 'react';

/**
 * Button Component - Reusable primary and secondary buttons for MISC Portal
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
    primary: "bg-[#0B1D3A] text-white hover:bg-[#145DA0] focus:ring-[#0B1D3A] border border-[#0B1D3A] shadow-xs",
    secondary: "bg-white text-[#0B1D3A] border border-slate-300 hover:bg-slate-50 hover:border-[#0B1D3A] focus:ring-[#0B1D3A]",
    miscBlue: "bg-[#145DA0] text-white hover:bg-[#0B1D3A] border border-[#145DA0] shadow-sm focus:ring-[#145DA0]",
    outlineLight: "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white focus:ring-white",
    gold: "bg-[#D4AF37] text-[#0B1D3A] hover:bg-[#B89628] focus:ring-[#D4AF37] shadow-xs",
    outlineGold: "bg-transparent text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37]/10 focus:ring-[#D4AF37]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
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
