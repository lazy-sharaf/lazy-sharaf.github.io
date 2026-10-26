"use client";

import { useEffect, useState } from "react";

const steps = [
  "client hello",
  "server hello",
  "certificate verified",
  "session established",
];

/**
 * Module-level so React StrictMode's double-invoked effect (and client
 * navigations) cannot restart or strand the animation.
 */
let handshakePlayed = false;

/**
 * A TLS handshake instead of a spinner. Runs once per session,
 * never longer than ~1.1s, and is skipped entirely for reduced motion.
 */
export function Loader() {
  const [phase, setPhase] = useState<"idle" | "run" | "out">("idle");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (handshakePlayed) return;
    handshakePlayed = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (sessionStorage.getItem("handshake") === "done") return;
    sessionStorage.setItem("handshake", "done");

    setPhase("run");

    // Timers are intentionally not cleared: the overlay is a one-shot that
    // must always reach "idle", including across StrictMode's remount.
    steps.forEach((_, i) => {
      window.setTimeout(() => setStep(i + 1), 90 + i * 190);
    });
    window.setTimeout(() => setPhase("out"), 1000);
    window.setTimeout(() => setPhase("idle"), 1500);
  }, []);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink transition-opacity duration-500"
      style={{ opacity: phase === "out" ? 0 : 1 }}
    >
      <div className="w-[min(22rem,80vw)]">
        <div className="mb-6 flex items-baseline justify-between">
          <span className="mono text-bone/72">TLS 1.3</span>
          <span className="mono-sm text-signal">handshake</span>
        </div>

        <div className="h-px w-full bg-bone/10">
          <div
            className="h-px bg-signal transition-[width] duration-700 ease-out"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <ul className="mt-5 space-y-1.5">
          {steps.map((label, i) => (
            <li
              key={label}
              className="mono-sm flex items-center gap-2 transition-opacity duration-300"
              style={{ opacity: i < step ? 1 : 0.18 }}
            >
              <span className="text-signal">›</span>
              <span className="text-bone/78">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
