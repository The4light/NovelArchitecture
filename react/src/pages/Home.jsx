import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion as Motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Feather,
  FileText,
  Layers3,
  MapPin,
  PanelLeft,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { genreKey, storyIllustration } from "../lib/publicCatalog";
import { novelsData } from "../data/novel";
import Navbar from "../components/Navbar";
import "./Home.css";

const WORDS = ["begin", "grow", "unfold", "live"];
const SAMPLE = novelsData[2];
const previewChapters = [
  "The city at the edge",
  "A name in the darkness",
  "What the river remembers",
];

function Author({ novel }) {
  const profile = novel.profiles;
  const name =
    profile?.display_name || novel.author_name || novel.author || "Anonymous";
  return profile?.username ? (
    <Link className="nf-author" to={`/profile/${profile.username}`}>
      {name}
    </Link>
  ) : (
    <span className="nf-author">{name}</span>
  );
}

function Book({ novel, className = "", decorative = false }) {
  const artwork =
    novel.thumbnail_url || novel.cover || storyIllustration(novel);
  return (
    <div
      className={`nf-book ${className}`}
      data-genre={genreKey(novel.genre)}
      aria-hidden={decorative || undefined}
    >
      {artwork && (
        <img
          src={artwork}
          alt={decorative ? "" : `Cover artwork for ${novel.title}`}
          loading={decorative ? "eager" : "lazy"}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="nf-book-type">
        <span>{novel.genre || "Fiction"}</span>
        <strong>{novel.title.replaceAll("_", " ")}</strong>
        <span>
          {novel.profiles?.display_name ||
            novel.author_name ||
            novel.author ||
            "NovelForge"}
        </span>
      </div>
      <span className="nf-book-spine" />
    </div>
  );
}

function ChangingWord() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % WORDS.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);
  return (
    <>
      <span className="nf-sr-only">begin</span>
      <Motion.span
        className="nf-changing-word"
        layout={!reduceMotion}
        transition={{ duration: 0.35 }}
        aria-hidden="true"
      >
        <span className="nf-word-dot" />
        <AnimatePresence mode="popLayout" initial={false}>
          <Motion.em
            key={WORDS[index]}
            initial={reduceMotion ? false : { opacity: 0, y: 9 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {WORDS[index]}
          </Motion.em>
        </AnimatePresence>
        <span key={index} className="nf-writing-cursor" />
      </Motion.span>
    </>
  );
}

function StudioPreview() {
  const [tab, setTab] = useState("Manuscript");
  const [chapter, setChapter] = useState(0);
  const tabs = [
    { label: "Manuscript", icon: <FileText size={16} /> },
    { label: "Characters", icon: <Users size={16} /> },
    { label: "Notes", icon: <Layers3 size={16} /> },
  ];
  return (
    <div
      className="nf-studio"
      aria-label="Illustrative writing workspace preview"
    >
      <div className="nf-studio-toolbar">
        <span>
          <Feather size={16} /> NovelForge{" "}
          <span className="nf-toolbar-divider">/</span>
          <span className="nf-preview-title">The Last Kingdom of Shadows</span>
        </span>
        <span className="nf-preview-label">Workspace preview</span>
      </div>
      <div className="nf-studio-body">
        <aside className="nf-studio-sidebar">
          <span className="nf-sidebar-label">Your story, together.</span>
          <div
            className="nf-preview-tabs"
            role="tablist"
            aria-label="Preview sections"
            onKeyDown={(event) => {
              const keys = [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
              ];
              if (!keys.includes(event.key)) return;
              event.preventDefault();
              const current = tabs.findIndex((item) => item.label === tab);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : (current +
                        (["ArrowLeft", "ArrowUp"].includes(event.key)
                          ? -1
                          : 1) +
                        tabs.length) %
                      tabs.length;
              setTab(tabs[next].label);
              event.currentTarget.querySelectorAll("[role=tab]")[next].focus();
            }}
          >
            {tabs.map(({ label, icon }) => (
              <button
                key={label}
                role="tab"
                id={`nf-tab-${label}`}
                aria-controls="nf-preview-panel"
                aria-selected={tab === label}
                tabIndex={tab === label ? 0 : -1}
                onClick={() => setTab(label)}
              >
                {icon}
                {label}
                {label === "Manuscript" && <span>3</span>}
              </button>
            ))}
          </div>
          <div className="nf-preview-chapters">
            <span className="nf-sidebar-label">Chapters</span>
            {previewChapters.map((title, i) => (
              <button
                key={title}
                className={
                  chapter === i && tab === "Manuscript" ? "is-active" : ""
                }
                onClick={() => {
                  setChapter(i);
                  setTab("Manuscript");
                }}
              >
                <span>0{i + 1}</span>
                {title}
              </button>
            ))}
          </div>
          <div className="nf-sidebar-bottom">
            <Feather size={15} />
            <span>A world of your own.</span>
          </div>
        </aside>
        <div
          className="nf-manuscript"
          role="tabpanel"
          id="nf-preview-panel"
          aria-labelledby={`nf-tab-${tab}`}
          tabIndex={0}
        >
          {tab === "Manuscript" ? (
            <>
              <div className="nf-manuscript-meta">
                <span>Chapter 0{chapter + 1}</span>
                <span>
                  <span className="nf-status-dot" /> Draft
                </span>
              </div>
              <span className="nf-manuscript-kicker">
                THE LAST KINGDOM OF SHADOWS
              </span>
              <h3>{previewChapters[chapter]}</h3>
              <p className="nf-drop-cap">
                {
                  [
                    "The city had forgotten the sound of rain. For a hundred years, its people had looked to an empty sky, collecting stories of storms the way other kingdoms collected gold.",
                    "Someone had written her name on the door. Not the name she used in the market, nor the one her mother whispered. Her real name. The one the kingdom had buried.",
                    "At dawn, the river returned something it had kept for a hundred years. A small brass key, warm as a living thing, and a promise nobody remembered making.",
                  ][chapter]
                }
              </p>
              <p>
                Beyond the last house, where the road became a path and the path
                became a question, a light was burning.
              </p>
              <p>
                She had never been this far from home.
                <br />
                She had never felt so close to it.
              </p>
              <span className="nf-preview-footnote">
                An imagined first page. Every world starts somewhere.
              </span>
            </>
          ) : tab === "Characters" ? (
            <>
              <div className="nf-manuscript-meta">
                <span>Story bible</span>
                <Users size={17} />
              </div>
              <span className="nf-manuscript-kicker">
                THE PEOPLE BEHIND THE PAGES
              </span>
              <h3>Someone worth following.</h3>
              <div className="nf-character-preview">
                <span className="nf-character-monogram">E</span>
                <div>
                  <h4>Elara</h4>
                  <span>Protagonist · Keeper of lost things</span>
                </div>
              </div>
              <p>
                She remembers what the rest of the city has forgotten. Now she
                must decide what is worth bringing back.
              </p>
              <div className="nf-character-traits">
                <span>A quiet courage</span>
                <span>A dangerous secret</span>
                <span>An unfinished promise</span>
              </div>
              <span className="nf-preview-footnote">
                Illustrative character notes
              </span>
            </>
          ) : (
            <>
              <div className="nf-manuscript-meta">
                <span>Scratchpad</span>
                <Layers3 size={17} />
              </div>
              <span className="nf-manuscript-kicker">KEEP THE SPARK</span>
              <h3>Nothing is a small idea.</h3>
              <p>
                What if the city’s missing rain is a memory, rather than a
                curse?
              </p>
              <div className="nf-note-preview">
                <span>Remember for chapter three</span>
                <p>
                  The river returns what the kingdom has forgotten. The key is
                  only the beginning.
                </p>
              </div>
              <span className="nf-preview-footnote">
                Illustrative story notes
              </span>
            </>
          )}
        </div>
        <aside className="nf-studio-codex">
          <span className="nf-sidebar-label">
            <Sparkles size={14} /> Worldbuilding
          </span>
          <div className="nf-codex-cover">
            <Book novel={SAMPLE} decorative />
          </div>
          <div className="nf-codex-note">
            <span>
              <Users size={14} /> Character
            </span>
            <strong>Elara</strong>
            <p>
              Keeper of lost things.
              <br />
              Still finding her own way.
            </p>
          </div>
          <div className="nf-codex-location">
            <MapPin size={15} />
            <div>
              <strong>The old city</strong>
              <span>A place that remembers.</span>
            </div>
          </div>
        </aside>
      </div>
      <div className="nf-studio-status">
        <span>
          <Check size={13} /> A home for every chapter, character, and
          possibility.
        </span>
        <Link to="/write">
          Make it yours <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function StoryShelf({ novels, loading, error, onRetry }) {
  return (
    <section
      className="nf-discover nf-section"
      id="discover"
      aria-labelledby="nf-discover-title"
    >
      <div className="nf-section-heading">
        <div>
          <span className="nf-eyebrow">FOR THE READER IN YOU</span>
          <h2 id="nf-discover-title">
            Find your next <em>obsession.</em>
          </h2>
        </div>
        <Link className="nf-text-link" to="/explore">
          All stories <ArrowRight size={18} />
        </Link>
      </div>
      {loading ? (
        <div className="nf-shelf-loading" role="status">
          <BookOpen size={24} />
          <p>Opening the bookshelf…</p>
        </div>
      ) : error ? (
        <div className="nf-shelf-empty" role="status">
          <BookOpen size={26} />
          <h3>The bookshelf is taking a moment.</h3>
          <p>
            We couldn’t load the stories. Your next world will be here when the
            connection returns.
          </p>
          <button className="nf-button nf-button-quiet" onClick={onRetry}>
            Try again <ArrowRight size={16} />
          </button>
        </div>
      ) : novels.length === 0 ? (
        <div className="nf-shelf-empty">
          <BookOpen size={26} />
          <h3>The first story could be yours.</h3>
          <p>A new bookshelf. Infinite possibilities.</p>
          <Link className="nf-button nf-button-quiet" to="/write">
            Start a story <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="nf-story-shelf">
          {novels.slice(0, 4).map((novel, i) => (
            <article
              className={`nf-story-item nf-story-item-${i}`}
              key={novel.id}
            >
              <Link
                className="nf-story-cover-link"
                to={`/read/${novel.id}`}
                aria-label={`Read ${novel.title}`}
              >
                <Book novel={novel} />
              </Link>
              <div className="nf-story-info">
                <span className="nf-eyebrow">{novel.genre || "Fiction"}</span>
                <h3>
                  <Link to={`/read/${novel.id}`}>{novel.title}</Link>
                </h3>
                <Author novel={novel} />
                {i === 0 && (
                  <p>
                    {novel.synopsis ||
                      novel.description ||
                      "A new world is waiting between these pages."}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="nf-genre-line">
        <span>Follow your curiosity.</span>
        {["Fantasy", "Romance", "Mystery", "Sci-Fi"].map((genre) => (
          <Link to="/explore" key={genre}>
            {genre}
            <ChevronRight size={13} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    let active = true;
    const request = new AbortController();
    const fetchLiveDirectory = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from("novels")
          .select(`*, profiles:user_id (username, display_name, avatar_url)`)
          .eq("status", "Published")
          .order("created_at", { ascending: false })
          .abortSignal(request.signal);
        if (queryError) throw queryError;
        if (active) setNovels(data || []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLiveDirectory();
    return () => {
      active = false;
      request.abort();
    };
  }, [attempt]);
  const heroBooks = novels.length
    ? [novels[0], novels[1] || novels[0]]
    : [SAMPLE, novelsData[0]];
  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { duration: 0.65 },
      };
  return (
    <div className="nf-home">
      <a className="nf-skip-link" href="#nf-main">
        Skip to content
      </a>
      <Navbar />
      <main id="nf-main">
        <section className="nf-hero" aria-labelledby="nf-hero-title">
          <div className="nf-hero-grain" aria-hidden="true" />
          <div className="nf-hero-copy">
            <span className="nf-eyebrow nf-hero-eyebrow">
              <span className="nf-asterisk">✳</span> A LITTLE WONDER. A WORLD OF
              POSSIBILITIES.
            </span>
            <h1 id="nf-hero-title">
              Where stories
              <span className="nf-heading-line">
                <ChangingWord /> &amp; worlds
              </span>
              come alive<span className="nf-gold-period">.</span>
            </h1>
            <p>
              Discover stories worth disappearing into.
              <br className="nf-desktop-break" /> Or build a world entirely your
              own.
            </p>
            <div className="nf-hero-actions">
              <Link className="nf-button nf-button-gold" to="/write">
                Start writing <ArrowRight size={17} />
              </Link>
              <Link className="nf-button nf-button-quiet" to="/explore">
                Explore stories <BookOpen size={17} />
              </Link>
            </div>
            <span className="nf-hero-caption">
              For the reader. The writer. The worldbuilder.
            </span>
          </div>
          <div className="nf-hero-objects">
            <div className="nf-hero-book-left">
              <Book novel={heroBooks[0]} decorative />
              <span className="nf-handwritten">
                a world to get lost in <span>↗</span>
              </span>
            </div>
            <div className="nf-floating-page" aria-hidden="true">
              <span>
                <Feather size={13} /> The beginning of something
              </span>
              <p>
                “What if,” she thought,
                <br />
                <em>“this is only the beginning?”</em>
              </p>
              <div />
              <div />
              <div />
            </div>
            <div className="nf-hero-book-right">
              <Book novel={heroBooks[1]} decorative />
              <span className="nf-book-tab">
                <BookOpen size={12} /> Just one more chapter.
              </span>
            </div>
            <span className="nf-hero-spark nf-spark-one" aria-hidden="true">
              ✧
            </span>
            <span className="nf-hero-spark nf-spark-two" aria-hidden="true">
              ✳
            </span>
          </div>
          <a
            href="#the-studio"
            className="nf-hero-scroll"
            aria-label="Discover the NovelForge writing studio"
          >
            <ArrowDown size={16} />
          </a>
        </section>
        <section
          className="nf-ecosystem nf-section"
          id="the-studio"
          aria-labelledby="nf-ecosystem-title"
        >
          <div className="nf-ecosystem-heading">
            <span className="nf-eyebrow">
              FROM A FLICKER OF AN IDEA TO THE FINAL FULL STOP.
            </span>
            <h2 id="nf-ecosystem-title">
              One story. <em>Every possibility.</em>
            </h2>
            <p>
              Write the chapters. Know the characters. Build the world.
              <br className="nf-desktop-break" /> Keep it all in one beautifully
              connected place.
            </p>
          </div>
          <Motion.div {...reveal} className="nf-studio-wrap">
            <StudioPreview />
            <div className="nf-floating-note" aria-hidden="true">
              <span>note to self</span>
              <p>
                Let the world be
                <br />a little bigger.
              </p>
              <span>↗</span>
            </div>
          </Motion.div>
          <div className="nf-story-journey">
            <span>
              <span>01</span> Catch the idea
            </span>
            <span className="nf-journey-dash" />
            <span>
              <span>02</span> Find the story
            </span>
            <span className="nf-journey-dash" />
            <span>
              <span>03</span> Give it a world
            </span>
          </div>
        </section>
        <StoryShelf
          novels={novels}
          loading={loading}
          error={error}
          onRetry={() => {
            setLoading(true);
            setError(false);
            setAttempt((value) => value + 1);
          }}
        />
        <section className="nf-world-section" aria-labelledby="nf-world-title">
          <div className="nf-world-inner nf-section">
            <div className="nf-world-copy">
              <span className="nf-eyebrow">
                THERE’S MORE TO A STORY THAN ITS PAGES.
              </span>
              <h2 id="nf-world-title">
                A place for the
                <br />
                entire <em>world</em>
                <br />
                behind the book.
              </h2>
              <p>
                The people with secrets. The cities with histories. The tiny
                detail that changes everything. Give every part of your
                imagination somewhere to belong.
              </p>
              <Link className="nf-text-link" to="/write">
                Meet your writing space <ArrowRight size={18} />
              </Link>
              <span className="nf-world-annotation">
                Messy ideas. Beautiful possibilities.
              </span>
            </div>
            <Motion.div
              {...reveal}
              className="nf-story-bible"
              aria-label="Illustrative arrangement of manuscript, character, location, lore, and notes"
            >
              <div className="nf-bible-manuscript">
                <span>
                  <FileText size={15} /> Manuscript <span>01 — 03</span>
                </span>
                <h3>
                  Every world starts
                  <br />
                  with <em>a word.</em>
                </h3>
                <p>
                  The city had forgotten the sound of rain. But Elara
                  remembered.
                </p>
                <div className="nf-paper-lines" />
                <span className="nf-bible-chapter">
                  Chapter 01 <ArrowRight size={14} />
                </span>
              </div>
              <div className="nf-bible-character">
                <div className="nf-character-art">
                  E<span>✧</span>
                </div>
                <span className="nf-eyebrow">CHARACTER</span>
                <h4>Elara</h4>
                <p>
                  A keeper of lost things.
                  <br />A story still unfolding.
                </p>
                <span className="nf-little-tag">Protagonist</span>
              </div>
              <div className="nf-bible-location">
                <span>
                  <MapPin size={15} /> Locations &amp; lore
                </span>
                <h4>The old city</h4>
                <p>
                  Where the river remembers
                  <br />
                  what the kingdom forgot.
                </p>
                <span className="nf-map-lines" aria-hidden="true" />
              </div>
              <div className="nf-bible-sticky">
                <span>an idea, not to be lost</span>
                <p>
                  What if the rain
                  <br />
                  is a memory?
                </p>
                <span>↗</span>
              </div>
              <span className="nf-bible-caption">
                <Plus size={14} /> All the little things that make it real.
              </span>
            </Motion.div>
          </div>
        </section>
        <section
          className="nf-workspace-feature nf-section"
          aria-labelledby="nf-workspace-title"
        >
          <div className="nf-workspace-detail">
            <div className="nf-mini-toolbar">
              <PanelLeft size={16} />
              <span>Your writing space</span>
              <span className="nf-little-tag">Draft</span>
            </div>
            <div className="nf-workspace-sheet">
              <span className="nf-eyebrow">CHAPTER ONE</span>
              <h3>
                Make room for
                <br />
                <em>the next sentence.</em>
              </h3>
              <p>
                A quiet page. A clear mind.
                <br />
                And everything you need, close at hand.
              </p>
              <span className="nf-static-cursor" />
            </div>
            <div className="nf-workspace-tools">
              <span>
                <Layers3 size={15} /> Chapters &amp; notes
              </span>
              <Link to="/write">
                Open your studio <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="nf-workspace-copy">
            <span className="nf-eyebrow">LESS FRICTION. MORE FICTION.</span>
            <h2 id="nf-workspace-title">
              Get into
              <br />
              <em>your flow.</em>
            </h2>
            <p>
              A dedicated space for the work you love. Move between chapters,
              keep your story bible nearby, and share your story when you’re
              ready.
            </p>
            <ul>
              <li>
                <Check size={16} /> Your manuscript, chapter by chapter
              </li>
              <li>
                <Check size={16} /> Characters, lore, and notes in reach
              </li>
              <li>
                <Check size={16} /> A place to write. A way to publish.
              </li>
            </ul>
            <Link className="nf-text-link" to="/write">
              Find your focus <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section
          className="nf-reading-section"
          aria-labelledby="nf-reading-title"
        >
          <div className="nf-reading-inner nf-section">
            <div className="nf-reading-intro">
              <span className="nf-eyebrow">
                AND WHEN IT’S TIME TO DISAPPEAR…
              </span>
              <h2 id="nf-reading-title">
                Just you.
                <br />
                And <em>one more chapter.</em>
              </h2>
              <p>
                Leave the noise behind. Meet a new world, find a new voice, and
                remember why you fell in love with stories.
              </p>
              <Link className="nf-text-link" to="/explore">
                Find something to get lost in <ArrowRight size={17} />
              </Link>
            </div>
            <div className="nf-reading-composition">
              <div className="nf-reading-book">
                <Book novel={heroBooks[0]} decorative />
              </div>
              <div className="nf-reader-page">
                <div className="nf-reader-top">
                  <BookOpen size={15} />
                  <span>A moment between the pages</span>
                  <span>01</span>
                </div>
                <span className="nf-quote-mark" aria-hidden="true">
                  “
                </span>
                <blockquote>
                  Beyond the last house, where the road became a path and the
                  path became a question, <em>a light was burning.</em>
                </blockquote>
                <span className="nf-reader-credit">An imagined first page</span>
                <div className="nf-reader-progress">
                  <span />
                </div>
                <span className="nf-reader-bottom">
                  The rest of the world can wait.
                </span>
              </div>
            </div>
          </div>
        </section>
        <section
          className="nf-finale nf-section"
          aria-labelledby="nf-finale-title"
        >
          <span className="nf-eyebrow">
            <Feather size={15} /> EVERY GREAT STORY STARTS SOMEWHERE.
          </span>
          <h2 id="nf-finale-title">
            There is a world
            <br />
            in your head.
            <br />
            <em>Forge it.</em>
          </h2>
          <div className="nf-hero-actions">
            <Link className="nf-button nf-button-gold" to="/write">
              Start writing <ArrowRight size={17} />
            </Link>
            <Link className="nf-button nf-button-quiet" to="/explore">
              Explore NovelForge <ArrowRight size={17} />
            </Link>
          </div>
          <span className="nf-finale-star" aria-hidden="true">
            ✳
          </span>
          <div className="nf-finale-pages" aria-hidden="true">
            <FileText size={34} />
            <span>
              Once upon
              <br />
              <em>a possibility.</em>
            </span>
          </div>
        </section>
      </main>
      <footer className="nf-footer">
        <div className="nf-footer-inner">
          <Link className="nf-brand" to="/">
            <Feather size={23} strokeWidth={1.7} />
            <span>
              NovelForge<span className="nf-brand-period">.</span>
            </span>
          </Link>
          <p>A home for stories. A space for yours.</p>
          <nav aria-label="Footer">
            <Link to="/explore">Explore</Link>
            <Link to="/write">Write</Link>
            <Link to="/library">Library</Link>
          </nav>
          <span className="nf-copyright">
            © {new Date().getFullYear()} NovelForge
          </span>
        </div>
        <div className="nf-footer-wordmark" aria-hidden="true">
          NovelForge<span>✳</span>
        </div>
      </footer>
    </div>
  );
}
