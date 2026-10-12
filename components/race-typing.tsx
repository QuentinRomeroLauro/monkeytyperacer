"use client";
import { memo, useEffect, useRef, useState } from "react";
import { useApp } from "./context";
import { useTypingCaret } from "./use-typing-caret";
import { Check } from "./icons";
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
}: {
  warmup?: boolean;
  quote: string;
  initial: string;
  enabled: boolean;
  onEdit: (type: RaceEdit["type"], text?: string, flush?: boolean) => void;
}) {
  const { config, modal } = useApp();
  const [typed, setTyped] = useState(initial),
    [focused, setFocused] = useState(false),
    [draft, setDraft] = useState(initial);
  const latest = useRef(initial),
    input = useRef<HTMLTextAreaElement>(null),
    container = useRef<HTMLDivElement>(null),
    word = useRef<HTMLSpanElement>(null);
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
    showAllLines: false,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
  });
  useEffect(() => {
    if (enabled && !modal && (!warmup || window.matchMedia("(pointer: fine)").matches)) input.current?.focus({ preventScroll: true });
  }, [enabled, modal, warmup]);
  function change(type: RaceEdit["type"], text?: string) {
    if (!enabled || latest.current === quote || modal) return;
    const next = editText(latest.current, { seq: 1, type, text }, quote);
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
    <div className={`race-type-area ${enabled ? "" : "race-type-inactive"}`}>
      {done && !warmup ? (
        <div className="race-finish-pending" role="status">
          <Check size={34} />
          <strong>quote complete!</strong>
          <span>confirming your finish…</span>
        </div>
      ) : <div
        className={`words-viewport ${needsFocus ? "unfocused" : ""}`}
        style={{ height: config.fontSize * 4.875 }}
        onClick={() => input.current?.focus()}
      >
        <textarea
          ref={input}
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
          {!done && (
            <div
              ref={caret}
              className={`caret ${config.caretStyle} ${enabled ? "" : "blink"}`}
            />
          )}
        </div>
        {needsFocus && (
          <button
            className="focus-warning"
            onClick={() => input.current?.focus()}
          >
            click here to focus
          </button>
        )}
      </div>}
      <div className="race-typing-hint" aria-live="polite">
        {done
          ? (warmup ? "quote complete" : "")
          : correctPrefix(typed, quote) < length
            ? "backspace to fix this word before moving on"
            : enabled
              ? (warmup ? "" : "type the quote · correct mistakes to move forward")
              : "get ready — everyone starts together"}
      </div>
    </div>
  );
});
