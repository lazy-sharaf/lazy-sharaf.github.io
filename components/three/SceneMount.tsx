"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Mounts the WebGL scene after first paint so it never blocks the
 * initial HTML/CSS render. Falls back to a static gradient if WebGL
 * is unavailable. Reading routes stay quiet — no scene behind prose.
 */
export function SceneMount() {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const enabled = pathname === "/";

  useEffect(() => {
    if (!enabled) return;

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

    if (!supportsWebGL) return;

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = idle(() => setReady(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(10, 10, 12, 0.24)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(16,16,18,0.88) 0%, rgba(16,16,18,0.64) 34%, rgba(16,16,18,0.34) 64%, rgba(16,16,18,0.5) 100%)",
        }}
      />
    </div>
  );
}
