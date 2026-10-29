import { useState } from "react";
import { Link } from "react-router-dom";
import { useStudioData, wordCount, titleOf } from "../lib/studioData";
import {
  StudioHeading,
  StudioError,
  StudioEmpty,
} from "../components/studio/StudioPieces";

export default function StudioAnalytics() {
  const data = useStudioData();
  const [period, setPeriod] = useState("all");
  const [book, setBook] = useState("all");
  const [now] = useState(() => Date.now());
  const novels = data.novels.filter(
    (n) => book === "all" || String(n.id) === book,
  );
  const since = period === "all" ? 0 : now - Number(period) * 86400000;
  const chapters = data.chapters.filter((c) =>
    novels.some((n) => n.id === c.novel_id),
  );
  const dated = chapters.filter(
    (c) => new Date(c.created_at).getTime() >= since,
  );
  const genres = novels.reduce(
    (a, n) => ({
      ...a,
      [n.genre || "Uncategorized"]: (a[n.genre || "Uncategorized"] || 0) + 1,
    }),
    {},
  );
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 5 + i);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      count: dated.filter((c) => {
        const t = new Date(c.created_at);
        return (
          t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear()
        );
      }).length,
    };
  });
  const max = Math.max(1, ...months.map((m) => m.count));
  return (
    <div className="studio-page">
      <StudioHeading
        eyebrow="CREATIVE INTELLIGENCE"
        title={
          <>
            The shape of <em>your work.</em>
          </>
        }
      >
        <Link className="pf-inline-link" to="/write">
          Back to manuscripts ↗
        </Link>
      </StudioHeading>
      <p className="studio-intro">
        A clear view of the stories you’re building. Every number comes from
        your manuscripts and chapters.
      </p>
      {data.error && <StudioError retry={data.retry}>{data.error}</StudioError>}
      {data.chapterError && <StudioError>{data.chapterError}</StudioError>}
      <div className="studio-controls">
        <label>
          Manuscript{" "}
          <select
            aria-label="Filter analytics by manuscript"
            value={book}
            onChange={(e) => setBook(e.target.value)}
          >
            <option value="all">All manuscripts</option>
            {data.novels.map((n) => (
              <option key={n.id} value={n.id}>
                {titleOf(n)}
              </option>
            ))}
          </select>
        </label>
        <div className="studio-tabs">
          {[
            ["7", "7 days"],
            ["30", "30 days"],
            ["90", "3 months"],
            ["365", "Year"],
            ["all", "All time"],
          ].map(([v, label]) => (
            <button
              key={v}
              aria-pressed={period === v}
              onClick={() => setPeriod(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="studio-analytics-metrics">
        {[
          ["Manuscripts", novels.length, "In your selected collection"],
          [
            "Published",
            novels.filter((n) => n.status === "Published").length,
            "Currently on the bookshelf",
          ],
          [
            "Chapters",
            data.chapterError ? "—" : chapters.length,
            "Current manuscript total",
          ],
          [
            "Words",
            data.chapterError
              ? "—"
              : chapters
                  .reduce((s, c) => s + wordCount(c.content), 0)
                  .toLocaleString(),
            "Current text, not writing history",
          ],
        ].map(([label, value, note]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{data.loading ? "—" : value}</strong>
            <small>{note}</small>
          </div>
        ))}
      </div>
      <div className="studio-analytics-grid">
        <section className="studio-chart">
          <span className="pf-kicker">OUTPUT OVER TIME</span>
          <h2>Chapters begun.</h2>
          <p>
            Creation dates · last six calendar months within the selected range.
          </p>
          {data.chapterError ? (
            <p>Chapter history is unavailable.</p>
          ) : (
            <>
              <div
                className="studio-bar-chart"
                role="img"
                aria-label={months
                  .map((m) => `${m.label}: ${m.count} chapters`)
                  .join(", ")}
              >
                {months.map((m) => (
                  <div key={m.key}>
                    <strong>{m.count}</strong>
                    <span
                      style={{
                        height: `${Math.max(1, (m.count / max) * 150)}px`,
                      }}
                    />
                    <small>{m.label}</small>
                  </div>
                ))}
              </div>
              <p>
                {dated.length} chapters created in the selected period.
                Historical daily word counts are not recorded.
              </p>
            </>
          )}
        </section>
        <section className="studio-chart">
          <span className="pf-kicker">YOUR STORY LANDSCAPE</span>
          <h2>Imaginations, by genre.</h2>
          {Object.entries(genres).map(([genre, count]) => (
            <div className="studio-genre-bar" key={genre}>
              <div>
                <span>{genre}</span>
                <strong>{count}</strong>
              </div>
              <progress max={Math.max(1, novels.length)} value={count} />
            </div>
          ))}
          {!novels.length && (
            <StudioEmpty title="A landscape waiting to take shape.">
              Your manuscript genres will appear here.
            </StudioEmpty>
          )}
          <p>Genre distribution reflects the current collection.</p>
        </section>
      </div>
      <section className="studio-chart">
        <h2>The manuscript ledger.</h2>
        <div className="studio-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Manuscript</th>
                <th>Status</th>
                <th>Chapters</th>
                <th>Words</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {novels.map((n) => {
                const cs = chapters.filter((c) => c.novel_id === n.id);
                return (
                  <tr key={n.id}>
                    <td>
                      <Link to={`/write/edit/${n.id}`}>{titleOf(n)}</Link>
                    </td>
                    <td>{n.status}</td>
                    <td>{data.chapterError ? "—" : cs.length}</td>
                    <td>
                      {data.chapterError
                        ? "—"
                        : cs
                            .reduce((s, c) => s + wordCount(c.content), 0)
                            .toLocaleString()}
                    </td>
                    <td>
                      {new Date(n.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <aside className="studio-data-note">
        <strong>A note on what’s measured.</strong> Reader engagement,
        completion rates, daily writing history and publication dates aren’t
        recorded by the current data model. They are not estimated here.
      </aside>
    </div>
  );
}
