import { ethicsQuote } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Ethics() {
  return (
    <section id="ethics" className="section">
      <div className="shell">
        <SectionHead index="08" label="ethics" path="~/ethics" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">cat ethics.md</p>
            <h2 className="h2">
              Proof,
              <br />
              <span className="text-bone/84">not possession.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              The proof of a vulnerability is that it exists — not that you kept a copy of
              what you found.
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <figure className="border-l border-signal/40 pl-6 sm:pl-8">
              <blockquote className="max-w-2xl text-[clamp(1.15rem,1.7vw,1.5rem)] leading-[1.45] text-bone/90">
                <span className="signal">“</span>
                {ethicsQuote.quote}
                <span className="signal">”</span>
              </blockquote>
              <figcaption className="mono-sm mt-5 text-bone/70">
                {ethicsQuote.attribution} — a live customer support chatbot, 2026
              </figcaption>
            </figure>

            <p className="body mt-10 max-w-2xl">
              I report, I retest the fix, and I delete what I do not need. Every
              organisation listed above received the same process: a reproducible finding,
              a plain impact statement, and no data beyond what was required to demonstrate
              the flaw.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
