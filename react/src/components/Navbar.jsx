import { useContext, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Feather,
  Menu,
  Search,
  UserRound,
  X,
  Home,
  Library,
  Compass,
  NotebookPen,
} from "lucide-react";
import { AuthContext } from "../context/AuthState";
import { supabase } from "../lib/supabaseClient";
import "./Navbar.css";

export default function Navbar({ tone }) {
  const [openAt, setOpenAt] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const menuButton = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const mobileOpen = openAt === location.pathname;
  const closeMenu = () => setOpenAt(null);
  const links = [
    { name: "Explore", path: "/explore" },
    { name: "Write", path: "/write" },
    { name: "Library", path: "/library" },
  ];
  const logout = async () => {
    setSigningOut(true);
    setLogoutError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      closeMenu();
      navigate("/");
    } catch {
      setLogoutError("Couldn’t log out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };
  if (user) return null;
  return (
    <>
      <header
        className={`nf-navigation${tone === "world" ? " nf-navigation-world" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenu();
            menuButton.current?.focus();
          }
        }}
      >
        <div className="nf-nav-inner">
          <Link
            to="/"
            className="nf-brand"
            aria-label="NovelForge home"
            onClick={closeMenu}
          >
            <Feather size={24} strokeWidth={1.7} />
            <span>
              NovelForge<span className="nf-brand-period">.</span>
            </span>
          </Link>
          <nav className="nf-desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                aria-current={
                  location.pathname.startsWith(link.path) ? "page" : undefined
                }
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="nf-nav-actions">
            <Link
              to="/search"
              className="nf-nav-icon nf-desktop-action"
              aria-label="Search stories"
            >
              <Search size={18} />
            </Link>
            {user ? (
              <>
                <Link
                  className="nf-nav-icon nf-desktop-action"
                  to="/profile"
                  aria-label="Your profile"
                >
                  <UserRound size={18} />
                </Link>
                <button
                  className="nf-nav-login nf-desktop-action"
                  onClick={logout}
                  disabled={signingOut}
                >
                  {signingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <Link to="/auth" className="nf-nav-login nf-desktop-action">
                Log in
              </Link>
            )}
            <Link className="nf-nav-cta" to="/write" onClick={closeMenu}>
              {user ? "Your studio" : "Start writing"}
              <ArrowRight size={15} />
            </Link>
            <button
              ref={menuButton}
              className="nf-menu-button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="nf-mobile-menu"
              onClick={() => setOpenAt(mobileOpen ? null : location.pathname)}
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav
            className="nf-mobile-menu"
            id="nf-mobile-menu"
            aria-label="Mobile navigation"
          >
            <Link to="/" onClick={closeMenu}>
              Home
              <ArrowRight size={17} />
            </Link>
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                aria-current={
                  location.pathname.startsWith(link.path) ? "page" : undefined
                }
              >
                {link.name}
                <ArrowRight size={17} />
              </Link>
            ))}
            <Link to="/search" onClick={closeMenu}>
              Search stories
              <Search size={17} />
            </Link>
            <div className="nf-mobile-auth">
              {user ? (
                <>
                  <Link to="/profile" onClick={closeMenu}>
                    Your profile
                  </Link>
                  <button onClick={logout} disabled={signingOut}>
                    {signingOut ? "Logging out…" : "Log out"}
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={closeMenu}>
                  Log in / Sign up
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </nav>
        )}
        {logoutError && (
          <p className="nf-nav-error" role="alert">
            {logoutError}
          </p>
        )}
      </header>
      <nav className="public-bottom-nav" aria-label="Mobile navigation">
        <Link
          to="/"
          aria-current={location.pathname === "/" ? "page" : undefined}
        >
          <Home size={21} />
          <span>Home</span>
        </Link>
        <Link
          to="/library"
          aria-current={location.pathname === "/library" ? "page" : undefined}
        >
          <Library size={21} />
          <span>Library</span>
        </Link>
        <Link
          to="/explore"
          aria-current={location.pathname === "/explore" ? "page" : undefined}
        >
          <Compass size={21} />
          <span>Explore</span>
        </Link>
        <Link
          to="/write"
          aria-current={
            location.pathname.startsWith("/write") ? "page" : undefined
          }
        >
          <NotebookPen size={21} />
          <span>Write</span>
        </Link>
        <Link to="/auth">
          <UserRound size={21} />
          <span>Log in</span>
        </Link>
      </nav>
    </>
  );
}
