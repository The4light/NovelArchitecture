import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { Feather } from "lucide-react";
import "../components/public/Public.css";
import "./AuthPage.css";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let handled = false;
    let subscription;

    const finish = (session) => {
      if (handled) return;
      handled = true;
      subscription?.unsubscribe();
      navigate(session ? "/" : "/auth?error=callback", { replace: true });
    };

    // Listen for the real event Supabase fires once it finishes
    // exchanging the code/token from the URL.
    const listener = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        finish(session);
      }
    });
    subscription = listener.data.subscription;

    // Also check immediately in case the session was already
    // resolved before this component mounted.
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) finish(session);
      })
      .catch(() => finish(null));

    // Only give up after a real timeout — not on INITIAL_SESSION.
    const timeout = setTimeout(() => finish(null), 6000);

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="nf-public pf-auth-page">
      <div className="pf-auth-scene">
        <div className="pf-auth-art" aria-hidden="true">
          <img src="/images/novelforge-portal.webp" alt="" />
        </div>
        <header className="pf-auth-top">
          <Link className="nf-brand" to="/" aria-label="NovelForge home">
            <Feather size={24} />
            <span>NovelForge.</span>
          </Link>
        </header>
        <div className="pf-auth-scene-copy">
          <span className="pf-kicker">YOUR NEXT CHAPTER</span>
          <h2>
            A world
            <br />
            <em>of your own.</em>
          </h2>
        </div>
        <main className="pf-auth-panel">
          <span className="pf-auth-small-mark">
            <Feather size={25} />
          </span>
          <h1>
            Opening
            <br />
            <em>your world.</em>
          </h1>
          <p className="pf-auth-intro" role="status">
            Confirming your sign-in. We’ll take you to your writing space in a
            moment.
          </p>
          <Link className="pf-inline-link" to="/auth">
            Return to log in
          </Link>
        </main>
      </div>
    </div>
  );
};

export default AuthCallback;
