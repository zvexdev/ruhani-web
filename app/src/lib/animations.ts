import { animate, random } from "animejs";

/**
 * Creates an exquisite golden & emerald celebratory particle burst
 * using anime.js when a spiritual milestone is achieved (e.g., Tasbeeh completed,
 * all Adhkar finished, or Name of Allah memorized).
 */
export function triggerSpiritualMilestone(targetElement?: HTMLElement | null) {
  if (typeof window === "undefined") return;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    container.style.left = `${rect.left + rect.width / 2}px`;
    container.style.top = `${rect.top + rect.height / 2}px`;
  } else {
    container.style.left = "50%";
    container.style.top = "50%";
  }

  document.body.appendChild(container);

  const colors = ["#fbbf24", "#f59e0b", "#10b981", "#34d399", "#d97706", "#ffffff"];
  const particleCount = 28;
  const particles: HTMLElement[] = [];

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = `${Math.floor(Math.random() * 6) + 4}px`;
    p.style.height = p.style.width;
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = Math.random() > 0.4 ? "50%" : "2px";
    p.style.boxShadow = "0 0 6px rgba(251, 191, 36, 0.6)";
    container.appendChild(p);
    particles.push(p);
  }

  animate(particles, {
    translateX: () => random(-140, 140),
    translateY: () => random(-140, 140),
    scale: [
      { to: 1.5, duration: 250, ease: "outQuad" },
      { to: 0, duration: 650, ease: "inQuad" }
    ],
    rotate: () => random(-360, 360),
    opacity: [
      { to: 1, duration: 150 },
      { to: 0, duration: 750, ease: "inExpo" }
    ],
    duration: 900,
    ease: "outExpo",
    onComplete: () => {
      container.remove();
    }
  });
}

/**
 * Anime.js magnetic pulse animation for Qibla compass alignment
 */
export function triggerCompassLockPulse(element: HTMLElement | null) {
  if (!element) return;
  animate(element, {
    scale: [1, 1.08, 1],
    duration: 600,
    ease: "inOutQuad"
  });
}

/**
 * Anime.js tactile counter ripple for digital tasbeeh
 */
export function triggerCounterRipple(element: HTMLElement | null) {
  if (!element) return;
  animate(element, {
    scale: [0.92, 1.04, 1],
    duration: 250,
    ease: "outElastic(1, .6)"
  });
}

/**
 * Anime.js golden bookmark burst with micro-sparkles and tactile spring pop
 */
export function triggerBookmarkBurst(targetElement: HTMLElement | null) {
  if (!targetElement || typeof window === "undefined") return;

  // 1. Elastic pop on the icon/button itself
  animate(targetElement, {
    scale: [1, 1.35, 1],
    rotate: [0, -12, 12, 0],
    duration: 400,
    ease: "outElastic(1, .5)"
  });

  // 2. Micro golden sparkle particles around the target
  const rect = targetElement.getBoundingClientRect();
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = `${rect.left + rect.width / 2}px`;
  container.style.top = `${rect.top + rect.height / 2}px`;
  container.style.pointerEvents = "none";
  container.style.zIndex = "9999";
  document.body.appendChild(container);

  const colors = ["#fbbf24", "#f59e0b", "#10b981", "#ffffff"];
  const particles: HTMLElement[] = [];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.style.position = "absolute";
    dot.style.width = "4px";
    dot.style.height = "4px";
    dot.style.borderRadius = "50%";
    dot.style.backgroundColor = colors[i % colors.length];
    dot.style.boxShadow = "0 0 4px rgba(251, 191, 36, 0.8)";
    container.appendChild(dot);
    particles.push(dot);
  }

  animate(particles, {
    translateX: () => random(-40, 40),
    translateY: () => random(-40, 40),
    scale: [
      { to: 1.4, duration: 150, ease: "outQuad" },
      { to: 0, duration: 350, ease: "inQuad" }
    ],
    opacity: [
      { to: 1, duration: 100 },
      { to: 0, duration: 400, ease: "inExpo" }
    ],
    duration: 500,
    ease: "outExpo",
    onComplete: () => {
      container.remove();
    }
  });
}

/**
 * Anime.js gentle golden halo pulse for highlighting newly selected or focused elements
 */
export function triggerGoldenPulse(element: HTMLElement | null) {
  if (!element) return;
  animate(element, {
    boxShadow: [
      "0 0 0 0 rgba(245, 158, 11, 0)",
      "0 0 0 8px rgba(245, 158, 11, 0.4)",
      "0 0 0 0 rgba(245, 158, 11, 0)"
    ],
    duration: 800,
    ease: "outQuad"
  });
}
