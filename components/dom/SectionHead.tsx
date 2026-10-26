/**
 * Section marker in the CLI idiom: `// 01/10  about  ~/about  ▌`
 * The double slash and the path are the motifs carried over from the
 * previous portfolio.
 */
export function SectionHead({
  index,
  label,
  path,
  total = 10,
}: {
  index: string;
  label: string;
  path?: string;
  total?: number;
}) {
  return (
    <div className="section-head">
      <span className="mono text-signal" aria-hidden="true">
        //
      </span>
      <span className="section-index tabular">
        {index}
        <span className="text-bone/70">/{total}</span>
      </span>
      <span className="mono text-bone/84">{label}</span>
      {path && (
        <span className="mono-sm ml-auto hidden text-bone/70 sm:block">{path}</span>
      )}
      <span className="caret" aria-hidden="true" />
    </div>
  );
}
