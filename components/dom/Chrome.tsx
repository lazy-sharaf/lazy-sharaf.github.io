"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { nav, navPrimary, sections, site } from "@/lib/content";
import { CommandPalette } from "./CommandPalette";

function useUtcClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Chrome() {
  const time = useUtcClock();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [progress, setProgress] = useState(0);
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, on: false });

  /* scroll: progress, condense, auto-hide, active section */
  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    let hide = false;

    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      setProgress(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0);
      setCondensed(y > 16);

      const dy = y - lastY;
      if (Math.abs(dy) > 3) {
        if (y > 520 && dy > 0) hide = true;
        else if (dy < 0) hide = false;
      }
      if (y < 160) hide = false;
      lastY = y;
      setHidden(hide);

      let current: string | null = null;
      for (const item of navPrimary) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.38) {
          current = item.id;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* the underline follows the pointer, then falls back to the current section */
  const measure = useCallback(() => {
    const key = hovered ?? active;
    const idx = key ? navPrimary.findIndex((n) => n.id === key) : -1;
    const el = idx >= 0 ? linkRefs.current[idx] : null;

    if (!el || el.offsetWidth === 0) {
      setIndicator((v) => (v.on ? { ...v, on: false } : v));
      return;
    }

    const x = el.offsetLeft;
    const w = el.offsetWidth;
    setIndicator((v) => (v.x === x && v.w === w && v.on ? v : { x, w, on: true }));
  }, [active, hovered]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  const measureRef = useRef(measure);
  measureRef.current = measure;

  useEffect(() => {
    const onResize = () => measureRef.current();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => measureRef.current()).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* palette */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* lock the page behind the mobile menu */
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="nav"
        data-condensed={condensed}
        data-hidden={hidden && !menuOpen}
      >
        <div className="nav-inner">
          <a href="#hero" className="nav-brand" aria-label={`${site.name} — home`}>
            <span className="brand-sigil" aria-hidden="true">
              <span className="brand-plus">+</span>
            </span>
            <span className="brand-word">soraf</span>
          </a>

          <span className="nav-status">open to engagements</span>

          <div className="nav-right">
            <nav className="nav-links" aria-label="Sections">
              <span
                className="nav-indicator"
                aria-hidden="true"
                data-on={indicator.on}
                style={{
                  transform: `translateX(${indicator.x}px)`,
                  width: indicator.w,
                }}
              />

              {navPrimary.map((item, i) => (
                <a
                  key={item.id}
                  ref={(el) => {
                    linkRefs.current[i] = el;
                  }}
                  href={`#${item.id}`}
                  className="nav-link"
                  data-active={active === item.id}
                  aria-current={active === item.id ? "true" : undefined}
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(item.id)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="nav-num">{item.number}</span>
                  <span className="nav-roll">
                    <span>{item.label}</span>
                    <span aria-hidden="true">{item.label}</span>
                  </span>
                </a>
              ))}
            </nav>

            <div className="nav-meta">
              <span className="nav-clock">
                {time}
                <span>UTC</span>
              </span>

              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="nav-kbd"
                aria-label="Open command palette"
              >
                <span className="nav-kbd-key">⌘K</span>
                <span className="nav-kbd-label">index</span>
              </button>

              <button
                type="button"
                className="nav-burger"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        <div className="nav-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </header>

      <div className="nav-menu" id="site-menu" data-open={menuOpen}>
        <div className="nav-menu-inner shell">
          <p className="prompt">ls ~/soraf</p>

          <ul className="nav-menu-list">
            {sections
              .filter((s) => s.id !== "hero")
              .map((s, i) => (
                <li
                  key={s.id}
                  className="nav-menu-item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <a
                    href={`#${s.id}`}
                    className="nav-menu-link"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="nav-menu-num">{s.number}</span>
                    <span className="nav-menu-label">{s.label}</span>
                    <span className="nav-menu-path">{s.path}</span>
                  </a>
                </li>
              ))}
          </ul>

          <div className="nav-menu-foot">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.github} target="_blank" rel="noopener noreferrer">
              {site.githubLabel}
            </a>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
        <div className="shell flex items-end justify-between pb-5">
          <div className="mono-sm flex items-center gap-2 text-bone/74">
            <span className="tabular w-8">{Math.round(progress)}%</span>
            <span className="progress-track" aria-hidden="true">
              <span className="progress-fill" style={{ width: `${progress}%` }} />
            </span>
            <span className="hidden text-bone/70 sm:inline">~/soraf</span>
          </div>
          <a
            href="#contact"
            className="mono-sm pointer-events-auto text-bone/80 hover:text-signal transition-colors"
          >
            ↓ contact
          </a>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
