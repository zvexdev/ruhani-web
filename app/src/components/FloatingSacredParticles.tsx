import { useEffect, useRef } from "react";
import { animate, random, stagger } from "animejs";

/**
 * High-performance, GPU-accelerated ambient floating sacred star particles
 * driven by Anime.js for a mystical spiritual sanctuary ambiance.
 * Respects prefers-reduced-motion.
 */
export default function FloatingSacredParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const numStars = 24;
    const stars: HTMLDivElement[] = [];

    for (let i = 0; i < numStars; i++) {
      const star = document.createElement("div");
      star.className = "absolute rounded-full pointer-events-none";
      const size = Math.random() * 3 + 2; // 2px to 5px
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      const isGold = Math.random() > 0.35;
      star.style.backgroundColor = isGold ? "rgba(251, 191, 36, 0.7)" : "rgba(16, 185, 129, 0.6)";
      star.style.boxShadow = isGold
        ? "0 0 8px rgba(251, 191, 36, 0.8)"
        : "0 0 8px rgba(16, 185, 129, 0.6)";
      
      container.appendChild(star);
      stars.push(star);
    }

    const animation = animate(stars, {
      translateY: () => [random(-15, 15), random(-40, 40)],
      translateX: () => [random(-20, 20), random(-30, 30)],
      opacity: [
        { to: () => Math.random() * 0.3 + 0.1, duration: 2000 },
        { to: () => Math.random() * 0.8 + 0.3, duration: 3000 },
        { to: () => Math.random() * 0.3 + 0.1, duration: 2500 }
      ],
      scale: [
        { to: 1, duration: 1500 },
        { to: () => Math.random() * 1.5 + 0.8, duration: 2500 },
        { to: 1, duration: 2000 }
      ],
      delay: stagger(120),
      duration: () => random(6000, 10000),
      ease: "inOutSine",
      loop: true,
      alternate: true
    });

    return () => {
      animation.pause();
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-60 -z-0"
      aria-hidden="true"
    />
  );
}
