import { credentials } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="shell">
        <SectionHead index="07" label="certifications" path="~/certs" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">ls ~/certs</p>
            <h2 className="h2">
              Certified.
              <br />
              <span className="text-bone/68">Still reading</span>
              <br />
              <span className="text-bone/68">source.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              Six credentials across application security, network security and API
              testing.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {credentials.map((c) => (
                <li
                  key={c.name}
                  className="group grid grid-cols-12 items-baseline gap-3 border-b border-bone/10 py-4 transition-colors hover:bg-bone/[0.025]"
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
      </div>
    </section>
  );
}
