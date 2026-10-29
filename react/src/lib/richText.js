export const RICH_PREFIX = "<!--novelforge-rich-->";
const tags = new Set([
  "P",
  "DIV",
  "BR",
  "B",
  "STRONG",
  "I",
  "EM",
  "U",
  "S",
  "STRIKE",
  "H1",
  "H2",
  "H3",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "LI",
  "HR",
  "A",
]);
// Rebuild from an allowlist. No scripts, event handlers, arbitrary styles or embeds.
export function cleanHTML(html) {
  const source = new DOMParser().parseFromString(html, "text/html");
  const out = document.createElement("div");
  const copy = (node, parent) => {
    if (node.nodeType === 3) {
      parent.append(document.createTextNode(node.textContent));
      return;
    }
    if (
      node.nodeType !== 1 ||
      ["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "MATH"].includes(
        node.tagName,
      )
    )
      return;
    if (!tags.has(node.tagName)) {
      node.childNodes.forEach((n) => copy(n, parent));
      return;
    }
    const el = document.createElement(node.tagName.toLowerCase());
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (/^(https?:\/\/|mailto:)/i.test(href)) {
        el.setAttribute("href", href);
        el.setAttribute("rel", "noopener noreferrer");
      }
    }
    if (["left", "center", "right", "justify"].includes(node.style.textAlign))
      el.style.textAlign = node.style.textAlign;
    node.childNodes.forEach((n) => copy(n, el));
    parent.append(el);
  };
  source.body.childNodes.forEach((node) => copy(node, out));
  return out.innerHTML;
}
export function editorHTML(content = "") {
  if (content.startsWith(RICH_PREFIX))
    return cleanHTML(content.slice(RICH_PREFIX.length));
  const container = document.createElement("div");
  content.split(/\n{2,}/).forEach((paragraph) => {
    const p = document.createElement("p");
    paragraph.split("\n").forEach((line, index) => {
      if (index) p.append(document.createElement("br"));
      p.append(document.createTextNode(line));
    });
    if (!paragraph) p.append(document.createElement("br"));
    container.append(p);
  });
  return container.innerHTML || "<p><br></p>";
}
