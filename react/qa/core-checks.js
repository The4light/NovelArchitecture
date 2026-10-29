import { cleanHTML, editorHTML, RICH_PREFIX } from "../src/lib/richText";
import { plainText, wordCount } from "../src/lib/studioData";
const cases = [
  [
    "Legacy paragraphs avoid duplicate blank blocks",
    () => {
      const box = document.createElement("div");
      box.innerHTML = editorHTML("One\nline\n\nTwo");
      return (
        box.children.length === 2 && box.querySelectorAll("br").length === 1
      );
    },
  ],
  [
    "Legacy prose stays literal",
    () => {
      const box = document.createElement("div");
      box.innerHTML = editorHTML("The <script> is a word, not a program.");
      return (
        box.textContent === "The <script> is a word, not a program." &&
        !box.querySelector("script")
      );
    },
  ],
  [
    "Scripts and event handlers removed",
    () =>
      !/<script|onerror|onload|<svg/i.test(
        cleanHTML(
          '<p onclick="evil()">Text<img src=x onerror="evil()"><script>evil()</script><svg onload="evil()"></svg></p>',
        ),
      ),
  ],
  [
    "Unsafe link removed",
    () =>
      !cleanHTML('<a href="javascript:evil()">text</a>').includes("javascript"),
  ],
  [
    "Safe links and formatting retained",
    () =>
      cleanHTML(
        '<p><strong>Story</strong> <a href="https://example.test">link</a></p>',
      ).includes('href="https://example.test"'),
  ],
  [
    "Inline styling does not split a word",
    () => wordCount(RICH_PREFIX + "<p>cl<b>ock</b> maker</p>") === 2,
  ],
  [
    "Paragraph boundaries count separate words",
    () => wordCount(RICH_PREFIX + "<p>One</p><p>Two</p>") === 2,
  ],
  [
    "Entities count as actual characters",
    () => plainText(RICH_PREFIX + "<p>A &amp; B</p>") === "A & B",
  ],
  [
    "Alignment retained without arbitrary styles",
    () => {
      const html = cleanHTML(
        '<p style="text-align:center;position:fixed">Scene</p>',
      );
      return html.includes("text-align: center") && !html.includes("position");
    },
  ],
];
export const coreChecks = cases.map(([name, test]) => ({
  name,
  passed: !!test(),
}));
if (coreChecks.some((c) => !c.passed))
  throw new Error(
    "Studio core verification failed: " +
      coreChecks
        .filter((c) => !c.passed)
        .map((c) => c.name)
        .join(", "),
  );
