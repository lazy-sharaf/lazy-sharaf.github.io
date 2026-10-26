import { Fragment } from "react";

/**
 * Renders `backtick`-delimited segments as inline code.
 * Keeps copy readable in lib/content.ts without pulling in a markdown parser.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split("`");

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="code-inline">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
