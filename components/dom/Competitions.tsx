import { competitions, organising } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Competitions() {
  return (
    <section id="competitions" className="section">
      <div className="shell">
        <SectionHead index="05" label="ctf &amp; competitions" path="~/ctf" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="h2">
              Measured
              <br />
              <span className="text-signal">against the</span>
              <br />
              <span className="text-bone/84">field.</span>
            </h2>
            <p className="body mt-6 max-w-sm">
              Six results across national and international events, plus one event I built
              rather than entered.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {competitions.map((c) => (
                <li
                  key={`${c.year}-${c.name}`}
                  className="group grid grid-cols-12 items-baseline gap-3 border-b border-bone/10 py-5"
                >
                  <span className="mono-sm col-span-2 text-bone/74">{c.year}</span>
                  <span className="col-span-6 text-base text-signal sm:text-lg">
                    {c.name}
                  </span>
                  <span className="col-span-4 text-right">
                    <span className="block text-sm text-bone/90">{c.result}</span>
                    <span className="mono-sm mt-1 block text-bone/74">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-l border-signal/40 pl-5">
              <p className="mono-sm text-signal/90">
                {organising.year} · Organiser &amp; Problem Setter
              </p>
              <p className="mt-2 text-base text-bone/95">{organising.name}</p>
              <p className="body mt-2 max-w-lg">{organising.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
