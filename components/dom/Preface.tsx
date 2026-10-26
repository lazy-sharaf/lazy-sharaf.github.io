import { site } from "@/lib/content";

/**
 * Opening statement, sitting between the hero and the index.
 * Deliberately not numbered — it reads as a preface to the directory
 * rather than a stop inside it. The long-form bio lives in <About />.
 */
export function Preface() {
  return (
    <section id="preface" className="relative pt-14 pb-20 sm:pt-16 sm:pb-24">
      <div className="shell">
        <div className="rule" />

        <div className="mono-sm mt-5 flex items-center justify-between text-bone/70">
          <span className="flex items-center gap-3">
            <span className="text-signal" aria-hidden="true">
              //
            </span>
            <span>preface</span>
          </span>
          <span className="hidden sm:block">~/intro</span>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <h2 className="over-field text-[clamp(2.1rem,4.6vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.04em]">
              {site.introLead}{" "}
              <span className="text-signal">{site.introAccent}</span>
            </h2>
          </div>

          <div className="md:col-span-4 md:col-start-9 md:border-l md:border-bone/12 md:pl-8">
            <p className="body">{site.introBody}</p>

            <a
              href="#about"
              className="prompt mt-8 inline-block transition-colors hover:text-bone"
            >
              read the long version
            </a>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-4 border-t border-bone/10 pt-4">
          <span className="mono-sm text-bone/70">scroll</span>
          <span className="h-px w-16 bg-bone/15" aria-hidden="true" />
          <span className="mono-sm ml-auto hidden text-bone/70 sm:block">
            {site.location}
          </span>
        </div>
      </div>
    </section>
  );
}
