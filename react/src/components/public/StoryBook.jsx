import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SaveBook } from "../studio/StudioPieces";
import {
  authorName,
  genreKey,
  storyIllustration,
} from "../../lib/publicCatalog";

export function AuthorLink({ novel, prefix = false }) {
  const name = authorName(novel);
  return (
    <span className="pf-author">
      {prefix && "by "}
      {novel.profiles?.username ? (
        <Link to={`/profile/${novel.profiles.username}`}>{name}</Link>
      ) : (
        name
      )}
    </span>
  );
}

export function BookCover({ novel, decorative = false, eager = false }) {
  const [failed, setFailed] = useState([]);
  const image = [
    novel.thumbnail_url || novel.cover,
    storyIllustration(novel),
  ].find((url) => url && !failed.includes(url));
  return (
    <div
      className={`pf-book ${!image ? "pf-book-fallback" : ""}`}
      data-genre={genreKey(novel.genre)}
      aria-hidden={decorative || undefined}
    >
      {image && (
        <img
          src={image}
          alt={decorative ? "" : `Cover artwork for ${novel.title}`}
          loading={eager ? "eager" : "lazy"}
          onError={() => setFailed((value) => [...value, image])}
        />
      )}
      <div className="pf-book-jacket">
        <span>{novel.genre || "Fiction"}</span>
        <strong>{novel.title?.replaceAll("_", " ") || "Untitled"}</strong>
        <span>{authorName(novel)}</span>
      </div>
      <span className="pf-book-binding" />
    </div>
  );
}

export default function StoryBook({ novel, compact = false, sample = false }) {
  const destination = sample ? "/explore" : `/read/${novel.id}`;
  return (
    <article className={`pf-story ${compact ? "pf-story-compact" : ""}`}>
      <Link
        className="pf-cover-link"
        to={destination}
        aria-label={
          sample
            ? `Browse published stories like ${novel.title}`
            : `Enter ${novel.title}`
        }
      >
        <BookCover novel={novel} />
      </Link>
      <div className="pf-story-meta">
        <span className="pf-kicker">
          {novel.genre || "Fiction"}
          {sample && " · Sample"}
        </span>
        <h3>
          <Link to={destination}>{novel.title?.replaceAll("_", " ")}</Link>
        </h3>
        <AuthorLink novel={novel} />
        {!sample && <SaveBook novel={novel} />}
        {compact && (
          <p>
            {novel.synopsis ||
              novel.description ||
              "A new world, waiting between the pages."}
          </p>
        )}
        {compact && (
          <Link className="pf-inline-link" to={destination}>
            {sample ? "Browse live stories" : "Enter the story"}
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </article>
  );
}
