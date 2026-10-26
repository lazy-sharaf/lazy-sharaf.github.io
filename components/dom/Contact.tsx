import { site } from "@/lib/content";
import { SectionHead } from "./SectionHead";

export function Contact() {
  return (
    <section id="contact" className="section pb-32">
      <div className="shell">
        <SectionHead index="10" label="contact" path="~/contact" />

        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="h2">
              Have an <span className="text-signal">attack</span>
              <br />
              <span className="text-signal">surface</span> worth
              <br />
              <span className="text-bone/84">testing?</span>
            </h2>

            <a
              href={`mailto:${site.email}`}
              className="group mt-10 inline-flex items-baseline gap-3 border-b border-bone/20 pb-2 transition-colors hover:border-signal"
            >
              <span className="text-lg text-bone/95 transition-colors group-hover:text-signal sm:text-2xl">
                {site.email}
              </span>
              <span className="mono-sm text-bone/74 transition-colors group-hover:text-signal">
                ↗
              </span>
            </a>

            <p className="body mt-6 max-w-md">
              Available for penetration testing, security research and responsible
              disclosure work. Based in Dhaka — working remotely.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <p className="mono-sm text-bone/60">Elsewhere</p>

            <ul className="mt-3 border-t border-bone/10">
              {[
                { label: "github", href: site.github, handle: "lazy-sharaf" },
                { label: "linkedin", href: site.linkedin, handle: "lazysharaf" },
                { label: "x", href: site.x, handle: "@lazy_sharaf" },
                { label: "facebook", href: site.facebook, handle: "lazysharaf" },
                { label: "medium", href: site.medium, handle: "@lazysharaf" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-baseline gap-4 border-b border-bone/10 py-3 transition-colors hover:bg-bone/[0.03]"
                  >
                    <span className="mono-sm w-20 shrink-0 text-bone/60 transition-colors group-hover:text-signal">
                      {item.label}
                    </span>
                    <span className="flex-1 truncate text-sm text-bone/90 transition-colors group-hover:text-bone">
                      {item.handle}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mono-sm text-bone/40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <dl className="mt-8 flex items-baseline justify-between gap-4">
              <dt className="mono-sm text-bone/60">Location</dt>
              <dd className="text-right text-sm text-bone/88">{site.location}</dd>
            </dl>
          </div>
        </div>

        <footer className="mt-24 flex flex-col gap-4 border-t border-bone/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-sm text-bone/70">
            © {site.year} {site.name}
          </p>
          <p className="mono-sm text-bone/70">
            Built from scratch. No templates.
          </p>
        </footer>
      </div>
    </section>
  );
}
