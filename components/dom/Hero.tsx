import { site } from "@/lib/content";

const summary = [
  { value: "08", label: "organisations disclosed to" },
  { value: "06", label: "public recognitions" },
  { value: "05", label: "competition results" },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col pt-28 pb-24 sm:pt-32 sm:pb-20"
    >
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="flex flex-col gap-2 md:col-span-7">
            <p className="prompt">cat role.txt</p>
            <div className="mono flex flex-wrap items-center gap-x-3 gap-y-2 text-bone/70">
              <span>{site.role}</span>
              <span className="text-bone/55" aria-hidden="true">
                /
              </span>
              <span>{site.subRole}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-5">
            <p className="prompt">cat status.txt</p>
            <p className="mono-sm text-bone/68">{site.status}</p>
          </div>
        </div>
      </div>

      <div className="shell my-auto">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="prompt mb-4">whoami</p>
            <h1 className="display uppercase">
              <span className="block">Mahbubur</span>
              <span className="block">Rahman</span>
              <span className="block">Soraf</span>
            </h1>
          </div>

          <dl className="over-field hidden shrink-0 pb-3 text-right lg:block">
            {summary.map((item) => (
              <div key={item.label} className="mb-4 last:mb-0">
                <dt className="text-2xl font-medium tracking-tight text-bone/95 tabular">
                  {item.value}
                </dt>
                <dd className="mono-sm mt-1 text-bone/75">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="shell mt-8">
        <div className="rule mb-6" />
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
          <p className="h3 md:col-span-5">
            <span className="signal">Boring recon wins.</span>
          </p>
          <p className="body md:col-span-5 md:col-start-8">{site.intro}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href="#case"
            className="prompt whitespace-nowrap transition-colors hover:text-bone"
          >
            tail -f case/001
          </a>
          <span className="h-px w-16 bg-bone/15" aria-hidden="true" />
          <span className="mono-sm text-bone/58">scroll</span>
        </div>
      </div>
    </section>
  );
}
