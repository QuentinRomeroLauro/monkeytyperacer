export type Point = { x: number; y: number };

/** Monotone cubic interpolation: passes through every sample without overshooting. */
export function smoothPath(points: Point[]): string {
  if (!points.length) return "";
  const start = `M${points[0].x},${points[0].y}`;
  if (points.length === 1) return start;
  const slopes = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[i - 1];
    const before = slopes[i - 1],
      after = slopes[i];
    return before * after <= 0 ? 0 : 2 / (1 / before + 1 / after);
  });
  for (let i = 0; i < slopes.length; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const magnitude = Math.hypot(
      tangents[i] / slopes[i],
      tangents[i + 1] / slopes[i],
    );
    if (magnitude > 3) {
      const scale = 3 / magnitude;
      tangents[i] *= scale;
      tangents[i + 1] *= scale;
    }
  }
  return (
    start +
    points
      .slice(1)
      .map((p, i) => {
        const previous = points[i],
          third = (p.x - previous.x) / 3;
        return ` C${previous.x + third},${previous.y + tangents[i] * third} ${p.x - third},${p.y - tangents[i + 1] * third} ${p.x},${p.y}`;
      })
      .join("")
  );
}
