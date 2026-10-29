import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthState";
import { supabase } from "./supabaseClient";

// Injectable only by the isolated QA harness; production always uses Supabase.
export const StudioClientContext = createContext(supabase);
export const titleOf = (book) =>
  (book?.title || "Untitled manuscript").replaceAll("_", " ");
export function plainText(content = "") {
  if (!content.startsWith("<!--novelforge-rich-->")) return content;
  const blocks = content.replace(
    /<\/(?:p|div|h[1-6]|li|blockquote)>|<br\s*\/?\s*>/gi,
    "\n",
  );
  const doc = new DOMParser().parseFromString(blocks, "text/html");
  return (doc.body.textContent || "").trim();
}
export const wordCount = (content) =>
  plainText(content).trim().split(/\s+/).filter(Boolean).length;
export function readWritingPosition(userId) {
  try {
    return JSON.parse(
      localStorage.getItem(`novelforge:writing:${userId}`) || "null",
    );
  } catch {
    return null;
  }
}
export function keepWritingPosition(userId, position) {
  try {
    localStorage.setItem(
      `novelforge:writing:${userId}`,
      JSON.stringify({ ...position, openedAt: new Date().toISOString() }),
    );
  } catch {
    /* Optional navigation history; chapter saving is independent. */
  }
}
export function useStudioData() {
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    novels: [],
    chapters: [],
    profile: null,
    loading: true,
    error: "",
    chapterError: "",
  });
  useEffect(() => {
    let active = true;
    if (!user) return;
    (async () => {
      try {
        const [books, person] = await Promise.all([
          client
            .from("novels")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        ]);
        if (books.error) throw books.error;
        const novels = books.data || [];
        const chapters = novels.length
          ? await client
              .from("chapters")
              .select("*")
              .in(
                "novel_id",
                novels.map((n) => n.id),
              )
              .order("chapter_order", { ascending: true })
          : { data: [] };
        if (active)
          setState({
            novels,
            chapters: chapters.data || [],
            profile: person.data,
            loading: false,
            error: person.error ? "Your profile could not be loaded." : "",
            chapterError: chapters.error
              ? "Chapter data is unavailable. Chapter and word totals are hidden."
              : "",
          });
      } catch (error) {
        if (active)
          setState({
            novels: [],
            chapters: [],
            profile: null,
            loading: false,
            error: error.message || "Your studio could not be loaded.",
            chapterError: "",
          });
      }
    })();
    return () => {
      active = false;
    };
  }, [user, client, attempt]);
  return {
    ...state,
    retry: () => {
      setState((s) => ({ ...s, loading: true }));
      setAttempt((a) => a + 1);
    },
  };
}

const libraryKey = (id) => `novelforge:library:${id}`;
export function readLibrary(id) {
  try {
    const items = JSON.parse(localStorage.getItem(libraryKey(id)) || "[]");
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}
export function usePersonalLibrary() {
  const { user } = useContext(AuthContext);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const changed = () => setRevision((r) => r + 1);
    window.addEventListener("novelforge-library", changed);
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener("novelforge-library", changed);
      window.removeEventListener("storage", changed);
    };
  }, []);
  // Revision subscribes all views to changes, including other tabs.
  const items = user && revision >= 0 ? readLibrary(user.id) : [];
  const update = (novel, changes) => {
    if (!user) return;
    const current = readLibrary(user.id);
    const previous = current.find((n) => String(n.id) === String(novel.id));
    const item = {
      ...novel,
      ...previous,
      ...changes,
      touchedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      libraryKey(user.id),
      JSON.stringify([
        item,
        ...current.filter((n) => String(n.id) !== String(novel.id)),
      ]),
    );
    window.dispatchEvent(new Event("novelforge-library"));
  };
  const remove = (id) => {
    localStorage.setItem(
      libraryKey(user.id),
      JSON.stringify(
        readLibrary(user.id).filter((n) => String(n.id) !== String(id)),
      ),
    );
    window.dispatchEvent(new Event("novelforge-library"));
  };
  return { items, update, remove };
}
