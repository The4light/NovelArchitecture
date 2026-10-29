import { useContext, useEffect, useState } from "react";
import { StudioClientContext } from './studioData';

// Same published catalogue as Home; UI filters run locally without schema changes.
export function usePublicCatalog() {
  const supabase = useContext(StudioClientContext);
  const [state, setState] = useState({
    novels: [],
    loading: true,
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const { data, error } = await supabase
          .from("novels")
          .select("*, profiles:user_id (username, display_name, avatar_url)")
          .eq("status", "Published")
          .order("created_at", { ascending: false })
          .abortSignal(controller.signal);
        if (error) throw error;
        if (active)
          setState({ novels: data || [], loading: false, error: false });
      } catch {
        if (active) setState({ novels: [], loading: false, error: true });
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt, supabase]);
  return {
    ...state,
    retry: () => {
      setState((value) => ({ ...value, loading: true, error: false }));
      setAttempt((value) => value + 1);
    },
  };
}

export function genreKey(genre = "") {
  return String(genre || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
export function genreLabel(genre = "") {
  return genreKey(genre) === "scifi" ? "Sci-Fi" : genre;
}
export function worldArtwork(novel) {
  return (
    novel.world_art_url ||
    novel.banner_url ||
    storyIllustration(novel) ||
    novel.thumbnail_url ||
    novel.cover ||
    null
  );
}
// Local, story-specific illustration. Author-supplied world art always wins.
// Further stories can opt into their own artwork without changing page layouts.
export function storyIllustration(novel) {
  return genreKey(novel.title) === "crimsonehalo"
    ? "/images/aurelius-academy.webp"
    : null;
}
export function authorName(novel) {
  return (
    novel.profiles?.display_name ||
    novel.author_name ||
    novel.author ||
    "Anonymous"
  );
}
