import { describe, expect, it } from "vitest";
import { raceStandings } from "../lib/race-standings";
const player = (id: string, progress: number, finishedAt: number | null = null) => ({ id, progress, finishedAt });
describe("race standings", () => {
  it("ranks finishers first and gives unfinished progress competition ranks", () => {
    const players = [player("e", .1), player("d", .4), player("b", .8), player("a", 1, 100), player("c", .8)];
    expect(raceStandings(players).map(p => [p.id, p.place, p.tied])).toEqual([
      ["a", 1, false], ["b", 2, true], ["c", 2, true], ["d", 4, false], ["e", 5, false],
    ]);
    expect(players[0].id).toBe("e");
  });
  it("shares first place when nobody has made progress", () => {
    expect(raceStandings([player("b", 0), player("a", 0)]).map(p => [p.place, p.tied])).toEqual([[1, true], [1, true]]);
  });
  it("shares equal finish times and skips the following position", () => {
    expect(raceStandings([player("c", 1, 200), player("a", 1, 100), player("b", 1, 100)]).map(p => p.place)).toEqual([1, 1, 3]);
  });
  it("normalizes unavailable progress and distinguishes nearby progress", () => {
    expect(raceStandings([player("a", NaN), player("b", 0)]).map(p => p.place)).toEqual([1, 1]);
    expect(raceStandings([player("a", .501), player("b", .502)]).map(p => p.place)).toEqual([1, 2]);
  });
});
