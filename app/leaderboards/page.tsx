"use client";
import { useEffect, useState } from "react";
import { Crown, RefreshCw } from "@/components/icons";
import { api } from "@/lib/store";
type Entry = { name: string; wpm: number; accuracy: number; createdAt: string };
export default function LeaderboardsPage() {
  const [duration, setDuration] = useState(15),
    [period, setPeriod] = useState("all"),
    [entries, setEntries] = useState<Entry[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setError("");
      }
    });
    api<{ entries: Entry[] }>(
      `leaderboards?duration=${duration}&period=${period}`,
    )
      .then(({ entries }) => {
        if (!cancelled) setEntries(entries);
      })
      .catch((error) => {
        if (!cancelled) setError(error.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [duration, period, refresh]);
  return (
    <div className="page-content">
      <div className="leaderboard-title">
        <Crown size={36} />
        <h1>leaderboards</h1>
      </div>
      <div className="leaderboard-controls">
        <div className="segmented">
          {[15, 60].map((n) => (
            <button
              type="button"
              key={n}
              className={duration === n ? "selected" : ""}
              onClick={() => setDuration(n)}
            >
              {n} seconds
            </button>
          ))}
        </div>
        <div className="segmented">
          {["all", "daily"].map((p) => (
            <button
              type="button"
              key={p}
              className={period === p ? "selected" : ""}
              onClick={() => setPeriod(p)}
            >
              {p === "all" ? "all time" : "daily"}
            </button>
          ))}
        </div>
        <button
          type="button"
          title="Refresh leaderboard"
          aria-label="Refresh leaderboard"
          onClick={() => setRefresh((n) => n + 1)}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>name</th>
              <th>wpm</th>
              <th>accuracy</th>
              <th>date</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              entries.map((entry, i) => (
                <tr key={entry.name}>
                  <td>
                    {i === 0 ? (
                      <Crown size={18} style={{ color: "var(--main-color)" }} />
                    ) : (
                      i + 1
                    )}
                  </td>
                  <td>{entry.name}</td>
                  <td className="speed">{Math.round(entry.wpm)}</td>
                  <td>{Math.round(entry.accuracy)}%</td>
                  <td className="muted">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {loading ? (
        <div className="empty-state">loading leaderboard...</div>
      ) : error ? (
        <div className="empty-state form-error">{error}</div>
      ) : !entries.length ? (
        <div className="empty-state">no results yet — set the first record</div>
      ) : null}
      <p className="leaderboard-note">
        english · no punctuation · no numbers
        <br />
        This project’s leaderboard starts fresh. Scores are client-reported.
      </p>
    </div>
  );
}
