import React from 'react';

/**
 * Card Component - Standardized academic card shell with restrained shadows & subtle border
 */
export const Card = ({
  children,
  className = "",
  hover = true,
  padding = "p-6"
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${
        hover ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200' : ''
      } ${padding} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
