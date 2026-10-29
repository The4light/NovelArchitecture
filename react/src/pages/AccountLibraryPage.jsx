import { useState } from "react";
import { Link } from "react-router-dom";
import { usePersonalLibrary } from "../lib/studioData";
import {
  StudioHeading,
  StudioEmpty,
  StudioError,
} from "../components/studio/StudioPieces";
import { BookCover } from "../components/public/StoryBook";
import { titleOf } from "../lib/studioData";
export default function AccountLibraryPage() {
  const { items, update, remove } = usePersonalLibrary();
  const [tab, setTab] = useState("reading");
  const [error, setError] = useState("");
  const act = (fn) => {
    try {
      fn();
      setError("");
    } catch {
      setError(
        "Your browser could not update the library. Check that storage is available.",
      );
    }
  };
  const books = items.filter((n) =>
    tab === "reading"
      ? n.chapterId && !n.completed
      : tab === "saved"
        ? n.saved
        : !!n.completed,
  );
  return (
    <div className="studio-page">
      <StudioHeading
        eyebrow="YOUR PRIVATE BOOKSHELF"
        title={
          <>
            Worlds you <em>keep close.</em>
          </>
        }
      >
        <Link className="pf-inline-link" to="/explore">
          Find your next story ↗
        </Link>
      </StudioHeading>
      <div className="studio-controls">
        <div className="studio-tabs">
          {[
            ["reading", "Continue reading"],
            ["saved", "Saved"],
            ["completed", "Completed"],
          ].map(([v, t]) => (
            <button key={v} aria-pressed={tab === v} onClick={() => setTab(v)}>
              {t}
            </button>
          ))}
        </div>
        <span className="pf-muted">{books.length} stories</span>
      </div>
      <p className="studio-local-notice">
        Your shelf and last opened chapter are saved in this browser for this
        account. They don’t sync between devices.
      </p>
      {error && <StudioError>{error}</StudioError>}
      {books.length ? (
        <div className="studio-library-grid">
          {books.map((n) => (
            <article className="studio-library-item" key={n.id}>
              <Link
                className="studio-library-cover"
                to={`/read/${n.id}${n.chapterId ? `?chapter=${n.chapterId}` : ""}`}
              >
                <BookCover novel={n} decorative />
              </Link>
              <h2>
                <Link to={`/read/${n.id}`}>{titleOf(n)}</Link>
              </h2>
              <p>
                {n.profiles?.display_name ||
                  n.author_name ||
                  n.genre ||
                  "Fiction"}
              </p>
              {n.chapterId && (
                <p>
                  Last opened: chapter {n.chapterNumber} of {n.totalChapters}
                  <br />
                  {n.chapterTitle}
                </p>
              )}
              <Link
                className="pf-inline-link"
                to={`/read/${n.id}${n.chapterId ? `?chapter=${n.chapterId}` : ""}`}
              >
                {n.chapterId ? "Return to the story" : "Enter the story"} →
              </Link>
              <div className="studio-library-actions">
                <button
                  onClick={() => act(() => update(n, { saved: !n.saved }))}
                >
                  {n.saved ? "Unsave" : "Save for later"}
                </button>
                {n.chapterId && (
                  <button
                    onClick={() =>
                      act(() => update(n, { completed: !n.completed }))
                    }
                  >
                    {n.completed ? "Mark as reading" : "Mark completed"}
                  </button>
                )}
                <button onClick={() => act(() => remove(n.id))}>
                  Remove from shelf
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <StudioEmpty
          title={
            tab === "saved"
              ? "A place for your next favourite."
              : tab === "completed"
                ? "Every ending earns its place."
                : "A story is waiting for you."
          }
          to="/explore"
          action="Explore the bookshelf"
        >
          {tab === "completed"
            ? "Mark a story completed from your reading shelf when you finish it."
            : tab === "saved"
              ? "Save a published story and it will be waiting here."
              : "Open a chapter to begin your personal reading shelf."}
        </StudioEmpty>
      )}
    </div>
  );
}
