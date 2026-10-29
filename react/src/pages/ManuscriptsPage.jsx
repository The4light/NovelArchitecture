import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowUpRight, Trash2 } from "lucide-react";
import {
  StudioClientContext,
  useStudioData,
  titleOf,
  wordCount,
} from "../lib/studioData";
import {
  StudioHeading,
  StudioEmpty,
  StudioError,
} from "../components/studio/StudioPieces";
import { BookCover } from "../components/public/StoryBook";
import DialogLayer from "../components/studio/DialogLayer";

export default function ManuscriptsPage() {
  const data = useStudioData();
  const client = useContext(StudioClientContext);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    setBusy(true);
    const { error } = await client.from("novels").delete().eq("id", pending.id);
    setBusy(false);
    if (error) setError(error.message);
    else {
      setPending(null);
      data.retry();
    }
  };
  const books = data.novels.filter(
    (n) =>
      (filter === "All" || n.status === filter) &&
      titleOf(n).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="studio-page">
      <StudioHeading
        eyebrow="THE AUTHOR’S STUDIO"
        title={
          <>
            Worlds in <em>the making.</em>
          </>
        }
      >
        <Link className="pf-button pf-button-gold" to="/write/create">
          <Plus size={17} />
          New manuscript
        </Link>
      </StudioHeading>
      <div className="studio-controls">
        <Link className="pf-inline-link" to="/analytics">
          Writing analytics ↗
        </Link>
        <div className="studio-tabs">
          {["All", "Draft", "Published"].map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "All"
                ? "All manuscripts"
                : f === "Draft"
                  ? "Drafts"
                  : "Published"}
            </button>
          ))}
        </div>
        <label className="studio-search">
          <Search size={17} />
          <input
            aria-label="Search manuscripts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a manuscript…"
          />
        </label>
      </div>
      {(data.error || error) && (
        <StudioError retry={data.retry}>{data.error || error}</StudioError>
      )}
      {data.loading ? (
        <p role="status">Opening your manuscripts…</p>
      ) : !books.length ? (
        <StudioEmpty
          title={
            data.novels.length
              ? "No manuscripts match."
              : "Every world begins somewhere."
          }
          to="/write/create"
          action="Start a manuscript"
        >
          Your chapters, characters and stray ideas will find a home here.
        </StudioEmpty>
      ) : (
        <div className="studio-manuscript-grid">
          {books.map((n) => {
            const chapters = data.chapters.filter((c) => c.novel_id === n.id);
            return (
              <article className="studio-manuscript" key={n.id}>
                <Link
                  className="studio-manuscript-art"
                  to={`/write/edit/${n.id}`}
                >
                  <BookCover
                    novel={{ ...n, author_name: data.profile?.display_name }}
                    decorative
                  />
                  <span className="studio-status">{n.status}</span>
                  <ArrowUpRight size={22} />
                </Link>
                <div className="studio-manuscript-info">
                  <span className="pf-kicker">{n.genre}</span>
                  <h2>
                    <Link to={`/write/edit/${n.id}`}>{titleOf(n)}</Link>
                  </h2>
                  <p>
                    {n.description ||
                      n.synopsis ||
                      "An unwritten world. An open possibility."}
                  </p>
                  <footer>
                    <span>
                      {data.chapterError
                        ? "Chapters unavailable"
                        : `${chapters.length} chapters · ${chapters.reduce((s, c) => s + wordCount(c.content), 0).toLocaleString()} words`}
                    </span>
                    <button
                      aria-label={`Delete ${titleOf(n)}`}
                      onClick={() => setPending(n)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </footer>
                </div>
              </article>
            );
          })}
          <Link className="studio-new-manuscript" to="/write/create">
            <Plus size={29} />
            <h2>Something new.</h2>
            <p>Make space for your next idea.</p>
          </Link>
        </div>
      )}
      {pending && (
        <DialogLayer
          onClose={() => {
            if (!busy) setPending(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="studio-modal"
          >
            <h2 id="delete-title">Delete this manuscript?</h2>
            <p>
              “{titleOf(pending)}”, its chapters and worldbuilding will be
              permanently deleted. This cannot be undone.
            </p>
            <div>
              <button
                autoFocus
                className="pf-button pf-button-quiet"
                disabled={busy}
                onClick={() => setPending(null)}
              >
                Keep manuscript
              </button>
              <button
                className="pf-button studio-danger"
                disabled={busy}
                onClick={remove}
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </DialogLayer>
      )}
    </div>
  );
}
