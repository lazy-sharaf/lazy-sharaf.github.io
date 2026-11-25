import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { Instrument_Serif, Source_Serif_4 } from "next/font/google";
import { marked } from "marked";
import hljs from "highlight.js/lib/common";
import { WriteupRuntime } from "./WriteupRuntime";

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

export type WriteupArticleProps = {
  /** Markdown file inside /writeup that holds this article. */
  sourceFile: string;
  /** Small label above the title, e.g. "CTF writeup · web & reversing". */
  eyebrow: string;
  /** Chip in the masthead, e.g. "Private program". */
  chip: string;
  /**
   * Hero subtitle. When provided, the markdown's first standalone bold line
   * is left in the article body instead of being lifted into the hero.
   */
  subtitle?: string;
  /** Year shown in the hero stats. */
  year?: string;
  /** Closing note above the end-of-article links. */
  footerNote: string;
  /** Case number shown in the hero and at the top of the page. */
  caseNo?: string;
};

type TocItem = { id: string; text: string; level: 2 | 3 };

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, "writeup");

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** PNG header: width and height live at bytes 16..24. */
function pngSize(file: string) {
  const buf = fs.readFileSync(file);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function srcSetFor(name: string, width: number) {
  const entries: string[] = [];
  if (width > 1600) {
    entries.push(`/writeup/visuals/${name}-1600.webp 1600w`);
  }
  if (width > 800) {
    entries.push(`/writeup/visuals/${name}-800.webp 800w`);
  }
  entries.push(`/writeup/visuals/${name}.webp ${width}w`);
  return entries.join(", ");
}

/* ------------------------------------------------------------------ */
/* code blocks                                                         */
/* ------------------------------------------------------------------ */

function renderCode(lang: string, code: string) {
  const trimmed = code.replace(/\n$/, "");
  // Unlabelled fences are either ASCII layout drawings or plain text.
  const isDiagram = lang === "" && /[┌└│─]|\+-{3,}/.test(trimmed);

  let body: string;
  const label = lang || (isDiagram ? "diagram" : "text");

  if (lang && hljs.getLanguage(lang)) {
    body = hljs.highlight(trimmed, { language: lang, ignoreIllegals: true }).value;
  } else {
    body = escapeHtml(trimmed);
  }

  return `<div class="wu-code${isDiagram ? " wu-code--diagram" : ""}" data-lang="${label}">
  <div class="wu-code-bar">
    <span class="wu-code-lang">${label}</span>
    <button type="button" class="wu-copy" data-copy aria-label="Copy ${label} code">Copy</button>
  </div>
  <pre><code class="hljs">${body}</code></pre>
</div>`;
}

/* ------------------------------------------------------------------ */
/* article                                                             */
/* ------------------------------------------------------------------ */

function buildArticle(raw: string, liftBoldSubtitle: boolean) {
  const blocks: string[] = [];

  // 1. Pull fenced code out before parsing so we control the wrapper,
  //    the language label and the highlighting.
  let md = raw.replace(
    /^```([\w+-]*)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm,
    (_match, lang: string, code: string) => {
      const index = blocks.push(renderCode(lang, code)) - 1;
      return `\n\n<div data-wu-block="${index}"></div>\n\n`;
    },
  );

  // 2. The first three lines are the cover: keep them out of the body.
  const title = (md.match(/^# (.+)$/m)?.[1] ?? "").trim();
  const subtitle = liftBoldSubtitle
    ? (md.match(/^\*\*(?!Flag:)(.+)\*\*[ \t]*$/m)?.[1] ?? "").trim()
    : "";
  const flag = md.match(/\*\*Flag:\*\*[ \t]*`([^`]+)`/)?.[1] ?? "";

  // When a subtitle is supplied by the page config, the article's own
  // standalone bold line is real prose and must stay in the body.
  md = md
    .replace(/^# .+$/m, "");

  if (liftBoldSubtitle) {
    md = md.replace(/^\*\*(?!Flag:)(.+)\*\*[ \t]*$/m, "");
  }

  md = md
    .replace(/^\*\*Flag:\*\*[ \t]*`[^`]+`[ \t]*$/m, "")
    // production notes, not prose
    .replace(/^> \*\*Images:\*\*.*$/m, "")
    .replace(/^\*\*\[ IMAGE [^\n]*$/gm, "");

  let html = marked.parse(md, { gfm: true, async: false }) as string;

  // 3. Drop the section rules; sections are spaced by the layout instead.
  html = html.replace(/<hr\s*\/?>/g, "");

  // 4. Give headings ids, anchors, and collect the table of contents.
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  html = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, inner: string) => {
      const text = stripTags(inner);
      const base = slugify(text) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const id = count === 0 ? base : `${base}-${count}`;
      toc.push({ id, text, level: level === "3" ? 3 : 2 });
      return `<h${level} id="${id}">${inner}<a class="wu-anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>`;
    },
  );

  // 5. Images: the markdown pairs every image with an italic caption.
  //    Wrap the pair in a figure and build a responsive srcset.
  let figureIndex = 0;
  html = html.replace(
    /<p><img src="([^"]+)" alt="([^"]*)"\s*\/?><\/p>\s*<p><em>([\s\S]*?)<\/em><\/p>/g,
    (_match, src: string, alt: string, caption: string) => {
      const name = path.basename(src).replace(/\.png$/i, "");
      const abs = path.join(IMAGE_DIR, `${name}.png`);
      const { width, height } = pngSize(abs);
      figureIndex += 1;
      return `<figure class="wu-shot">
  <button type="button" class="wu-shot-open" data-lightbox aria-label="Enlarge figure ${figureIndex}">
    <img src="/writeup/visuals/${name}.webp" srcset="${srcSetFor(name, width)}" sizes="(max-width: 900px) calc(100vw - 2.5rem), 900px" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${alt}">
  </button>
  <figcaption><span class="wu-fig-no">Fig. ${String(figureIndex).padStart(2, "0")}</span>${caption}</figcaption>
</figure>`;
    },
  );

  // 6. Any image that did not have a caption still needs to be responsive.
  html = html.replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g, (match, src: string, alt: string) => {
    if (!src.includes("visuals/")) return match;
    const name = path.basename(src).replace(/\.png$/i, "");
    const { width, height } = pngSize(path.join(IMAGE_DIR, `${name}.png`));
    return `<img src="/writeup/visuals/${name}.webp" srcset="${srcSetFor(name, width)}" sizes="(max-width: 900px) calc(100vw - 2.5rem), 900px" width="${width}" height="${height}" loading="lazy" decoding="async" alt="${alt}">`;
  });

  // 7. Tables scroll on narrow screens instead of breaking the layout.
  html = html.replace(/<table>/g, '<div class="wu-table"><table>').replace(/<\/table>/g, "</table></div>");

  // 8. External links open in a new tab.
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');

  // 9. Put the code blocks back.
  html = html.replace(/<div data-wu-block="(\d+)"><\/div>/g, (_m, index: string) => blocks[Number(index)] ?? "");

  // 10. Wrap each h2 section so the layout can breathe between them.
  const chunks = html.split(/(?=<h2 id=")/).filter((chunk) => chunk.trim());
  const sections = chunks.map((chunk, index) => {
    const id = chunk.match(/<h2 id="([^"]+)"/)?.[1] ?? `section-${index}`;
    const heading = stripTags(chunk.match(/<h2 id="[^"]+">([\s\S]*?)<\/h2>/)?.[1] ?? "");
    const brief = /TL;?DR/i.test(heading) ? " wu-sec--brief" : "";
    // Headings that already carry their own number (this article's style)
    // don't need an extra "Section 01" kicker above them.
    const numbered = /^\d+(\.\d+)?[.)]?\s/.test(heading) ? " wu-sec--numbered" : "";
    // The prose before the first h2 is not a numbered section.
    const intro = /<h2 id="/.test(chunk) ? "" : " wu-sec--intro";
    return `<section class="wu-sec${brief}${numbered}${intro}" data-sec="${id}">${chunk}</section>`;
  });

  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 215));

  return {
    title,
    subtitle,
    flag,
    toc,
    html: sections.join("\n"),
    minutes,
    words,
  };
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

export function WriteupArticle({
  sourceFile,
  eyebrow,
  chip,
  subtitle,
  year = "2026",
  footerNote,
  caseNo = "—",
}: WriteupArticleProps) {
  const raw = fs.readFileSync(path.join(IMAGE_DIR, sourceFile), "utf8");
  const article = buildArticle(raw, subtitle === undefined);

  return (
    <div className={`wu ${display.variable} ${body.variable}`}>
      <div className="wu-progress" aria-hidden="true">
        <span className="wu-progress-bar" data-progress />
      </div>

      <header className="wu-bar">
        <div className="wu-bar-inner">
          <a className="wu-bar-mark" href="#top" aria-label="Back to the top">
            <span className="wu-bar-dot" aria-hidden="true" />
            <span className="wu-bar-title">{article.title}</span>
          </a>
          <div className="wu-bar-meta">
            <Link href="/writeup" className="wu-chip">
              ← All writeups
            </Link>
            <span className="wu-chip wu-chip--case">Case {caseNo}</span>
            <span className="wu-bar-time">{article.minutes} min</span>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="wu-hero">
          <div className="wu-hero-grid" aria-hidden="true" />

          <div className="wu-hero-inner">
            <div className="wu-hero-meta">
              <span className="wu-hero-file">
                Case file <b>{caseNo}</b>
              </span>
              <span className="wu-hero-meta-rule" aria-hidden="true" />
              <span className="wu-hero-meta-chip">{chip}</span>
              <span className="wu-hero-meta-year">{year}</span>
            </div>

            <div className="wu-hero-body">
              <div className="wu-hero-copy">
                <p className="wu-eyebrow">
                  <span className="wu-eyebrow-dot" aria-hidden="true" />
                  {eyebrow}
                </p>

                <h1 className="wu-title">{article.title}</h1>

                <p className="wu-sub">{subtitle ?? article.subtitle}</p>

                {article.flag ? (
                  <div className="wu-flag">
                    <span className="wu-flag-label">Flag</span>
                    <code className="wu-flag-value">{article.flag}</code>
                    <button
                      type="button"
                      className="wu-flag-copy"
                      data-copy
                      data-copy-text={article.flag}
                    >
                      Copy
                    </button>
                  </div>
                ) : null}
              </div>

              <aside className="wu-hero-folio" aria-hidden="true">
                <span className="wu-folio-no">{caseNo}</span>
                <span className="wu-folio-rule" />
                <span className="wu-folio-label">
                  Security research
                  <br />
                  Field notes
                </span>
              </aside>
            </div>

            <dl className="wu-stats">
              <div>
                <dt>Read</dt>
                <dd>{article.minutes} min</dd>
              </div>
              <div>
                <dt>Words</dt>
                <dd>{article.words.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt>Sections</dt>
                <dd>{article.toc.filter((item) => item.level === 2).length}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{year}</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="wu-shell">
          <aside className="wu-rail" aria-label="Table of contents">
            <div className="wu-rail-head">
              <p className="wu-rail-label">On this page</p>
              <span className="wu-rail-percent" data-progress-label>
                0%
              </span>
            </div>
            <div className="wu-rail-meter" aria-hidden="true">
              <span data-progress-rail />
            </div>
            <nav className="wu-toc">
              {article.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={item.level === 3 ? "wu-toc-link wu-toc-link--sub" : "wu-toc-link"}
                  data-toc={item.id}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>

          <div className="wu-body">
            <details className="wu-toc-mobile">
              <summary>
                <span>Contents</span>
                <span className="wu-toc-mobile-count">
                  {article.toc.filter((item) => item.level === 2).length} sections
                </span>
              </summary>
              <nav>
                {article.toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={item.level === 3 ? "wu-toc-link wu-toc-link--sub" : "wu-toc-link"}
                    data-toc={item.id}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </details>

            <article className="wu-prose" dangerouslySetInnerHTML={{ __html: article.html }} />

            <footer className="wu-end">
              <p className="wu-end-label">End of writeup</p>
              <p className="wu-end-note">{footerNote}</p>
              <div className="wu-end-links">
                <Link className="wu-end-index" href="/writeup">
                  ← All writeups
                </Link>
                <a className="wu-end-top" href="#top">
                  Back to top
                  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
                  </svg>
                </a>
              </div>
            </footer>
          </div>
        </div>
      </main>

      <WriteupRuntime />
    </div>
  );
}
