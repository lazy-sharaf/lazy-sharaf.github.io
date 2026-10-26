import { indexEntries } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function IndexSection() {
  return (
    <section id="index" className="section">
      <div className="shell">
        <SectionHead index="00" label="index" path="~/" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">ls ./sections</p>
            <h2 className="h2">
              Choose
              <br />
              where to
              <br />
              <span className="text-signal">dive in.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              Seven directories. Each one opens where it lives on the page.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {indexEntries.map((entry, i) => (
                <li key={entry.path}>
                  <a
                    href={entry.href}
                    className="group flex items-baseline gap-3 border-b border-bone/10 py-4 transition-colors hover:bg-bone/[0.025] sm:gap-5"
                  >
                    <span className="mono-sm w-10 shrink-0 text-bone/74 tabular">
                      {String(i + 1).padStart(2, "0")}/
                      {String(indexEntries.length).padStart(2, "0")}
                    </span>

                    <span className="mono-sm hidden w-32 shrink-0 text-signal/85 sm:block">
                      {entry.path}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-bone/95 transition-colors group-hover:text-bone sm:text-base">
                        {entry.title}
                      </span>
                      <span className="mono-sm mt-1 block truncate text-bone/74">
                        {entry.note}
                      </span>
                    </span>

                    <span className="mono-sm hidden shrink-0 text-bone/74 md:block">
                      {entry.count}
                    </span>

                    <span className="mono-sm shrink-0 text-bone/70 transition-colors group-hover:text-signal">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mono-sm mt-5 break-all text-bone/70">
              {indexEntries.map((e) => e.path.replace("~/", "")).join("/")}/
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
