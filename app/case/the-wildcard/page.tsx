import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/content";
import { WildcardDiagram } from "@/components/case/WildcardDiagram";

export const metadata: Metadata = {
  title: "Case 001 — The Wildcard",
  description:
    "How a wildcard MQTT subscription exposed live customer support conversations — and became a first four-digit bounty.",
};

const sections = [
  { id: "target", label: "The target" },
  { id: "api-url", label: "A hidden API URL" },
  { id: "env-app", label: "env_app.js" },
  { id: "mqtt", label: "What MQTT means" },
  { id: "fallback", label: "The fallback" },
  { id: "test", label: "Building the test" },
  { id: "worked", label: "When it worked" },
  { id: "trust", label: "Why this breaks trust" },
  { id: "reporting", label: "Reporting" },
  { id: "triage", label: "The triage call" },
  { id: "closing", label: "Closing" },
];

export default function CaseWildcard() {
  return (
    <article className="pt-28 pb-32">
      <div className="shell">
        <Link
          href="/"
          className="mono-sm text-bone/84 transition-colors hover:text-signal"
        >
          ← index
        </Link>

        <header className="mt-10 border-b border-bone/10 pb-12">
          <p className="prompt">cat case/001-the-wildcard.md</p>
          <p className="mono mt-3 text-signal">Case 001 / 2026</p>

          <h1 className="mt-5 max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-[-0.04em]">
            How a wildcard subscription read{" "}
            <span className="text-bone/84">ten strangers&rsquo; conversations</span> in
            three minutes.
          </h1>

          <p className="lede mt-8">
            One character in an MQTT topic string separated my session from everyone
            else&rsquo;s. This is the full disclosure, including the part where triage said
            no.
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-bone/10 pt-8 sm:grid-cols-4">
            {[
              ["Target", "Live support chatbot"],
              ["Program", "Private HackerOne"],
              ["Severity", "Critical"],
              ["Outcome", "First 4-digit bounty"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="mono-sm text-bone/78">{k}</dt>
                <dd className="mt-2 text-sm text-bone/93">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <nav aria-label="Contents" className="sticky top-28">
              <p className="mono-sm mb-4 text-bone/74">Contents</p>
              <ol className="space-y-2.5">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex gap-3 text-sm text-bone/84 transition-colors hover:text-bone"
                    >
                      <span className="mono-sm pt-0.5 text-bone/70 group-hover:text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="prose min-w-0 lg:col-span-9 lg:max-w-none">
            <p>
              This is the story of a critical bug in a live customer support chatbot on a
              major website — and the first four-digit bounty I ever earned. No zero-day.
              No exploit chain. The evidence was already public.
            </p>

            <h2 id="target">01 — The target</h2>
            <p>
              I was hunting on a private HackerOne program. The main site looked ordinary.
              In the corner sat the familiar support chat bubble — the one you click when
              you want help.
            </p>
            <p>
              I did not start with scanners. I did the thing that still works: I{" "}
              <strong>viewed the page source</strong>. That is the raw HTML and embedded
              configuration your browser downloads before it draws anything. Companies
              leave API URLs, feature flags and backend hostnames in there more often than
              they would like to admit.
            </p>

            <h2 id="api-url">02 — A chat API URL hidden in the page</h2>
            <p>
              Inside the source was a Drupal settings JSON block — a bag of configuration
              the front end needs. I searched it for anything chat-related. One object
              held the integration, and one field mattered:
            </p>
            <pre className="code-block" data-lang="json">
              <code>{`apiUrl: "https://chat-backend.[REDACTED]:8081/custom?token=[redacted]"`}</code>
            </pre>
            <p>
              The homepage was telling every visitor where the chat application actually
              lives. Not on <code className="code-inline">www.[REDACTED].com</code> — on a
              separate host, on port 8081. If something was misconfigured, it would be
              there.
            </p>

            <h2 id="env-app">03 — env_app.js, served to anyone</h2>
            <p>
              I moved recon to that host and started collecting JavaScript. Among the
              files was <code className="code-inline">env_app.js</code> — environment
              configuration for the chat application. No login. No cookie check. It simply
              loaded.
            </p>
            <pre className="code-block" data-lang="js">
              <code>{`CWC_CONNECTION_USERNAME: 'cwc_user'
CWC_CONNECTION_PASSWORD: '[redacted]'
REACT_APP_CWC_MQTT_URL: 'wss://chat-backend.[REDACTED]:8081/mqtt'`}</code>
            </pre>
            <p>
              Broker URL and credentials, in a public file. Even stopping there would have
              been a finding: it tells an attacker exactly where to knock and which keys
              might work.
            </p>
            <p>
              But I did not know what MQTT was. I had never used it in a hunt. I only knew
              the chat felt real-time, and this configuration was how it got there.
            </p>

            <h2 id="mqtt">04 — What MQTT actually means</h2>
            <p>
              Imagine a post office in the middle. Apps do not message each other directly;
              they send packets to a <strong>broker</strong>. Each packet goes to a{" "}
              <strong>topic</strong>, which is a channel name. Other apps subscribe to the
              topics they care about.
            </p>
            <p>For this system, each customer session had its own topic shape:</p>
            <pre className="code-block" data-lang="topic">
              <code>{`client/{session-id}/chat_session`}</code>
            </pre>
            <p>
              That is good design — if the broker only lets you subscribe to{" "}
              <em>your</em> session. But MQTT supports wildcards. The{" "}
              <code className="code-inline">+</code> symbol means{" "}
              <em>match any single level here</em>:
            </p>
            <pre className="code-block" data-lang="topic">
              <code>{`client/+/chat_session`}</code>
            </pre>
            <p>
              That means <strong>every customer&rsquo;s chat at once</strong>. If the broker
              accepts it, you are no longer listening to one conversation — you are
              listening to the whole support queue.
            </p>

            <WildcardDiagram />

            <h2 id="fallback">05 — The fallback in main.js</h2>
            <p>
              The credentials in <code className="code-inline">env_app.js</code> were for{" "}
              <code className="code-inline">cwc_user</code>, not an administrator. So I
              followed the front-end build. I opened{" "}
              <code className="code-inline">asset-manifest.json</code>, used it to locate{" "}
              <code className="code-inline">main.js</code>, and read the minified bundle
              looking for needles.
            </p>
            <p>There was a fallback in the logic:</p>
            <pre className="code-block" data-lang="js">
              <code>{`username: "admin"
password: "admin"`}</code>
            </pre>
            <p>
              Developers leave a default account for local testing and forget it on the
              server. The code said <code className="code-inline">admin</code> /{" "}
              <code className="code-inline">admin</code>. When I tested the broker, the
              live misconfiguration was weaker still:{" "}
              <code className="code-inline">admin</code> with an{" "}
              <strong>empty password</strong> worked.
            </p>

            <h2 id="test">06 — Building the test</h2>
            <p>
              I used AI to learn the client commands — brokers, topics, subscribe versus
              publish — and turned it into a small Node proof of concept with the{" "}
              <code className="code-inline">mqtt</code> library.
            </p>
            <pre className="code-block" data-lang="bash">
              <code>{`npm install mqtt

node -e "const c=require('mqtt').connect(
  'wss://chat-backend.[REDACTED]:8081/mqtt',
  {username:'admin',password:'',rejectUnauthorized:false}
);
c.on('connect',()=>{
  console.log('CONNECTED');
  c.subscribe('client/+/chat_session',{qos:0},()=>console.log('SUBSCRIBED'))
});
c.on('message',(t,m)=>console.log(t+': '+m.toString()));
setTimeout(()=>process.exit(),60000)"`}</code>
            </pre>
            <p>
              No company account. No VPN. No special network. Just Node and network access
              to a broker URL that was already in public JavaScript.
            </p>

            <h2 id="worked">07 — When it worked</h2>
            <p>
              It connected. It subscribed. Then lines started appearing, fast. This was not
              a staging sandbox — these were live customer support chats happening at that
              moment. Each line was a topic and a JSON payload: session metadata, chat
              history, sometimes JWT tokens and session IDs.
            </p>
            <p>
              When customers typed personal details into the chat — phone numbers, home
              addresses, service information — those appeared in the same stream. Some
              messages were security-sensitive in their own right, such as SIM unlock
              requests.
            </p>

            <div className="pull-quote">
              <p>
                I let it run for about three minutes. In that window I counted 88 messages
                across 10 different customer sessions.
              </p>
            </div>

            <p>Then I stopped.</p>

            <h2 id="trust">08 — Why this breaks trust</h2>
            <p>Two failures stacked:</p>
            <ul>
              <li>
                <strong>Authentication.</strong> The broker accepted a trivial{" "}
                <code className="code-inline">admin</code> login with no password.
              </li>
              <li>
                <strong>Authorization.</strong> That user could subscribe to a wildcard
                topic and receive many unrelated sessions.
              </li>
            </ul>
            <p>
              An attacker could sit anywhere in the world and read active support chats in
              real time, without registering an account. No complex chain — one script,
              built from clues already public in JavaScript files.
            </p>

            <h2 id="reporting">09 — Reporting and outcome</h2>
            <p>
              I packaged the finding in mid-March 2026: reproduction steps, the Node
              command, a short PoC video, redacted samples, and a plain impact statement.
            </p>
            <p>
              Triage did not end in one message. I had to explain the real issue more than
              once. In the end the program accepted it as a{" "}
              <strong>valid critical-severity issue</strong> — and for me it was also
              personal: my first four-digit bounty.
            </p>

            <h2 id="triage">10 — The triage call</h2>
            <p>
              The first reply sounded like a duplicate of older reports. The program had
              already reviewed similar findings, where exposed chat configuration and a
              public MQTT connection were judged intentional — the widget is public, and
              authentication happens later. In that earlier review, you could not read
              other people&rsquo;s messages.
            </p>
            <p>
              I replied calmly and stuck to facts. A public broker connection might be
              acceptable by design. That was not the core bug. The core bug was{" "}
              <strong>authorization on MQTT topics</strong>. My PoC video showed real
              fields — home addresses, phone numbers, service IDs — flowing in real time. I
              asked one direct question: did the older reports demonstrate{" "}
              <em>live cross-customer data</em>, or only exposed config files? Those are not
              the same severity.
            </p>
            <p>That message changed the tone. The engineering team retested and confirmed:</p>
            <div className="pull-quote">
              <p>
                &ldquo;We tested this and confirmed on the engineering side that it was real
                customer data. Earlier reports did not show any live data leaks. The chatbot
                has been taken down until the issue is fixed.&rdquo;
              </p>
            </div>
            <p>
              A few days later they asked me to retest the fix and share IP addresses and
              timestamps so they could improve logging. I retested: the wildcard
              subscription no longer worked. The chatbot stayed offline until the backend
              was safe.
            </p>

            <h2 id="closing">11 — Closing</h2>
            <p>
              Boring recon still wins. Page source led to the chat{" "}
              <code className="code-inline">apiUrl</code>; the chat host led to{" "}
              <code className="code-inline">env_app.js</code>; that file led to a protocol I
              had to learn on the fly; and the application bundle gave the last hint about
              which account to try.
            </p>
            <p>
              AI helped me learn and assemble the test. The evidence came from what was
              already exposed on the public internet.
            </p>

            <div className="mt-16 border-t border-bone/10 pt-8">
              <p className="mono-sm text-bone/78">
                Originally published on{" "}
                <a
                  href="https://medium.com/@lazysharaf/how-i-hacked-a-live-chatbot-and-earned-my-first-4-digit-bounty-5c43c8891741"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone/88 underline decoration-bone/20 underline-offset-4 transition-colors hover:text-signal"
                >
                  Medium
                </a>
                , 3 June 2026. Target details redacted. No customer data retained.
              </p>
              <p className="mono-sm mt-3 text-bone/74">
                Thanks to <span className="text-bone/86">@emptymahbob</span>.
              </p>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-6">
              <Link
                href="/"
                className="mono text-bone/88 transition-colors hover:text-signal"
              >
                ← back to index
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="mono text-bone/88 transition-colors hover:text-signal"
              >
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
