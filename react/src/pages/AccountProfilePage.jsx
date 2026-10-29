import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthState";
import {
  StudioClientContext,
  useStudioData,
  usePersonalLibrary,
} from "../lib/studioData";
import {
  StudioHeading,
  StudioSection,
  StudioEmpty,
  StudioError,
  SmallBook,
} from "../components/studio/StudioPieces";
export default function AccountProfilePage() {
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const data = useStudioData();
  const { items } = usePersonalLibrary();
  const [editing, setEditing] = useState(false),
    [name, setName] = useState(""),
    [bio, setBio] = useState(""),
    [avatar, setAvatar] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const profile = data.profile;
  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", "Novel_Dive");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dl4b62svx/image/upload",
        { method: "POST", body: form },
      );
      const image = await response.json();
      if (!response.ok || !image.secure_url)
        throw new Error("Your portrait could not be uploaded.");
      setAvatar(image.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const edit = () => {
    setName(profile?.display_name || "");
    setBio(profile?.bio || "");
    setAvatar(profile?.avatar_url || "");
    setEditing(true);
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data: row, error } = await client
        .from("profiles")
        .update({ display_name: name.trim(), bio, avatar_url: avatar })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      if (!row) throw new Error("Your profile was not updated.");
      setEditing(false);
      data.retry();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="studio-page">
      <div className="studio-account-links">
        <Link to="/settings">Settings</Link>
        <Link to="/write">Writing studio</Link>
      </div>
      <StudioHeading
        eyebrow="READER. WRITER. WORLD BUILDER."
        title={
          <>
            Your literary <em>identity.</em>
          </>
        }
      >
        {profile && (
          <button className="pf-button pf-button-quiet" onClick={edit}>
            Edit profile
          </button>
        )}
      </StudioHeading>
      {data.loading ? (
        <p role="status">Opening your profile…</p>
      ) : (
        <>
          <div className="studio-profile-identity">
            <div>
              <span className="pf-kicker">
                {profile?.username
                  ? `@${profile.username}`
                  : "YOUR NOVELFORGE PROFILE"}
              </span>
              <h2>
                {profile?.display_name ||
                  user.user_metadata?.pen_name ||
                  "A storyteller"}
              </h2>
              <p>
                {profile?.bio ||
                  "Let your stories introduce you. Add a bio to tell readers a little about the voice behind them."}
              </p>
              <p>
                {data.novels.filter((n) => n.status === "Published").length}{" "}
                published stories · {data.novels.length} manuscripts
              </p>
              {profile?.username && (
                <Link
                  className="pf-inline-link"
                  to={`/profile/${profile.username}`}
                >
                  View your public author page ↗
                </Link>
              )}
            </div>
            <div className="studio-profile-portrait">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Your profile portrait" />
              ) : (
                (profile?.display_name || "N").slice(0, 1)
              )}
            </div>
          </div>
          {(error || data.error) && (
            <StudioError retry={data.retry}>{error || data.error}</StudioError>
          )}
          {editing && (
            <form className="studio-form" onSubmit={save}>
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label htmlFor="profile-bio">Author bio</label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <label htmlFor="profile-avatar">Portrait image URL</label>
              <label htmlFor="profile-upload">Or upload a portrait</label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={uploadAvatar}
              />
              <input
                id="profile-avatar"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
              <div>
                <button className="pf-button pf-button-gold" disabled={busy}>
                  {busy ? "Saving…" : "Save profile"}
                </button>
                <button
                  type="button"
                  className="pf-button pf-button-quiet"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <StudioSection title="The published bookshelf">
            {data.novels.some((n) => n.status === "Published") ? (
              <div className="studio-discovery">
                {data.novels
                  .filter((n) => n.status === "Published")
                  .map((n) => (
                    <SmallBook
                      key={n.id}
                      book={{ ...n, author_name: profile?.display_name }}
                    />
                  ))}
              </div>
            ) : (
              <StudioEmpty
                title="A voice still finding its pages."
                to="/write"
                action="Visit your manuscripts"
              >
                Your published stories will appear here for readers to discover.
              </StudioEmpty>
            )}
          </StudioSection>
          <StudioSection title="Behind the scenes · only you">
            {data.novels.some((n) => n.status !== "Published") ? (
              <div className="studio-mini-shelf">
                {data.novels
                  .filter((n) => n.status !== "Published")
                  .map((n) => (
                    <SmallBook key={n.id} book={n} writing />
                  ))}
              </div>
            ) : (
              <p className="studio-local-notice">
                Your private drafts will appear here. They never appear on your
                public author page.
              </p>
            )}
          </StudioSection>
          <StudioSection
            title="The reader in you"
            to="/library"
            action="Your private library"
          >
            {items.length ? (
              <div className="studio-mini-shelf">
                {items.slice(0, 3).map((n) => (
                  <SmallBook key={n.id} book={n} />
                ))}
              </div>
            ) : (
              <p className="studio-local-notice">
                Save a story or open a chapter to build your personal shelf.
                Your reading shelf is private to this browser.
              </p>
            )}
          </StudioSection>
        </>
      )}
    </div>
  );
}
