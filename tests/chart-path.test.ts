import { describe, expect, it } from "vitest";
import { smoothPath } from "../lib/chart-path";

describe("smooth chart paths", () => {
  it("handles empty, single and flat series", () => {
    expect(smoothPath([])).toBe("");
    expect(smoothPath([{ x: 5, y: 10 }])).toBe("M5,10");
    expect(
      smoothPath([
        { x: 0, y: 10 },
        { x: 30, y: 10 },
      ]),
    ).toBe("M0,10 C10,10 20,10 30,10");
  });
  it("passes through all samples without overshooting spikes or valleys", () => {
    const values = [20, 100, 10, 10, 90, 91, 5, 60];
    const path = smoothPath(values.map((y, i) => ({ x: i * 30, y })));
    const segments = [
      ...path.matchAll(
        /C([\d.e+-]+),([\d.e+-]+) ([\d.e+-]+),([\d.e+-]+) ([\d.e+-]+),([\d.e+-]+)/g,
      ),
    ];
    expect(segments).toHaveLength(values.length - 1);
    segments.forEach((segment, i) => {
      expect(Number(segment[5])).toBe((i + 1) * 30);
      expect(Number(segment[6])).toBe(values[i + 1]);
      for (let step = 0; step <= 100; step++) {
        const t = step / 100;
        const y =
          (1 - t) ** 3 * values[i] +
          3 * (1 - t) ** 2 * t * Number(segment[2]) +
          3 * (1 - t) * t ** 2 * Number(segment[4]) +
          t ** 3 * values[i + 1];
        expect(y).toBeGreaterThanOrEqual(
          Math.min(values[i], values[i + 1]) - 0.00001,
        );
        expect(y).toBeLessThanOrEqual(
          Math.max(values[i], values[i + 1]) + 0.00001,
        );
      }
    });
  });
});
