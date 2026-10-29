import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Feather, ArrowRight } from "lucide-react";
import { AuthContext } from "../context/AuthState";
import { StudioClientContext } from "../lib/studioData";
import { StudioHeading, StudioError } from "../components/studio/StudioPieces";
export default function CreateStoryPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [synopsis, setSynopsis] = useState(""),
    [genre, setGenre] = useState("Fantasy"),
    [mature, setMature] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const create = async (e) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data, error } = await client
        .from("novels")
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            synopsis: synopsis.trim(),
            genre,
            is_mature: mature,
            user_id: user.id,
            status: "Draft",
          },
        ])
        .select()
        .single();
      if (error) throw error;
      if (!data) throw new Error("The manuscript could not be created.");
      navigate(`/write/edit/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="studio-page">
      <Link className="pf-back-link" to="/write">
        ← All manuscripts
      </Link>
      <StudioHeading
        eyebrow="A NEW POSSIBILITY"
        title={
          <>
            Somewhere, a world <em>begins.</em>
          </>
        }
      />
      <div className="studio-create-layout">
        <form className="studio-form" onSubmit={create}>
          {error && <StudioError>{error}</StudioError>}
          <label htmlFor="new-title">Manuscript title</label>
          <input
            required
            id="new-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A name for this new world…"
          />
          <label htmlFor="new-genre">Genre</label>
          <select
            id="new-genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            {[
              "Fantasy",
              "Sci-Fi",
              "Mystery",
              "Romance",
              "Thriller",
              "Slice of Life",
            ].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label htmlFor="new-logline">The hook</label>
          <input
            id="new-logline"
            maxLength={150}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One sentence. A whole possibility."
          />
          <label htmlFor="new-synopsis">What’s the story?</label>
          <textarea
            id="new-synopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="The world, the conflict, the person at its heart. You can change this later."
          />
          <label className="studio-mature">
            <input
              type="checkbox"
              checked={mature}
              onChange={(e) => setMature(e.target.checked)}
            />{" "}
            Contains mature themes (18+)
          </label>
          <button disabled={busy} className="pf-button pf-button-gold">
            {busy ? "Creating your desk…" : "Create manuscript"}
            <ArrowRight size={16} />
          </button>
        </form>
        <aside className="studio-create-note">
          <Feather size={32} />
          <h2>
            It doesn’t have
            <br />
            to be perfect.
            <br />
            <em>It has to begin.</em>
          </h2>
          <p>
            A private desk for your chapters, characters, lore and all the
            things you haven’t figured out yet.
          </p>
          <span>Your manuscript starts as a private draft.</span>
        </aside>
      </div>
    </div>
  );
}
