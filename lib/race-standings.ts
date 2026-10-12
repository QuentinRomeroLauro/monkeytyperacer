import type { PublicRacer } from "./race";

type Standing = Pick<PublicRacer, "id" | "finishedAt" | "progress">;
const progress = (player: Standing) => Number.isFinite(player.progress) ? player.progress : 0;
function compare(a: Standing, b: Standing) {
  if (a.finishedAt !== null && b.finishedAt !== null) return a.finishedAt - b.finishedAt;
  if (a.finishedAt !== null) return -1;
  if (b.finishedAt !== null) return 1;
  return progress(b) - progress(a);
}

/** Competition ranking: equal finish times or unfinished progress share a place. */
export function raceStandings<T extends Standing>(players: readonly T[]) {
  const sorted = [...players].sort((a, b) => compare(a, b) || a.id.localeCompare(b.id));
  let place = 1;
  return sorted.map((player, index) => {
    if (index > 0 && compare(sorted[index - 1], player) !== 0) place = index + 1;
    const tied = (index > 0 && compare(sorted[index - 1], player) === 0)
      || (index + 1 < sorted.length && compare(player, sorted[index + 1]) === 0);
    return { ...player, place, tied };
  });
}
