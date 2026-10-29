import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthState";
import { StudioClientContext } from "../src/lib/studioData";
import { AppExperience } from "../src/App";
import "../src/index.css";
import { coreChecks } from "./core-checks";

const user = {
  id: "qa-studio-user",
  email: "studio@example.test",
  user_metadata: { pen_name: "Alex Morgan" },
};
const date = (n) => new Date(Date.now() - n * 86400000).toISOString();
const novels = [
  {
    id: 901,
    user_id: user.id,
    title: "The Atlas of Lost Hours",
    genre: "Fantasy",
    status: "Draft",
    synopsis:
      "In a city where every clock remembers a different past, a cartographer begins mapping the hours everyone else has forgotten.",
    description:
      "Some cities are built from stone. This one is built from borrowed time.",
    created_at: date(35),
  },
  {
    id: 902,
    user_id: user.id,
    title: "Crimsone_Halo",
    genre: "Fantasy",
    status: "Published",
    synopsis: "Beyond the academy gates, a promise is waiting to be broken.",
    description: "A new world behind the gates.",
    created_at: date(82),
    author_name: "Alex Morgan",
  },
  {
    id: 903,
    user_id: user.id,
    title: "Letters from the Glass Sea",
    genre: "Mystery",
    status: "Draft",
    description: "The tide returns everything. Eventually.",
    created_at: date(5),
  },
];
const chapters = [
  {
    id: 801,
    novel_id: 901,
    title: "The hour that went missing",
    chapter_order: 1,
    content:
      "The clockmaker had been dead for seven years when his shop opened again.\n\nMira saw the light first. A narrow ribbon of gold across the rain-soaked street, where no light had fallen since the winter the city forgot.\n\nShe stopped beneath the awning and listened. Inside, a thousand clocks were ticking. None of them agreed.",
    status: "Draft",
    created_at: date(21),
  },
  {
    id: 802,
    novel_id: 901,
    title: "An inventory of impossible things",
    chapter_order: 2,
    content:
      "There were seventeen impossible things on the counter. The eighteenth was the man standing behind it.",
    status: "Draft",
    created_at: date(3),
  },
  {
    id: 803,
    novel_id: 902,
    title: "Beyond the gates",
    chapter_order: 1,
    content:
      "The gates of Aurelius opened at dawn. In the courtyard, autumn leaves gathered around the fountain.",
    status: "Published",
    created_at: date(60),
  },
  {
    id: 804,
    novel_id: 902,
    title: "The promise",
    chapter_order: 2,
    content: "A promise, once made, could become a world of its own.",
    status: "Published",
    created_at: date(55),
  },
];
const codex_entries = [
  {
    id: 701,
    novel_id: 901,
    title: "Mira Vey",
    category: "Character",
    summary: "Cartographer · reluctant keeper of lost time",
    content:
      "Mira remembers the streets before they were built. She carries a broken compass, a notebook, and a suspicion that someone has been editing her memories.",
    created_at: date(8),
  },
  {
    id: 702,
    novel_id: 901,
    title: "The city’s missing hour",
    category: "Lore",
    summary: "Every midnight, thirteen minutes disappear.",
    content:
      "No two clocks agree on which thirteen minutes. The Council insists this is normal.",
    created_at: date(9),
  },
  {
    id: 703,
    novel_id: 901,
    title: "What if the clocks are listening?",
    category: "Scratchpad",
    content:
      "The clockmaker’s shop should feel familiar to Mira. Let the reader notice before she does.\n\nA small detail: the rain falls upward at the threshold.",
    summary: "",
    is_floating: false,
    position_x: 780,
    position_y: 170,
    bg_color: "#eee6c8",
    created_at: date(2),
  },
  {
    id: 704,
    novel_id: 901,
    title: "A promise to the reader",
    category: "Scratchpad",
    content:
      "Every lost hour has a cost.\n\nDon’t explain the city too early. Let the mystery breathe.",
    summary: "",
    is_floating: false,
    position_x: 750,
    position_y: 170,
    bg_color: "#eee6c8",
    created_at: date(1),
  },
];
const profiles = [
  {
    id: user.id,
    display_name: "Alex Morgan",
    username: "alex_morgan",
    bio: "Writing about impossible places and the ordinary people who find their way into them. Usually with a cup of tea.",
    created_at: date(150),
  },
];
const db = { novels, chapters, codex_entries, profiles };
if (new URLSearchParams(location.search).has("floating"))
  codex_entries.find((n) => n.category === "Scratchpad").is_floating = true;
