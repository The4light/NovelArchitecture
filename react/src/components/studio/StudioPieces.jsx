import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Check } from "lucide-react";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthState";
import { titleOf, usePersonalLibrary } from "../../lib/studioData";
import { BookCover } from "../public/StoryBook";

export function StudioHeading({ eyebrow, title, children }) {
  return (
    <header className="studio-heading">
      <div>
        <span className="pf-kicker">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}
export function StudioSection({ title, to, action = "View all", children }) {
  return (
    <section className="studio-section">
      <div className="studio-section-title">
        <h2>{title}</h2>
        {to && (
          <Link to={to}>
            {action}
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
export function StudioEmpty({ title, children, to, action }) {
  return (
    <div className="studio-empty">
      <span aria-hidden="true">✧</span>
      <h3>{title}</h3>
      <p>{children}</p>
      {to && (
        <Link className="pf-inline-link" to={to}>
          {action}
          <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}
export function StudioError({ children, retry }) {
  return (
    <div className="studio-error" role="alert">
      {children}
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}
export function SaveBook({ novel }) {
  const { user } = useContext(AuthContext);
  const { items, update } = usePersonalLibrary();
  const [error, setError] = useState("");
  if (!user) return null;
  const position = items.find((n) => String(n.id) === String(novel.id));
  const saved = position?.saved;
  return (
    <>
      <button
        className="studio-save-book"
        aria-pressed={!!saved}
        onClick={() => {
          try {
            update(novel, { saved: !saved });
            setError("");
          } catch {
            setError("Your browser could not save this book.");
          }
        }}
      >
        {saved ? <Check size={15} /> : <Bookmark size={15} />}{" "}
        {saved ? "On your shelf" : "Save to library"}
      </button>
      {position?.chapterId && !position.completed && (
        <Link
          className="studio-resume-book"
          to={`/read/${novel.id}?chapter=${position.chapterId}`}
        >
          Resume chapter {position.chapterNumber} →
        </Link>
      )}
      {error && <span role="alert">{error}</span>}
    </>
  );
}
export function SmallBook({ book, writing = false }) {
  return (
    <article className="studio-small-book">
      <Link
        to={
          writing
            ? `/write/edit/${book.id}`
            : `/read/${book.id}${book.chapterId ? `?chapter=${book.chapterId}` : ""}`
        }
      >
        <BookCover novel={book} decorative />
      </Link>
      <div>
        <span className="pf-kicker">
          {writing ? book.status : book.genre || "Fiction"}
        </span>
        <h3>
          <Link to={writing ? `/write/edit/${book.id}` : `/read/${book.id}`}>
            {titleOf(book)}
          </Link>
        </h3>
        <p>
          {writing
            ? "Return to your story"
            : book.profiles?.display_name ||
              book.author_name ||
              "A world to discover"}
        </p>
        {book.chapterTitle && <small>Last opened: {book.chapterTitle}</small>}
      </div>
    </article>
  );
}
