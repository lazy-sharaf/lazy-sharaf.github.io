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
              Have an attack
              <br />
              surface worth
              <br />
              <span className="text-bone/68">testing?</span>
            </h2>

            <a
              href={`mailto:${site.email}`}
              className="group mt-10 inline-flex items-baseline gap-3 border-b border-bone/20 pb-2 transition-colors hover:border-signal"
            >
              <span className="text-lg text-bone/92 transition-colors group-hover:text-signal sm:text-2xl">
                {site.email}
              </span>
              <span className="mono-sm text-bone/58 transition-colors group-hover:text-signal">
                ↗
              </span>
            </a>

            <p className="body mt-6 max-w-md">
              Available for penetration testing, security research and responsible
              disclosure work. Based in Dhaka — working remotely.
            </p>
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <dl className="space-y-6">
              <div>
                <dt className="mono-sm text-bone/58">Elsewhere</dt>
                <dd className="mt-2 space-y-2">
                  <div>
                    <a
                      href={site.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ul-link text-sm text-bone/84 hover:text-bone"
                    >
                      {site.githubLabel}
                    </a>
                  </div>
                  <div>
                    <a
                      href={site.medium}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ul-link text-sm text-bone/84 hover:text-bone"
                    >
                      {site.mediumLabel}
                    </a>
                  </div>
                </dd>
              </div>

              <div>
                <dt className="mono-sm text-bone/58">PGP</dt>
                <dd className="mt-2">
                  {site.pgp.published ? (
                    <a
                      href={site.pgp.keyUrl ?? "#"}
                      className="mono-sm break-all text-bone/78 hover:text-signal"
                    >
                      {site.pgp.fingerprint}
                    </a>
                  ) : (
                    <span className="mono-sm text-bone/58">
                      Key not yet published
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="mono-sm text-bone/58">Location</dt>
                <dd className="mt-2 text-sm text-bone/78">{site.location}</dd>
              </div>
            </dl>
          </div>
        </div>

        <footer className="mt-24 flex flex-col gap-4 border-t border-bone/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-sm text-bone/55">
            © {site.year} {site.name}
          </p>
          <p className="mono-sm text-bone/55">
            Built from scratch. No templates.
          </p>
        </footer>
      </div>
    </section>
  );
}
