import { Link, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthState";
import ExplorePage from "./Explore";
import { ArrowRight, Search, X } from "lucide-react";
import PublicLayout, {
  PublicState,
  SectionHeading,
} from "../components/public/PublicLayout";
import StoryBook from "../components/public/StoryBook";
import { novelsData } from "../data/novel";
import { genreKey, genreLabel } from "../lib/publicCatalog";

function PublicSearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const genre = params.get("genre") || "";
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
  const genres = [...new Set(novelsData.map((novel) => novel.genre))];
  const results = novelsData.filter(
    (novel) =>
      (!genre || genreKey(novel.genre) === genreKey(genre)) &&
      `${novel.title} ${novel.author}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <PublicLayout className="pf-search-page">
      <div className="pf-container pf-page-top">
        <div className="pf-editorial-header">
          <div>
            <span className="pf-kicker">FOLLOW A THREAD. FIND A WORLD.</span>
            <h1>
              What are you
              <br />
              <em>looking for?</em>
            </h1>
            <p>Sometimes, all it takes is a name.</p>
          </div>
          <span className="pf-editorial-star" aria-hidden="true">
            ✧
          </span>
        </div>
        <form
          className="pf-search-field pf-search-large"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={23} />
          <label className="pf-sr-only" htmlFor="story-search">
            Search sample titles and authors
          </label>
          <input
            id="story-search"
            type="search"
            placeholder="Search by title or author"
            value={query}
            onChange={(event) => update("q", event.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update("q", "")}
            >
              <X size={20} />
            </button>
          )}
        </form>
        <div className="pf-preview-notice">
          <span>Preview collection</span>
          <p>
            This search currently uses {novelsData.length} sample titles. For
            published NovelForge stories, use the live catalogue.
          </p>
          <Link
            to={`/explore${query ? `?q=${encodeURIComponent(query)}` : ""}`}
          >
            Search live stories
            <ArrowRight size={16} />
          </Link>
        </div>
        <nav className="pf-genre-filters" aria-label="Filter sample results">
          <button aria-pressed={!genre} onClick={() => update("genre", "")}>
            All genres
          </button>
          {genres.map((item) => (
            <button
              key={item}
              aria-pressed={genreKey(item) === genreKey(genre)}
              onClick={() => update("genre", item)}
            >
              {genreLabel(item)}
            </button>
          ))}
        </nav>
        <SectionHeading
          eyebrow={query ? `RESULTS FOR “${query}”` : "THE SAMPLE BOOKSHELF"}
          title={
            query ? (
              <>
                A story with <em>your name on it.</em>
              </>
            ) : (
              <>
                A little <em>inspiration.</em>
              </>
            )
          }
        >
          <span className="pf-muted" role="status">
            {results.length} sample {results.length === 1 ? "match" : "matches"}
          </span>
        </SectionHeading>
        {results.length ? (
          <div className="pf-search-results">
            {results.map((novel) => (
              <StoryBook key={novel.id} novel={novel} compact sample />
            ))}
          </div>
        ) : (
          <PublicState
            as="h2"
            title="No matches on this shelf."
            action={
              <button
                className="pf-button pf-button-quiet"
                onClick={() => setParams({})}
              >
                Clear search &amp; filters
                <ArrowRight size={17} />
              </button>
            }
          >
            Try a different name or genre, or search the live catalogue instead.
          </PublicState>
        )}
        <Link className="pf-back-link" to="/explore">
          Back to the live bookshelf
          <ArrowRight size={17} />
        </Link>
      </div>
    </PublicLayout>
  );
}
export default function SearchPage() {
  const { user } = useContext(AuthContext);
  return user ? <ExplorePage /> : <PublicSearchPage />;
}
