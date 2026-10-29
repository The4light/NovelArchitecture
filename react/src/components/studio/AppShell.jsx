import { createElement, useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Feather,
  Home,
  Library,
  Compass,
  NotebookPen,
  ChartNoAxesCombined,
  UserRound,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  Plus,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../context/AuthState";
import { StudioClientContext } from "../../lib/studioData";
import "../public/Public.css";
import "./Studio.css";
const readingLinks = [
  ["/", "Home", Home],
  ["/library", "Library", Library],
  ["/explore", "Explore", Compass],
];
const bottomLinks = [
  ...readingLinks,
  ["/write", "Studio", NotebookPen],
  ["/profile", "You", UserRound],
];
export default function AppShell({ children }) {
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const location = useLocation();
  const navigate = useNavigate();
  const writer =
    location.pathname.startsWith("/write") ||
    location.pathname === "/analytics";
  const [collapsed, setCollapsed] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  const name =
    user?.user_metadata?.pen_name ||
    user?.user_metadata?.full_name ||
    "Your literary life";
  const groups = [
    ["Read", readingLinks],
    [
      "Create",
      [
        ["/write", "Writing studio", NotebookPen],
        ...(writer
          ? [["/analytics", "Writing analytics", ChartNoAxesCombined]]
          : []),
      ],
    ],
    [
      "Account",
      [
        ["/profile", "Your profile", UserRound],
        ["/settings", "Settings", Settings],
      ],
    ],
  ];
  const logout = async () => {
    const { error } = await client.auth.signOut();
    if (error) setError(error.message);
    else navigate("/");
  };
  return (
    <div
      className={`nf-app nf-public studio-home-shell ${writer ? "studio-writer-shell" : "studio-reader-shell"} ${collapsed ? "studio-collapsed" : ""}`}
    >
      <a href="#studio-main" className="pf-skip">
        Skip to content
      </a>
      <aside className="studio-sidebar" aria-label="Application sidebar">
        <Link className="studio-brand" to="/" aria-label="NovelForge home">
          <Feather size={25} />
          <span>
            NovelForge<span className="studio-gold">.</span>
          </span>
        </Link>
        <button
          className="studio-collapse"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} />
          ) : (
            <PanelLeftClose size={17} />
          )}
        </button>
        <nav aria-label="Application navigation">
          {groups.map(([label, links]) => (
            <div className="studio-nav-group" key={label}>
              <span>{label}</span>
              {links.map(([to, text, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/profile"}
                  title={text}
                >
                  {createElement(Icon, { size: 18 })}
                  <span>{text}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="studio-sidebar-bottom">
          {writer && (
            <div className="studio-desk-note">
              <Feather size={22} />
              <p>
                A little time.
                <br />
                <em>A whole new world.</em>
              </p>
              <Link to="/write/create">
                Begin a manuscript
                <Plus size={14} />
              </Link>
            </div>
          )}
          <Link className="studio-person" to="/profile">
            <span className="studio-avatar">{name.slice(0, 1)}</span>
            <span>
              {name}
              <small>
                {writer ? "Your writing studio" : "Your reading room"}
              </small>
            </span>
          </Link>
          <button className="studio-logout" onClick={logout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className="studio-frame">
        <header className="studio-topbar">
          <Link
            className="studio-mobile-brand"
            to="/"
            aria-label="NovelForge home"
          >
            <Feather size={22} />
          </Link>
          <span className="studio-breadcrumb">
            <span className="studio-mode-badge">
              {writer ? "Writing studio" : "Reading room"}
            </span>
            <span>/</span>
            {location.pathname === "/"
              ? "Home"
              : location.pathname.startsWith("/write")
                ? "Manuscripts"
                : location.pathname.split("/")[1]}
          </span>
          <div>
            <Link to="/search" aria-label="Search stories">
              <Search size={18} />
            </Link>
            {writer && (
              <Link className="studio-new-link" to="/write/create">
                <Plus size={16} />
                <span>New manuscript</span>
              </Link>
            )}
            <Link to="/profile" aria-label="Your profile">
              <span className="studio-avatar">{name.slice(0, 1)}</span>
            </Link>
          </div>
        </header>
        <main id="studio-main" tabIndex={-1}>
          {children}
        </main>
      </div>
      <nav className="studio-bottom-nav" aria-label="Mobile navigation">
        {bottomLinks.map(([to, text, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              isActive ||
              (to === "/write" && writer) ||
              (to === "/profile" && location.pathname === "/settings")
                ? "active"
                : undefined
            }
          >
            {createElement(Icon, { size: 21 })}
            <span>{text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
