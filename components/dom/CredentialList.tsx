"use client";

import { useState } from "react";
import { credentials, type Credential } from "@/lib/content";
import { ProofLightbox } from "./ProofLightbox";

function Arrow() {
  return (
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
  );
}

function RowContent({ entry }: { entry: Credential }) {
  return (
    <>
      <span className="mono-sm text-bone/70 tabular transition-colors group-hover:text-signal">
        {entry.year}
      </span>

      <span className="min-w-0">
        <span className="block text-sm text-signal transition-colors group-hover:text-bone sm:text-base">
          {entry.name}
        </span>
        <span className="mono-sm mt-1 block text-bone/60 sm:hidden">{entry.issuer}</span>
      </span>

      <span className="mono-sm hidden text-right text-bone/70 sm:block">{entry.issuer}</span>

      {entry.image ? <Arrow /> : <span className="ml-auto h-9 w-9" aria-hidden="true" />}
    </>
  );
}

export function CredentialList() {
  const [active, setActive] = useState<number | null>(null);
  const item = active === null ? null : credentials[active];

  return (
    <>
      <ul className="border-t border-bone/10">
        {credentials.map((entry, i) => (
          <li key={entry.name} className="border-b border-bone/10">
            {entry.image ? (
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View the certificate for ${entry.name}`}
                className="group grid w-full grid-cols-[3.25rem_1fr_2.25rem] items-center gap-3 py-4 text-left transition-colors hover:bg-bone/[0.03] sm:grid-cols-[4rem_1fr_12rem_2.5rem] sm:gap-4 sm:py-5"
              >
                <RowContent entry={entry} />
              </button>
            ) : (
              <div className="grid grid-cols-[3.25rem_1fr_2.25rem] items-center gap-3 py-4 sm:grid-cols-[4rem_1fr_12rem_2.5rem] sm:gap-4 sm:py-5">
                <RowContent entry={entry} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {item?.image && (
        <ProofLightbox
          image={item.image}
          title={item.name}
          meta={item.issuer}
          note={item.note}
          year={item.year}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
