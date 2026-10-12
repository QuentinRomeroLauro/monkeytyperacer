"use client";
import { track } from "@/lib/analytics";
import { useState } from "react";
import {
  ArrowRight,
  RotateCw,
  Upload,
  Check,
  Crown,
  ChevronDown,
  ChevronUp,
} from "@/components/icons";
import Link from "next/link";
import type { TestResult } from "@/lib/config";
import { useApp } from "./context";
import { Chart } from "./chart";
import { useRaceEntry } from "./use-race-entry";
import { RaceEnterButton } from "./race-enter-button";
export { Chart } from "./chart";
export function Results({
  result: r,
  onNext,
  onRepeat,
}: {
  result: TestResult;
  onNext: () => void;
  onRepeat: () => void;
  onPractice: () => void;
}) {
  const entry = useRaceEntry();
  const { user, results } = useApp();
  const [history, setHistory] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const pb =
    !r.failed &&
    r.wpm >
      Math.max(
        0,
        ...results
          .filter(
            (x) =>
              x.id !== r.id &&
              x.mode === r.mode &&
              x.mode2 === r.mode2 &&
              x.language === r.language,
          )
          .map((x) => x.wpm),
      );
  const shareResult = async () => {
    if (sharing) return;
    setSharing(true);
    setShareMessage("");
    const text = `${Math.round(r.wpm)} wpm · ${Math.round(r.accuracy)}% accuracy · ${r.mode} ${r.mode2} · ${r.language.replaceAll("_", " ")} — monkeytyperacer.com`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Monkeytype Racer result", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareMessage("copied — ready to share");
      }
      track("practice_result_shared", { method: typeof navigator.share === "function" ? "native" : "copy" });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setShareMessage("Couldn’t share. Please try again.");
    } finally {
      setSharing(false);
    }
  };
  return (
    <section className="results" aria-label="Test results">
      <div className="results-top">
        <div className="primary-stats">
          <div className="stat">
            <div className="stat-label">
              wpm {pb && <Crown size={19} aria-label="Personal best" />}
            </div>
            <div className="stat-value">{Math.round(r.wpm)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">acc</div>
            <div className="stat-value">{Math.round(r.accuracy)}%</div>
          </div>
        </div>
        <Chart samples={r.samples} expanded />
      </div>
      <div className="secondary-stats">
        <div className="stat">
          <div className="stat-label">test type</div>
          <div className="stat-small">
            {r.mode} {r.mode2}
            <br />
            {r.language.replaceAll("_", " ")}
            {r.punctuation && (
              <>
                <br />
                punctuation
              </>
            )}
            {r.numbers && (
              <>
                <br />
                numbers
              </>
            )}
            {r.difficulty !== "normal" && (
              <>
                <br />
                {r.difficulty}
              </>
            )}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">raw</div>
          <div className="stat-number">{Math.round(r.raw)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">characters</div>
          <div
            className="stat-number chars-stat"
            title="correct / incorrect / extra / missed"
          >
            {r.correct}
            <span>
              /{r.incorrect}/{r.extra}/{r.missed}
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">consistency</div>
          <div className="stat-number">{Math.round(r.consistency)}%</div>
        </div>
        <div className="stat">
          <div className="stat-label">time</div>
          <div className="stat-number">{r.duration.toFixed(1)}s</div>
        </div>
      </div>
      {r.failed && (
        <div className="failed-test">
          test failed —{" "}
          {r.difficulty === "normal"
            ? "minimum speed or accuracy not reached"
            : `${r.difficulty} difficulty`}
        </div>
      )}
      {r.quoteSource && <div className="quote-source">{r.quoteSource}</div>}
      <div className="result-actions">
        <button
          type="button"
          className="next-test-action"
          onClick={onNext}
          aria-label="Next test"
          title="next test"
        >
          <span>next test</span>
          <ArrowRight size={20} />
        </button>
        <button
          type="button"
          onClick={onRepeat}
          aria-label="Repeat test"
          title="repeat test"
        >
          <RotateCw />
        </button>
        <button type="button" onClick={shareResult} disabled={sharing} aria-label="Share result" title="share result" className="practice-share-action">
          {shareMessage.startsWith("copied") ? <Check size={20} /> : <Upload size={20} />}<span>share</span>
        </button>
      </div>
      {shareMessage && <p className="practice-share-feedback" role="status">{shareMessage}</p>}
      <div className="race-launch-primary practice-race-entry"><RaceEnterButton entry={entry} /></div>
      {entry.error && <p className="race-error practice-entry-error" role="alert">{entry.error}</p>}
      <div className="save-hint">
        {user ? (
          "result saved to your account"
        ) : (
          <>
            <Link href="/login">sign in</Link> to save your results
          </>
        )}
      </div>
      <button
        type="button"
        className="history-toggle"
        onClick={() => setHistory(!history)}
      >
        words history{" "}
        {history ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {history && (
        <div className="words-history">
          {r.words.map((word, i) => (
            <span
              key={i}
              className={word === r.typed[i] ? "correct" : "incorrect"}
              title={`typed: ${r.typed[i] || "(skipped)"}`}
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
