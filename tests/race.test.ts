import { describe, it, expect } from "vitest";
import {
  advanceRace,
  applyEdits,
  raceView,
  startRace,
  correctPrefix,
  editText,
  type RaceState,
  type Racer,
} from "../lib/race";
const racer = (id: string): Racer => ({
  id,
  session: `secret-${id}`,
  name: id,
  ready: true,
  joinedAt: 0,
  seenAt: 1000,
  typed: "",
  samples: [],
  seq: 0,
  attempts: 0,
  errors: 0,
  finishedAt: null,
  left: false,
});
const room = (): RaceState => ({
  id: "room",
  kind: "private",
  phase: "waiting",
  host: "a",
  round: 1,
  quote: "hello world",
  source: "test",
  createdAt: 0,
  startAt: null,
  deadline: null,
  players: [racer("a"), racer("b")],
});
describe("authoritative races", () => {
  it("hides the quote until countdown and never exposes session secrets", () => {
    const r = room();
    const view = raceView(r, "secret-a", 1000);
    expect(view.quote).toBe("");
    expect(JSON.stringify(view)).not.toContain("secret-");
    expect(view.me?.id).toBe("a");
  });
  it("starts together and ignores early typing", () => {
    const r = room();
    startRace(r, 1000);
    applyEdits(r, r.players[0], [{ seq: 1, type: "insert", text: "h" }], 2000);
    expect(r.players[0].seq).toBe(0);
    advanceRace(r, 8000);
    expect(r.phase).toBe("racing");
  });
  it("counts corrected errors, deduplicates retries, and gives an immutable finish", () => {
    const r = room();
    startRace(r, 1000);
    advanceRace(r, 8000);
    const p = r.players[0];
    const edits = [
      { seq: 1, type: "insert" as const, text: "x" },
      { seq: 2, type: "delete" as const },
      ...Array.from(r.quote).map((text, i) => ({
        seq: i + 3,
        type: "insert" as const,
        text,
      })),
    ];
    applyEdits(r, p, edits, 18000);
    expect(p.finishedAt).toBe(18000);
    expect(p.errors).toBe(1);
    expect(p.attempts).toBe(12);
    expect(r.deadline).toBe(48000);
    applyEdits(r, p, edits, 19000);
    expect(p.finishedAt).toBe(18000);
    expect(p.attempts).toBe(12);
  });
  it("rejects missing event sequences and implausible bursts", () => {
    const r = room();
    startRace(r, 1000);
    advanceRace(r, 8000);
    expect(() =>
      applyEdits(
        r,
        r.players[0],
        [{ seq: 2, type: "insert", text: "h" }],
        9000,
      ),
    ).toThrow(/sequence/);
    r.quote = "a".repeat(100);
    expect(() =>
      applyEdits(
        r,
        r.players[0],
        Array.from(r.quote).map((text, i) => ({
          seq: i + 1,
          type: "insert",
          text,
        })),
        8001,
      ),
    ).toThrow(/quickly/);
  });
  it("cancels abandoned countdowns and reassigns the host", () => {
    const r = room();
    startRace(r, 1000);
    r.players[0].left = true;
    advanceRace(r, 2000);
    expect(r.phase).toBe("waiting");
    expect(r.host).toBe("b");
  });
  it("closes races at the deadline and respects unicode boundaries", () => {
    const r = room();
    startRace(r, 1000);
    advanceRace(r, 8000);
    advanceRace(r, 188001);
    expect(r.phase).toBe("finished");
    expect(correctPrefix("a😀x", "a😀b")).toBe(2);
  });
});

describe("race word correction", () => {
  it("keeps errors within a word and allows correction to finish", () => {
    const r = room();
    startRace(r, 1000);
    advanceRace(r, 8000);
    const p = r.players[0];
    let seq = 0;
    for (const text of "hxllo world") applyEdits(r, p, [{seq:++seq,type:"insert",text}], 18000);
    expect(p.typed).toBe("hxllo");
    expect(p.finishedAt).toBeNull();
    for (let i=0;i<4;i++) applyEdits(r,p,[{seq:++seq,type:"delete"}],19000);
    for (const text of "ello world") applyEdits(r,p,[{seq:++seq,type:"insert",text}],20000);
    expect(p.finishedAt).toBe(20000);
    expect(p.errors).toBeGreaterThan(0);
  });
  it("does not hide overflow beyond the last character", () => {
    expect(editText("hellx",{seq:1,type:"insert",text:"z"},"hello")).toBe("hellx");
    expect(editText("a😀x",{seq:1,type:"delete"},"a😀b")).toBe("a😀");
  });
});
