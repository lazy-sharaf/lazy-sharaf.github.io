"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { computeScroll } from "@/lib/scroll";
import { site } from "@/lib/content";
import { BOOT_TOTAL, getStage, setBootLocked, setStage } from "@/lib/boot";

/**
 * One line per stage. Lowercase on purpose — the screen should sound like a
 * person, not a status bar. The second word carries the accent colour.
 */
const lines = [
  { pre: "hold", accent: "up" },
  { pre: "cooking", accent: "something" },
  { pre: "loading the", accent: "good stuff" },
  { pre: "almost,", accent: "don't blink" },
  { pre: "ok,", accent: "we're in" },
];

const status = [
  "waking up",
  "warming up",
  "building the scene",
  "compiling shaders",
  "ready",
];

/** Set once the overlay has lifted, so a remount can't re-run the gate. */
let bootDone = false;

/**
 * The boot screen. It is server-rendered so it is the first thing painted —
 * there is no flash of the page before it appears — and it lifts only when the
 * scene has claimed its final stage, i.e. a frame is actually on screen.
 *
 * Certificate images are deliberately not part of this: they only exist inside
 * the lightbox, so they load when a visitor opens one.
 */
export function Loader() {
  const pathname = usePathname();
  const home = pathname === "/";

  const [stage, setStageState] = useState(0);
  const [phase, setPhase] = useState<"boot" | "out" | "gone">(
    home ? "boot" : "gone",
  );

  const numberRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);

  useEffect(() => {
    if (!home || bootDone) {
      setPhase("gone");
      setBootLocked(false);
      return;
    }

    setBootLocked(true);
    document.documentElement.dataset.boot = "1";

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const hold = reduced ? 0 : 340;
      const fade = reduced ? 0 : 620;

      window.setTimeout(() => setPhase("out"), hold);
      window.setTimeout(() => {
        bootDone = true;
        setPhase("gone");
        // Release the layout before telling Lenis to resume: it re-measures
        // the document on start, and measuring while the page is still locked
        // gives it a zero scroll range it never recovers from.
        delete document.documentElement.dataset.boot;
        setBootLocked(false);
        computeScroll();
      }, hold + fade);
    };

    // Escape is the courtesy exit: nobody should be held hostage by a loader.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStage(BOOT_TOTAL);
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);

    // Polling the shared stage, rather than subscribing to it or watching it
    // through a second effect. Both of those have sharp edges here: the scene
    // is a separate chunk, and a re-run effect cancels its own exit timers.
    // A 100 ms read is free and cannot get out of step with reality.
    const started = Date.now();
    const id = window.setInterval(() => {
      const next = getStage();
      setStageState(next);

      // a shader that never compiles must not trap the visitor behind a
      // full-screen overlay
      if (next >= BOOT_TOTAL || Date.now() - started > 12000) {
        window.clearInterval(id);
        dismiss();
      }
    }, 100);

    requestAnimationFrame(() => setStage(1));

    return () => {
      window.clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [home]);

  // The counter eases toward the real stage, so it reads as progress rather
  // than three discrete jumps. Written straight to the DOM: sixty React
  // renders a second would be absurd for three digits.
  useEffect(() => {
    if (phase === "gone") return;
    let raf = 0;
    const tick = () => {
      const target = (getStage() / BOOT_TOTAL) * 100;
      shown.current += (target - shown.current) * 0.14;
      if (Math.abs(target - shown.current) < 0.4) shown.current = target;
      if (numberRef.current) {
        numberRef.current.textContent = String(Math.round(shown.current)).padStart(2, "0");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === "gone") return null;

  const active = Math.min(stage, lines.length - 1);
  const pct = (stage / BOOT_TOTAL) * 100;

  return (
    <div
      id="boot"
      aria-hidden="true"
      className="fixed inset-0 z-[120] flex flex-col justify-between overflow-hidden bg-ink px-6 py-6 sm:px-10 sm:py-8"
      style={{
        opacity: phase === "out" ? 0 : 1,
        transition: "opacity 620ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* two slow orange blooms, the same warmth the scene puts behind the city */}
      <div
        className="boot-blob pointer-events-none absolute -left-[20%] top-[-18%] h-[70vmax] w-[70vmax]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,107,44,0.16) 0%, rgba(255,107,44,0.05) 34%, rgba(10,10,11,0) 66%)",
        }}
      />
      <div
        className="boot-blob pointer-events-none absolute -right-[24%] bottom-[-26%] h-[62vmax] w-[62vmax]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,107,44,0.11) 0%, rgba(255,107,44,0.03) 36%, rgba(10,10,11,0) 68%)",
          animationDelay: "-4.5s",
        }}
      />
      {/* a faint breath of light drifting down the screen */}
      <div
        className="boot-scan pointer-events-none absolute inset-x-0 top-0 h-[30vh]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,107,44,0) 0%, rgba(255,107,44,0.055) 50%, rgba(255,107,44,0) 100%)",
        }}
      />
      {/* vignette, so the edges settle back into the page */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 50%, rgba(10,10,11,0) 38%, rgba(10,10,11,0.72) 100%)",
        }}
      />

      <div className="relative flex items-baseline justify-between">
        <span className="mono text-bone/60">~/{site.handle}</span>
        <span className="mono-sm text-bone/25">{site.role}</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="mono-sm mb-6 flex items-center gap-3 text-signal">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          <span className="tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}
          </span>
        </div>

        {/* the reel: one line at a time, sliding up out of the mask. Sized so
            the longest line fills the gutter at any viewport width. */}
        <div
          className="relative overflow-hidden"
          style={{ fontSize: "clamp(1.5rem, 9vw, 9.5rem)", height: "1.16em" }}
        >
          {lines.map((l, i) => {
            const offset = i - active;
            return (
              <div
                key={l.pre}
                className="absolute inset-x-0 top-0 flex items-baseline gap-[0.26em] whitespace-nowrap"
                style={{
                  height: "1.16em",
                  lineHeight: 1.16,
                  fontWeight: 500,
                  letterSpacing: "-0.045em",
                  transform: `translateY(${offset * 100}%)`,
                  opacity: offset === 0 ? 1 : 0,
                  transition:
                    "transform 760ms cubic-bezier(0.16, 1, 0.3, 1), opacity 520ms ease",
                }}
              >
                <span className="text-bone">{l.pre}</span>
                <span className="text-signal">{l.accent}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-center gap-6">
          {/* track: recessed, so the fill reads as light sitting in a channel */}
          <div
            className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-bone/[0.07]"
            style={{
              boxShadow:
                "inset 0 1px 3px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(240,238,232,0.10)",
            }}
          >
            <div
              className="relative h-full overflow-hidden rounded-full"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, #b8431a 0%, #ff6b2c 46%, #ffa06a 100%)",
                transition: "width 680ms cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow:
                  "0 0 18px rgba(255,107,44,0.55), 0 0 44px rgba(255,107,44,0.22), inset 0 1px 0 rgba(255,255,255,0.28)",
              }}
            >
              {/* travelling highlight — the bar looks alive rather than filled */}
              <span className="boot-shimmer absolute inset-y-0 left-0 w-full" />
              {/* bright leading cap */}
              <span
                className="absolute inset-y-0 right-0 w-[3px] rounded-full bg-[#ffd9c2]"
                style={{ boxShadow: "0 0 12px rgba(255,217,194,0.95)" }}
              />
            </div>

            {/* quarter ticks, absorbed by the fill as it passes them */}
            {[25, 50, 75].map((t) => (
              <span
                key={t}
                className="pointer-events-none absolute top-0 h-full w-px bg-bone/[0.16]"
                style={{
                  left: `${t}%`,
                  opacity: pct > t ? 0 : 1,
                  transition: "opacity 400ms ease",
                }}
              />
            ))}
          </div>
          <span className="mono-sm tabular-nums text-bone/45">
            <span ref={numberRef}>00</span>
            <span className="text-bone/20"> / 100</span>
          </span>
        </div>
      </div>

      <div className="relative flex items-baseline justify-between">
        <span className="mono-sm text-bone/35">{status[active]}</span>
        <span className="mono-sm text-bone/20">esc to skip</span>
      </div>
    </div>
  );
}
