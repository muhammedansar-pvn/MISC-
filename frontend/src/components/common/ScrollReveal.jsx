'use client';

import React from 'react';

/**
 * ScrollReveal - Safe, high-performance animation container
 * Eliminates client chunk errors and hydration mismatches while ensuring all content is immediately accessible
 */
export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 600,
  yOffset = 20,
  threshold = 0.15,
  once = true
}) => {
  return (
    <div className={`transition-all ease-out duration-700 ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
