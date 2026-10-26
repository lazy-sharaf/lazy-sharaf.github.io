import { additionalDisclosures, numbers, recognitions } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function DisclosureRecord() {
  return (
    <section id="record" className="section">
      <div className="shell">
        <SectionHead index="03" label="recognition" path="~/record" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="h2">
              Recognised
              <br />
              by the
              <br />
              <span className="text-bone/68">institutions.</span>
            </h2>
            <p className="body mt-6 max-w-sm">
              Six organisations have publicly acknowledged disclosures. Two more received
              them without a published recognition.
            </p>
          </div>

          <div className="md:col-span-8">
            <ul className="border-t border-bone/10">
              {recognitions.map((item) => (
                <li
                  key={item.org}
                  className="group grid grid-cols-12 items-baseline gap-3 border-b border-bone/10 py-5 transition-colors hover:bg-bone/[0.025]"
                >
                  <span className="mono-sm col-span-2 text-bone/58">{item.year}</span>
                  <span className="col-span-7 text-base text-bone/92 transition-colors group-hover:text-bone sm:text-lg">
                    {item.org}
                  </span>
                  <span className="mono-sm col-span-3 text-right text-bone/62 transition-colors group-hover:text-signal">
                    {item.kind}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mono-sm mt-5 text-bone/58">
              Also disclosed to: {additionalDisclosures.join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-bone/10 pt-10 sm:grid-cols-3 lg:grid-cols-5">
          {numbers.map((n) => (
            <div key={n.label}>
              <p className="text-4xl font-medium tracking-tighter text-bone tabular sm:text-5xl">
                {n.value}
              </p>
              <p className="mono-sm mt-3 leading-relaxed text-bone/62">{n.label}</p>
              {n.sub && <p className="mono-sm mt-1 text-signal/85">{n.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
