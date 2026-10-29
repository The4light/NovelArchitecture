import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudioClientContext } from "../lib/studioData";
import { AuthContext } from "../context/AuthState";
import { StudioHeading } from "../components/studio/StudioPieces";
export default function StudioSettings() {
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="studio-page">
      <StudioHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title={
          <>
            A space that <em>feels like you.</em>
          </>
        }
      />
      <section className="studio-chart studio-form">
        <h2>Your account</h2>
        <p>Signed in as {user?.email}</p>
        <Link className="pf-inline-link" to="/profile">
          Edit your literary profile →
        </Link>
        <h2 style={{ marginTop: 35 }}>This browser</h2>
        <p>
          Your library is stored locally for this account. Signing out leaves it
          here for your next visit.
        </p>
        <label>
          <input
            type="checkbox"
            defaultChecked={localStorage.getItem("novelforge:focus") === "true"}
            onChange={(e) => {
              localStorage.setItem(
                "novelforge:focus",
                String(e.target.checked),
              );
              setSaved(true);
            }}
          />{" "}
          Open the writing editor in Focus Mode
        </label>
        {saved && <p role="status">Preference saved in this browser.</p>}
        <p>Motion follows your device’s reduced motion setting.</p>
        <button
          className="pf-button pf-button-quiet"
          onClick={async () => {
            const { error } = await client.auth.signOut();
            if (error) setError(error.message);
            else navigate("/auth");
          }}
        >
          Log out
        </button>
        {error && <p role="alert">{error}</p>}
      </section>
    </div>
  );
}
