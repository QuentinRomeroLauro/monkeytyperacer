"use client";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { WarmupResults } from "./warmup-results";
import { newWarmup, recordWarmup, finishWarmup, type WarmupResult } from "@/lib/warmup";
import type { RaceEdit } from "@/lib/race";
import { RaceTyping } from "./race-typing";
import { UserPlus, Keyboard } from "./icons";
import { useRaceEntry } from "./use-race-entry";
import { RaceEnterButton } from "./race-enter-button";
export function RaceHome({ warmups }: { warmups: { text: string; source: string; author?: string }[] }) {
  const entry = useRaceEntry();
  const { busy, error, enter } = entry;
  const [quoteIndex, setQuoteIndex] = useState(0), [result, setResult] = useState<WarmupResult | null>(null);
  const quote = warmups[quoteIndex % warmups.length];
  const warmup = useRef(newWarmup());
  const onWarmupEdit = useCallback((type: RaceEdit["type"], text?: string, finished?: boolean) => {
    const now = performance.now();
    warmup.current = recordWarmup(warmup.current, quote.text, type, text, now);
    if (finished) setResult(finishWarmup(warmup.current, now));
  }, [quote]);
  return (
    <div className="race-home minimal-race-home">
      <div className={`race-launch ${result ? "race-launch-finished" : ""}`}>
        {result && (
          <section className="warmup-quote-source" aria-label="Quote attribution">
            <span className="warmup-quote-label">quote from</span>
            <cite>{quote.source}</cite>
            {quote.author && <p>by {quote.author}</p>}
          </section>
        )}
        {result ? <WarmupResults result={result}/> : <RaceTyping key={quoteIndex} quote={quote.text} initial="" enabled={!busy} warmup onEdit={onWarmupEdit}/>}
        <div className="race-launch-primary">
          <RaceEnterButton entry={entry} />
          {result && <button className="warmup-repeat" onClick={() => { setQuoteIndex(i => i + 1); setResult(null); warmup.current = newWarmup(); }}>another quote</button>}
        </div>
        <div className="race-launch-options">
          <button disabled={!!busy} onClick={() => enter("create")}><UserPlus size={16}/> race a friend</button>
          <Link href="/practice"><Keyboard size={16}/> practice</Link>
        </div>
        <div className="race-launch-status" aria-live="polite">
          {error ? <span className="race-error" role="alert">{error}</span> : busy ? <span className="sr-only">{busy === "queue" ? "Finding a race" : "Creating room"}</span> : null}
        </div>
      </div>
    </div>
  );
}
