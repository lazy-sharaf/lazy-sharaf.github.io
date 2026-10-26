import { skills } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="shell">
        <SectionHead index="02" label="skills" path="~/skills" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">cat skills.txt</p>
            <h2 className="h2">
              The
              <br />
              <span className="text-bone/84">toolkit.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              What I reach for on an engagement, and what I am reading when nothing is
              breaking.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {skills.map((group, i) => (
                <li key={group.group} className="group border-b border-bone/10">
                  <div className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-2 py-6 transition-colors group-hover:bg-bone/[0.02]">
                    <span className="mono-sm text-bone/40 tabular transition-colors group-hover:text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className="text-base text-bone/95 transition-colors group-hover:text-bone sm:text-lg">
                        {group.group}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-bone/74">
                        {group.items.map((item, j) => (
                          <span key={item}>
                            {j > 0 && (
                              <span className="text-signal/40" aria-hidden="true">
                                {" · "}
                              </span>
                            )}
                            {item}
                          </span>
                        ))}
                      </p>
                    </div>

                    <span className="mono-sm text-bone/60 tabular">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
