import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import PublicLayout, {
  PublicState,
  SectionHeading,
} from "../components/public/PublicLayout";
import StoryBook, {
  AuthorLink,
  BookCover,
} from "../components/public/StoryBook";
import { SaveBook } from "../components/studio/StudioPieces";
import {
  genreKey,
  genreLabel,
  usePublicCatalog,
  worldArtwork,
} from "../lib/publicCatalog";

export default function ExplorePage() {
  const { novels, loading, error, retry } = usePublicCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const genre = params.get("genre") || "";
  const sort = params.get("sort") || "Recent";
  const update = (key, value) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  const genres = [
    ...new Map(
      novels
        .filter((item) => item.genre)
        .map((item) => [genreKey(item.genre), genreLabel(item.genre)]),
    ).entries(),
  ];
  const filtered = novels
    .filter(
      (novel) =>
        (!genre || genreKey(novel.genre) === genreKey(genre)) &&
        (!query.trim() ||
          `${novel.title} ${novel.author_name || ""} ${novel.profiles?.display_name || ""}`
            .toLowerCase()
            .includes(query.toLowerCase().trim())),
    )
    .sort((a, b) =>
      sort === "Title"
        ? a.title.localeCompare(b.title)
        : sort === "Popular"
          ? (b.views || 0) - (a.views || 0)
          : new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );
  const featured = filtered[0];
  const browsing = !query.trim() && !genre;

  return (
    <PublicLayout className="pf-explore">
      <div className="pf-container pf-page-top">
        <div className="pf-editorial-header">
          <div>
            <span className="pf-kicker">THE NOVELFORGE BOOKSHELF</span>
            <h1>
              Stories worth
              <br />
              <em>disappearing into.</em>
            </h1>
            <p>
              A new voice. An unexpected obsession. A world you’ll carry with
              you.
            </p>
          </div>
          <div className="pf-header-aside">
            <span className="pf-editorial-star" aria-hidden="true">
              ✳
            </span>
            <span>
              Follow a little curiosity.
              <br />
              Find an entirely new world.
            </span>
          </div>
        </div>
        <div className="pf-catalog-controls">
          <form
            className="pf-search-field"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={20} />
            <label className="pf-sr-only" htmlFor="catalog-search">
              Search published stories by title or author
            </label>
            <input
              id="catalog-search"
              type="search"
              placeholder="A title, an author, a new beginning…"
              value={query}
              onChange={(event) => update("q", event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => update("q", "")}
              >
                <X size={18} />
              </button>
            )}
          </form>
          <label className="pf-sort">
            <SlidersHorizontal size={16} />
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => update("sort", event.target.value)}
            >
              <option>Recent</option>
              <option>Popular</option>
              <option>Title</option>
            </select>
          </label>
        </div>
        <nav className="pf-genre-filters" aria-label="Filter stories by genre">
          <button aria-pressed={!genre} onClick={() => update("genre", "")}>
            All stories
          </button>
          {genres.map(([key, label]) => (
            <button
              key={key}
              aria-pressed={genreKey(genre) === key}
              onClick={() => update("genre", key)}
            >
              {label}
            </button>
          ))}
        </nav>
        {loading ? (
          <PublicState as="h2" title="Opening the bookshelf…" loading />
        ) : error ? (
          <PublicState
            as="h2"
            title="A brief pause between stories."
            action={
              <button className="pf-button pf-button-gold" onClick={retry}>
                Try again
                <ArrowRight size={17} />
              </button>
            }
          >
            We couldn’t reach the catalogue. Please try again in a moment.
          </PublicState>
        ) : !featured ? (
          <PublicState
            as="h2"
            title={
              query || genre
                ? "A different path, perhaps?"
                : "The first story could be yours."
            }
            action={
              query || genre ? (
                <button
                  className="pf-button pf-button-quiet"
                  onClick={() => setParams({})}
                >
                  Clear filters
                  <ArrowRight size={17} />
                </button>
              ) : (
                <Link className="pf-button pf-button-gold" to="/write">
                  Start a story
                  <ArrowRight size={17} />
                </Link>
              )
            }
          >
            {query || genre
              ? "No published stories match these filters. Try another title or explore every genre."
              : "This bookshelf is waiting for its first published world."}
          </PublicState>
        ) : (
          <>
            <div className="pf-results-meta" aria-live="polite">
              <span>
                {filtered.length} published{" "}
                {filtered.length === 1 ? "story" : "stories"}
                {query && ` matching “${query}”`}
              </span>
              <span>
                {browsing
                  ? "Begin somewhere extraordinary."
                  : genre
                    ? genreLabel(
                        genres.find(([key]) => key === genreKey(genre))?.[1] ||
                          genre,
                      )
                    : "A little closer to your next read."}
              </span>
            </div>
            <section
              className="pf-featured-story"
              aria-labelledby="featured-story-title"
            >
              <div className="pf-featured-environment" aria-hidden="true">
                {worldArtwork(featured) && (
                  <img
                    src={worldArtwork(featured)}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.opacity = "0";
                    }}
                  />
                )}
              </div>
              <div className="pf-featured-copy">
                <span className="pf-kicker">
                  {browsing ? "A WORLD TO STEP INTO" : "YOUR NEXT CHAPTER"}{" "}
                  <span>·</span> {genreLabel(featured.genre)}
                </span>
                <h2 id="featured-story-title">
                  <Link to={`/read/${featured.id}`}>
                    {featured.title.replaceAll("_", " ")}
                  </Link>
                </h2>
                <AuthorLink novel={featured} prefix />
                <SaveBook novel={featured} />
                <p>
                  {featured.synopsis ||
                    featured.description ||
                    "Some stories stay with you long after the last page. This could be one of them."}
                </p>
                <Link
                  className="pf-button pf-button-gold"
                  to={`/read/${featured.id}`}
                >
                  Enter the story
                  <ArrowRight size={17} />
                </Link>
              </div>
              <Link
                className="pf-featured-cover"
                to={`/read/${featured.id}`}
                aria-label={`Enter ${featured.title}`}
              >
                <BookCover novel={featured} decorative eager />
              </Link>
              <span className="pf-featured-footnote">
                A whole world. Just beyond the cover.
              </span>
            </section>
            {filtered.length > 1 && (
              <section className="pf-discovery-shelf">
                <SectionHeading
                  eyebrow={
                    browsing ? "KEEP EXPLORING" : "A FEW MORE POSSIBILITIES"
                  }
                  title={
                    browsing ? (
                      <>
                        More worlds. <em>More wonder.</em>
                      </>
                    ) : (
                      <>
                        There’s more <em>between the lines.</em>
                      </>
                    )
                  }
                >
                  <span className="pf-muted">
                    {Math.min(filtered.length - 1, 8)} more to discover
                  </span>
                </SectionHeading>
                <div className="pf-book-rail">
                  {filtered.slice(1, 9).map((novel) => (
                    <StoryBook key={novel.id} novel={novel} />
                  ))}
                </div>
              </section>
            )}
            {browsing && genres.length > 1 && (
              <section className="pf-genre-directory">
                <SectionHeading
                  eyebrow="WHERE WILL YOU GO?"
                  title={
                    <>
                      Let curiosity <em>choose.</em>
                    </>
                  }
                />
                {genres.map(([key, label], index) => (
                  <button
                    key={key}
                    onClick={() => {
                      update("genre", key);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    <span>0{index + 1}</span>
                    <strong>{label}</strong>
                    <span>
                      {
                        novels.filter((novel) => genreKey(novel.genre) === key)
                          .length
                      }{" "}
                      {novels.filter((novel) => genreKey(novel.genre) === key)
                        .length === 1
                        ? "story"
                        : "stories"}
                    </span>
                    <ArrowRight size={20} />
                  </button>
                ))}
              </section>
            )}
          </>
        )}
        <div className="pf-small-invitation">
          <BookOpen size={22} strokeWidth={1.3} />
          <p>Some stories are worth keeping close.</p>
          <Link to="/library">
            Visit your library
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
