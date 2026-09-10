import React, { useEffect, useRef, useState } from 'react';

/**
 * ImageCrossfade - Controlled smooth crossfade & scale transition between image assets
 */
export const ImageCrossfade = ({
  images = [],
  alt = "MISC Visual Asset",
  className = "",
  imgClassName = "",
  interval = 5000,
  transitionDuration = 500,
  caption = null
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || images.length <= 1) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [images.length]);

  useEffect(() => {
    if (!isInView || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, images.length, interval]);

  if (!images || images.length === 0) return null;

  const currentAlt = Array.isArray(alt) ? (alt[currentIndex] || alt[0]) : alt;

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {images.map((src, idx) => {
        const isActive = idx === currentIndex;
        return (
          <img
            key={src}
            src={src}
            alt={Array.isArray(alt) ? (alt[idx] || alt[0]) : alt}
            className={`w-full h-full object-cover object-center transition-all ${imgClassName} ${
              idx === 0 ? 'relative' : 'absolute inset-0'
            } ${isActive ? 'opacity-100 scale-103 z-10' : 'opacity-0 scale-100 z-0'}`}
            style={{
              transitionDuration: `${transitionDuration}ms`,
              transitionTimingFunction: 'ease-in-out',
              willChange: 'opacity, transform'
            }}
          />
        );
      })}

      {caption && (
        <div className="relative z-20">
          {typeof caption === 'function' ? caption(currentIndex, currentAlt) : caption}
        </div>
      )}
    </div>
  );
};

export default ImageCrossfade;
