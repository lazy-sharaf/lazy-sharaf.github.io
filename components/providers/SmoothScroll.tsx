"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { computeScroll, scrollState } from "@/lib/scroll";
import { isBootLocked, onBootLock } from "@/lib/boot";

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

    // Lenis only smooths the wheel. On touch devices it would be a second
    // animation loop doing nothing, competing with the WebGL one.
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    if (!finePointer) {
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

    // The boot overlay owns the page until the scene is ready.
    if (isBootLocked()) lenis.stop();
    const offLock = onBootLock((locked) => {
      if (locked) lenis.stop();
      else {
        lenis.start();
        // measure on the next frame, once the boot lock has left the layout
        requestAnimationFrame(() => {
          lenis.resize();
          computeScroll();
        });
      }
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
      offLock();
      lenis.destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
