import { additionalDisclosures, numbers } from "@/lib/content";
import { RecognitionList } from "./RecognitionList";
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
              <span className="text-bone/84">institutions.</span>
            </h2>
            <p className="body mt-6 max-w-sm">
              These are the ones that put their name to it. Others received the report
              without a published recognition. Open any entry to see the acknowledgement
              itself.
            </p>
          </div>

          <div className="md:col-span-8">
            <RecognitionList />

            <p className="mono-sm mt-5 text-bone/74">
              Also disclosed to: {additionalDisclosures.join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-bone/10 pt-10 sm:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.label}>
              <p className="text-4xl font-medium tracking-tighter text-bone tabular sm:text-5xl">
                {n.value}
              </p>
              <p className="mono-sm mt-3 leading-relaxed text-bone/78">{n.label}</p>
              {n.sub && <p className="mono-sm mt-1 text-signal/85">{n.sub}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
