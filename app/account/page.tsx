"use client";
import { identifyAnalytics, track } from "@/lib/analytics";
import { useState } from "react";
import Link from "next/link";
import { LogOut, Download, UserRound } from "@/components/icons";
import { useApp } from "@/components/context";
import { Chart } from "@/components/results";
import { api } from "@/lib/store";
export default function AccountPage() {
  const { user, setUser, results, notify } = useApp(),
    [mode, setMode] = useState("all"),
    [deleteForm, setDeleteForm] = useState(false),
    [password, setPassword] = useState("");
  const visible = results.filter(
      (r) => !r.failed && (mode === "all" || r.mode === mode),
    ),
    best = Math.max(0, ...visible.map((r) => r.wpm));
  const average =
      visible.reduce((a, r) => a + r.wpm, 0) / (visible.length || 1),
    accuracy =
      visible.reduce((a, r) => a + r.accuracy, 0) / (visible.length || 1);
  const exportResults = () => {
    const header =
      "date,mode,length,language,wpm,raw,accuracy,consistency,duration";
    const rows = results.map((r) =>
      [
        r.createdAt,
        r.mode,
        r.mode2,
        r.language,
        r.wpm.toFixed(2),
        r.raw.toFixed(2),
        r.accuracy.toFixed(2),
        r.consistency.toFixed(2),
        r.duration.toFixed(2),
      ].join(","),
    );
    const url = URL.createObjectURL(
      new Blob([[header, ...rows].join("\n")], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "monkeytype-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page-content">
      <div className="account-heading">
        <div className="account-identity">
          <div className="avatar">
            {user ? user.name[0].toUpperCase() : <UserRound />}
          </div>
          <div>
            <h1>{user?.name ?? "local account"}</h1>
            <p>
              {user
                ? `joined ${new Date(user.createdAt).toLocaleDateString()}`
                : "your progress on this device"}
            </p>
          </div>
        </div>
        {user ? (
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              try {
                await api("auth/logout", "POST");
                track("account_signed_out");
                identifyAnalytics(null);
                setUser(null);
                notify("Signed out.");
              } catch {
                notify("Could not sign out. Try again.", true);
              }
            }}
          >
            <LogOut size={15} />
            sign out
          </button>
        ) : (
          <Link className="primary-button" href="/login">
            sign in / register
          </Link>
        )}
      </div>
      <div className="account-stats">
        <div>
          <div className="stat-label">tests completed</div>
          <div className="stat-number">
            {results.filter((r) => !r.failed).length}
          </div>
        </div>
        <div>
          <div className="stat-label">highest wpm</div>
          <div className="stat-number">{Math.round(best)}</div>
        </div>
        <div>
          <div className="stat-label">average wpm</div>
          <div className="stat-number">{Math.round(average)}</div>
        </div>
        <div>
          <div className="stat-label">average accuracy</div>
          <div className="stat-number">{Math.round(accuracy)}%</div>
        </div>
      </div>
      <div className="section-heading">
        <h2>typing progress</h2>
        <select
          aria-label="Filter results"
          style={{ width: 150 }}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          {["all", "time", "words", "quote", "zen", "custom"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      {visible.length > 1 && (
        <Chart
          compact
          samples={[...visible]
            .reverse()
            .slice(-50)
            .map((r, i) => ({
              second: i + 1,
              wpm: r.wpm,
              raw: r.raw,
              errors: r.incorrect,
            }))}
        />
      )}
      <div className="section-heading">
        <h2>result history</h2>
        <button type="button" onClick={exportResults}>
          <Download size={15} />
          export csv
        </button>
      </div>
      {visible.length ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>wpm</th>
                <th>raw</th>
                <th>accuracy</th>
                <th>consistency</th>
                <th>mode</th>
                <th>language</th>
                <th>date</th>
              </tr>
            </thead>
            <tbody>
              {visible.slice(0, 100).map((r) => (
                <tr key={r.id}>
                  <td className="speed">{Math.round(r.wpm)}</td>
                  <td>{Math.round(r.raw)}</td>
                  <td>{Math.round(r.accuracy)}%</td>
                  <td>{Math.round(r.consistency)}%</td>
                  <td>
                    {r.mode} {r.mode2}
                  </td>
                  <td>{r.language.replaceAll("_", " ")}</td>
                  <td className="muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>no results yet</p>
          <Link href="/" className="primary-button">
            take your first test
          </Link>
        </div>
      )}
      {user && (
        <div style={{ marginTop: 70 }}>
          <button
            type="button"
            onClick={() => setDeleteForm(!deleteForm)}
            className="danger-button"
          >
            delete account
          </button>
          {deleteForm && (
            <form
              className="auth-form"
              style={{ marginTop: 20 }}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api("account", "DELETE", { password });
                  track("account_deleted");
                  identifyAnalytics(null);
                  setUser(null);
                  setDeleteForm(false);
                  notify("Your account and cloud results were deleted.");
                } catch (error) {
                  notify(
                    error instanceof Error
                      ? error.message
                      : "Unable to delete account.",
                    true,
                  );
                }
              }}
            >
              <p className="form-error">
                This permanently deletes your account and cloud results. Enter
                your password to confirm.
              </p>
              <input
                aria-label="Confirm account password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit" className="danger-button">
                permanently delete my account
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
