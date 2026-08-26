"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LANDMARK_IMAGES, type LandmarkImage } from "./content";

interface HeroCarouselProps {
  isDark: boolean;
}

export default function HeroCarousel({ isDark }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Preload images
  useEffect(() => {
    const loaded = LANDMARK_IMAGES.map(() => false);
    setImagesLoaded(loaded);

    LANDMARK_IMAGES.forEach((img, i) => {
      const el = new Image();
      el.onload = () => {
        setImagesLoaded((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      };
      el.src = img.src;
    });
  }, []);

  // Auto-rotate timer
  useEffect(() => {
    if (isReducedMotion || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LANDMARK_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isReducedMotion, isPaused]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index);
    },
    []
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Background image carousel"
      role="region"
    >
      {/* Images */}
      {LANDMARK_IMAGES.map((img: LandmarkImage, i: number) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-[800ms] ease-in-out"
          style={{
            opacity: i === currentIndex ? 1 : 0,
            zIndex: i === currentIndex ? 1 : 0,
          }}
        >
          <img
            src={img.src}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* Navy gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(10,31,61,0.92) 0%, rgba(11,18,32,0.88) 100%)"
            : "linear-gradient(180deg, rgba(10,31,61,0.82) 0%, rgba(10,31,61,0.78) 100%)",
        }}
      />

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {/* Pause/Play button */}
        <button
          type="button"
          onClick={togglePause}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white"
          aria-label={isPaused ? "Resume carousel" : "Pause carousel"}
        >
          {isPaused ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>

        {/* Dot indicators */}
        {LANDMARK_IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 bg-saffron"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}: ${img.alt}`}
            aria-current={i === currentIndex ? "true" : undefined}
          />
        ))}
      </div>

      {/* Photo credit */}
      <span className="absolute bottom-2 right-4 z-20 text-[10px] text-white/30">
        {LANDMARK_IMAGES[currentIndex].credit}
      </span>
    </div>
  );
}
