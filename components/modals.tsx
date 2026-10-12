"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Check,
  Palette,
  Globe,
  Clock3,
  Type,
  Settings,
  Keyboard,
  Crown,
  Info,
  X,
  RotateCw,
} from "@/components/icons";
import { useApp } from "./context";
import { themes, type Theme } from "@/lib/themes";
import languages from "@/lib/languages.json";
import { defaults, type Config } from "@/lib/config";
export function Modals() {
  const { modal } = useApp();
  return modal ? <ModalContent key={modal} /> : null;
}
function ModalContent() {
  const { modal, setModal, config, setConfig, notify } = useApp();
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(0),
    [text, setText] = useState(config.customText),
    [random, setRandom] = useState(config.customRandom),
    [count, setCount] = useState(config.customWordCount),
    [length, setLength] = useState(
      modal === "time" ? config.time : config.words,
    );
  const router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null),
    list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const choose = (update: Partial<Config>) => {
    setConfig(update);
    setModal(null);
  };
  const commands = [
    { label: "Theme", Icon: Palette, action: () => setModal("theme") },
    { label: "Language", Icon: Globe, action: () => setModal("language") },
    {
      label: "Time 15",
      Icon: Clock3,
      action: () => choose({ mode: "time", time: 15 }),
    },
    {
      label: "Time 30",
      Icon: Clock3,
      action: () => choose({ mode: "time", time: 30 }),
    },
    {
      label: "Time 60",
      Icon: Clock3,
      action: () => choose({ mode: "time", time: 60 }),
    },
    {
      label: "Time 120",
      Icon: Clock3,
      action: () => choose({ mode: "time", time: 120 }),
    },
    ...[10, 25, 50, 100].map((words) => ({
      label: `Words ${words}`,
      Icon: Type,
      action: () => choose({ mode: "words", words }),
    })),
    {
      label: "Mode quote",
      Icon: Type,
      action: () => choose({ mode: "quote" }),
    },
    { label: "Mode zen", Icon: Type, action: () => choose({ mode: "zen" }) },
    {
      label: "Mode custom",
      Icon: Type,
      action: () => {
        setConfig({ mode: "custom" });
        setModal("custom");
      },
    },
    {
      label: `Punctuation ${config.punctuation ? "off" : "on"}`,
      Icon: Type,
      action: () => choose({ punctuation: !config.punctuation }),
    },
    {
      label: `Numbers ${config.numbers ? "off" : "on"}`,
      Icon: Type,
      action: () => choose({ numbers: !config.numbers }),
    },
    {
      label: "Settings",
      Icon: Settings,
      action: () => {
        router.push("/settings");
        setModal(null);
      },
    },
    {
      label: "Test",
      Icon: Keyboard,
      action: () => {
        router.push("/");
        setModal(null);
      },
    },
    {
      label: "Leaderboards",
      Icon: Crown,
      action: () => {
        router.push("/leaderboards");
        setModal(null);
      },
    },
    {
      label: "About",
      Icon: Info,
      action: () => {
        router.push("/about");
        setModal(null);
      },
    },
    {
      label: `Live wpm ${config.liveWpm ? "off" : "on"}`,
      Icon: Clock3,
      action: () => choose({ liveWpm: !config.liveWpm }),
    },
    {
      label: `Sound ${config.sound === "off" ? "on" : "off"}`,
      Icon: Keyboard,
      action: () => choose({ sound: config.sound === "off" ? "click" : "off" }),
    },
    {
      label: "Reset settings",
      Icon: RotateCw,
      action: () => {
        choose(defaults);
        notify("Settings reset.");
      },
    },
  ];
  type Row = {
    label: string;
    name?: string;
    theme?: Theme;
    Icon?: typeof Search;
    action: () => void;
  };
  const rows: Row[] =
    modal === "theme"
      ? Object.entries(themes)
          .map(([name, theme]) => ({
            label: name.replaceAll("_", " "),
            name,
            theme,
            action: () => choose({ theme: name, customTheme: false }),
          }))
          .filter((x) => x.label.includes(query.toLowerCase()))
      : modal === "language"
        ? languages
            .map((name) => ({
              label: name.replaceAll("_", " "),
              name,
              action: () => choose({ language: name }),
            }))
            .filter((x) => x.label.includes(query.toLowerCase()))
        : commands.filter((x) =>
            x.label.toLowerCase().includes(query.toLowerCase()),
          );
  const searchable = ["command", "theme", "language"].includes(modal ?? "");
  const close = () => setModal(null);
  return (
    <dialog
      aria-label={modal ?? "Command palette"}
      ref={dialog}
      className={`modal ${searchable ? "search-modal" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      onKeyDown={(e) => {
        if (searchable && e.key === "ArrowDown") {
          e.preventDefault();
          const next = Math.min(rows.length - 1, selected + 1);
          setSelected(next);
          list.current?.children[next]?.scrollIntoView({ block: "nearest" });
        }
        if (searchable && e.key === "ArrowUp") {
          e.preventDefault();
          const next = Math.max(0, selected - 1);
          setSelected(next);
          list.current?.children[next]?.scrollIntoView({ block: "nearest" });
        }
        if (searchable && e.key === "Enter") {
          e.preventDefault();
          rows[selected]?.action();
        }
      }}
    >
      <div className="modal-inner">
        {searchable ? (
          <>
            <div className="command-search">
              {modal === "command" ? <ChevronRight /> : <Search size={20} />}
              <input
                autoFocus
                aria-label={`Search ${modal}`}
                placeholder={
                  modal === "command"
                    ? "Type to search..."
                    : `Search ${modal}s...`
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
              />
              <kbd>esc</kbd>
            </div>
            {modal !== "command" && (
              <div className="modal-breadcrumb">
                <button type="button" onClick={() => setModal("command")}>
                  commands
                </button>
                <ChevronRight size={12} />
                {modal}
              </div>
            )}
            <div className="command-list" ref={list}>
              {rows.map((row, index) => (
                <button
                  type="button"
                  key={row.label}
                  className={`command-option ${index === selected ? "highlighted" : ""}`}
                  onMouseEnter={() => setSelected(index)}
                  onClick={row.action}
                >
                  {row.Icon && <row.Icon size={15} />}
                  <span>{row.label.toLowerCase()}</span>
                  {row.theme && (
                    <span
                      className="theme-preview"
                      style={{
                        background: row.theme.bg,
                        color: row.theme.text,
                      }}
                    >
                      <span style={{ color: row.theme.main }}>●</span>
                      <span style={{ color: row.theme.sub }}>●</span>●
                    </span>
                  )}
                  {"name" in row &&
                    (row.name === config.theme ||
                      row.name === config.language) && <Check size={14} />}
                </button>
              ))}
              {!rows.length && <p className="empty-state">no results found</p>}
            </div>
            <div className="modal-help">
              <span>
                <kbd>↑</kbd> <kbd>↓</kbd> navigate
              </span>
              <span>
                <kbd>enter</kbd> select
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="modal-heading">
              <h2>
                {modal === "custom"
                  ? "custom text"
                  : modal === "time"
                    ? "custom time"
                    : modal === "words"
                      ? "custom word count"
                      : modal === "notifications"
                        ? "notifications"
                        : modal === "version"
                          ? "changelog"
                          : "help & shortcuts"}
              </h2>
              <button type="button" onClick={close} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>
            {modal === "custom" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim())
                    choose({
                      mode: "custom",
                      customText: text,
                      customRandom: random,
                      customWordCount: count,
                    });
                }}
              >
                <textarea
                  aria-label="Custom text"
                  autoFocus
                  rows={7}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter or paste your text here..."
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={random}
                    onChange={(e) => setRandom(e.target.checked)}
                  />{" "}
                  randomize words
                </label>
                {random && (
                  <label>
                    word count
                    <input
                      aria-label="Custom random word count"
                      type="number"
                      min="1"
                      max="10000"
                      value={count}
                      onChange={(e) => {
                        const number = e.target.valueAsNumber;
                        if (Number.isFinite(number)) setCount(number);
                      }}
                    />
                  </label>
                )}
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!text.trim()}
                >
                  apply
                </button>
              </form>
            )}
            {(modal === "time" || modal === "words") && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (length > 0 && length <= 10000)
                    choose({ [modal]: length });
                }}
              >
                <p>
                  {modal === "time"
                    ? "Test duration in seconds."
                    : "Number of words in the test."}
                </p>
                <input
                  autoFocus
                  aria-label="Test length"
                  type="number"
                  min="1"
                  max="10000"
                  required
                  value={length}
                  onChange={(e) => {
                    const number = e.target.valueAsNumber;
                    if (Number.isFinite(number)) setLength(number);
                  }}
                />
                <button type="submit" className="primary-button">
                  apply
                </button>
              </form>
            )}
            {modal === "notifications" && (
              <div className="empty-state">
                <Check size={32} />
                <p>you’re all caught up</p>
              </div>
            )}
            {modal === "version" && (
              <div className="prose">
                <h3>v0.1.0</h3>
                <p>
                  The Monkeytype foundation, rebuilt with Next.js. Five typing
                  modes, original themes and languages, personal results, and
                  Neon-backed accounts.
                </p>
                <p>TypeRacer features are next.</p>
              </div>
            )}
            {modal === "help" && (
              <div className="prose">
                <p>
                  <kbd>tab</kbd> + <kbd>enter</kbd> — restart test
                </p>
                <p>
                  <kbd>esc</kbd> — open the command line
                </p>
                <p>
                  <kbd>ctrl</kbd> + <kbd>backspace</kbd> — erase current word
                </p>
                <p>
                  <kbd>shift</kbd> + <kbd>enter</kbd> — finish zen mode
                </p>
                <p>
                  Use settings to customize your test, or choose a theme from
                  the bottom-right corner.
                </p>
                <p>
                  This is a small independent project inspired by Monkeytype and
                  TypeRacer. Find other racers in{" "}
                  <a
                    href="https://discord.gg/KJ75VN2pM"
                    target="_blank"
                    rel="noreferrer"
                  >
                    the Monkeytype Racer Discord
                  </a>
                  .
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
