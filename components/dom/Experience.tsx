import { education, experience } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Experience() {
  return (
    <section id="experience" className="section">
      <div className="shell">
        <SectionHead index="08" label="experience" path="~/cv" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">cat experience.log</p>
            <h2 className="h2">
              Where
              <br />
              <span className="text-bone/68">I&rsquo;ve been.</span>
            </h2>
          </div>

          <div className="md:col-span-8">
            <ul className="space-y-12">
              {experience.map((job) => (
                <li key={job.title} className="border-t border-bone/10 pt-6">
                  <p className="mono-sm text-signal/85">{job.period}</p>
                  <h3 className="mt-2 text-lg text-bone/95">{job.title}</h3>
                  <p className="mono-sm mt-1 text-bone/62">{job.org}</p>
                  <ul className="mt-4 space-y-2">
                    {job.points.map((point) => (
                      <li key={point} className="body flex gap-3">
                        <span
                          className="mt-[0.6em] h-px w-3 shrink-0 bg-bone/20"
                          aria-hidden="true"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-bone/10 pt-6">
              <p className="mono-sm text-signal/85">{education.period}</p>
              <h3 className="mt-2 text-lg text-bone/95">{education.degree}</h3>
              <p className="mono-sm mt-1 text-bone/62">
                {education.org} · {education.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
