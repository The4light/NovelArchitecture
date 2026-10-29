import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthState";
import { StickyContext } from "../../context/StickyState";
import { StudioClientContext } from "../../lib/studioData";
import FloatingSticky from "../FloatingSticky";
import "../../pages/Workspace.css";
export default function PersistentNotes({ children }) {
  const { user } = useContext(AuthContext);
  const client = useContext(StudioClientContext);
  const [state, setState] = useState({ owner: null, records: [] });
  const [error, setError] = useState("");
  const records = state.owner === user?.id ? state.records : [];
  const upsert = useCallback(
    (note) =>
      setState((previous) => {
        const current = previous.owner === user?.id ? previous.records : [];
        return {
          owner: user?.id,
          records: [
            ...current.filter((n) => String(n.id) !== String(note.id)),
            note,
          ],
        };
      }),
    [user?.id],
  );
  useEffect(() => {
    let active = true;
    if (!user) return;
    (async () => {
      try {
        const books = await client
          .from("novels")
          .select("id")
          .eq("user_id", user.id);
        if (books.error) throw books.error;
        if (!books.data?.length) return;
        const notes = await client
          .from("codex_entries")
          .select("*")
          .in(
            "novel_id",
            books.data.map((n) => n.id),
          )
          .eq("is_floating", true);
        if (notes.error) throw notes.error;
        if (active)
          setState((previous) => ({
            owner: user.id,
            records: [
              ...(notes.data || []).filter(
                (n) =>
                  !previous.records.some((p) => String(p.id) === String(n.id)),
              ),
              ...(previous.owner === user.id ? previous.records : []),
            ],
          }));
      } catch {
        if (active)
          setError(
            "Floating notes could not be restored. They remain saved in your manuscript.",
          );
      }
    })();
    return () => {
      active = false;
    };
  }, [user, client]);
  const setRecords = (updater) =>
    setState((previous) => ({
      owner: user?.id,
      records:
        typeof updater === "function"
          ? updater(previous.owner === user?.id ? previous.records : [])
          : updater,
    }));
  const create = async (novelId) => {
    const { data, error } = await client
      .from("codex_entries")
      .insert([
        {
          novel_id: novelId,
          title: "A thought to keep",
          category: "Scratchpad",
          summary: "",
          content: "",
          is_floating: true,
          position_x: 40,
          position_y: 100,
          bg_color: "#eee6c8",
        },
      ])
      .select()
      .single();
    if (error || !data)
      setError(error?.message || "The note could not be created.");
    else upsert(data);
  };
  return (
    <StickyContext.Provider value={{ records, upsert }}>
      {children}
      {user &&
        records
          .filter((n) => n.is_floating)
          .map((note) => (
            <FloatingSticky
              key={note.id}
              note={note}
              setCodexEntries={setRecords}
              spawnNewStickyNote={() => create(note.novel_id)}
            />
          ))}
      {user && error && (
        <div className="persistent-note-error" role="alert">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}
    </StickyContext.Provider>
  );
}
