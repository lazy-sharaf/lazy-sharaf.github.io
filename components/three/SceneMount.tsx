"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BOOT_TOTAL, setStage } from "@/lib/boot";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Mounts the WebGL scene after first paint so it never blocks the
 * initial HTML/CSS render. Falls back to a static gradient if WebGL
 * is unavailable. Reading routes stay quiet — no scene behind prose.
 *
 * The chunk download starts immediately rather than waiting for idle: the
 * boot screen is holding the visitor until the scene is ready, so the fastest
 * possible start is the one that gets them through it soonest.
 */
export function SceneMount() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const enabled = pathname === "/";

  useEffect(() => {
    if (!enabled) {
      setStage(BOOT_TOTAL);
      return;
    }

    const supportsWebGL = (() => {
      try {
        const canvas = document.createElement("canvas");
        return Boolean(
          canvas.getContext("webgl2") || canvas.getContext("webgl"),
        );
      } catch {
        return false;
      }
    })();

    // No WebGL means no scene to wait for. Open the gate rather than sit on
    // an overlay forever.
    if (!supportsWebGL) {
      setStage(BOOT_TOTAL);
      return;
    }

    import("./Scene").then(() => setStage(2));

    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(120% 90% at 78% 18%, rgba(255,107,44,0.06) 0%, rgba(20,20,22,0) 55%)",
      }}
    >
      {enabled && ready && <Scene />}
      <div className="scene-veil pointer-events-none absolute inset-0" />
      <div className="scene-scrim pointer-events-none absolute inset-0" />
      <div className="scene-vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
