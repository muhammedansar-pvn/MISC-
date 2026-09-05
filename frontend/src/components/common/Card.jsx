import React from 'react';

/**
 * Card Component - Standardized academic card shell with subtle borders & soft light-blue hover
 */
export const Card = ({
  children,
  className = "",
  hover = true,
  padding = "p-6 sm:p-8",
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-md border border-[#E2E8E0] shadow-2xs ${
        hover ? 'hover:shadow-xs hover:-translate-y-0.5 hover:border-[#2F7C7A]/40 transition-all duration-200' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
