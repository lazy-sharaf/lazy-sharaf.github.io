"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { computeScroll, scrollState } from "@/lib/scroll";

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollState.reduced = reduced;

    computeScroll();
    const onScroll = () => computeScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    if (reduced) {
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const lenis = new Lenis({
      duration: 1.15,
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const off = lenis.on("scroll", computeScroll);

    return () => {
      cancelAnimationFrame(frame);
      off();
      lenis.destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
