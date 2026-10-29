import { createElement, useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PanelLeft,
  X,
  BookOpen,
  Files,
  Users,
  ScrollText,
  StickyNote,
  Globe,
  Settings,
  Plus,
  Search,
  Maximize2,
  Minimize2,
  Check,
  Save,
  ArrowRight,
} from "lucide-react";
import { AuthContext } from "../context/AuthState";
import {
  StudioClientContext,
  titleOf,
  wordCount,
  readWritingPosition,
  keepWritingPosition,
} from "../lib/studioData";
import { StudioError, StudioEmpty } from "../components/studio/StudioPieces";
import { BookCover } from "../components/public/StoryBook";
import WritingEditor from "../components/studio/WritingEditor";
import { StickyContext } from "../context/StickyState";
import DialogLayer from "../components/studio/DialogLayer";
import EntryReading from "../components/studio/EntryReading";
import { useFocusBoundary, useSmallScreen } from "../lib/useFocusBoundary";
import "../components/studio/Studio.css";
import "./Workspace.css";

export default function CreationWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const notes = useContext(StickyContext);
  const [novel, setNovel] = useState(null),
    [chapters, setChapters] = useState([]),
    [entries, setEntries] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [entryEditing, setEntryEditing] = useState(false);
  const openEntry = (value) => {
    setEntryEditing(false);
    setEntry({ ...value });
  };
  useEffect(() => {
    setEntries((previous) => {
      const next = previous.map(
        (e) => notes.records.find((n) => String(n.id) === String(e.id)) || e,
      );
      return JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next;
    });
  }, [notes.records]);
  const [view, setView] = useState("desk"),
    [menu, setMenu] = useState(false),
    [focus, setFocus] = useState(
      () => localStorage.getItem("novelforge:focus") === "true",
    ),
    [query, setQuery] = useState("");
  const [draft, setDraft] = useState(null),
    [saved, setSaved] = useState(null),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState(""),
    [recovered, setRecovered] = useState(false);
  const [entry, setEntry] = useState(null),
    [busy, setBusy] = useState(false),
    [meta, setMeta] = useState(null),
    [confirmPublish, setConfirmPublish] = useState(null);
  const draftRef = useRef(null),
    savedRef = useRef(null),
    flight = useRef(null);
  const recoveryKey = (chapterId) =>
    `novelforge:draft:${user.id}:${id}:${chapterId}`;
  const setCurrent = (value) => {
    draftRef.current = value;
    setDraft(value);
  };
  const small = useSmallScreen();
  const sidebar = useRef(null);
  const main = useRef(null);
  useEffect(() => {
    main.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [view, draft?.id]);
  useFocusBoundary(sidebar, menu && small);
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const book = await client
          .from("novels")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (book.error) throw book.error;
        if (!book.data)
          throw new Error("This manuscript is not available in your account.");
        const [cs, es] = await Promise.all([
          client
            .from("chapters")
            .select("*")
            .eq("novel_id", id)
            .order("chapter_order", { ascending: true }),
          client
            .from("codex_entries")
            .select("*")
            .eq("novel_id", id)
            .order("created_at", { ascending: false }),
        ]);
        if (cs.error) throw cs.error;
        if (es.error && active)
          setError(
            "Worldbuilding could not be loaded. Your manuscript is still available.",
          );
        if (active) {
          setNovel(book.data);
          setMeta({
            title: book.data.title,
            genre: book.data.genre,
            synopsis: book.data.synopsis || "",
          });
          setChapters(cs.data || []);
          setEntries(es.data || []);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user.id, client]);
  const persist = async () => {
    if (flight.current) {
      await flight.current;
      if (JSON.stringify(draftRef.current) === JSON.stringify(savedRef.current))
        return true;
    }
    const snapshot = draftRef.current;
    if (
      !snapshot ||
      JSON.stringify(snapshot) === JSON.stringify(savedRef.current)
    )
      return true;
    setSaving(true);
    setSaveError("");
    const work = (async () => {
      try {
        const { data, error } = await client
          .from("chapters")
          .update({ title: snapshot.title, content: snapshot.content })
          .eq("id", snapshot.id)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("The chapter was not saved.");
        savedRef.current = snapshot;
        setSaved(snapshot);
        setChapters((cs) =>
          cs.map((c) => (c.id === snapshot.id ? { ...c, ...data } : c)),
        );
        if (JSON.stringify(draftRef.current) === JSON.stringify(snapshot)) {
          try {
            localStorage.removeItem(recoveryKey(snapshot.id));
          } catch {
            /* Database persistence already succeeded. */
          }
          setRecovered(false);
        }
        return true;
      } catch (err) {
        setSaveError(
          err.message ||
            "Could not save your chapter. Your browser recovery copy is kept.",
        );
        return false;
      } finally {
        setSaving(false);
      }
    })();
    flight.current = work;
    const result = await work;
    flight.current = null;
    return result;
  };
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => persist(), 1400);
    return () => clearTimeout(timer);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const warn = (e) => {
      if (
        draftRef.current &&
        JSON.stringify(draftRef.current) !== JSON.stringify(savedRef.current)
      ) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const edit = (changes) => {
    const next = { ...draftRef.current, ...changes };
    setCurrent(next);
    try {
      localStorage.setItem(recoveryKey(next.id), JSON.stringify(next));
    } catch {
      setSaveError(
        "Browser recovery storage is unavailable. Use Save before leaving.",
      );
    }
  };
  const select = async (chapter) => {
    if (!(await persist())) return;
    const original =
      savedRef.current?.id === chapter.id
        ? savedRef.current
        : {
            id: chapter.id,
            title: chapter.title,
            content: chapter.content || "",
          };
    let buffered;
    try {
      buffered = JSON.parse(
        localStorage.getItem(recoveryKey(chapter.id)) || "null",
      );
    } catch {
      buffered = null;
    }
    savedRef.current = original;
    setSaved(original);
    setCurrent(buffered?.id === chapter.id ? buffered : original);
    setRecovered(!!buffered);
    setView("editor");
    setMenu(false);
    setSaveError("");
    keepWritingPosition(user.id, { novelId: id, chapterId: chapter.id });
  };
  const go = async (next) => {
    if (!(await persist())) return;
    setView(next);
    setMenu(false);
  };
  const back = async () => {
    if (await persist()) navigate("/write");
  };
  const createChapter = async () => {
    if (!(await persist())) return;
    setBusy(true);
    setError("");
    try {
      const order =
        Math.max(0, ...chapters.map((c) => c.chapter_order || 0)) + 1;
      const { data, error } = await client
        .from("chapters")
        .insert([
          {
            novel_id: id,
            title: `Chapter ${order}: Untitled`,
            content: "",
            chapter_order: order,
            status: "Draft",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setChapters((cs) => [...cs, data]);
      await select(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const saveMeta = async () => {
    setBusy(true);
    setError("");
    try {
      const { data, error } = await client
        .from("novels")
        .update(meta)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("Manuscript details were not saved.");
      setNovel(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const publish = async () => {
    if (!(await persist())) return;
    setBusy(true);
    setError("");
    try {
      if (confirmPublish === "unpublish") {
        const { data, error } = await client
          .from("novels")
          .update({ status: "Draft" })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        if (!data)
          throw new Error("The manuscript visibility was not updated.");
        setNovel(data);
      } else if (confirmPublish === "chapter") {
        const { data, error } = await client
          .from("chapters")
          .update({ status: "Published" })
          .eq("id", draftRef.current.id)
          .select()
          .single();
        if (error) throw error;
        if (!data) throw new Error("This chapter was not published.");
        setChapters((cs) => cs.map((c) => (c.id === data.id ? data : c)));
      } else {
        const chapterResult = await client
          .from("chapters")
          .update({ status: "Published" })
          .eq("novel_id", id)
          .select();
        if (chapterResult.error) throw chapterResult.error;
        setChapters(chapterResult.data || []);
        const book = await client
          .from("novels")
          .update({ ...meta, status: "Published" })
          .eq("id", id)
          .select()
          .single();
        if (book.error) throw book.error;
        if (!book.data) throw new Error("Your story was not published.");
        setNovel(book.data);
      }
      setConfirmPublish(null);
    } catch (err) {
      setError(
        `Publishing did not finish: ${err.message}. Check publishing status before retrying.`,
      );
    } finally {
      setBusy(false);
    }
  };
  const createNote = async () => {
    setBusy(true);
    try {
      const { data, error } = await client
        .from("codex_entries")
        .insert([
          {
            novel_id: id,
            title: "A thought to keep",
            category: "Scratchpad",
            summary: "",
            content: "",
            is_floating: true,
            position_x: 40 + (entries.length % 3) * 50,
            position_y: 100 + (entries.length % 3) * 40,
            bg_color: "#eee6c8",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setEntries((es) => [...es, data]);
      notes.upsert(data);
      setView("Scratchpad");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const saveEntry = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        novel_id: id,
        title: entry.title,
        category: entry.category,
        summary: entry.summary || "",
        content: entry.content || "",
      };
      const request = entry.id
        ? client.from("codex_entries").update(payload).eq("id", entry.id)
        : client.from("codex_entries").insert([payload]);
      const { data, error } = await request.select().single();
      if (error) throw error;
      if (!data) throw new Error("The entry was not saved.");
      setEntries((es) => [data, ...es.filter((x) => x.id !== data.id)]);
      if (data.is_floating || notes.records.some((n) => n.id === data.id))
        notes.upsert(data);
      setEntry(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const deleteEntry = async () => {
    if (!window.confirm("Permanently delete this worldbuilding entry?")) return;
    setBusy(true);
    try {
      const { error } = await client
        .from("codex_entries")
        .delete()
        .eq("id", entry.id);
      if (error) throw error;
      setEntries((es) => es.filter((x) => x.id !== entry.id));
      notes.upsert({ ...entry, is_floating: false });
      setEntry(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const toggleNote = async (note) => {
    const { error } = await client
      .from("codex_entries")
      .update({ is_floating: !note.is_floating })
      .eq("id", note.id);
    if (error) setError(error.message);
    else {
      notes.upsert({ ...note, is_floating: !note.is_floating });
      setEntries((es) =>
        es.map((x) =>
          x.id === note.id ? { ...x, is_floating: !x.is_floating } : x,
        ),
      );
    }
  };
  const nav = [
    ["desk", "Story desk", BookOpen],
    ["chapters", "Chapters", Files],
    ["Character", "Characters", Users],
    ["Lore", "Lore & world", ScrollText],
    ["Scratchpad", "Notes", StickyNote],
    ["publishing", "Publishing", Globe],
    ["settings", "Story settings", Settings],
  ];
  const activeChapter = chapters.find((c) => c.id === draft?.id);
  const position = readWritingPosition(user.id);
  const returnChapter =
    chapters.find((c) => String(c.id) === String(position?.chapterId)) ||
    chapters[chapters.length - 1];
  if (loading)
    return (
      <div className="nf-public">
        <div className="studio-empty" role="status">
          <h3>Opening your story desk…</h3>
        </div>
      </div>
    );
  if (!novel)
    return (
      <div className="nf-public studio-page">
        <StudioError>{error || "Manuscript not found."}</StudioError>
        <button className="pf-button" onClick={() => navigate("/write")}>
          Back to manuscripts
        </button>
      </div>
    );
  return (
    <div
      className={`nf-workspace nf-public ${view === "editor" ? "workspace-is-editing" : ""} ${navCollapsed ? "workspace-nav-collapsed" : ""} ${focus && view === "editor" ? "workspace-focus" : ""}`}
    >
      <header className="workspace-header">
        <div>
          <button
            aria-label="Toggle manuscript navigation"
            aria-expanded={
              small ? menu : !navCollapsed && !(focus && view === "editor")
            }
            onClick={() => {
              if (small) setMenu(!menu);
              else if (focus && view === "editor") {
                setFocus(false);
                setNavCollapsed(false);
              } else setNavCollapsed(!navCollapsed);
            }}
          >
            <PanelLeft size={19} />
          </button>
          <button
            onClick={view === "editor" ? () => go("chapters") : back}
            className="workspace-brand"
            aria-label={
              view === "editor" ? "Return to chapters" : "Back to manuscripts"
            }
          >
            <ArrowLeft size={20} />
            {view === "editor" && <span>Return to chapters</span>}
          </button>
          <span className="workspace-book-name">
            {titleOf(novel)}
            <small>
              {view === "editor"
                ? "The writing room"
                : "Your story, taking shape"}
            </small>
          </span>
        </div>
        <div>
          <span
            className={`workspace-save-status ${saveError ? "has-error" : ""}`}
            role="status"
          >
            {view === "editor" ? (
              saving ? (
                "Saving…"
              ) : saveError ? (
                "Save failed"
              ) : dirty ? (
                "Unsaved changes"
              ) : (
                <>
                  <Check size={13} />
                  Saved
                </>
              )
            ) : (
              novel.status
            )}
          </span>
          {view === "editor" && (
            <>
              <button
                title="Save chapter"
                aria-label="Save chapter"
                disabled={saving || !dirty}
                onClick={persist}
              >
                <Save size={17} />
              </button>
              <button
                aria-label={focus ? "Exit Focus Mode" : "Enter Focus Mode"}
                title={focus ? "Exit Focus Mode" : "Enter Focus Mode"}
                onClick={() => {
                  setFocus(!focus);
                  setMenu(false);
                }}
              >
                {focus ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
            </>
          )}
        </div>
      </header>
      <div className="workspace-body">
        {menu && (
          <button
            className="workspace-scrim"
            aria-label="Close manuscript navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside
          ref={sidebar}
          inert={small ? !menu : navCollapsed || (focus && view === "editor")}
          onKeyDown={(e) => {
            if (e.key === "Escape") setMenu(false);
          }}
          className={`workspace-sidebar ${menu ? "is-open" : ""}`}
        >
          <button className="workspace-back" onClick={back}>
            <ArrowLeft size={14} />
            All manuscripts
          </button>
          <div className="workspace-sidebar-book">
            <div>
              <BookCover novel={novel} decorative />
            </div>
            <h2>{titleOf(novel)}</h2>
            <span>
              {novel.genre} · {novel.status}
            </span>
          </div>
          <nav aria-label="Manuscript navigation">
            {nav.map(([key, text, Icon]) => (
              <button
                key={key}
                aria-current={
                  view === key || (key === "chapters" && view === "editor")
                    ? "page"
                    : undefined
                }
                onClick={() => go(key)}
              >
                {createElement(Icon, { size: 16 })}
                {text}
                {key === "chapters" && <small>{chapters.length}</small>}
              </button>
            ))}
          </nav>
          {(view === "editor" || view === "chapters") && (
            <div className="workspace-chapter-nav">
              <label className="workspace-chapter-search">
                <Search size={14} />
                <input
                  aria-label="Search chapters"
                  placeholder="Find a chapter…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              {chapters
                .filter((c) =>
                  c.title.toLowerCase().includes(query.toLowerCase()),
                )
                .map((c, i) => (
                  <button
                    key={c.id}
                    aria-current={draft?.id === c.id ? "page" : undefined}
                    onClick={() => select(c)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      {c.title}
                      <small>{c.status}</small>
                    </span>
                  </button>
                ))}
              <button
                className="workspace-add-chapter"
                disabled={busy}
                onClick={createChapter}
              >
                <Plus size={15} />
                Add chapter
              </button>
            </div>
          )}
          <span className="workspace-sidebar-foot">
            A world only you could make.
          </span>
        </aside>
        <main ref={main} className="workspace-main" id="workspace-main">
          {error && (
            <StudioError>
              {error}
              <button onClick={() => setError("")}>Dismiss</button>
            </StudioError>
          )}
          {saveError && (
            <StudioError>
              {saveError}
              <button onClick={persist}>Retry saving</button>
            </StudioError>
          )}
          {recovered && view === "editor" && (
            <div className="workspace-recovery" role="status">
              Recovered writing from this browser. It will autosave when
              connected.
            </div>
          )}
          {view === "editor" && draft ? (
            <WritingEditor
              key={draft.id}
              chapterId={draft.id}
              title={draft.title}
              content={draft.content}
              status={activeChapter?.status}
              onChange={(content) => edit({ content })}
              onTitleChange={(title) => edit({ title })}
            />
          ) : view === "desk" ? (
            <div className="workspace-desk">
              <div className="workspace-desk-heading">
                <span className="pf-kicker">THE CREATIVE DESK</span>
                <button
                  className="workspace-settings-link"
                  onClick={() => go("settings")}
                >
                  <Settings size={15} />
                  Story settings
                </button>
                <h1>{titleOf(novel)}</h1>
                <p>
                  {novel.synopsis ||
                    novel.description ||
                    "Every chapter, every character, every fleeting idea. A world coming together."}
                </p>
                <button
                  className="pf-button pf-button-gold"
                  disabled={busy}
                  onClick={() =>
                    chapters.length ? select(returnChapter) : createChapter()
                  }
                >
                  {chapters.length
                    ? "Return to the manuscript"
                    : "Write the first chapter"}
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="workspace-desk-grid">
                <section className="workspace-outline">
                  <span className="pf-kicker">THE MANUSCRIPT</span>
                  <h2>A story, in pieces.</h2>
                  {chapters.slice(0, 5).map((c, i) => (
                    <button key={c.id} onClick={() => select(c)}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        {c.title}
                        <small>
                          {wordCount(c.content)} words · {c.status}
                        </small>
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                  <button
                    className="workspace-outline-add"
                    disabled={busy}
                    onClick={createChapter}
                  >
                    <Plus size={15} />A new chapter
                  </button>
                </section>
                <section className="workspace-desk-fragments">
                  <span className="pf-kicker">THE WORLD BEYOND THE WORDS</span>
                  <h2>The people. The possibilities.</h2>
                  <div>
                    {entries
                      .filter((e) => e.category !== "Scratchpad")
                      .slice(0, 3)
                      .map((e) => (
                        <button
                          key={e.id}
                          className="workspace-fragment"
                          onClick={() => openEntry(e)}
                        >
                          <span>
                            {e.category === "Character" ? (
                              <Users size={20} />
                            ) : (
                              <ScrollText size={20} />
                            )}
                          </span>
                          <span>
                            <small>{e.category}</small>
                            <strong>{e.title}</strong>
                            <p>{e.summary || "An idea taking shape."}</p>
                          </span>
                        </button>
                      ))}
                  </div>
                  <button
                    className="pf-inline-link"
                    onClick={() => {
                      setView("Character");
                      setEntry({
                        category: "Character",
                        title: "",
                        summary: "",
                        content: "",
                      });
                    }}
                  >
                    Bring someone to life <Plus size={14} />
                  </button>
                </section>
              </div>
              <div className="workspace-notes-heading">
                <h2>Thoughts on the desk.</h2>
                <button onClick={createNote} disabled={busy}>
                  <Plus size={15} />A new note
                </button>
              </div>
              <div className="workspace-pinned-notes">
                {entries
                  .filter((e) => e.category === "Scratchpad")
                  .slice(0, 4)
                  .map((e, i) => (
                    <button
                      key={e.id}
                      className="workspace-paper-note"
                      style={{ "--note-rotation": `${i % 2 ? 2 : -2}deg` }}
                      onClick={() => openEntry(e)}
                    >
                      <span>✳</span>
                      <h3>{e.title}</h3>
                      <p>
                        {e.content || "A little space for a passing thought."}
                      </p>
                    </button>
                  ))}
                {!entries.some((e) => e.category === "Scratchpad") && (
                  <button
                    className="workspace-paper-note workspace-note-empty"
                    onClick={createNote}
                  >
                    <Plus size={25} />
                    <p>
                      Leave a thought
                      <br />
                      for your future self.
                    </p>
                  </button>
                )}
              </div>
            </div>
          ) : view === "chapters" ? (
            <div className="workspace-content">
              <span className="pf-kicker">THE MANUSCRIPT</span>
              <h1>Chapter by chapter.</h1>
              <label className="studio-search">
                <Search size={16} />
                <input
                  aria-label="Find chapters"
                  placeholder="Search chapters…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="workspace-chapter-list">
                {chapters
                  .filter((c) =>
                    c.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((c, i) => (
                    <button key={c.id} onClick={() => select(c)}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h2>{c.title}</h2>
                        <small>
                          {wordCount(c.content)} words · {c.status}
                        </small>
                      </div>
                      <ArrowRight size={18} />
                    </button>
                  ))}
              </div>
              <button
                className="pf-button pf-button-gold"
                onClick={createChapter}
                disabled={busy}
              >
                <Plus size={15} />
                Add chapter
              </button>
            </div>
          ) : ["Character", "Lore", "Scratchpad"].includes(view) ? (
            <div className="workspace-content">
              <div className="workspace-view-heading">
                <div>
                  <span className="pf-kicker">THE STORY ARCHIVE</span>
                  <h1>
                    {view === "Character"
                      ? "The people within."
                      : view === "Lore"
                        ? "The world beyond."
                        : "A place for stray thoughts."}
                  </h1>
                </div>
                <button
                  className="pf-button pf-button-gold"
                  disabled={busy}
                  onClick={() =>
                    view === "Scratchpad"
                      ? createNote()
                      : setEntry({
                          title: "",
                          category: view,
                          summary: "",
                          content: "",
                        })
                  }
                >
                  <Plus size={16} />
                  {view === "Scratchpad" ? "New note" : "New entry"}
                </button>
              </div>
              <div
                className={
                  view === "Scratchpad"
                    ? "workspace-pinned-notes"
                    : "workspace-codex-grid"
                }
              >
                {entries
                  .filter((e) => e.category === view)
                  .map((e, i) => (
                    <article
                      key={e.id}
                      className={
                        view === "Scratchpad"
                          ? "workspace-paper-note"
                          : "workspace-codex-card"
                      }
                      style={{ "--note-rotation": `${i % 2 ? 1.5 : -1.5}deg` }}
                    >
                      {e.thumbnail_url ? (
                        <img src={e.thumbnail_url} alt="" />
                      ) : (
                        <span className="workspace-entry-mark">
                          {view === "Character" ? e.title.slice(0, 1) : "✧"}
                        </span>
                      )}
                      <button onClick={() => openEntry(e)}>
                        <span className="pf-kicker">{e.category}</span>
                        <h2>{e.title}</h2>
                        <p>{e.summary}</p>
                        <div className="workspace-entry-excerpt">
                          <EntryReading content={e.content} />
                        </div>
                      </button>
                      {view === "Scratchpad" && (
                        <button
                          className="workspace-float-toggle"
                          onClick={() => toggleNote(e)}
                        >
                          {e.is_floating ? "Put away" : "Float on desk"} ↗
                        </button>
                      )}
                    </article>
                  ))}
              </div>
              {!entries.some((e) => e.category === view) && (
                <StudioEmpty
                  title={
                    view === "Character"
                      ? "Every story needs someone."
                      : view === "Lore"
                        ? "An entire world to discover."
                        : "Catch an idea before it disappears."
                  }
                >
                  Create an entry to start your archive.
                </StudioEmpty>
              )}
            </div>
          ) : view === "publishing" ? (
            <div className="workspace-content workspace-publishing">
              <span className="pf-kicker">
                FROM PRIVATE PAGES TO PUBLIC WORLDS
              </span>
              <h1>A story ready to be shared.</h1>
              <p>
                Your book is currently <strong>{novel.status}</strong>.
                Publishing the manuscript makes the book and all its chapters
                available to readers.
              </p>
              <div className="workspace-publication-summary">
                <BookCover novel={novel} decorative />
                <div>
                  <h2>{titleOf(novel)}</h2>
                  <p>
                    {chapters.length} chapters ·{" "}
                    {chapters.filter((c) => c.status === "Published").length}{" "}
                    published
                  </p>
                  <p>
                    {novel.synopsis ||
                      "Add a synopsis in story settings before sharing."}
                  </p>
                </div>
              </div>
              <button
                className="pf-button pf-button-gold"
                disabled={busy || !chapters.length}
                onClick={() => setConfirmPublish("novel")}
              >
                Publish manuscript
                <Globe size={16} />
              </button>
              {novel.status === "Published" && (
                <button
                  className="pf-button pf-button-quiet"
                  disabled={busy}
                  onClick={() => setConfirmPublish("unpublish")}
                >
                  Return to private draft
                </button>
              )}
              <h2>Individual chapters</h2>
              {chapters.map((c) => (
                <div className="workspace-publishing-row" key={c.id}>
                  <span>
                    {c.title}
                    <small>{c.status}</small>
                  </span>
                  <button
                    onClick={async () => {
                      await select(c);
                      setConfirmPublish("chapter");
                    }}
                  >
                    Review & publish →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="workspace-content">
              <span className="pf-kicker">THE BOOK’S IDENTITY</span>
              <h1>Story settings.</h1>
              <form
                className="studio-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveMeta();
                }}
              >
                <label htmlFor="book-title">Manuscript title</label>
                <input
                  required
                  id="book-title"
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                />
                <label htmlFor="book-genre">Genre</label>
                <input
                  required
                  id="book-genre"
                  value={meta.genre}
                  onChange={(e) => setMeta({ ...meta, genre: e.target.value })}
                />
                <label htmlFor="book-synopsis">Synopsis</label>
                <textarea
                  id="book-synopsis"
                  value={meta.synopsis}
                  onChange={(e) =>
                    setMeta({ ...meta, synopsis: e.target.value })
                  }
                />
                <button disabled={busy} className="pf-button pf-button-gold">
                  {busy ? "Saving…" : "Save story details"}
                </button>
              </form>
            </div>
          )}
          {view === "editor" && draft && (
            <button
              className="workspace-publish-chapter"
              disabled={saving || busy}
              onClick={() => setConfirmPublish("chapter")}
            >
              Publish chapter
              <Globe size={14} />
            </button>
          )}
        </main>
      </div>
      <nav
        className="workspace-bottom-nav"
        aria-label="Manuscript mobile navigation"
      >
        {[
          ["desk", "Desk", BookOpen],
          ["chapters", "Chapters", Files],
          ["Character", "People", Users],
          ["Lore", "Lore", ScrollText],
          ["Scratchpad", "Notes", StickyNote],
          ["publishing", "Publish", Globe],
        ].map(([key, label, Icon]) => (
          <button
            key={key}
            aria-current={
              view === key || (key === "chapters" && view === "editor")
                ? "page"
                : undefined
            }
            onClick={() => go(key)}
          >
            {createElement(Icon, { size: 19 })}
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {entry && (
        <DialogLayer
          onClose={() => {
            if (!busy) setEntry(null);
          }}
        >
          {entry.id && !entryEditing ? (
            <article
              className="studio-modal entry-reading"
              role="dialog"
              aria-modal="true"
              aria-labelledby="entry-reading-title"
            >
              <div className="workspace-dialog-heading">
                <span className="pf-kicker">
                  {entry.category === "Scratchpad"
                    ? "FROM YOUR NOTEBOOK"
                    : entry.category}
                </span>
                <button aria-label="Close entry" onClick={() => setEntry(null)}>
                  <X size={20} />
                </button>
              </div>
              <h2 id="entry-reading-title">{entry.title}</h2>
              {entry.summary && (
                <p className="entry-reading-summary">{entry.summary}</p>
              )}
              <EntryReading content={entry.content} />
              <footer>
                <button
                  className="pf-button pf-button-gold"
                  onClick={() => setEntryEditing(true)}
                >
                  Edit{" "}
                  {entry.category === "Character"
                    ? "character"
                    : entry.category === "Scratchpad"
                      ? "note"
                      : "entry"}
                </button>
                <button
                  className="pf-button pf-button-quiet"
                  onClick={() => setEntry(null)}
                >
                  Back to the desk
                </button>
              </footer>
            </article>
          ) : (
            <form
              className="studio-modal studio-form"
              role="dialog"
              aria-modal="true"
              aria-labelledby="entry-dialog-title"
              onSubmit={saveEntry}
            >
              <div className="workspace-dialog-heading">
                <h2 id="entry-dialog-title">
                  {entry.id ? "An idea, refined." : "Something taking shape."}
                </h2>
                <button
                  type="button"
                  aria-label="Close entry"
                  onClick={() => setEntry(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <label htmlFor="entry-title">
                {entry.category === "Character" ? "Name" : "Title"}
              </label>
              <input
                id="entry-title"
                required
                autoFocus
                value={entry.title}
                onChange={(e) => setEntry({ ...entry, title: e.target.value })}
              />
              <label htmlFor="entry-summary">
                {entry.category === "Character"
                  ? "Role, traits or relationship"
                  : "A short description"}
              </label>
              <input
                id="entry-summary"
                value={entry.summary}
                onChange={(e) =>
                  setEntry({ ...entry, summary: e.target.value })
                }
              />
              <label htmlFor="entry-content">The details</label>
              <textarea
                id="entry-content"
                value={entry.content}
                onChange={(e) =>
                  setEntry({ ...entry, content: e.target.value })
                }
              />
              <div>
                <button className="pf-button pf-button-gold" disabled={busy}>
                  {busy ? "Saving…" : "Keep this idea"}
                </button>
                {entry.id && (
                  <button
                    type="button"
                    className="pf-button pf-button-quiet"
                    disabled={busy}
                    onClick={deleteEntry}
                  >
                    Delete entry
                  </button>
                )}
              </div>
              {error && <StudioError>{error}</StudioError>}
            </form>
          )}
        </DialogLayer>
      )}
      {confirmPublish && (
        <DialogLayer
          onClose={() => {
            if (!busy) setConfirmPublish(null);
          }}
        >
          <div
            className="studio-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-dialog-title"
          >
            <h2 id="publish-dialog-title">
              {confirmPublish === "unpublish"
                ? "Return this story to your desk?"
                : "Open this world to readers?"}
            </h2>
            <p>
              {confirmPublish === "unpublish"
                ? "Your manuscript will become a private draft. Chapter text and chapter statuses are kept."
                : confirmPublish === "chapter"
                  ? "This chapter will be marked Published. It is readable when its parent manuscript is published."
                  : "The manuscript and all its chapters will become public. Draft chapters are included."}
            </p>
            {error && <StudioError>{error}</StudioError>}
            <div>
              <button
                autoFocus
                className="pf-button pf-button-quiet"
                disabled={busy}
                onClick={() => setConfirmPublish(null)}
              >
                Keep working
              </button>
              <button
                className="pf-button pf-button-gold"
                disabled={busy}
                onClick={publish}
              >
                {busy
                  ? "Updating…"
                  : confirmPublish === "unpublish"
                    ? "Make private"
                    : "Publish now"}
              </button>
            </div>
          </div>
        </DialogLayer>
      )}
    </div>
  );
}
