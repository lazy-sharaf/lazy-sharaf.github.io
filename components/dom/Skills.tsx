import { skills } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Skills() {
  return (
    <section id="skills" className="section">
      <div className="shell">
        <SectionHead index="02" label="skills" path="~/skills" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">cat skills.txt</p>
            <h2 className="h2">
              The
              <br />
              <span className="text-bone/68">toolkit.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              What I reach for on an engagement, and what I am reading when nothing is
              breaking.
            </p>
          </div>

          <div className="md:col-span-8">
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {skills.map((group) => (
                <div key={group.group} className="border-t border-bone/10 pt-5">
                  <h3 className="mono-sm text-signal/90">{group.group}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="mono-sm border border-bone/15 px-2.5 py-1.5 text-bone/68 transition-colors hover:border-bone/30 hover:text-bone/84"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
