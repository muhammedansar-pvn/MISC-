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
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wider uppercase";

  const variants = {
    primary: "bg-[#2F7C7A] text-white hover:bg-[#256664] focus:ring-[#2F7C7A] border border-[#2F7C7A] shadow-2xs",
    secondary: "bg-white text-[#132238] border border-[#E2E8E0] hover:bg-[#E6F2F1] hover:border-[#2F7C7A] focus:ring-[#2F7C7A]",
    outline: "bg-white text-[#132238] border border-[#E2E8E0] hover:bg-[#E6F2F1] hover:border-[#2F7C7A] focus:ring-[#2F7C7A]",
    miscBlue: "bg-[#2F7C7A] text-white hover:bg-[#132238] border border-[#2F7C7A] shadow-2xs focus:ring-[#2F7C7A]",
    lightBlue: "bg-[#E6F2F1] text-[#132238] border border-[#E2E8E0] hover:bg-[#E6F2F1] hover:text-[#2F7C7A] focus:ring-[#2F7C7A]",
    outlineDark: "bg-transparent text-[#132238] border border-[#132238] hover:bg-[#132238] hover:text-white focus:ring-[#132238]",
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
