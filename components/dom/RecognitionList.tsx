"use client";

import { useState } from "react";
import { recognitions } from "@/lib/content";
import { ProofLightbox } from "./ProofLightbox";

export function RecognitionList() {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : recognitions[active];

  return (
    <>
      <ul className="border-t border-bone/10">
        {recognitions.map((entry, i) => (
          <li key={entry.org} className="border-b border-bone/10">
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View the ${entry.kind} from ${entry.org}`}
              className="group grid w-full grid-cols-[3.25rem_1fr_2.25rem] items-center gap-3 py-4 text-left transition-colors hover:bg-bone/[0.03] sm:grid-cols-[4rem_1fr_10rem_2.5rem] sm:gap-4 sm:py-5"
            >
              <span className="mono-sm text-bone/70 tabular transition-colors group-hover:text-signal">
                {entry.year}
              </span>

              <span className="min-w-0">
                <span className="block truncate text-base text-bone/95 transition-colors group-hover:text-bone sm:text-lg">
                  {entry.org}
                </span>
                <span className="mono-sm mt-1 block text-bone/60 sm:hidden">
                  {entry.kind}
                </span>
              </span>

              <span className="mono-sm hidden text-right text-bone/70 sm:block">
                {entry.kind}
              </span>

              <span className="ml-auto flex h-9 w-9 items-center justify-center border border-bone/15 text-bone/70 transition-all duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-[#0a0a0b]">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                >
                  <path d="M4.5 11.5 11.5 4.5M5.75 4.5h5.75v5.75" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {item && (
        <ProofLightbox
          image={item.image}
          title={item.org}
          meta={item.kind}
          note={item.note}
          year={item.year}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
