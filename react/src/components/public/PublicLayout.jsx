import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Feather } from "lucide-react";
import Navbar from "../Navbar";
import "./Public.css";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthState";

export function PublicFooter() {
  return (
    <footer className="pf-footer">
      <div className="pf-container">
        <Link className="nf-brand" to="/">
          <Feather size={22} />
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
        <span>© {new Date().getFullYear()} NovelForge</span>
      </div>
    </footer>
  );
}

export default function PublicLayout({
  children,
  className = "",
  tone,
  footer = true,
}) {
  const { user } = useContext(AuthContext);
  if (user)
    return (
      <div className={`nf-public ${className}`}>
        <div id="public-main" tabIndex={-1}>
          {children}
        </div>
      </div>
    );
  return (
    <div className={`nf-public ${className}`}>
      <a className="pf-skip" href="#public-main">
        Skip to content
      </a>
      <Navbar tone={tone} />
      <main id="public-main" tabIndex={-1}>
        {children}
      </main>
      {footer && <PublicFooter />}
    </div>
  );
}

export function PublicState({
  title,
  children,
  loading = false,
  action,
  icon,
  as = "h1",
}) {
  const Title = as;
  return (
    <div
      className={`pf-state ${loading ? "pf-state-loading" : ""}`}
      role={loading ? "status" : undefined}
    >
      <span className="pf-state-symbol" aria-hidden="true">
        {icon || <BookOpen size={30} strokeWidth={1.2} />}
      </span>
      <span className="pf-kicker">NOVELFORGE</span>
      <Title>{title}</Title>
      {children && <p>{children}</p>}
      {action ||
        (!loading && (
          <Link className="pf-button pf-button-gold" to="/explore">
            Explore stories
            <ArrowRight size={17} />
          </Link>
        ))}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="pf-section-heading">
      <div>
        {eyebrow && <span className="pf-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
