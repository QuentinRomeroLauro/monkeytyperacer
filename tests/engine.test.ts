import { describe, it, expect } from "vitest";
import { defaults as appDefaults } from "../lib/config";
import {
  newSession,
  typeInput,
  commitWord,
  previousWord,
  tick,
  metrics,
  generateWords,
  resultFrom,
} from "../lib/engine";
const defaults = { ...appDefaults, mode: "time" as const };
describe("typing engine", () => {
  it("does not start until the first character and expires at exact duration", () => {
    let s = newSession(["hello", "world"]);
    expect(tick(s, 1000, defaults).startedAt).toBeNull();
    s = typeInput(s, "h", 1000, defaults);
    s = tick(s, 40000, defaults);
    expect(s.endedAt).toBe(31000);
    expect(metrics(s).duration).toBe(30);
  });
  it("counts correct words and calculates wpm over elapsed time", () => {
    let s = typeInput(newSession(["hello", "world"]), "hello", 1000, defaults);
    s = commitWord(s, 2000, defaults);
    s = typeInput(s, "world", 6000, defaults);
    expect(metrics(s).wpm).toBeCloseTo(26.4);
    expect(metrics(s).accuracy).toBe(100);
  });
  it("retains errors in accuracy after corrections", () => {
    let s = typeInput(newSession(["hello"]), "x", 1000, defaults);
    s = typeInput(s, "", 1100, defaults);
    s = typeInput(s, "h", 1200, defaults);
    expect(metrics(s).accuracy).toBe(50);
    expect(metrics(s).incorrect).toBe(0);
  });
  it("does not count incorrect completed words towards wpm", () => {
    let s = typeInput(newSession(["hello", "world"]), "hxllo", 1000, defaults);
    s = commitWord(s, 3000, defaults);
    expect(metrics(s).wpm).toBe(0);
    expect(metrics(s).correct).toBe(4);
    expect(metrics(s).incorrect).toBe(1);
  });
  it("separately counts missed and extra characters", () => {
    let s = typeInput(newSession(["hello", "to", "end"]), "he", 1000, defaults);
    s = commitWord(s, 2000, defaults);
    s = typeInput(s, "too", 3000, defaults);
    s = commitWord(s, 4000, defaults);
    expect(metrics(s).missed).toBe(3);
    expect(metrics(s).extra).toBe(1);
  });
  it("finishes a words test on the last correct letter", () => {
    const c = { ...defaults, mode: "words" as const };
    const s = typeInput(newSession(["hi"]), "hi", 1000, c);
    expect(s.endedAt).toBe(1000);
  });
  it("prevents backspacing correct words without freedom mode", () => {
    let s = typeInput(newSession(["hi", "there"]), "hi", 1000, defaults);
    s = commitWord(s, 2000, defaults);
    expect(previousWord(s, defaults).index).toBe(1);
    expect(previousWord(s, { ...defaults, freedomMode: true }).index).toBe(0);
  });
  it("allows fixing previous incorrect words and respects confidence mode", () => {
    let s = typeInput(newSession(["hi", "there"]), "ho", 1000, defaults);
    s = commitWord(s, 2000, defaults);
    expect(previousWord(s, defaults).input).toBe("ho");
    expect(previousWord(s, { ...defaults, confidenceMode: "on" }).index).toBe(
      1,
    );
  });
  it("enforces master and expert difficulty at the correct time", () => {
    const master = typeInput(newSession(["hi"]), "x", 1000, {
      ...defaults,
      difficulty: "master",
    });
    expect(master.failed).toBe(true);
    let expert = typeInput(newSession(["hi"]), "x", 1000, {
      ...defaults,
      difficulty: "expert",
    });
    expect(expert.failed).toBe(false);
    expert = commitWord(expert, 2000, { ...defaults, difficulty: "expert" });
    expect(expert.failed).toBe(true);
  });
  it("letter-stop blocks incorrect input but records the error", () => {
    const s = typeInput(newSession(["hi"]), "x", 1000, {
      ...defaults,
      stopOnError: "letter",
    });
    expect(s.input).toBe("");
    expect(s.errors).toBe(1);
  });
  it("word-stop will not advance an incorrect word", () => {
    const c = { ...defaults, stopOnError: "word" as const };
    const s = commitWord(typeInput(newSession(["hi"]), "ho", 1000, c), 2000, c);
    expect(s.index).toBe(0);
  });
  it("zen accepts arbitrary text", () => {
    const c = { ...defaults, mode: "zen" as const };
    let s = typeInput(newSession([""]), "anything", 1000, c);
    s = commitWord(s, 2000, c);
    expect(s.words).toEqual(["anything", ""]);
    expect(s.hits).toBe(9);
    expect(s.endedAt).toBeNull();
  });
  it("never mutates a finished session", () => {
    let s = typeInput(newSession(["hi"]), "h", 1000, defaults);
    s = tick(s, 31000, defaults);
    expect(typeInput(s, "hi", 32000, defaults)).toBe(s);
    expect(commitWord(s, 32000, defaults)).toBe(s);
  });
  it("generates the exact requested count with no consecutive repeats", () => {
    const words = generateWords(
      ["one", "two"],
      25,
      { punctuation: false, numbers: false },
      () => 0,
    );
    expect(words).toHaveLength(25);
    expect(words.slice(1).every((w, i) => w !== words[i])).toBe(true);
  });
  it("produces finite results and one sample per second", () => {
    let s = typeInput(newSession(["hello"]), "h", 1000, defaults);
    s = tick(s, 2000, defaults);
    s = tick(s, 2100, defaults);
    expect(s.samples).toHaveLength(1);
    expect(Number.isFinite(resultFrom(s, defaults).consistency)).toBe(true);
  });
  it("minimum accuracy does not fail before the grace period", () => {
    const c = { ...defaults, minAccuracy: 90 };
    let s = typeInput(newSession(["hi"]), "x", 1000, c);
    expect(tick(s, 3000, c).failed).toBe(false);
    s = tick(s, 4000, c);
    expect(s.failed).toBe(true);
  });
});
