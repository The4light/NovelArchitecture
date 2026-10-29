import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Feather,
  Moon,
  Sun,
} from "lucide-react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { AuthContext } from "../context/AuthState";
import { StudioClientContext, usePersonalLibrary } from "../lib/studioData";
import { RICH_PREFIX, cleanHTML } from "../lib/richText";
import { SaveBook } from "../components/studio/StudioPieces";
import PublicLayout, {
  PublicFooter,
  PublicState,
  SectionHeading,
} from "../components/public/PublicLayout";
import { AuthorLink, BookCover } from "../components/public/StoryBook";
import { genreLabel, worldArtwork } from "../lib/publicCatalog";
import "./ReadPage.css";

function StoryPage({ id }) {
  const supabase = useContext(StudioClientContext);
  const { user } = useContext(AuthContext);
  const library = usePersonalLibrary();
  const [libraryError, setLibraryError] = useState("");
  const [state, setState] = useState({
    novel: null,
    chapters: [],
    loading: true,
    error: false,
  });
  const [params, setParams] = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const [fontSize, setFontSize] = useState(20);
  const [night, setNight] = useState(false);
  const chapterId = params.get("chapter");
  const reduceMotion = useReducedMotion();
  const readerHeading = useRef(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const { data: novel, error } = await supabase
          .from("novels")
          .select("*, profiles:user_id (username, display_name, avatar_url)")
          .eq("id", id)
          .maybeSingle()
          .abortSignal(controller.signal);
        if (error) throw error;
        if (!novel) {
          if (active)
            setState({
              novel: null,
              chapters: [],
              loading: false,
              error: false,
            });
          return;
        }
        const { data: chapters, error: chapterError } = await supabase
          .from("chapters")
          .select("*")
          .eq("novel_id", id)
          .eq("status", "Published")
          .order("chapter_order", { ascending: true })
          .abortSignal(controller.signal);
        if (chapterError) throw chapterError;
        if (active)
          setState({
            novel,
            chapters: chapters || [],
            loading: false,
            error: false,
          });
      } catch {
        if (active)
          setState({ novel: null, chapters: [], loading: false, error: true });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, attempt, supabase]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (chapterId && !state.loading)
      readerHeading.current?.focus({ preventScroll: true });
  }, [chapterId, state.loading]);

  const { novel, chapters, loading, error } = state;
  const chapterIndex = chapters.findIndex(
    (chapter) => String(chapter.id) === chapterId,
  );
  const activeChapter = chapters[chapterIndex];
  const position = library.items.find((n) => String(n.id) === String(id));
  const resumeChapter =
    !position?.completed &&
    chapters.find((c) => String(c.id) === String(position?.chapterId));
  useEffect(() => {
    if (user && novel && activeChapter) {
      try {
        library.update(novel, {
          chapterId: activeChapter.id,
          chapterTitle: activeChapter.title,
          chapterNumber: chapterIndex + 1,
          totalChapters: chapters.length,
          completed: false,
        });
      } catch {
        setLibraryError(
          "Your reading position could not be saved in this browser.",
        );
      }
    }
  }, [user?.id, novel?.id, activeChapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const openChapter = (chapter) => setParams({ chapter: String(chapter.id) });
  const retry = () => {
    setState((value) => ({ ...value, loading: true }));
    setAttempt((value) => value + 1);
  };
  if (loading)
    return (
      <PublicLayout>
        <PublicState title="A world is opening…" loading />
      </PublicLayout>
    );
  if (error)
    return (
      <PublicLayout>
        <PublicState
          title="A pause at the threshold."
          action={
            <button className="pf-button pf-button-gold" onClick={retry}>
              Try again
              <ArrowRight size={17} />
            </button>
          }
        >
          We couldn’t load this story. Please try again in a moment.
        </PublicState>
      </PublicLayout>
    );
  if (!novel)
    return (
      <PublicLayout>
        <PublicState title="This story isn’t on the shelf.">
          It may be unpublished or no longer available. There are other worlds
          waiting to be discovered.
        </PublicState>
      </PublicLayout>
    );
  if (chapterId && !activeChapter)
    return (
      <PublicLayout>
        <PublicState
          title="This chapter isn’t available."
          action={
            <button
              className="pf-button pf-button-gold"
              onClick={() => setParams({})}
            >
              Back to the story
              <ArrowLeft size={17} />
            </button>
          }
        >
          Only published chapters can be read here. Return to the story to
          choose another.
        </PublicState>
      </PublicLayout>
    );

  if (activeChapter)
    return (
      <div className={`nf-public pf-reader ${night ? "pf-reader-night" : ""}`}>
        <a className="pf-skip" href="#reading-main">
          Skip to chapter
        </a>
        <header className="pf-reader-header">
          <Link to="/" className="pf-reader-brand" aria-label="NovelForge home">
            <Feather size={23} />
          </Link>
          <button
            className="pf-reader-return"
            aria-label="Back to story"
            onClick={() => setParams({})}
          >
            <ArrowLeft size={16} />
            <span>Back to story</span>
          </button>
          <span className="pf-reader-story-title">
            {novel.title.replaceAll("_", " ")}
          </span>
          <span className="pf-reader-count">
            {chapterIndex + 1} / {chapters.length}
          </span>
        </header>
        <div className="pf-reading-progress">
          <progress
            value={chapterIndex + 1}
            max={chapters.length}
            aria-label={`Chapter ${chapterIndex + 1} of ${chapters.length}`}
          />
        </div>
        <main className="pf-reading-canvas" id="reading-main" tabIndex={-1}>
          <div className="pf-reading-tools">
            <span>CHAPTER {String(chapterIndex + 1).padStart(2, "0")}</span>
            <div>
              <button
                onClick={() => setFontSize((value) => Math.max(17, value - 1))}
                disabled={fontSize <= 17}
                aria-label="Decrease reading text size"
              >
                A−
              </button>
              <button
                onClick={() => setFontSize((value) => Math.min(26, value + 1))}
                disabled={fontSize >= 26}
                aria-label="Increase reading text size"
              >
                A+
              </button>
              <button
                onClick={() => setNight((value) => !value)}
                aria-label={
                  night ? "Use paper reading theme" : "Use night reading theme"
                }
              >
                {night ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            </div>
          </div>
          <h1 ref={readerHeading} tabIndex={-1}>
            {activeChapter.title}
          </h1>
          <div className="pf-reading-ornament" aria-hidden="true">
            ✧
          </div>
          <div className="pf-reading-prose" style={{ fontSize }}>
            {activeChapter.content?.startsWith(RICH_PREFIX) ? (
              <div
                className="pf-rich-prose"
                dangerouslySetInnerHTML={{
                  __html: cleanHTML(
                    activeChapter.content.slice(RICH_PREFIX.length),
                  ),
                }}
              />
            ) : (
              activeChapter.content ||
              "This published chapter doesn’t contain any text yet."
            )}
          </div>
          {libraryError && <p role="alert">{libraryError}</p>}
          <nav
            className="pf-chapter-navigation"
            aria-label="Chapter navigation"
          >
            <button
              className="pf-inline-link"
              onClick={() => openChapter(chapters[chapterIndex - 1])}
              disabled={chapterIndex === 0}
            >
              <ArrowLeft size={17} />
              Previous chapter
            </button>
            {chapterIndex < chapters.length - 1 ? (
              <button
                className="pf-button pf-button-gold"
                onClick={() => openChapter(chapters[chapterIndex + 1])}
              >
                Next chapter
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                className="pf-button pf-button-gold"
                onClick={() => setParams({})}
              >
                Back to the story
                <Check size={17} />
              </button>
            )}
          </nav>
          <span className="pf-reader-endnote">
            {chapterIndex === chapters.length - 1
              ? "You’re up to date with this story."
              : "There is always another page."}
          </span>
          <div className="pf-reader-jump">
            <label htmlFor="reader-chapter">Jump to a chapter</label>
            <select
              id="reader-chapter"
              value={chapterId}
              onChange={(event) => setParams({ chapter: event.target.value })}
            >
              {chapters.map((chapter, index) => (
                <option key={chapter.id} value={chapter.id}>
                  {index + 1}. {chapter.title}
                </option>
              ))}
            </select>
          </div>
        </main>
      </div>
    );

  const artwork = worldArtwork(novel);
  return (
    <PublicLayout className="pf-story-page" tone="world" footer={false}>
      <section className="pf-story-world" aria-labelledby="story-title">
        <div className="pf-story-environment" aria-hidden="true">
          {artwork && (
            <Motion.img
              src={artwork}
              alt=""
              initial={reduceMotion ? false : { scale: 1.035, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>
        <div className="pf-container pf-story-world-inner">
          <Link className="pf-story-back" to="/explore">
            <ArrowLeft size={16} />
            Back to the bookshelf
          </Link>
          <Motion.div
            className="pf-story-entrance"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="pf-story-world-copy">
              <span className="pf-kicker">
                {genreLabel(novel.genre) || "Fiction"}
                <span className="pf-world-dot" />
                {novel.status || "Published"}
              </span>
              <h1 id="story-title">{novel.title.replaceAll("_", " ")}</h1>
              <AuthorLink novel={novel} prefix />
              <SaveBook novel={novel} />
              <p>
                {novel.description ||
                  novel.synopsis ||
                  "Every story is a doorway. Step through this one."}
              </p>
              <div className="pf-story-world-actions">
                {chapters.length > 0 ? (
                  <button
                    className="pf-button pf-button-gold"
                    onClick={() => openChapter(resumeChapter || chapters[0])}
                  >
                    {resumeChapter ? "Continue reading" : "Start reading"}
                    <BookOpen size={18} />
                  </button>
                ) : (
                  <span className="pf-chapters-coming">
                    Chapters are on their way.
                  </span>
                )}
                <a className="pf-story-chapters-link" href="#story-chapters">
                  {chapters.length} published{" "}
                  {chapters.length === 1 ? "chapter" : "chapters"}
                  <ChevronDown size={15} />
                </a>
              </div>
            </div>
            <div className="pf-world-book">
              <BookCover novel={novel} decorative eager />
              <span>Leave the ordinary behind.</span>
            </div>
          </Motion.div>
          <span className="pf-story-threshold">ONE COVER. ANOTHER WORLD.</span>
        </div>
      </section>
      <div className="pf-container pf-story-details">
        <section className="pf-story-about">
          <span className="pf-kicker">BETWEEN THESE PAGES</span>
          <h2>
            A world <em>worth knowing.</em>
          </h2>
          <p>
            {novel.synopsis ||
              novel.description ||
              "This author is keeping the premise a mystery. Open the first chapter and discover the story for yourself."}
          </p>
        </section>
        <aside className="pf-story-colophon">
          <Feather size={23} strokeWidth={1.3} />
          <dl>
            <div>
              <dt>Written by</dt>
              <dd>
                <AuthorLink novel={novel} />
              </dd>
            </div>
            <div>
              <dt>On the shelf</dt>
              <dd>{genreLabel(novel.genre) || "Fiction"}</dd>
            </div>
            <div>
              <dt>Chapters published</dt>
              <dd>{chapters.length}</dd>
            </div>
            {novel.is_mature && (
              <div>
                <dt>Content note</dt>
                <dd>Mature themes</dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
      <section
        className="pf-container pf-table-of-contents"
        id="story-chapters"
      >
        <SectionHeading
          eyebrow="THE PATH THROUGH THIS WORLD"
          title={
            <>
              A chapter at <em>a time.</em>
            </>
          }
        >
          <span className="pf-muted">{chapters.length} published</span>
        </SectionHeading>
        {chapters.length ? (
          <ol>
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <button onClick={() => openChapter(chapter)}>
                  <span className="pf-chapter-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="pf-chapter-title">{chapter.title}</span>
                  <span className="pf-chapter-length">
                    {Math.max(
                      1,
                      Math.ceil(
                        (chapter.content || "")
                          .trim()
                          .split(/\s+/)
                          .filter(Boolean).length / 200,
                      ),
                    )}{" "}
                    min read
                  </span>
                  <ArrowRight size={20} />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="pf-chapter-empty">
            <BookOpen size={26} />
            <h3>A little anticipation.</h3>
            <p>
              The author hasn’t published any chapters yet. There are other
              stories to explore while this one takes shape.
            </p>
            <Link className="pf-inline-link" to="/explore">
              Return to the bookshelf
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>
      <div className="pf-container pf-story-afterword">
        <span className="pf-kicker">THE NEXT WORLD COULD BE YOURS.</span>
        <p>
          Some stories are found.
          <br />
          <em>Some are waiting to be written.</em>
        </p>
        <Link className="pf-button pf-button-quiet" to="/write">
          Write your own beginning
          <ArrowRight size={17} />
        </Link>
      </div>
      <PublicFooter />
    </PublicLayout>
  );
}

export default function ReadPage() {
  const { id } = useParams();
  if (!id)
    return (
      <PublicLayout>
        <PublicState title="Choose a world to step into.">
          Find a story on the bookshelf, then make yourself at home between its
          pages.
        </PublicState>
      </PublicLayout>
    );
  return <StoryPage key={id} id={id} />;
}
