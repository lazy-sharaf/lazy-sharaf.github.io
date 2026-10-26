"use client";

import { useEffect, useRef } from "react";

/**
 * A trailing `+` reticle. Reads as a scanner following the pointer,
 * which is the same gesture the shader uses to resolve the field.
 */
export function WildcardCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let vx = 0;
    let vy = 0;
    let frame = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        el.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    const tick = () => {
      const dx = tx - x;
      const dy = ty - y;
      x += dx * 0.16;
      y += dy * 0.16;
      vx += (Math.abs(dx) - vx) * 0.1;
      vy += (Math.abs(dy) - vy) * 0.1;

      const speed = Math.min(1, (vx + vy) / 42);
      const scale = 1 + speed * 0.9;
      const rotate = dx * 0.06;

      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[65] select-none font-mono text-[15px] leading-none text-signal opacity-0 mix-blend-screen transition-opacity duration-500"
      style={{ willChange: "transform" }}
    >
      +
    </div>
  );
}
