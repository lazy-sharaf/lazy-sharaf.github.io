import { ethicsQuote } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Ethics() {
  return (
    <section id="ethics" className="section">
      <div className="shell">
        <SectionHead index="09" label="ethics" path="~/ethics" />

        <figure className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-2">
            <span className="mono-sm text-bone/55">— on restraint</span>
          </div>

          <blockquote className="md:col-span-10">
            <p className="max-w-4xl text-[clamp(1.6rem,4vw,3.25rem)] font-medium leading-[1.1] tracking-tight text-bone/95">
              <span className="signal">“</span>
              {ethicsQuote.quote}
              <span className="signal">”</span>
            </p>
            <figcaption className="mono-sm mt-8 text-bone/62">
              {ethicsQuote.attribution} — a live customer support chatbot, 2026
            </figcaption>
          </blockquote>
        </figure>

        <div className="mt-16 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-2" />
          <div className="md:col-span-10 md:max-w-3xl">
            <p className="body">
              The proof of a vulnerability is that it exists — not that you kept a copy of
              what you found. I report, I retest the fix, and I delete what I do not need.
              Every organisation listed above received the same process: a reproducible
              finding, a plain impact statement, and no data beyond what was required to
              demonstrate the flaw.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
