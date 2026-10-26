"use client";

import { useEffect } from "react";

export function ProofLightbox({
  image,
  title,
  meta,
  note,
  year,
  onClose,
}: {
  image: string;
  title: string;
  meta: string;
  note?: string;
  year: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ${meta}`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex flex-col bg-[#08080a]/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="mono-sm text-bone/70">
          {year} <span className="text-bone/40">/</span> {meta}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mono-sm text-bone/70 transition-colors hover:text-bone"
        >
          close [esc]
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-5 sm:px-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — ${meta}`}
          onClick={(event) => event.stopPropagation()}
          className="max-h-full max-w-full border border-bone/10 object-contain"
        />
      </div>

      <div className="border-t border-bone/10 px-5 py-5 sm:px-8">
        <p className="text-lg text-bone/95">{title}</p>
        {note && <p className="body mt-1 max-w-2xl text-sm">{note}</p>}
      </div>
    </div>
  );
}