let failWrites = false;
let serial = 1000;
class Query {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.mode = "select";
    this.one = false;
  }
  select() {
    return this;
  }
  eq(k, v) {
    this.filters.push((row) => String(row[k]) === String(v));
    return this;
  }
  in(k, values) {
    this.filters.push((row) => values.includes(row[k]));
    return this;
  }
  order(k, { ascending } = {}) {
    this.sort = [k, ascending];
    return this;
  }
  maybeSingle() {
    this.one = true;
    return this;
  }
  single() {
    this.one = true;
    return this;
  }
  abortSignal() {
    return this;
  }
  insert(payload) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }
  update(payload) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  then(resolve, reject) {
    return new Promise((r) =>
      setTimeout(() => {
        if (this.mode !== "select" && failWrites) {
          r({
            data: null,
            error: {
              message:
                "QA simulated connection failure. Your writing is still in the recovery copy.",
            },
          });
          return;
        }
        let result = db[this.table].filter((row) =>
          this.filters.every((f) => f(row)),
        );
        if (this.mode === "insert") {
          result = this.payload.map((row) => ({
            ...row,
            id: ++serial,
            created_at: date(0),
          }));
          db[this.table].push(...result);
        }
        if (this.mode === "update") {
          result.forEach((row) => Object.assign(row, this.payload));
        }
        if (this.mode === "delete") {
          db[this.table] = db[this.table].filter(
            (row) => !result.includes(row),
          );
        }
        if (this.sort) {
          const [k, asc] = this.sort;
          result.sort(
            (a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (asc ? 1 : -1),
          );
        }
        result = result.map((row) => ({
          ...row,
          ...(this.table === "novels" ? { profiles: profiles[0] } : {}),
        }));
        r({ data: this.one ? result[0] || null : result, error: null });
      }, 120),
    ).then(resolve, reject);
  }
}
const client = {
  from: (table) => new Query(table),
  auth: { signOut: async () => ({ error: null }) },
};
export function QA() {
  const [failure, setFailure] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const params = new URLSearchParams(location.search);
  return (
    <AuthContext.Provider
      value={{ user: signedIn ? user : null, loading: false }}
    >
      <StudioClientContext.Provider value={client}>
        <MemoryRouter initialEntries={["/" + (params.get("page") || "")]}>
          <AppExperience />
        </MemoryRouter>
        <div
          style={{
            position: "fixed",
            bottom: "calc(84px + env(safe-area-inset-bottom))",
            left: 0,
            right: 0,
            zIndex: 500,
            background: "#242b21",
            color: "#f5edd6",
            font: "10px sans-serif",
            padding: "5px 12px",
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <span>
            ISOLATED QA · fictional sample records · no database writes ·{" "}
            {coreChecks.filter((c) => c.passed).length} core checks passed
          </span>
          <button
            style={{ border: "1px solid #8a926d", padding: "3px 6px" }}
            onClick={() => {
              failWrites = !failure;
              setFailure(!failure);
            }}
          >
            {failure ? "Restore connection" : "Simulate save failure"}
          </button>
          <button onClick={() => setSignedIn(!signedIn)}>
            {signedIn ? "Preview signed out" : "Preview signed in"}
          </button>
        </div>
      </StudioClientContext.Provider>
    </AuthContext.Provider>
  );
}
if (import.meta.env.DEV)
  createRoot(document.getElementById("root")).render(<QA />);
