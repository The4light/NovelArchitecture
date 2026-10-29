import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Search } from "lucide-react";
import { AuthContext } from "../context/AuthState";
import { usePersonalLibrary, titleOf } from "../lib/studioData";
import { usePublicCatalog, authorName } from "../lib/publicCatalog";
import {
  demoBooks,
  SHOW_DEMO_BOOKS,
  readingType,
} from "../lib/readingShowcase";
import { StudioHeading, StudioError } from "../components/studio/StudioPieces";
import {
  Jacket,
  ReadingBook,
  ReadingCarousel,
  ReadingDetails,
} from "../components/studio/ReadingShowcase";
import "./StudioHome.css";
import "./ReadingDashboard.css";

function Shelf({ title, subtitle, books, onOpen }) {
  if (!books.length) return null;
  return (
    <section className="reading-section reading-shelf">
      <div className="reading-section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Link to="/explore">
          Explore <ArrowRight size={14} />
        </Link>
      </div>
      <div className="reading-book-grid">
        {books.map((book) => (
          <ReadingBook key={book.id} book={book} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
export default function StudioHome() {
  const { user } = useContext(AuthContext);
  const { items } = usePersonalLibrary();
  const catalogue = usePublicCatalog();
  const books = [
    ...catalogue.novels.map((book) => ({ ...book, title: titleOf(book) })),
    ...(SHOW_DEMO_BOOKS ? demoBooks : []),
  ];
  const [selected, setSelected] = useState(null),
    [genre, setGenre] = useState("All genres"),
    [type, setType] = useState("All types"),
    [query, setQuery] = useState("");
  const reading = items.filter((n) => n.chapterId && !n.completed);
  const filtered = books.filter(
    (book) =>
      (genre === "All genres" || book.genre === genre) &&
      (type === "All types" || readingType(book) === type) &&
      `${book.title} ${authorName(book)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="studio-page studio-home reader-home reading-dashboard">
      <StudioHeading
        eyebrow="YOUR READING ROOM"
        title={
          <>
            So many worlds. <em>Find yours.</em>
          </>
        }
      >
        <Link className="pf-inline-link" to="/library">
          Your library <ArrowRight size={15} />
        </Link>
      </StudioHeading>
      {catalogue.error && (
        <StudioError retry={catalogue.retry}>
          {SHOW_DEMO_BOOKS
            ? "Live stories could not be loaded. Sample books remain available to preview."
            : "Live stories could not be loaded."}
        </StudioError>
      )}
      {SHOW_DEMO_BOOKS && (
        <p className="reading-demo-notice">
          <span>PREVIEW COLLECTION</span> Sample books and ratings are labelled.
          Live stories appear first.
        </p>
      )}
      <ReadingCarousel
        books={books.slice(0, 5)}
        onOpen={setSelected}
        dialogOpen={!!selected}
      />
      {catalogue.loading && <p role="status">Opening the live bookshelf…</p>}
      {!catalogue.loading && !books.length && (
        <p className="reading-no-results">
          The bookshelf is waiting for its first published story. Check back
          soon.
        </p>
      )}
      <Shelf
        title="Featured on the shelf"
        subtitle="A small cover. A whole world inside."
        books={books.slice(0, 10)}
        onOpen={setSelected}
      />
      {reading.length > 0 && (
        <section className="reading-section">
          <div className="reading-section-heading">
            <h2>Pick up where you left off</h2>
            <Link to="/library">
              Your reading shelf <ArrowRight size={14} />
            </Link>
          </div>
          <div className="reading-continue">
            {reading.slice(0, 4).map((book) => (
              <Link
                key={book.id}
                to={`/read/${book.id}?chapter=${book.chapterId}`}
              >
                <div className="reading-continue-cover">
                  <Jacket book={book} />
                </div>
                <span>
                  <strong>{book.title}</strong>
                  <small>{book.chapterTitle || "Continue your chapter"}</small>
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="reading-section reading-discover">
        <div className="reading-section-heading">
          <div>
            <h2>A story for every mood</h2>
            <p>Find a genre, pick a format, follow your curiosity.</p>
          </div>
          <label className="reading-search">
            <Search size={15} />
            <input
              aria-label="Search dashboard books"
              placeholder="Title or author"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="reading-genres" aria-label="Filter books by genre">
          {[
            "All genres",
            ...new Set(books.map((book) => book.genre).filter(Boolean)),
          ].map((value) => (
            <button
              key={value}
              aria-pressed={genre === value}
              onClick={() => setGenre(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="reading-types" aria-label="Filter books by type">
          {["All types", ...new Set(books.map(readingType))].map((value) => (
            <button
              key={value}
              aria-pressed={type === value}
              onClick={() => setType(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="reading-result-count" role="status">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"} to
          explore
        </p>
        <div className="reading-book-grid">
          {filtered.map((book) => (
            <ReadingBook key={book.id} book={book} onOpen={setSelected} />
          ))}
        </div>
        {!filtered.length && (
          <div className="reading-no-results">
            <p>No stories match this combination yet.</p>
            <button
              className="pf-button"
              onClick={() => {
                setGenre("All genres");
                setType("All types");
                setQuery("");
              }}
            >
              Show every story
            </button>
          </div>
        )}
      </section>
      <section className="reading-section">
        <div className="reading-section-heading">
          <div>
            <h2>Three ways to get lost</h2>
            <p>
              Selections by genre.{" "}
              {SHOW_DEMO_BOOKS && "Sample review scores are illustrative."}
            </p>
          </div>
        </div>
        <div className="reading-ranked-columns">
          {["Fantasy", "Mystery", "Romance"].map((value) => (
            <div key={value}>
              <h3>
                {value} <span>SELECTION</span>
              </h3>
              {books
                .filter((book) => book.genre === value)
                .slice(0, 5)
                .map((book, i) => (
                  <ReadingBook
                    key={book.id}
                    book={book}
                    rank={i + 1}
                    onOpen={setSelected}
                  />
                ))}
              {!books.some((book) => book.genre === value) && (
                <p>More stories coming soon.</p>
              )}
            </div>
          ))}
        </div>
      </section>
      <Shelf
        title="Short reads, lasting impressions"
        subtitle="Novellas and short stories for an unhurried break."
        books={books
          .filter((book) =>
            ["Novella", "Short story"].includes(readingType(book)),
          )
          .slice(0, 10)}
        onOpen={setSelected}
      />
      <div className="reading-footer">
        <BookOpen size={22} />
        <div>
          <h2>Make room for your next favourite.</h2>
          <p>
            Your saved books and last opened chapters are waiting in your
            library.
          </p>
        </div>
        <Link className="pf-button" to="/library">
          Open your library <ArrowRight size={15} />
        </Link>
      </div>
      {selected && (
        <ReadingDetails
          key={selected.id}
          book={selected}
          userId={user.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
