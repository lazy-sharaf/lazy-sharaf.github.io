"use client";

/**
 * Module-level scroll state read inside useFrame.
 * Deliberately not React state — the render loop must not trigger re-renders.
 */
export const scrollState = {
  progress: 0,
  heroProgress: 0,
  reduced: false,
};

export function computeScroll() {
  if (typeof window === "undefined") return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const y = window.scrollY;
  scrollState.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
  // 0 at the top of the hero, 1 once the hero has fully left the viewport
  scrollState.heroProgress = Math.min(1, Math.max(0, y / window.innerHeight));
}
