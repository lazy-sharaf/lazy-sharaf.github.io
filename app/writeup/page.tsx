import Link from "next/link";
import { Instrument_Serif, Source_Serif_4 } from "next/font/google";
import { writeups } from "@/lib/content";
import "./writeup.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--wu-display",
  display: "swap",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--wu-body",
  display: "swap",
});

export const metadata = {
  title: "Writeups",
  description: "Case files — how the bugs were found.",
  robots: { index: false, follow: false },
};

function OneLiner({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((part, index) =>
        part.startsWith("`") ? (
          <code key={index}>{part.slice(1, -1)}</code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

export default function WriteupIndex() {
  return (
    <div className={`wu wu-idx ${display.variable} ${body.variable}`}>
      <header className="wu-bar">
        <div className="wu-bar-inner">
          <Link className="wu-bar-mark" href="/" aria-label="Back to the portfolio">
            <span className="wu-bar-dot" aria-hidden="true" />
            <span className="wu-bar-title">Writeups</span>
          </Link>
          <div className="wu-bar-meta">
            <Link href="/" className="wu-chip">
              ← Portfolio
            </Link>
            <span className="wu-bar-time">
              {String(writeups.length).padStart(2, "0")} files
            </span>
          </div>
        </div>
      </header>

      <main id="top" className="wu-idx-main">
        <section className="wu-hero wu-idx-hero">
          <div className="wu-hero-grid" aria-hidden="true" />
          <div className="wu-hero-inner">
            <div className="wu-hero-meta">
              <span className="wu-hero-file">
                Case archive <b>{String(writeups.length).padStart(2, "0")}</b>
              </span>
              <span className="wu-hero-meta-rule" aria-hidden="true" />
              <span className="wu-hero-meta-chip">Security research</span>
              <span className="wu-hero-meta-year">2026</span>
            </div>

            <div className="wu-hero-body">
              <div className="wu-hero-copy">
                <p className="wu-eyebrow">
                  <span className="wu-eyebrow-dot" aria-hidden="true" />
                  Case files · security research
                </p>
                <h1 className="wu-title">
                  Writeups<span className="wu-title-dot">.</span>
                </h1>
                <p className="wu-sub">
                  The recon, the dead ends, and the exact moment it worked —
                  written up end to end.
                </p>
              </div>

              <aside className="wu-hero-folio" aria-hidden="true">
                <span className="wu-folio-no">
                  {String(writeups.length).padStart(2, "0")}
                </span>
                <span className="wu-folio-rule" />
                <span className="wu-folio-label">
                  Open case files
                  <br />
                  2024 — 2026
                </span>
              </aside>
            </div>

            <dl className="wu-stats wu-stats--index">
              <div>
                <dt>Case files</dt>
                <dd>{String(writeups.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt>Disciplines</dt>
                <dd>web · MQTT</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>2026</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="wu-idx-shell">
          <div className="wu-idx-list">
            {writeups.map((w, i) => {
              const split = w.codename.lastIndexOf(" ");
              const head = w.codename.slice(0, split);
              const tail = w.codename.slice(split + 1);
              const href = `${w.href}/`;

              return (
                <Link key={w.href} href={href} className="wu-idx-card">
                  <span className="wu-idx-ghost" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="wu-idx-card-top">
                    <span className="wu-idx-no">
                      Case {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="wu-idx-cat">{w.category}</span>
                    {w.badge && <span className="wu-idx-badge">{w.badge}</span>}
                  </div>

                  <h2 className="wu-idx-title">
                    {head} <em>{tail}</em>
                  </h2>

                  <p className="wu-idx-line">
                    <OneLiner text={w.oneLiner} />
                  </p>

                  <dl className="wu-idx-meta">
                    {w.meta.map((m) => (
                      <div key={m.label}>
                        <dt>{m.label}</dt>
                        <dd>{m.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <span className="wu-idx-read">
                    {w.readLabel}
                    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
                    </svg>
                  </span>
                </Link>
              );
            })}
          </div>

          <footer className="wu-idx-foot">
            <p>
              Written up for the people who had to learn it the hard way too.
            </p>
            <Link href="/">← Back to the portfolio</Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
