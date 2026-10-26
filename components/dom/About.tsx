import { site } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function About() {
  return (
    <section id="about" className="section">
      <div className="shell">
        <SectionHead index="01" label="about" path="~/about" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="prompt mb-5">cat status.txt</p>
            <h2 className="h2">
              Breaking
              <br />
              <span className="text-signal">things</span>
              <br />
              <span className="text-bone/84">responsibly.</span>
            </h2>
            <p className="mono-sm mt-6 text-bone/74">since 2022</p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="prose">
              <p>{site.about}</p>
              <p>{site.aboutSecond}</p>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {site.aboutTags.map((tag) => (
                <li
                  key={tag}
                  className="mono-sm border border-bone/15 px-2.5 py-1.5 text-bone/84"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
