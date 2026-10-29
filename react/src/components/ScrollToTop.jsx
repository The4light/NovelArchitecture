import { useEffect, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const { pathname, key, hash } = useLocation();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = previous; };
  }, []);
  useLayoutEffect(() => {
    // Keep section links working; every other navigation starts at the top.
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector(".workspace-main")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [key, hash]);
  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target =
          document.querySelector(".workspace-main") ||
          document.scrollingElement;
        setVisible((target?.scrollTop || 0) > 360);
      });
    };
    update();
    document.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  if (!visible) return null;
  return (
    <button
      className="scroll-to-top"
      aria-label="Scroll to top"
      title="Back to top"
      onClick={() => {
        const target =
          document.querySelector(".workspace-main") ||
          document.scrollingElement;
        target?.scrollTo({
          top: 0,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }}
    >
      <ArrowUp size={19} />
      <span>Top</span>
    </button>
  );
}
