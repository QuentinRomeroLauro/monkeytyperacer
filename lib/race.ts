import { racerName } from "./racer-name";
import type { Sample } from "./config";
export type RaceEdit = {
  seq: number;
  type: "insert" | "delete";
  text?: string;
};
export type Racer = {
  id: string;
  session: string;
  name: string;
  ready: boolean;
  joinedAt: number;
  seenAt: number;
  typed: string;
  samples: Sample[];
  seq: number;
  attempts: number;
  errors: number;
  finishedAt: number | null;
  left: boolean;
};
export type RaceState = {
  id: string;
  kind: "public" | "private";
  phase: "waiting" | "countdown" | "racing" | "finished";
  host: string;
  round: number;
  quote: string;
  source: string;
  createdAt: number;
  startAt: number | null;
  deadline: number | null;
  players: Racer[];
};
export type PublicRacer = Omit<Racer, "session" | "typed" | "samples"> & {
  progress: number;
  wpm: number;
  accuracy: number;
};
export type RaceView = Omit<RaceState, "players"> & {
  players: PublicRacer[];
  me: { id: string; typed: string; seq: number; samples: Sample[] } | null;
  serverNow: number;
};
export function correctPrefix(text: string, quote: string) {
  const typed = Array.from(text),
    expected = Array.from(quote);
  let i = 0;
  while (i < typed.length && typed[i] === expected[i]) i++;
  return i;
}
export function editText(text: string, edit: RaceEdit, quote: string) {
  if (edit.type === "delete") return Array.from(text).slice(0, -1).join("");
  const chars = Array.from(text), expected = Array.from(quote);
  if (chars.length >= expected.length) return text;
  const correct = correctPrefix(text, quote);
  if (correct < chars.length) {
    // Keep an unresolved mistake in the current word instead of scrolling past it.
    const boundary = expected.indexOf(" ", correct);
    const limit = boundary < 0 ? expected.length : Math.max(correct + 1, boundary);
    if (chars.length >= limit || edit.text === " ") return text;
  }
  return text + (edit.text ?? "");
}
export function advanceRace(state: RaceState, now: number) {
  if (state.phase === "waiting" || state.phase === "countdown") {
    state.players = state.players.filter(
      (p) => !p.left && now - p.seenAt < 30_000,
    );
    if (!state.players.some((p) => p.id === state.host))
      state.host = state.players[0]?.id ?? "";
    if (state.phase === "countdown" && state.players.length < 2) {
      state.phase = "waiting";
      state.startAt = null;
      state.deadline = null;
    }
    if (state.phase === "countdown" && now >= state.startAt!)
      state.phase = "racing";
  }
  if (
    (state.phase === "racing" || state.phase === "finished") &&
    !state.players.some(
      (p) => p.id === state.host && !p.left && now - p.seenAt < 30000,
    )
  ) {
    state.host =
      state.players.find((p) => !p.left && now - p.seenAt < 30000)?.id ??
      state.host;
  }
  if (
    state.phase === "racing" &&
    (now >= state.deadline! ||
      state.players.every((p) => p.finishedAt !== null || p.left))
  )
    state.phase = "finished";
}
export function startRace(state: RaceState, now: number) {
  state.phase = "countdown";
  state.startAt = now + 7000;
  state.deadline = state.startAt + 180000;
}
export function applyEdits(
  state: RaceState,
  player: Racer,
  edits: RaceEdit[],
  now: number,
) {
  if (state.phase !== "racing" || player.left || player.finishedAt !== null)
    return;
  for (const edit of edits) {
    if (edit.seq <= player.seq) continue;
    if (edit.seq !== player.seq + 1)
      throw new Error("Input is out of sequence. Reconnect to resume.");
    if (edit.type === "insert" && Array.from(edit.text ?? "").length !== 1)
      throw new Error("Type one character at a time.");
    const next = editText(player.typed, edit, state.quote);
    if (edit.type === "insert") {
      player.attempts++;
      if (!state.quote.startsWith(next)) player.errors++;
    }
    player.typed = next;
    player.seq = edit.seq;
    const progress = correctPrefix(next, state.quote);
    if (progress > 10 + ((now - state.startAt!) / 60000) * 400 * 5)
      throw new Error(
        "Typing arrived too quickly. Please type the quote yourself.",
      );
    if (next === state.quote) {
      player.finishedAt = now;
      state.deadline = Math.min(state.deadline!, now + 30000);
      break;
    }
  }
}
export function raceView(
  state: RaceState,
  session: string,
  now: number,
): RaceView {
  const mine = state.players.find((p) => p.session === session && !p.left);
  return {
    ...state,
    quote: state.phase === "waiting" ? "" : state.quote,
    source: state.phase === "waiting" ? "" : state.source,
    serverNow: now,
    me: mine
      ? {
          id: mine.id,
          typed: mine.typed,
          seq: mine.seq,
          samples: mine.samples ?? [],
        }
      : null,
    players: state.players.map((player) => {
      const { session, typed, samples, ...p } = player;
        void samples;
      const chars = correctPrefix(typed, state.quote);
      const duration = Math.max(
        1,
        (p.finishedAt ?? Math.min(now, state.deadline ?? now)) -
          (state.startAt ?? now),
      );
      return {
        ...p,
        name: racerName(p.name, session),
        progress: chars / Array.from(state.quote).length,
        wpm:
          state.startAt && now >= state.startAt
            ? chars / 5 / (duration / 60000)
            : 0,
        accuracy: p.attempts
          ? ((p.attempts - p.errors) / p.attempts) * 100
          : 100,
      };
    }),
  };
}
