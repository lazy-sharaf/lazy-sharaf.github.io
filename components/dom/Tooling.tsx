import { toolAscii, tools } from "@/lib/content";
import { SectionHead } from "./SectionHead";

function asFlag(tag: string, highlight?: string) {
  if (highlight && tag === highlight) return tag;
  return `--${tag.toLowerCase().replace(/\s+/g, "-")}`;
}

export function Tooling() {
  return (
    <section id="tooling" className="section">
      <div className="shell">
        <SectionHead index="05" label="projects &amp; tools" path="~/bin" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">ls -la ~/bin</p>
            <h2 className="h2">
              Built
              <br />
              to look
              <br />
              <span className="text-bone/68">closer.</span>
            </h2>
          </div>

          <div className="md:col-span-8">
            <ul>
              {tools.map((tool, i) => (
                <li
                  key={tool.name}
                  className="group border-t border-bone/10 py-8 last:border-b last:border-bone/10"
                >
                  <div className="grid gap-5 sm:grid-cols-12">
                    <div className="sm:col-span-1">
                      <span className="mono-sm text-bone/58">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="min-w-0 sm:col-span-5">
                      <pre className="ascii mb-4 hidden xl:block" aria-hidden="true">
                        {toolAscii[tool.name]}
                      </pre>
                      <h3 className="h3 transition-colors group-hover:text-signal">
                        {tool.name}
                      </h3>
                      <p className="mono-sm mt-2 text-bone/62">{tool.tagline}</p>
                    </div>

                    <div className="min-w-0 sm:col-span-6">
                      <p className="body">{tool.description}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {tool.tags.map((tag) => (
                          <li
                            key={tag}
                            className={`mono-sm normal-case border px-2 py-1 ${
                              tag === tool.highlight
                                ? "border-signal/40 text-signal"
                                : "border-bone/15 text-bone/65"
                            }`}
                          >
                            {asFlag(tag, tool.highlight)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mono-sm mt-6 text-bone/58">
              Released on GitHub. Source available on request where a tool targets a live
              CVE.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
