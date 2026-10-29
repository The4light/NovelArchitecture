import { Fragment } from "react";

// Render common manuscript-note Markdown as React text, never executable HTML.
function inline(text) {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    .map((part, i) =>
      part.startsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("*") ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : part.startsWith("`") ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}

export default function EntryReading({ content }) {
  const blocks = [];
  const lines = String(content || "")
    .replace(/\r/g, "")
    .split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const heading = line.match(/^#{1,6}\s+(.+)/);
    if (heading) {
      blocks.push(<h3 key={i}>{inline(heading[1])}</h3>);
      continue;
    }
    if (/^\s*([-*+] |\d+\. )/.test(line)) {
      const start = i,
        ordered = /^\s*\d+\. /.test(line),
        items = [];
      const pattern = ordered ? /^\s*\d+\. / : /^\s*[-*+] /;
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(<li key={i}>{inline(lines[i].replace(pattern, ""))}</li>);
        i++;
      }
      i--;
      blocks.push(
        ordered ? <ol key={start}>{items}</ol> : <ul key={start}>{items}</ul>,
      );
      continue;
    }
    if (line.startsWith("> ")) {
      blocks.push(<blockquote key={i}>{inline(line.slice(2))}</blockquote>);
      continue;
    }
    const start = i,
      paragraph = [line];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !/^\s*(#{1,6}\s|[-*+] |\d+\. |> )/.test(lines[i + 1])
    )
      paragraph.push(lines[++i]);
    blocks.push(<p key={start}>{inline(paragraph.join("\n"))}</p>);
  }
  return (
    <div className="entry-reading-prose">
      {blocks.length ? (
        blocks
      ) : (
        <p className="entry-reading-empty">
          No details yet. Add a few words when inspiration arrives.
        </p>
      )}
    </div>
  );
}
