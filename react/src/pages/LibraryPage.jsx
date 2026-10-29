import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, BookOpen } from "lucide-react";
import { AuthContext } from "../context/AuthState";
import AccountLibraryPage from "./AccountLibraryPage";
import PublicLayout, { PublicState } from "../components/public/PublicLayout";
import { BookCover } from "../components/public/StoryBook";
import { novelsData } from "../data/novel";

export default function LibraryPage() {
  const { user, loading } = useContext(AuthContext);
  if (user) return <AccountLibraryPage />;
  return (
    <PublicLayout className="pf-library-page">
      {loading ? (
        <PublicState title="Opening your next chapter…" loading />
      ) : (
        <div className="pf-container pf-library-entry">
          <div>
            <span className="pf-kicker">
              <Bookmark size={14} /> YOUR LITTLE CORNER OF NOVELFORGE
            </span>
            <h1>
              Some worlds
              <br />
              are worth
              <br />
              <em>keeping close.</em>
            </h1>
            <p>
              Sign in to enter your library. Until then, there’s a whole
              bookshelf of published stories to explore.
            </p>
            <div className="pf-entry-actions">
              <Link className="pf-button pf-button-gold" to="/auth">
                Log in to NovelForge
                <ArrowRight size={17} />
              </Link>
              <Link className="pf-inline-link" to="/explore">
                Explore stories
                <BookOpen size={17} />
              </Link>
            </div>
            <span className="pf-library-note">
              Your next favourite might be waiting just beyond the cover.
            </span>
          </div>
          <div className="pf-library-books" aria-hidden="true">
            {[novelsData[2], novelsData[0], novelsData[5]].map((novel) => (
              <div key={novel.id}>
                <BookCover novel={novel} decorative eager />
              </div>
            ))}
            <span>
              There’s always room
              <br />
              for <em>one more story.</em>
            </span>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
