import type { CSSProperties } from "react";
import { site } from "@/lib/content";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 md:min-h-[100svh] md:justify-center"
    >
      <div className="shell">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-2 md:col-span-7">
            <p className="prompt">cat role.txt</p>
            <div className="mono flex flex-wrap items-center gap-x-3 gap-y-2 text-bone/84">
              <span>{site.role}</span>
              <span className="text-bone/70" aria-hidden="true">
                /
              </span>
              <span>{site.subRole}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-5">
            <p className="prompt">cat status.txt</p>
            <p className="mono-sm text-bone/84">{site.status}</p>
          </div>
        </div>
      </div>

      <div className="shell mt-8 sm:mt-10">
        <div
          className="@container relative"
          style={{ "--hero-name": "min(17.2cqw, 24svh)" } as CSSProperties}
        >
          <p className="prompt mb-4">whoami</p>

          {/* the name block is its own frame so the portrait keeps its ratio
              when anything is added underneath */}
          <div className="relative">
            <h1
              className="display uppercase"
              style={{ fontSize: "var(--hero-name)" }}
            >
              <span className="block">Mahbubur</span>
              <span className="block">Rahman</span>
              <span className="block text-signal">Soraf</span>
            </h1>

            {/* sized and placed off the name itself, so the composition holds at
                every width — hair on the first line, base on the last */}
            <figure
              className="absolute top-[23%]"
              style={{
                width: "calc(var(--hero-name) * 1.744)",
                right: "calc(96% - var(--hero-name) * 5.394)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portrait.webp"
                alt={`${site.name}, ${site.role}`}
                width={900}
                height={1063}
                className="h-auto w-full"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, #000 82%, rgba(0,0,0,0) 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 82%, rgba(0,0,0,0) 100%)",
                }}
              />
            </figure>
          </div>

          <a
            href="/Mahbubur_Rahman_Soraf_CV.pdf"
            download
            style={{ fontSize: "0.75rem" }}
            className="mono group mt-8 inline-flex items-center gap-4 border border-signal/70 px-7 py-4 text-signal transition-all duration-300 hover:-translate-y-0.5 hover:border-signal hover:bg-signal hover:text-[#0a0a0b] hover:shadow-[0_16px_44px_-16px_rgba(255,107,44,0.65)]"
          >
            <span>download cv</span>
            <span className="h-4 w-px bg-signal/35 transition-colors group-hover:bg-[#0a0a0b]/30" aria-hidden="true" />
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="square"
            >
              <path d="M8 2.5v10M3.75 8.25 8 12.5l4.25-4.25" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
