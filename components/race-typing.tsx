"use client";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApp } from "./context";
import { useTypingCaret } from "./use-typing-caret";
import { RotateCw } from "./icons";
import { correctPrefix, editText, type RaceEdit } from "@/lib/race";
function wordRanges(quote: string) {
  const words = quote.split(" "),
    ranges = [];
  let offset = 0;
  for (const [index, text] of words.entries()) {
    const start = offset;
    offset += Array.from(text).length + (index < words.length - 1 ? 1 : 0);
    ranges.push({ text, start, end: offset });
  }
  return ranges;
}
export const RaceTyping = memo(function RaceTyping({
  quote,
  initial,
  enabled,
  onEdit,
  warmup = false,
  finished = false,
  replayId,
}: {
  warmup?: boolean;
  finished?: boolean;
  replayId?: string;
  quote: string;
  initial: string;
  enabled: boolean;
  onEdit: (type: RaceEdit["type"], text?: string, flush?: boolean) => void;
}) {
  const { config, modal } = useApp();
  const [liveTyped, setTyped] = useState(initial),
    [focused, setFocused] = useState(false),
    [draft, setDraft] = useState(initial);
  const latest = useRef(initial),
    input = useRef<HTMLTextAreaElement>(null),
    container = useRef<HTMLDivElement>(null),
    viewport = useRef<HTMLDivElement>(null),
    word = useRef<HTMLSpanElement>(null);
  const recording = useRef<{ at: number; text: string }[]>([{ at: 0, text: initial }]);
  const recordingStart = useRef<number | null>(null);
  const [replayAt, setReplayAt] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const replayPosition = useRef(0);
  const replayDuration = recording.current.at(-1)?.at ?? 0;
  const replayPoint = finished && replayAt !== null
    ? recording.current.findLast(point => point.at <= replayAt)
    : null;
  const typed = replayPoint?.text ?? liveTyped;
  useEffect(() => {
    if (!playing || !finished) return;
    let frame: number;
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = now - previous;
      previous = now;
      replayPosition.current = Math.min(replayDuration, replayPosition.current + elapsed);
      setReplayAt(replayPosition.current);
      if (replayPosition.current >= replayDuration) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, finished, replayDuration]);
  useEffect(() => {
    if (!finished || !replayId) return;
    const key = `mtr.replay:${replayId}`;
    try {
      if (recording.current.length > 1) {
        sessionStorage.setItem(key, JSON.stringify({ quote, points: recording.current }));
      } else {
        const saved = JSON.parse(sessionStorage.getItem(key) || "null");
        if (saved?.quote === quote && Array.isArray(saved.points) && saved.points.length > 1 && saved.points.length <= 10000 && saved.points.every((point: {at: number; text: string}) => Number.isFinite(point.at) && point.at >= 0 && typeof point.text === "string" && point.text.length <= quote.length + 10)) {
          recording.current = saved.points;
          setReplayAt(saved.points.at(-1).at);
        }
      }
    } catch { /* Replay remains available in memory when storage is unavailable. */ }
  }, [finished, replayId, quote]);
  const chars = Array.from(typed),
    length = chars.length;
  const ranges = wordRanges(quote);
  const activeIndex = Math.max(
    0,
    ranges.findIndex((r, i) => length < r.end || i === ranges.length - 1),
  );
  const caret = useTypingCaret({
    wordRef: word,
    containerRef: container,
    inputLength: Math.max(0, length - ranges[activeIndex].start),
    wordIndex: activeIndex,
    ready: true,
    smooth: config.smoothCaret,
    showAllLines: finished,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
  });
  useLayoutEffect(() => {
    if (!finished || !viewport.current) return;
    if (replayAt === null) {
      viewport.current.scrollTop = 0;
      return;
    }
    const active = word.current;
    if (!active) return;
    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;
    const view = viewport.current;
    if (top < view.scrollTop || bottom > view.scrollTop + view.clientHeight) {
      view.scrollTop = Math.max(0, top - active.offsetHeight);
    }
  }, [finished, replayAt, activeIndex]);
  useEffect(() => {
    if (enabled && !modal && (!warmup || window.matchMedia("(pointer: fine)").matches)) input.current?.focus({ preventScroll: true });
  }, [enabled, modal, warmup]);
  function change(type: RaceEdit["type"], text?: string) {
    if (!enabled || latest.current === quote || modal) return;
    const next = editText(latest.current, { seq: 1, type, text }, quote);
    const now = performance.now();
    recordingStart.current ??= now;
    recording.current.push({ at: Math.max(1, now - recordingStart.current), text: next });
    latest.current = next;
    setTyped(next);
    onEdit(type, text, next === quote);
  }
  function acceptValue(value: string) {
    const before=Array.from(latest.current),after=Array.from(value);
    let shared=0;
    while(shared<before.length && shared<after.length && before[shared]===after[shared])shared++;
    for(let i=before.length;i>shared;i--)change("delete");
    for(const char of after.slice(shared))change("insert",char);
    setDraft(latest.current);
  }
  const done = typed === quote;
  const needsFocus = enabled && !focused && !done;
  return (
    <div className={`race-type-area ${enabled || finished || done ? "" : "race-type-inactive"}`}>
      <div
        ref={viewport}
        className={`words-viewport ${finished ? "race-quote-scroll" : ""} ${needsFocus ? "unfocused" : ""}`}
        role={finished ? "region" : undefined}
        aria-label={finished ? "Finished quote" : undefined}
        tabIndex={finished ? 0 : undefined}
        onWheel={() => { if (finished) setPlaying(false); }}
        onTouchStart={() => { if (finished) setPlaying(false); }}
        onKeyDown={event => {
          if (!finished) return;
          setPlaying(false);
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            event.currentTarget.scrollTop = event.key === "Home" ? 0 : event.currentTarget.scrollHeight;
          }
        }}
        style={{ height: config.fontSize * 4.875 }}
        onClick={() => { if (!finished) input.current?.focus(); }}
      >
        <textarea
          ref={input}
          hidden={finished}
          className="typing-input"
          aria-label={warmup ? "Type the quote" : "Type the race quote"}
          value={draft}
          disabled={!enabled || done}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            if (!(e.nativeEvent as InputEvent).isComposing)acceptValue(e.target.value);
          }}
          onCompositionEnd={(e) => acceptValue(e.currentTarget.value)}
        />
        <div ref={container} className="words-container">
          {ranges.map(({ text, start }, index) => (
            <span
              key={index}
              ref={index === activeIndex ? word : undefined}
              className={`word ${index === activeIndex ? "active-word" : ""}`}
            >
              {Array.from(text).map((char, i) => (
                <span
                  key={i}
                  className={
                    start + i < length
                      ? chars[start + i] === char
                        ? "correct"
                        : "incorrect"
                      : ""
                  }
                >
                  {char}
                </span>
              ))}
              <span
                className={
                  start + Array.from(text).length < length &&
                  chars[start + Array.from(text).length] !== " " &&
                  index < ranges.length - 1
                    ? "incorrect race-space-error"
                    : "word-end"
                }
              >
                &#8203;
              </span>
            </span>
          ))}
          {(
            <div
              ref={caret}
              style={{ visibility: done ? "hidden" : "visible" }}
              className={`caret ${config.caretStyle} ${enabled ? "" : "blink"}`}
            />
          )}
        </div>
        {needsFocus && (
          <button
            className="focus-warning"
            onClick={() => { if (!finished) input.current?.focus(); }}
          >
            click here to focus
          </button>
        )}
      </div>
      {finished && recording.current.length > 1 ? (
        <div className="race-replay-controls" aria-label="Your typing replay">
          <button onClick={() => { if (playing) setPlaying(false); else { if (replayAt === null || replayAt >= replayDuration) { replayPosition.current = 0; setReplayAt(0); } setPlaying(true); } }}><RotateCw size={16}/>{playing ? "pause replay" : "replay"}</button>
          <input aria-label="Replay position" type="range" min={0} max={replayDuration} step={1} value={replayAt ?? replayDuration} onChange={event => { setPlaying(false); replayPosition.current = Number(event.target.value); setReplayAt(replayPosition.current); }}/>
          <span>{((replayAt ?? replayDuration) / 1000).toFixed(1)}s</span>
        </div>
      ) : <div className="race-typing-hint" aria-live="polite">
        {finished ? "" : done
          ? (warmup ? "quote complete" : "")
          : correctPrefix(typed, quote) < length
            ? "backspace to fix this word before moving on"
            : enabled
              ? (warmup ? "" : "type the quote · correct mistakes to move forward")
              : "get ready — everyone starts together"}
      </div>}
    </div>
  );
});
