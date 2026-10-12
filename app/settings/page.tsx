"use client";
import { useState, type ReactNode } from "react";
import {
  Settings,
  SlidersHorizontal,
  Paintbrush,
  Type,
  Volume2,
  Keyboard,
  Timer,
  RotateCw,
  Download,
  Upload,
} from "@/components/icons";
import { useApp } from "@/components/context";
import { defaults, type Config } from "@/lib/config";
import { configSchema } from "@/lib/config-schema";
import { themes } from "@/lib/themes";
function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-label">{title}</div>
        <div className="setting-description">{description}</div>
      </div>
      <div className="setting-control">{children}</div>
    </div>
  );
}
export default function SettingsPage() {
  const { config, setConfig, setModal, notify } = useApp(),
    [search, setSearch] = useState("");
  const toggle = (key: keyof Config) => (
    <>
      {[false, true].map((value) => (
        <button
          type="button"
          key={String(value)}
          className={config[key] === value ? "selected" : ""}
          onClick={() => setConfig({ [key]: value })}
        >
          {value ? "on" : "off"}
        </button>
      ))}
    </>
  );
  const choice = (key: keyof Config, values: (string | number)[]) => (
    <>
      {values.map((value) => (
        <button
          type="button"
          key={value}
          className={config[key] === value ? "selected" : ""}
          onClick={() => setConfig({ [key]: value })}
        >
          {value}
        </button>
      ))}
    </>
  );
  const numeric = (key: keyof Config, min: number, max: number, step = 1) => (
    <input
      aria-label={String(key)}
      type="number"
      min={min}
      max={max}
      step={step}
      value={Number(config[key])}
      onChange={(e) => {
        const value = e.target.valueAsNumber;
        if (Number.isFinite(value) && value >= min && value <= max)
          setConfig({ [key]: value });
      }}
    />
  );
  const exportConfig = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(config, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "monkeytype-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="page-content">
      <h1 className="page-title">
        <Settings />
        settings
      </h1>
      <div className="settings-layout">
        <nav className="settings-nav">
          {[
            { id: "behavior", icon: SlidersHorizontal },
            { id: "input", icon: Keyboard },
            { id: "sound", icon: Volume2 },
            { id: "caret", icon: Type },
            { id: "appearance", icon: Paintbrush },
            { id: "theme", icon: Paintbrush },
            { id: "hide-elements", icon: Timer },
            { id: "danger-zone", icon: RotateCw },
          ].map(({ id, icon: Icon }) => (
            <a key={id} href={`#${id}`}>
              <Icon />
              {id.replaceAll("-", " ")}
            </a>
          ))}
        </nav>
        <div className="settings-content">
          <section id="behavior">
            <h2>behavior</h2>
            <Row
              title="test difficulty"
              description="Normal is the classic typing experience. Expert fails on an incorrect word. Master fails on any incorrect key."
            >
              {choice("difficulty", ["normal", "expert", "master"])}
            </Row>
            <Row
              title="quick restart"
              description="Press tab to instantly restart the test, without needing to press enter."
            >
              {toggle("quickRestart")}
            </Row>
            <Row
              title="repeat quotes"
              description="Choose the length of quotes used in quote mode."
            >
              {choice("quoteLength", [
                "all",
                "short",
                "medium",
                "long",
                "thicc",
              ])}
            </Row>
            <Row
              title="language"
              description="Change the word list used to generate your tests."
            >
              <button type="button" onClick={() => setModal("language")}>
                {config.language.replaceAll("_", " ")}
              </button>
            </Row>
            <Row
              title="minimum wpm"
              description="Fail the test if your speed drops below this number after 3 seconds. Set to 0 to disable."
            >
              {numeric("minWpm", 0, 400)}
            </Row>
            <Row
              title="minimum accuracy"
              description="Fail the test if your accuracy drops below this percentage after 3 seconds. Set to 0 to disable."
            >
              {numeric("minAccuracy", 0, 100)}
            </Row>
          </section>
          <section id="input">
            <h2>input</h2>
            <Row
              title="stop on error"
              description="Stop at the end of an incorrect word, or prevent incorrect letters from being entered."
            >
              {choice("stopOnError", ["off", "word", "letter"])}
            </Row>
            <Row
              title="confidence mode"
              description="On prevents going back to previous words. Max disables backspace entirely."
            >
              {choice("confidenceMode", ["off", "on", "max"])}
            </Row>
            <Row
              title="freedom mode"
              description="Allows you to backspace into correctly typed previous words."
            >
              {toggle("freedomMode")}
            </Row>
            <Row
              title="quick end"
              description="Finish a word-based test as soon as the last word reaches its target length, even with errors."
            >
              {toggle("quickEnd")}
            </Row>
            <Row
              title="blind mode"
              description="Hide incorrect characters and error highlighting during the test."
            >
              {toggle("blindMode")}
            </Row>
          </section>
          <section id="sound">
            <h2>sound</h2>
            <Row
              title="play sound on click"
              description="Play a sound with every keypress."
            >
              {choice("sound", ["off", "click", "typewriter", "beep"])}
            </Row>
            <Row
              title="play sound on error"
              description="Play a distinct sound when you make a typing mistake."
            >
              {toggle("errorSound")}
            </Row>
            <Row
              title="sound volume"
              description="Adjust the volume of typing and error sounds."
            >
              <input
                aria-label="Sound volume"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={config.soundVolume}
                onChange={(e) =>
                  setConfig({ soundVolume: Number(e.target.value) })
                }
              />
            </Row>
          </section>
          <section id="caret">
            <h2>caret</h2>
            <Row
              title="smooth caret"
              description="Animate the caret moving between characters."
            >
              {toggle("smoothCaret")}
            </Row>
            <Row
              title="caret style"
              description="Change the appearance of the typing caret."
            >
              {choice("caretStyle", ["line", "block", "underline"])}
            </Row>
            <Row
              title="pace caret"
              description="Show a second caret at a target words-per-minute pace. Set to 0 to disable."
            >
              {numeric("paceCaret", 0, 400)}
            </Row>
          </section>
          <section id="appearance">
            <h2>appearance</h2>
            <Row
              title="font size"
              description="Change the size of the test words."
            >
              {choice("fontSize", [20, 24, 32, 40, 48])}
            </Row>
            <Row
              title="font family"
              description="Use one of Monkeytype’s original monospace fonts."
            >
              <select
                aria-label="Font family"
                value={config.fontFamily}
                onChange={(e) => setConfig({ fontFamily: e.target.value })}
              >
                {[
                  "Roboto Mono",
                  "JetBrains Mono",
                  "Fira Code",
                  "IBM Plex Mono",
                  "Geist Mono",
                  "monospace",
                ].map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </Row>
            <Row
              title="colorful mode"
              description="Use the main theme color for correctly typed letters."
            >
              {toggle("colorfulMode")}
            </Row>
            <Row
              title="flip test colors"
              description="Swap the colors of typed and untyped characters."
            >
              {toggle("flipTestColors")}
            </Row>
            <Row
              title="show all lines"
              description="Show the full test text instead of a three-line window."
            >
              {toggle("showAllLines")}
            </Row>
            <Row
              title="keymap"
              description="Show an on-screen keyboard with the next key highlighted."
            >
              {toggle("keymap")}
            </Row>
          </section>
          <section id="theme">
            <h2>theme</h2>
            <Row
              title="custom theme"
              description="Create your own palette with custom background, accent, muted and text colors."
            >
              {toggle("customTheme")}
            </Row>
            {config.customTheme && (
              <div className="color-fields">
                {Object.entries(config.customColors).map(([key, value]) => (
                  <label key={key}>
                    {key}
                    <input
                      aria-label={`${key} color`}
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setConfig({
                          customColors: {
                            ...config.customColors,
                            [key]: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            )}
            <input
              aria-label="Search themes"
              placeholder="search themes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="theme-grid">
              {Object.entries(themes)
                .filter(([name]) =>
                  name.replaceAll("_", " ").includes(search.toLowerCase()),
                )
                .map(([name, theme]) => (
                  <button
                    type="button"
                    key={name}
                    className={`theme-card ${config.theme === name && !config.customTheme ? "is-selected" : ""}`}
                    style={{ background: theme.bg, color: theme.text }}
                    onClick={() =>
                      setConfig({ theme: name, customTheme: false })
                    }
                  >
                    <span>{name.replaceAll("_", " ")}</span>
                    <span style={{ color: theme.main }}>● ● ●</span>
                  </button>
                ))}
            </div>
          </section>
          <section id="hide-elements">
            <h2>hide elements</h2>
            <Row
              title="live speed"
              description="Display words per minute during the test."
            >
              {toggle("liveWpm")}
            </Row>
            <Row
              title="live accuracy"
              description="Display accuracy during the test."
            >
              {toggle("liveAccuracy")}
            </Row>
            <Row
              title="timer style"
              description="Display remaining time as a number or a progress bar."
            >
              {choice("timerStyle", ["mini", "bar", "off"])}
            </Row>
            <Row
              title="key tips"
              description="Show keyboard shortcuts above the footer."
            >
              {toggle("showKeyTips")}
            </Row>
          </section>
          <section id="danger-zone">
            <h2>settings management</h2>
            <Row
              title="export settings"
              description="Download a backup of your configuration."
            >
              <button type="button" onClick={exportConfig}>
                <Download size={14} /> export
              </button>
            </Row>
            <Row
              title="import settings"
              description="Restore settings from a previously exported file."
            >
              <label className="primary-button">
                <Upload size={14} /> import
                <input
                  style={{ display: "none" }}
                  type="file"
                  accept="application/json"
                  onChange={async (e) => {
                    try {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = JSON.parse(await file.text());
                      const valid = configSchema.parse(data);
                      setConfig(valid);
                      notify("Settings imported.");
                    } catch {
                      notify("Invalid settings file.", true);
                    }
                  }}
                />
              </label>
            </Row>
            <Row
              title="reset settings"
              description="Reset all preferences to their defaults. Your results are kept."
            >
              <button
                type="button"
                onClick={() => {
                  setConfig(defaults);
                  notify("Settings reset to defaults.");
                }}
              >
                reset settings
              </button>
            </Row>
          </section>
        </div>
      </div>
    </div>
  );
}
