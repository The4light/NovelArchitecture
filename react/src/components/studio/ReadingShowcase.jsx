import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { authorName } from "../../lib/publicCatalog";
import { reviewStats, readingType } from "../../lib/readingShowcase";
import { BookCover } from "../public/StoryBook";
import { SaveBook } from "./StudioPieces";
import DialogLayer from "./DialogLayer";

export function Jacket({ book }) {
  return book.isDemo ? (
    <div
      className="reading-jacket"
      style={{ "--jacket": book.jacket }}
      aria-hidden="true"
    >
      <span>NOVELFORGE · SAMPLE EDITION</span>
      <i>✦</i>
      <strong>{book.title}</strong>
      <small>{authorName(book)}</small>
    </div>
  ) : (
    <BookCover novel={book} decorative />
  );
}
export function Rating({ book }) {
  const stats = reviewStats(book);
  return (
    <span className="reading-rating">
      <Star size={12} fill={stats ? "currentColor" : "none"} />
      <span>
        {stats
          ? `${stats.average.toFixed(1)} · ${stats.count} ${book.isDemo ? "sample reviews" : "reviews"}`
          : "Not yet reviewed"}
      </span>
    </span>
  );
}
export function ReadingBook({ book, onOpen, rank }) {
  return (
    <button
      className={`reading-book ${rank ? "reading-ranked-book" : ""}`}
      onClick={() => onOpen(book)}
    >
      {rank && (
        <span className="reading-rank">{String(rank).padStart(2, "0")}</span>
      )}
      <div className="reading-cover">
        <Jacket book={book} />
        {book.isDemo && <span className="reading-sample">Sample</span>}
      </div>
      <div className="reading-book-meta">
        <h3>{book.title}</h3>
        <p>
          {book.genre || "Fiction"} · {readingType(book)}
        </p>
        <Rating book={book} />
      </div>
    </button>
  );
}
export function ReadingCarousel({ books, onOpen, dialogOpen }) {
  const [slide, setSlide] = useState(1),
    [paused, setPaused] = useState(false),
    [hovering, setHovering] = useState(false),
    [reduced, setReduced] = useState(false),
    [hidden, setHidden] = useState(false),
    [jump, setJump] = useState(false);
  const total = books.length,
    active = total ? (slide - 1 + total) % total : 0;
  const frames = total > 1 ? [books[total - 1], ...books, books[0]] : books;
  useEffect(() => {
    if (!jump) return;
    let second;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setJump(false));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [jump]);
  const move = (direction) => {
    if (total < 2) return;
    if (reduced) setSlide(((active + direction + total) % total) + 1);
    else
      setSlide((value) => Math.max(0, Math.min(total + 1, value + direction)));
  };
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (paused || hovering || reduced || hidden || total < 2 || dialogOpen)
      return;
    const timer = setInterval(
      () => setSlide((value) => Math.min(total + 1, value + 1)),
      4800,
    );
    return () => clearInterval(timer);
  }, [paused, hovering, reduced, hidden, total, dialogOpen]);
  if (!total) return null;
  return (
    <section
      className="reading-carousel"
      aria-label="Featured books"
      aria-roledescription="carousel"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setHovering(false);
      }}
    >
      <div
        className="reading-carousel-track"
        style={{
          transform: `translateX(-${(total > 1 ? slide : 0) * 100}%)`,
          transition: jump ? "none" : undefined,
        }}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget || total < 2) return;
          if (slide === total + 1 || slide === 0) {
            setJump(true);
            setSlide(slide === 0 ? total : 1);
          }
        }}
      >
        {frames.map((book, i) => (
          <div
            key={`${book.id}-${i}`}
            className="reading-slide"
            inert={
              total > 1 ? i !== slide || i === 0 || i === total + 1 : false
            }
            aria-hidden={
              total > 1 ? i !== slide || i === 0 || i === total + 1 : false
            }
            role="group"
            aria-roledescription="slide"
            aria-label={`${total > 1 ? i : 1} of ${total}: ${book.title}`}
          >
            <div className="reading-slide-copy">
              <span className="pf-kicker">
                {book.isDemo
                  ? "A LITTLE INSPIRATION · SAMPLE STORY"
                  : "FROM THE NOVELFORGE BOOKSHELF"}
              </span>
              <h2>{book.title}</h2>
              <p className="reading-slide-author">
                {authorName(book)} · {book.genre || "Fiction"}
              </p>
              <p>
                {book.synopsis ||
                  book.description ||
                  "A new voice. An unfamiliar world. Your next chapter awaits."}
              </p>
              <button
                className="pf-button pf-button-gold"
                onClick={() => onOpen(book)}
              >
                {book.isDemo ? "Discover this book" : "Read & reviews"}
                <BookOpen size={15} />
              </button>
              <Rating book={book} />
            </div>
            <div className="reading-slide-cover">
              <Jacket book={book} />
            </div>
          </div>
        ))}
      </div>
      <div className="reading-carousel-controls">
        <button aria-label="Previous featured book" onClick={() => move(-1)}>
          <ChevronLeft size={17} />
        </button>
        <div>
          {books.map((book, i) => (
            <button
              key={book.id}
              className={i === active ? "active" : ""}
              aria-label={`Show featured book ${i + 1}: ${book.title}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => setSlide(i + 1)}
            />
          ))}
        </div>
        <button aria-label="Next featured book" onClick={() => move(1)}>
          <ChevronRight size={17} />
        </button>
        <button
          aria-label={paused ? "Play book carousel" : "Pause book carousel"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <span>
          {active + 1} / {total}
        </span>
      </div>
    </section>
  );
}

export function ReadingDetails({ book, userId, onClose }) {
  const key = `novelforge:review:${userId}:${book.id}`;
  const [previous] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  });
  const [stars, setStars] = useState(previous?.stars || 0),
    [review, setReview] = useState(previous?.text || ""),
    [notice, setNotice] = useState("");
  const save = (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          stars,
          text: review,
          updatedAt: new Date().toISOString(),
        }),
      );
      setNotice(
        "Your review is saved in this browser. It is not a public review.",
      );
    } catch {
      setNotice("Your browser could not save the review. Please try again.");
    }
  };
  return (
    <DialogLayer onClose={onClose}>
      <article
        className="studio-modal reading-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-detail-title"
      >
        <button
          className="reading-detail-close"
          aria-label="Close book details"
          onClick={onClose}
        >
          <X size={21} />
        </button>
        <div className="reading-detail-heading">
          <div className="reading-detail-cover">
            <Jacket book={book} />
          </div>
          <div>
            <span className="pf-kicker">
              {book.genre || "Fiction"} · {readingType(book)}
              {book.isDemo ? " · SAMPLE BOOK" : ""}
            </span>
            <h2 id="reading-detail-title">{book.title}</h2>
            <p>{authorName(book)}</p>
            <Rating book={book} />
            {!book.isDemo && (
              <>
                <Link
                  className="pf-button pf-button-gold"
                  to={`/read/${book.id}`}
                >
                  Enter the story <BookOpen size={15} />
                </Link>
                <SaveBook novel={book} />
              </>
            )}
          </div>
        </div>
        <p className="reading-detail-synopsis">
          {book.synopsis ||
            book.description ||
            "The author has not added a description yet."}
        </p>
        {book.isDemo && (
          <div className="reading-sample-review">
            <span className="pf-kicker">SAMPLE REVIEW · FICTIONAL</span>
            <p>
              “The kind of world you want to stay in for one more chapter.
              Quietly absorbing, with a little wonder on every page.”
            </p>
            <small>
              Demo reader · illustrative review, not submitted by a real reader
            </small>
          </div>
        )}
        <form className="reading-review-form" onSubmit={save}>
          <h3>Your reading impression</h3>
          <p>
            {book.isDemo
              ? "Try the review interaction on this fictional book."
              : "Keep a personal rating and review."}{" "}
            Saved in this browser only; public review publishing is not
            connected yet.
          </p>
          <fieldset>
            <legend>Your rating</legend>
            <div className="reading-star-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="book-rating"
                    value={value}
                    checked={stars === value}
                    onChange={() => setStars(value)}
                    required
                  />
                  <Star
                    size={25}
                    fill={value <= stars ? "currentColor" : "none"}
                  />
                  <span className="reading-visually-hidden">
                    {value} {value === 1 ? "star" : "stars"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor="reading-review">Your review</label>
          <textarea
            id="reading-review"
            maxLength={2000}
            rows={3}
            placeholder="What stayed with you?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button className="pf-button pf-button-gold">
            Save personal review
          </button>
          <p role="status">{notice}</p>
        </form>
        {book.isDemo && (
          <Link className="pf-inline-link" to="/explore">
            Find a live story to read <BookOpen size={14} />
          </Link>
        )}
      </article>
    </DialogLayer>
  );
}
