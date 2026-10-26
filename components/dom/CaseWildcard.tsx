import Link from "next/link";
import { featuredCase } from "@/lib/content";
import { InlineCode } from "@/components/ui/InlineCode";
import { SectionHead } from "./SectionHead";

export function CaseWildcard() {
  // last word of the headline carries the accent
  const split = featuredCase.codename.lastIndexOf(" ");
  const head = featuredCase.codename.slice(0, split);
  const tail = featuredCase.codename.slice(split + 1);

  return (
    <section id="case" className="section">
      <div className="shell">
        <SectionHead index="09" label="writeup" path="~/writeup" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mono mb-5 text-bone/80">
              {featuredCase.id} <span className="text-bone/70">/</span>{" "}
              {featuredCase.year}
            </p>

            <h2 className="h2">
              {head} <span className="text-signal">{tail}</span>
              <span className="signal">.</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone/90 sm:text-xl">
              <InlineCode text={featuredCase.oneLiner} />
            </p>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-bone/10 pt-6">
              {featuredCase.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="mono-sm text-bone/78">{stat.label}</dt>
                  <dd className="mt-2">
                    <span className="block text-3xl font-medium tracking-tight text-bone tabular sm:text-4xl">
                      {stat.value}
                    </span>
                    <span className="mono-sm mt-1 block text-signal/90">{stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={featuredCase.href}
              className="ul-link mono mt-10 inline-block text-bone/93 hover:text-bone"
            >
              Read the writeup →
            </Link>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <dl className="panel p-6">
              <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 pb-4">
                <dt className="mono-sm text-bone/78">Target</dt>
                <dd className="text-right text-sm text-bone/92">{featuredCase.target}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 py-4">
                <dt className="mono-sm text-bone/78">Program</dt>
                <dd className="text-right text-sm text-bone/92">{featuredCase.program}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-bone/10 py-4">
                <dt className="mono-sm text-bone/78">Severity</dt>
                <dd className="text-right">
                  <span className="mono-sm border border-signal/40 px-2 py-1 text-signal">
                    {featuredCase.severity}
                  </span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-4">
                <dt className="mono-sm text-bone/78">Outcome</dt>
                <dd className="text-right text-sm text-bone/92">{featuredCase.outcome}</dd>
              </div>
            </dl>

            <p className="mono-sm mt-6 leading-relaxed text-bone/84">
              Responsible disclosure. No customer data retained. The vendor took the
              service offline until the fix was verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
