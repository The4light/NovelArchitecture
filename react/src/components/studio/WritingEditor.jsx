import { createElement, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Minus,
  Link as LinkIcon,
} from "lucide-react";
import { cleanHTML, editorHTML, RICH_PREFIX } from "../../lib/richText";
import { plainText, wordCount } from "../../lib/studioData";

export default function WritingEditor({
  chapterId,
  title,
  content,
  onChange,
  onTitleChange,
  status,
}) {
  const editor = useRef(null);
  const range = useRef(null);
  const [format, setFormat] = useState({});
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    editor.current.innerHTML =
      editorHTML(
        content,
      ); /* Content updates are native while typing; switching chapters remounts. */
  }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps
  const sync = () =>
    onChange(RICH_PREFIX + cleanHTML(editor.current.innerHTML));
  const selection = () => {
    const selected = window.getSelection();
    if (selected?.rangeCount && editor.current.contains(selected.anchorNode)) {
      range.current = selected.getRangeAt(0).cloneRange();
      setFormat(
        Object.fromEntries(
          [
            "bold",
            "italic",
            "underline",
            "strikeThrough",
            "insertUnorderedList",
            "insertOrderedList",
            "justifyLeft",
            "justifyCenter",
            "justifyRight",
          ].map((c) => [c, document.queryCommandState(c)]),
        ),
      );
    }
  };
  const command = (name, value) => {
    editor.current.focus();
    if (range.current) {
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(range.current);
    }
    document.execCommand(name, false, value);
    sync();
    selection();
  };
  const buttons = [
    ["bold", "Bold", Bold],
    ["italic", "Italic", Italic],
    ["underline", "Underline", Underline],
    ["strikeThrough", "Strikethrough", Strikethrough],
    ["insertUnorderedList", "Bulleted list", List],
    ["insertOrderedList", "Numbered list", ListOrdered],
    ["justifyLeft", "Align left", AlignLeft],
    ["justifyCenter", "Align center", AlignCenter],
    ["justifyRight", "Align right", AlignRight],
    ["undo", "Undo", Undo2],
    ["redo", "Redo", Redo2],
  ];
  return (
    <div className="writing-surface">
      <div
        className="writing-toolbar"
        role="toolbar"
        aria-label="Manuscript formatting"
      >
        <select
          aria-label="Paragraph style"
          defaultValue="p"
          onChange={(e) => command("formatBlock", e.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading</option>
          <option value="h3">Subheading</option>
          <option value="blockquote">Block quote</option>
        </select>
        {buttons.map(([cmd, label, Icon]) => (
          <button
            key={cmd}
            title={label}
            aria-label={label}
            aria-pressed={cmd in format ? !!format[cmd] : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => command(cmd)}
          >
            {createElement(Icon, { size: 16 })}
          </button>
        ))}
        <button
          aria-label="Block quote"
          title="Block quote"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => command("formatBlock", "blockquote")}
        >
          <Quote size={16} />
        </button>
        <button
          aria-label="Insert scene break"
          title="Insert scene break"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            command(
              "insertHTML",
              '<p style="text-align:center">✧ ✧ ✧</p><p><br></p>',
            )
          }
        >
          <Minus size={16} />
        </button>
        <button
          aria-label="Insert link"
          title="Insert link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setLinkOpen(!linkOpen)}
        >
          <LinkIcon size={16} />
        </button>
      </div>
      {linkOpen && (
        <form
          className="writing-link-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (/^https?:\/\//i.test(url)) {
              command("createLink", url);
              setLinkOpen(false);
              setUrl("");
            }
          }}
        >
          <label>
            Link URL
            <input
              autoFocus
              required
              type="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <button>Add link</button>
          <button type="button" onClick={() => setLinkOpen(false)}>
            Cancel
          </button>
        </form>
      )}
      <div className="writing-paper">
        <span className="pf-kicker">{status || "Draft"} · MANUSCRIPT</span>
        <textarea
          className="writing-chapter-title"
          rows={2}
          aria-label="Chapter title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="An untitled chapter"
        />
        <div className="writing-ornament" aria-hidden="true">
          ✧
        </div>
        <div
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Chapter text"
          className="writing-prose"
          onInput={sync}
          onKeyUp={selection}
          onMouseUp={selection}
          onBlur={selection}
          onPaste={(e) => {
            e.preventDefault();
            command("insertText", e.clipboardData.getData("text/plain"));
          }}
          onDrop={(e) => {
            e.preventDefault();
            command("insertText", e.dataTransfer.getData("text/plain"));
          }}
        />
      </div>
      <footer className="writing-count">
        <span>{wordCount(content).toLocaleString()} words</span>
        <span>{plainText(content).length.toLocaleString()} characters</span>
        <span>Write a world worth getting lost in.</span>
      </footer>
    </div>
  );
}
