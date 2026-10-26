"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { nav, site } from "@/lib/content";

type Command = {
  id: string;
  label: string;
  hint: string;
  group: "navigate" | "contact" | "external";
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (id: string) => () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose();
    };

    return [
      ...nav.map((item) => ({
        id: `goto-${item.id}`,
        label: `Go to ${item.label}`,
        hint: `#${item.id}`,
        group: "navigate" as const,
        run: go(item.id),
      })),
      {
        id: "copy-email",
        label: "Copy email address",
        hint: site.email,
        group: "contact",
        run: () => {
          void navigator.clipboard?.writeText(site.email);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        },
      },
      {
        id: "github",
        label: "GitHub",
        hint: site.githubLabel,
        group: "external",
        run: () => window.open(site.github, "_blank", "noopener"),
      },
      {
        id: "medium",
        label: "Writeups on Medium",
        hint: site.mediumLabel,
        group: "external",
        run: () => window.open(site.medium, "_blank", "noopener"),
      },
    ];
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint.toLowerCase().includes(q) ||
        c.id.includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % Math.max(filtered.length, 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        filtered[active]?.run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[18vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl border border-bone/15 bg-[#0d0d0f] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 border-b border-bone/10 px-4 py-3">
          <span className="mono-sm text-signal">›</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search index, contact, writeups…"
            className="w-full bg-transparent font-mono text-sm text-bone placeholder:text-bone/58 focus:outline-none"
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="kbd">esc</kbd>
        </div>

        <ul className="max-h-72 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <li className="px-4 py-6 mono-sm text-bone/62">No match.</li>
          )}
          {filtered.map((cmd, i) => (
            <li key={cmd.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={cmd.run}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-bone/[0.06]" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      i === active ? "bg-signal" : "bg-transparent"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm text-bone/92">{cmd.label}</span>
                </span>
                <span className="mono-sm text-bone/58">{cmd.hint}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-bone/10 px-4 py-2">
          <span className="mono-sm text-bone/55">
            {copied ? "copied to clipboard" : "↑↓ navigate · ↵ select"}
          </span>
          <span className="mono-sm text-bone/55">{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
