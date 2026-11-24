import Link from "next/link";
import { writeups } from "@/lib/content";
import { InlineCode } from "@/components/ui/InlineCode";
import { SectionHead } from "./SectionHead";

export function Writeups() {
  return (
    <section id="writeup" className="section">
      <div className="shell">
        <SectionHead index="09" label="writeups" path="~/writeups" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">ls ./writeups</p>
            <h2 className="h2">
              Stories from
              <br />
              the <span className="text-signal">trenches.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              Full writeups. The recon, the dead ends, and the exact moment it
              worked.
            </p>
            <p className="mono-sm mt-8 text-bone/70">
              {writeups.length} case files · tap one to open
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {writeups.map((w) => {
                const split = w.codename.lastIndexOf(" ");
                const head = w.codename.slice(0, split);
                const tail = w.codename.slice(split + 1);

                return (
                  <Link
                    key={w.id}
                    href={w.href}
                    className="wcard panel hover-lift group flex flex-col p-6 sm:p-7"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="mono-sm text-signal">{w.id}</span>
                      {w.badge && (
                        <span className="wcard-badge mono-sm shrink-0">
                          {w.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="h3 mt-6 text-[1.35rem] leading-[1.08] text-signal sm:text-[1.5rem]">
                      {head} <span>{tail}</span>
                      <span className="signal">.</span>
                    </h3>

                    <p className="mono-sm mt-3 text-bone/70">{w.category}</p>

                    <p className="body mt-4 text-sm">
                      <InlineCode text={w.oneLiner} />
                    </p>

                    <dl className="wcard-meta mt-auto border-t border-bone/10 pt-5">
                      {w.meta.map((m) => (
                        <div
                          key={m.label}
                          className="flex items-baseline justify-between gap-3 py-1.5"
                        >
                          <dt className="mono-sm shrink-0 text-bone/68">
                            {m.label}
                          </dt>
                          <dd className="text-right text-xs text-bone/92 sm:text-sm">
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <span className="ul-link mono mt-6 inline-flex items-center gap-2 text-bone/93 group-hover:text-bone">
                      {w.readLabel}
                      <span className="wcard-arrow text-signal" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
