import { useContext, useEffect, useRef, useState } from "react";
import { GripHorizontal, Plus, X, Minus, ChevronDown } from "lucide-react";
import { StudioClientContext } from "../lib/studioData";
export default function FloatingSticky({
  note,
  setCodexEntries,
  spawnNewStickyNote,
}) {
  const client = useContext(StudioClientContext);
  const drag = useRef(null);
  const pos = useRef(null);
  const saves = useRef(Promise.resolve());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [screen, setScreen] = useState(() => ({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  }));
  useEffect(() => {
    const resize = () =>
      setScreen({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const screenWidth = screen.width;
  const bottomLimit = screen.height - (screenWidth < 768 ? 390 : 310);
  const width = Math.min(270, screenWidth - 32);
  const x = Math.min(
    Math.max(8, note.position_x || 40),
    Math.max(8, screenWidth - width - 12),
  );
  const y = Math.min(
    Math.max(76, note.position_y || 120),
    Math.max(76, bottomLimit),
  );
  const change = (patch) =>
    setCodexEntries((es) =>
      es.map((e) => (e.id === note.id ? { ...e, ...patch } : e)),
    );
  const persist = async (patch) => {
    setSaving(true);
    setError("");
    const previous = saves.current;
    const payload = { title: note.title, content: note.content, ...patch };
    const work = (async () => {
      await previous;
      try {
        const { data, error } = await client
          .from("codex_entries")
          .update(payload)
          .eq("id", note.id)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("The note was not saved.");
        return true;
      } catch (err) {
        setError(err.message || "Note not saved.");
        return false;
      } finally {
        if (saves.current === work) setSaving(false);
      }
    })();
    saves.current = work;
    return work;
  };
  const move = (px, py) => {
    const next = {
      position_x: Math.round(
        Math.min(Math.max(8, px), Math.max(8, screenWidth - width - 12)),
      ),
      position_y: Math.round(
        Math.min(Math.max(76, py), Math.max(76, bottomLimit)),
      ),
    };
    pos.current = next;
    change(next);
  };
  return (
    <section
      className="floating-paper"
      style={{
        left: x,
        top: y,
        width,
        "--note-rotation": Number(note.id) % 2 ? "1.4deg" : "-1.4deg",
      }}
      aria-label={`Floating note: ${note.title}`}
    >
      <div
        className="floating-paper-grip"
        tabIndex={0}
        role="button"
        aria-label="Move note with arrow keys or drag"
        onPointerDown={(e) => {
          if (e.target.closest("button")) return;
          drag.current = { x: e.clientX - x, y: e.clientY - y };
          pos.current = { position_x: x, position_y: y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            move(e.clientX - drag.current.x, e.clientY - drag.current.y);
        }}
        onPointerUp={() => {
          if (drag.current) {
            drag.current = null;
            persist(pos.current);
          }
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            move(
              x +
                (e.key === "ArrowLeft" ? -10 : e.key === "ArrowRight" ? 10 : 0),
              y + (e.key === "ArrowUp" ? -10 : e.key === "ArrowDown" ? 10 : 0),
            );
            persist(pos.current);
          }
        }}
      >
        <button aria-label="Create another note" onClick={spawnNewStickyNote}>
          <Plus size={15} />
        </button>
        {minimized ? (
          <span className="floating-note-mini-title">{note.title}</span>
        ) : (
          <GripHorizontal size={19} />
        )}
        <button
          aria-label={minimized ? "Expand note" : "Minimize note"}
          aria-expanded={!minimized}
          onClick={() => setMinimized(!minimized)}
        >
          {minimized ? <ChevronDown size={14} /> : <Minus size={14} />}
        </button>
        <button
          aria-label="Close note"
          onClick={async () => {
            if (await persist({ is_floating: false }))
              change({ is_floating: false });
          }}
        >
          <X size={14} />
        </button>
      </div>
      <input
        hidden={minimized}
        aria-label="Note title"
        value={note.title || ""}
        onChange={(e) => change({ title: e.target.value })}
        onBlur={(e) => persist({ title: e.target.value })}
      />
      <textarea
        hidden={minimized}
        aria-label="Note text"
        placeholder="Catch a passing thought…"
        value={note.content || ""}
        onChange={(e) => change({ content: e.target.value })}
        onBlur={(e) => persist({ content: e.target.value })}
      />
      <small role="status" hidden={minimized}>
        {error ? (
          <button
            onClick={() =>
              persist({
                title: note.title,
                content: note.content,
                position_x: x,
                position_y: y,
              })
            }
          >
            Save failed · retry
          </button>
        ) : saving ? (
          "Saving…"
        ) : (
          "Edits save when you leave a field"
        )}
      </small>
    </section>
  );
}
