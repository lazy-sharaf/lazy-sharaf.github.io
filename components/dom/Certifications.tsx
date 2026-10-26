import { CredentialList } from "./CredentialList";
import { SectionHead } from "./SectionHead";

export function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="shell">
        <SectionHead index="06" label="certifications" path="~/certs" />

        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="prompt mb-5">ls ~/certs</p>
            <h2 className="h2">
              Certified.
              <br />
              <span className="text-signal">Still reading</span>
              <br />
              <span className="text-bone/84">source.</span>
            </h2>
            <p className="body mt-6 max-w-xs">
              Eight credentials across application security, network security and API
              testing. Open any entry to see the certificate.
            </p>
          </div>

          <div className="md:col-span-8">
            <CredentialList />
          </div>
        </div>
      </div>
    </section>
  );
}
