import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Feather } from "lucide-react";
import { StudioClientContext } from '../lib/studioData';
import { AuthContext } from "../context/AuthState";
import AccountProfilePage from "./AccountProfilePage";
import PublicLayout, {
  PublicState,
  SectionHeading,
} from "../components/public/PublicLayout";
import StoryBook from "../components/public/StoryBook";

function PublicAuthorProfile({ username, isCurrentUser }) {
  const supabase=useContext(StudioClientContext);
  const [state, setState] = useState({
    profile: null,
    novels: [],
    loading: true,
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle()
          .abortSignal(controller.signal);
        if (error) throw error;
        if (!profile) {
          if (active)
            setState({
              profile: null,
              novels: [],
              loading: false,
              error: false,
            });
          return;
        }
        const { data: novels, error: novelsError } = await supabase
          .from("novels")
          .select("*")
          .eq("user_id", profile.id)
          .eq("status", "Published")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);
        if (novelsError) throw novelsError;
        if (active)
          setState({
            profile,
            novels: (novels || []).map((novel) => ({
              ...novel,
              profiles: profile,
            })),
            loading: false,
            error: false,
          });
      } catch {
        if (active)
          setState({ profile: null, novels: [], loading: false, error: true });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [username, attempt, supabase]);
  const { profile, novels, loading, error } = state;
  if (loading)
    return (
      <PublicLayout>
        <PublicState title="Meeting the storyteller…" loading />
      </PublicLayout>
    );
  if (error)
    return (
      <PublicLayout>
        <PublicState
          title="The author’s page is taking a moment."
          action={
            <button
              className="pf-button pf-button-gold"
              onClick={() => {
                setState((value) => ({ ...value, loading: true }));
                setAttempt((value) => value + 1);
              }}
            >
              Try again
              <ArrowRight size={17} />
            </button>
          }
        >
          We couldn’t load this page. Please try again.
        </PublicState>
      </PublicLayout>
    );
  if (!profile)
    return (
      <PublicLayout>
        <PublicState title="This voice hasn’t found its page yet.">
          We couldn’t find @{username}. There are other storytellers waiting on
          the bookshelf.
        </PublicState>
      </PublicLayout>
    );
  return (
    <PublicLayout className="pf-author-page">
      <div className="pf-container pf-page-top">
        <Link className="pf-back-link" to="/explore">
          <ArrowLeft size={16} />
          Back to the bookshelf
        </Link>
        <header className="pf-author-header">
          <div>
            <span className="pf-kicker">
              <Feather size={14} /> THE VOICE BEHIND THE WORLDS
            </span>
            <h1>
              {profile.display_name || profile.username}
              <span className="pf-gold-dot">.</span>
            </h1>
            <span className="pf-author-handle">@{profile.username}</span>
            <p className="pf-author-bio">
              {profile.bio ||
                "This author is letting the stories speak for themselves."}
            </p>
            <div className="pf-author-facts">
              <span>
                {novels.length} published{" "}
                {novels.length === 1 ? "story" : "stories"}
              </span>
              {profile.created_at && (
                <span>
                  On NovelForge since{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            {isCurrentUser === profile.id && (
              <Link className="pf-inline-link" to="/profile">
                Edit your profile
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
          <div className="pf-author-portrait">
            <span className="pf-author-initial" aria-hidden="true">
              {(profile.display_name || profile.username).slice(0, 1)}
            </span>
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || profile.username}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="pf-author-portrait-caption">
              A world begins with a voice.
            </span>
            <span className="pf-author-star" aria-hidden="true">
              ✳
            </span>
          </div>
        </header>
        <section className="pf-author-bibliography">
          <SectionHeading
            eyebrow="THE BIBLIOGRAPHY"
            title={
              <>
                From this <em>imagination.</em>
              </>
            }
          >
            <span className="pf-muted">Published works</span>
          </SectionHeading>
          {novels.length ? (
            <div className="pf-author-works">
              {novels.map((novel, index) => (
                <StoryBook key={novel.id} novel={novel} compact={index === 0} />
              ))}
            </div>
          ) : (
            <PublicState title="A story is still taking shape.">
              There aren’t any published works here yet. Good things begin with
              a blank page.
            </PublicState>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user, loading } = useContext(AuthContext);
  if (username)
    return (
      <PublicAuthorProfile
        key={username}
        username={username}
        isCurrentUser={user?.id}
      />
    );
  if (user) return <AccountProfilePage />;
  return (
    <PublicLayout>
      <PublicState
        title={loading ? "Finding your place…" : "Every story has a voice."}
        loading={loading}
        action={
          !loading && (
            <Link className="pf-button pf-button-gold" to="/auth">
              Log in to your profile
              <ArrowRight size={17} />
            </Link>
          )
        }
      >
        {!loading &&
          "Sign in to find your author profile, or explore the voices already on NovelForge."}
      </PublicState>
    </PublicLayout>
  );
}
