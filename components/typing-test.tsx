"use client";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  AtSign,
  Hash,
  Clock3,
  Type,
  Quote,
  Mountain,
  Wrench,
  SlidersHorizontal,
  Globe,
  RotateCw,
  Volume2,
  LockKeyhole,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "@/components/icons";
import { useApp } from "./context";
import type { Mode, TestResult } from "@/lib/config";
import {
  generateWords,
  newSession,
  typeInput,
  commitWord,
  previousWord,
  tick,
  metrics,
  resultFrom,
  type Session,
} from "@/lib/engine";
import { Results } from "./results";
import { useTypingCaret } from "./use-typing-caret";
const modeItems = [
  { mode: "time", Icon: Clock3 },
  { mode: "words", Icon: Type },
  { mode: "quote", Icon: Quote },
  { mode: "zen", Icon: Mountain },
  { mode: "custom", Icon: Wrench },
] as const;
export function TypingTest() {
  const { config, setConfig, setModal, active } = useApp();
  const [restart, setRestart] = useState(0),
    [repeat, setRepeat] = useState<{ words: string[]; source?: string } | null>(
      null,
    );
  const [result, setResult] = useState<TestResult | null>(null);
  const reset = useCallback(() => {
    setResult(null);
    setRepeat(null);
    setRestart((n) => n + 1);
  }, []);
  const signature = JSON.stringify([
    config.mode,
    config.time,
    config.words,
    config.quoteLength,
    config.language,
    config.numbers,
    config.punctuation,
    config.customText,
    config.customRandom,
    config.customWordCount,
  ]);
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current !== signature) {
      lastSignature.current = signature;
      queueMicrotask(reset);
    }
  }, [signature, reset]);
  const startAgain = (words?: string[], source?: string) => {
    setResult(null);
    setRepeat(words ? { words, source } : null);
    setRestart((n) => n + 1);
  };
  return (
    <div className={`test-page ${active ? "in-progress" : ""}`}>
      {!result && (
        <div className="test-config" aria-label="Test configuration">
          <div className="config-group toggles">
            {[
              { key: "punctuation", Icon: AtSign },
              { key: "numbers", Icon: Hash },
            ].map(({ key, Icon }) => (
              <button
                type="button"
                key={key}
                className={
                  config[key as "punctuation" | "numbers"] ? "selected" : ""
                }
                onClick={() =>
                  setConfig({
                    [key]: !config[key as "punctuation" | "numbers"],
                  })
                }
              >
                <Icon size={13} />
                {key}
              </button>
            ))}
          </div>
          <span className="config-divider" />
          <div className="config-group modes">
            {modeItems.map(({ mode, Icon }) => (
              <button
                type="button"
                key={mode}
                className={config.mode === mode ? "selected" : ""}
                onClick={() => setConfig({ mode: mode as Mode })}
              >
                <Icon size={13} />
                {mode}
              </button>
            ))}
          </div>
          <span className="config-divider" />
          <div className="config-group lengths">
            {(config.mode === "time" || config.mode === "words") && (
              <>
                {(config.mode === "time"
                  ? [15, 30, 60, 120]
                  : [10, 25, 50, 100]
                ).map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setConfig({ [config.mode]: n })}
                    className={
                      config[config.mode as "time" | "words"] === n
                        ? "selected"
                        : ""
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  title="custom length"
                  aria-label="Custom test length"
                  onClick={() =>
                    setModal(config.mode === "time" ? "time" : "words")
                  }
                >
                  <SlidersHorizontal size={14} />
                </button>
              </>
            )}
            {config.mode === "quote" &&
              (["all", "short", "medium", "long", "thicc"] as const).map(
                (n) => (
                  <button
                    type="button"
                    key={n}
                    className={config.quoteLength === n ? "selected" : ""}
                    onClick={() => setConfig({ quoteLength: n })}
                  >
                    {n}
                  </button>
                ),
              )}
            {config.mode === "zen" && <span>just type</span>}
            {config.mode === "custom" && (
              <button type="button" onClick={() => setModal("custom")}>
                change <SlidersHorizontal size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      {result ? (
        <Results
          result={result}
          onNext={() => startAgain()}
          onRepeat={() =>
            startAgain(repeat?.words ?? result.words, result.quoteSource)
          }
          onPractice={() => {
            const missed = result.words.filter(
              (word, index) => result.typed[index] !== word,
            );
            if (missed.length) startAgain(missed);
          }}
        />
      ) : (
        <TestSession
          key={`${signature}:${restart}`}
          repeat={repeat}
          onComplete={(result, words) => {
            setRepeat({ words, source: result.quoteSource });
            setResult(result);
          }}
          onRestart={reset}
        />
      )}
    </div>
  );
}
function TestSession({
  repeat,
  onComplete,
  onRestart,
}: {
  repeat: { words: string[]; source?: string } | null;
  onComplete: (r: TestResult, words: string[]) => void;
  onRestart: () => void;
}) {
  const { config, setModal, modal, saveResult, setActive, notify } = useApp();
  const [session, setSession] = useState<Session | null>(null),
    [focused, setFocused] = useState(true),
    [caps, setCaps] = useState(false),
    [loadError, setLoadError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null),
    wordContainer = useRef<HTMLDivElement>(null),
    activeWord = useRef<HTMLSpanElement>(null),
    completed = useRef(false);
  const audio = useRef<AudioContext | null>(null),
    configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      let words: string[], source: string | undefined;
      if (repeat) {
        words = repeat.words;
        source = repeat.source;
      } else if (config.mode === "zen") words = [""];
      else if (config.mode === "custom") {
        const list = config.customText.trim().split(/\s+/).filter(Boolean);
        words = config.customRandom
          ? generateWords(list, config.customWordCount, {
              punctuation: false,
              numbers: false,
            })
          : list;
      } else if (config.mode === "quote") {
        let response = await fetch(`/quotes/${config.language}.json`, {
          signal: controller.signal,
        });
        if (!response.ok)
          response = await fetch("/quotes/english.json", {
            signal: controller.signal,
          });
        if (!response.ok)
          throw new Error("Could not load quotes. Please try again.");
        const data = (await response.json()) as {
          quotes: { text: string; source: string; length: number }[];
        };
        const ranges = {
          all: [0, Infinity],
          short: [0, 100],
          medium: [101, 300],
          long: [301, 600],
          thicc: [601, Infinity],
        };
        const [min, max] = ranges[config.quoteLength];
        const filtered = data.quotes.filter(
          (q) => q.length >= min && q.length <= max,
        );
        const pool = filtered.length ? filtered : data.quotes;
        const quote = pool[Math.floor(Math.random() * pool.length)];
        words = quote.text.trim().split(/\s+/);
        source = quote.source;
      } else {
        const response = await fetch(`/languages/${config.language}.json`, {
          signal: controller.signal,
        });
        if (!response.ok)
          throw new Error(
            "Could not load this language. Try another language.",
          );
        const data = (await response.json()) as { words: string[] };
        words = generateWords(
          data.words,
          config.mode === "words"
            ? config.words
            : Math.max(1000, config.time * 12),
          config,
        );
      }
      if (!controller.signal.aborted) {
        setSession(newSession(words.length ? words : ["type"], source));
        input.current?.focus({ preventScroll: true });
      }
    }
    load().catch((error) => {
      if (error.name !== "AbortError") setLoadError(error.message);
    });
    return () => {
      controller.abort();
      setActive(false);
    };
    // A session is intentionally fixed until the parent changes its key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const timer = setInterval(
      () =>
        setSession((s) =>
          s ? tick(s, performance.now(), configRef.current) : s,
        ),
      100,
    );
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const active =
      session?.startedAt !== null &&
      session?.startedAt !== undefined &&
      session?.endedAt === null;
    setActive(active);
    if (
      session?.endedAt !== null &&
      session?.endedAt !== undefined &&
      !completed.current
    ) {
      completed.current = true;
      const result = resultFrom(session, configRef.current);
      saveResult(result);
      onComplete(result, session.words);
    }
  }, [session, setActive, saveResult, onComplete]);
  const ready = !!session;
  useEffect(() => {
    if (!modal && ready) input.current?.focus({ preventScroll: true });
  }, [modal, ready]);
  const caretRef = useTypingCaret({
    wordRef: activeWord,
    containerRef: wordContainer,
    inputLength: session?.input.length ?? 0,
    wordIndex: session?.index ?? 0,
    ready,
    smooth: config.smoothCaret,
    showAllLines: config.showAllLines,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize,
  });
  const sound = (error: boolean) => {
    if (error && config.errorSound) {
      const a = new Audio("/sounds/error1/1.wav");
      a.volume = config.soundVolume;
      a.play().catch(() => {});
      return;
    }
    if (config.sound === "off") return;
    if (config.sound === "beep") {
      audio.current ??= new AudioContext();
      const oscillator = audio.current.createOscillator(),
        gain = audio.current.createGain();
      oscillator.connect(gain);
      gain.connect(audio.current.destination);
      gain.gain.value = config.soundVolume * 0.05;
      oscillator.frequency.value = error ? 180 : 440;
      oscillator.start();
      oscillator.stop(audio.current.currentTime + 0.035);
    } else {
      const a = new Audio(
        `/sounds/${config.sound === "click" ? "click1" : "click4"}/${Math.floor(Math.random() * 3) + 1}.wav`,
      );
      a.volume = config.soundVolume;
      a.play().catch(() => {});
    }
  };
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    setCaps(event.getModifierState("CapsLock"));
    if (!session || modal) return;
    if (event.key === "Tab" && config.quickRestart) {
      event.preventDefault();
      onRestart();
      return;
    }
    if (event.key === "Enter" && event.shiftKey && config.mode === "zen") {
      event.preventDefault();
      if (session.startedAt !== null)
        setSession((s) =>
          s ? { ...s, now: performance.now(), endedAt: performance.now() } : s,
        );
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      sound(session.input !== session.words[session.index]);
      setSession((s) => (s ? commitWord(s, performance.now(), config) : s));
      return;
    }
    if (event.key === "Backspace") {
      if (config.confidenceMode === "max") {
        event.preventDefault();
        return;
      }
      if (!session.input) {
        event.preventDefault();
        setSession((s) => (s ? previousWord(s, config) : s));
      } else if (event.ctrlKey || event.altKey || event.metaKey) {
        event.preventDefault();
        setSession((s) => (s ? { ...s, input: "" } : s));
      }
    }
  };
  const m = session ? metrics(session) : null,
    started = session?.startedAt !== null && session?.startedAt !== undefined;
  const focus = () => {
    input.current?.focus({ preventScroll: true });
    setFocused(true);
  };
  const progress =
    config.mode === "time"
      ? Math.max(0, config.time - (m?.duration ?? 0))
      : (session?.index ?? 0);
  const paceIndex =
    config.paceCaret && m
      ? Math.floor(((config.paceCaret * 5) / 60) * m.duration)
      : 0;

  return (
    <section className="typing-section" aria-label="Typing test">
      <div className="test-meta">
        <button
          type="button"
          className="language-button"
          onClick={() => setModal("language")}
        >
          <Globe size={16} />
          {config.language.replaceAll("_", " ")}
        </button>
        {config.difficulty !== "normal" && (
          <span>
            <AlertTriangle size={14} />
            {config.difficulty}
          </span>
        )}
        {config.blindMode && <span>blind</span>}
        {caps && (
          <span className="caps">
            <LockKeyhole size={14} />
            caps lock
          </span>
        )}
      </div>
      {loadError ? (
        <div className="load-error">
          {loadError}
          <button type="button" onClick={onRestart}>
            <RefreshCw size={18} />
            retry
          </button>
        </div>
      ) : !session ? (
        <div className="loading-words">loading words...</div>
      ) : (
        <>
          <div className="live-stats" aria-live="off">
            {started && (
              <>
                {config.timerStyle === "mini" && (
                  <span>
                    {config.mode === "time"
                      ? Math.ceil(progress)
                      : `${session.index}/${config.mode === "zen" ? "∞" : session.words.length}`}
                  </span>
                )}
                {config.liveWpm && (
                  <span>
                    {Math.round(m?.wpm ?? 0)} <small>wpm</small>
                  </span>
                )}
                {config.liveAccuracy && (
                  <span>
                    {Math.round(m?.accuracy ?? 100)}
                    <small>%</small>
                  </span>
                )}
              </>
            )}
          </div>
          {config.timerStyle === "bar" && started && (
            <div className="timer-track">
              <div
                style={{
                  width: `${config.mode === "time" ? (progress / config.time) * 100 : (session.index / session.words.length) * 100}%`,
                }}
              />
            </div>
          )}
          <div
            className={`words-viewport ${config.showAllLines ? "show-all" : ""} ${!focused ? "unfocused" : ""} ${config.flipTestColors ? "flip-colors" : ""} ${config.colorfulMode ? "colorful" : ""}`}
            style={{
              height: config.showAllLines
                ? "auto"
                : `${config.fontSize * 4.875}px`,
            }}
          >
            <textarea
              ref={input}
              className="typing-input"
              aria-label="Type the words here"
              value={session.input}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={keyDown}
              onPaste={(e) => {
                e.preventDefault();
                notify("Type the words to complete the test.");
              }}
              onChange={(event) => {
                const value = event.target.value.replace(/\n/g, "");
                sound(
                  value.at(-1) !==
                    session.words[session.index]?.[value.length - 1],
                );
                setSession((s) =>
                  s ? typeInput(s, value, performance.now(), config) : s,
                );
              }}
            />
            <div
              className="words-container"
              ref={wordContainer}
              aria-hidden="true"
            >
              {session.words
                .slice(0, Math.max(100, session.index + 100))
                .map((word, index) => {
                  const typed =
                    index === session.index
                      ? session.input
                      : (session.typed[index] ?? "");
                  const hasError = index < session.index && typed !== word;
                  const chars = [...word];
                  const extra = typed.slice(word.length);
                  const start = config.paceCaret
                    ? session.words
                        .slice(0, index)
                        .reduce((sum, w) => sum + w.length + 1, 0)
                    : 0;
                  return (
                    <span
                      key={index}
                      ref={index === session.index ? activeWord : undefined}
                      className={`word ${hasError && !config.blindMode ? "word-error" : ""} ${index === session.index ? "active-word" : ""}`}
                    >
                      {chars.map((char, i) => {
                        const status =
                          i < typed.length
                            ? typed[i] === char || config.blindMode
                              ? "correct"
                              : "incorrect"
                            : index < session.index
                              ? "missed"
                              : "";
                        return (
                          <span
                            key={i}
                            className={`${status} ${config.paceCaret && start + i === paceIndex && started ? "pace-char" : ""}`}
                          >
                            {char}
                          </span>
                        );
                      })}
                      {[...extra].map((char, i) => (
                        <span
                          key={`extra${i}`}
                          className={config.blindMode ? "correct" : "extra"}
                        >
                          {char}
                        </span>
                      ))}
                      <span className="word-end">&#8203;</span>
                    </span>
                  );
                })}
              <div
                ref={caretRef}
                className={`caret ${config.caretStyle} ${config.smoothCaret ? "smooth" : ""} ${!started ? "blink" : ""}`}
              />
            </div>
            {!focused && (
              <button type="button" className="focus-warning" onClick={focus}>
                <ChevronRight size={18} />
                Click here to focus
              </button>
            )}
          </div>
          {config.mode === "zen" && (
            <div className="zen-tip">
              <kbd>shift</kbd> + <kbd>enter</kbd> to finish zen
            </div>
          )}
        </>
      )}
      <div className="restart-row">
        <button
          type="button"
          aria-label="Restart test"
          title="Restart test"
          onClick={onRestart}
        >
          <RotateCw size={21} />
        </button>
      </div>
      {config.keymap && (
        <div className="keymap" aria-label="Keyboard">
          {["qwertyuiop", "asdfghjkl", "zxcvbnm"].map((row) => (
            <div key={row}>
              {[...row].map((key) => (
                <kbd
                  key={key}
                  className={
                    session?.words[session.index]?.[
                      session.input.length
                    ]?.toLowerCase() === key
                      ? "next-key"
                      : ""
                  }
                >
                  {key}
                </kbd>
              ))}
            </div>
          ))}
          <div>
            <kbd className="space-key">space</kbd>
          </div>
        </div>
      )}
      {config.sound !== "off" && (
        <div className="sound-indicator">
          <Volume2 size={12} />
          sound on
        </div>
      )}
    </section>
  );
}
