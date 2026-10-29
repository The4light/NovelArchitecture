import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Feather,
} from "lucide-react";
import { authService } from "../services/auth.service";
import { supabase } from "../lib/supabaseClient";
import { AuthContext } from "../context/AuthState";
import "../components/public/Public.css";
import "./AuthPage.css";

export default function AuthPage() {
  const [params, setParams] = useSearchParams();
  const isLogin = params.get("mode") !== "signup";
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notification, setNotification] = useState(() =>
    params.get("error") === "callback"
      ? {
          type: "error",
          message:
            "Your sign-in didn’t finish. Please try again with email or Google.",
        }
      : null,
  );
  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);
  const switchMode = (login) => {
    if (loading || googleLoading) return;
    setParams(login ? {} : { mode: "signup" }, { replace: true });
    setNotification(null);
    setPassword("");
    setShowPassword(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (loading || googleLoading) return;
    setLoading(true);
    setNotification(null);
    try {
      if (isLogin) {
        await authService.login(email.trim(), password);
        navigate("/");
      } else {
        await authService.signup(email.trim(), password, penName.trim());
        setNotification({
          type: "success",
          message:
            "Your account is ready for its first chapter. Check your email for a verification link, then log in.",
        });
        setParams({}, { replace: true });
        setPassword("");
        setPenName("");
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  const googleSignIn = async () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    setNotification(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setNotification({
        type: "error",
        message:
          error.message || "Google sign-in couldn’t start. Please try again.",
      });
      setGoogleLoading(false);
    }
  };
  const busy = loading || googleLoading;
  return (
    <div className="nf-public pf-auth-page">
      <a className="pf-skip" href="#auth-form">
        Skip to sign in
      </a>
      <div className="pf-auth-scene">
        <div className="pf-auth-art" aria-hidden="true">
          <img
            src="/images/novelforge-portal.webp"
            alt=""
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
        <header className="pf-auth-top">
          <Link className="nf-brand" to="/" aria-label="NovelForge home">
            <Feather size={25} strokeWidth={1.6} />
            <span>
              NovelForge<span className="nf-brand-period">.</span>
            </span>
          </Link>
          <Link className="pf-auth-back" to="/explore">
            <ArrowLeft size={15} />
            Back to the stories
          </Link>
        </header>
        <div className="pf-auth-scene-copy">
          <span className="pf-kicker">THE ORDINARY ENDS HERE.</span>
          <h2>
            Somewhere,
            <br />a world is
            <br />
            <em>waiting for you.</em>
          </h2>
          <p>
            Read a little further.
            <br />
            Dream a little bigger.
          </p>
          <span className="pf-auth-scene-caption">
            A home for stories. A space for yours.
          </span>
        </div>
        <main className="pf-auth-panel" id="auth-form">
          <span className="pf-auth-small-mark">
            <Feather size={24} strokeWidth={1.3} />
          </span>
          <div className="pf-auth-mode" aria-label="Authentication mode">
            <button
              type="button"
              aria-pressed={isLogin}
              disabled={busy}
              onClick={() => switchMode(true)}
            >
              Log in
            </button>
            <button
              type="button"
              aria-pressed={!isLogin}
              disabled={busy}
              onClick={() => switchMode(false)}
            >
              Create account
            </button>
          </div>
          <h1>
            {isLogin ? (
              <>
                Welcome <em>back.</em>
              </>
            ) : (
              <>
                Your next
                <br />
                <em>beginning.</em>
              </>
            )}
          </h1>
          <p className="pf-auth-intro">
            {isLogin
              ? "Your worlds are waiting."
              : "Every world starts somewhere. Create yours."}
          </p>
          {notification && (
            <div
              className={`pf-auth-message pf-auth-message-${notification.type}`}
              role={notification.type === "error" ? "alert" : "status"}
            >
              {notification.type === "success" && <Check size={17} />}
              <p>{notification.message}</p>
            </div>
          )}
          <form onSubmit={submit} aria-busy={busy}>
            {!isLogin && (
              <div className="pf-auth-field">
                <label htmlFor="pen-name">Pen name</label>
                <input
                  id="pen-name"
                  name="penName"
                  autoComplete="nickname"
                  value={penName}
                  onChange={(event) => setPenName(event.target.value)}
                  placeholder="The name on your next chapter"
                  required
                  disabled={busy}
                />
              </div>
            )}
            <div className="pf-auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                disabled={busy}
              />
            </div>
            <div className="pf-auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="pf-password-wrap">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isLogin ? "Your password" : "At least 6 characters"
                  }
                  minLength={isLogin ? undefined : 6}
                  required
                  disabled={busy}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              className="pf-button pf-button-gold pf-auth-submit"
              type="submit"
              disabled={busy}
            >
              {loading
                ? "Opening your world…"
                : isLogin
                  ? "Enter NovelForge"
                  : "Create your account"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="pf-auth-divider">
            <span />
            or continue with
            <span />
          </div>
          <button
            className="pf-google-button"
            type="button"
            onClick={googleSignIn}
            disabled={busy}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? "Connecting to Google…" : "Continue with Google"}
          </button>
          <p className="pf-auth-switch">
            {isLogin ? "New to NovelForge?" : "Already have a world here?"}
            <button
              type="button"
              onClick={() => switchMode(!isLogin)}
              disabled={busy}
            >
              {isLogin ? "Create an account" : "Log in"}
              <ArrowRight size={13} />
            </button>
          </p>
          <Link className="pf-auth-explore" to="/explore">
            Just here to read? Explore the stories.
          </Link>
        </main>
      </div>
      <div className="pf-auth-bottom">
        <span>© {new Date().getFullYear()} NovelForge</span>
        <span>For the reader. The writer. The worldbuilder.</span>
      </div>
    </div>
  );
}
