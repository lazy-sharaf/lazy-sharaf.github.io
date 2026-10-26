import { credentials, education, experience } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Credentials() {
  return (
    <section id="credentials" className="section">
      <div className="shell">
        <SectionHead index="05" label="credentials" path="~/certs" />

        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="h2">
              Certified.
              <br />
              <span className="text-bone/68">And still</span>
              <br />
              <span className="text-bone/68">reading source.</span>
            </h2>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {credentials.map((c) => (
                <li
                  key={c.name}
                  className="grid grid-cols-12 items-baseline gap-3 border-b border-bone/10 py-4"
                >
                  <span className="mono-sm col-span-2 text-bone/58">{c.year}</span>
                  <span className="col-span-10 text-sm text-bone/88 sm:col-span-6 sm:text-base">
                    {c.name}
                  </span>
                  <span className="mono-sm col-span-12 text-bone/62 sm:col-span-4 sm:text-right">
                    {c.issuer}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-bone/10 pt-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h3 className="mono text-bone/68">Experience</h3>
          </div>

          <div className="md:col-span-8">
            <ul className="space-y-10">
              {experience.map((job) => (
                <li key={job.title}>
                  <p className="mono-sm text-signal/85">{job.period}</p>
                  <h4 className="mt-2 text-lg text-bone/95">{job.title}</h4>
                  <p className="mono-sm mt-1 text-bone/62">{job.org}</p>
                  <ul className="mt-4 space-y-2">
                    {job.points.map((point) => (
                      <li key={point} className="body flex gap-3">
                        <span className="mt-[0.6em] h-px w-3 shrink-0 bg-bone/20" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-bone/10 pt-8">
              <p className="mono-sm text-signal/85">{education.period}</p>
              <h4 className="mt-2 text-lg text-bone/95">{education.degree}</h4>
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
