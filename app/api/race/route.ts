import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID, randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  advanceRace,
  applyEdits,
  correctPrefix,
  raceView,
  startRace,
  type RaceState,
  type Racer,
} from "@/lib/race";
import { racerName } from "@/lib/racer-name";
import quotes from "@/lib/race-quotes.json";
export const runtime = "nodejs";
const input = z.object({
  action: z.enum([
    "queue",
    "create",
    "view",
    "join",
    "sync",
    "ready",
    "start",
    "leave",
    "rematch",
  ]),
  room: z
    .string()
    .regex(/^[a-f0-9]{24}$/)
    .optional(),
  name: z
    .string()
    .trim()
    .min(2)
    .max(20)
    .regex(
      /^[\p{L}\p{N}_ -]+$/u,
      "Use letters, numbers, spaces, underscores or hyphens.",
    )
    .optional(),
  round: z.number().int().positive().optional(),
  ready: z.boolean().optional(),
  edits: z
    .array(
      z.object({
        seq: z.number().int().positive(),
        type: z.enum(["insert", "delete"]),
        text: z.string().max(4).optional(),
      }),
    )
    .max(500)
    .optional(),
});
class RaceError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const digest = (text: string) =>
  createHash("sha256").update(text).digest("hex");
const json = (value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
function quote(previous?: string) {
  const pool = quotes.filter((q) => q.text !== previous);
  return pool[randomInt(pool.length)];
}
function makePlayer(session: string, name: string, now: number): Racer {
  return {
    id: randomUUID(),
    session,
    name: racerName(name, session),
    ready: false,
    joinedAt: now,
    seenAt: now,
    typed: "",
    samples: [],
    seq: 0,
    attempts: 0,
    errors: 0,
    finishedAt: null,
    left: false,
  };
}
function makeRoom(
  kind: "public" | "private",
  session: string,
  name: string,
): RaceState {
  const now = Date.now(),
    player = makePlayer(session, name, now),
    q = quote();
  return {
    id: randomBytes(12).toString("hex"),
    kind,
    phase: "waiting",
    host: player.id,
    round: 1,
    quote: q.text,
    source: q.source,
    createdAt: now,
    startAt: null,
    deadline: null,
    players: [player],
  };
}
function join(state: RaceState, session: string, name: string, now: number) {
  const existing = state.players.find((p) => p.session === session && !p.left);
  if (existing) {
    existing.seenAt = now;
    return;
  }
  if (!(
    state.phase === "waiting" ||
    (state.kind === "public" &&
      state.phase === "countdown" &&
      state.startAt! - now > 2000)
  ))
    throw new RaceError(
      "This race has already started. Join the next round.",
      409,
    );
  if (state.players.length >= 5)
    throw new RaceError("This room is full (5 racers).", 409);
  const player = makePlayer(session, name, now);
  state.players.push(player);
  if (!state.host) state.host = player.id;
}
async function changeRoom(
  id: string,
  session: string,
  action: z.infer<typeof input>,
) {
  const sql = db();
  for (let retry = 0; retry < 12; retry++) {
    const rows =
      await sql`SELECT state,version,open FROM race_rooms WHERE id=${id} AND created_at>now()-interval '24 hours'`;
    if (!rows.length)
      throw new RaceError(
        "This room has expired or does not exist. Start a new race.",
        404,
      );
    const state = rows[0].state as RaceState,
      now = Date.now();
    const reconnecting = state.players.find(
      (p) => p.session === session && !p.left,
    );
    if (reconnecting) reconnecting.seenAt = now;
    advanceRace(state, now);
    if (action.action === "join" || action.action === "queue")
      join(state, session, action.name ?? "Guest", now);
    const player = state.players.find((p) => p.session === session && !p.left);
    if (action.action !== "view" && action.action !== "sync" && !player)
      throw new RaceError("Join this room before racing.", 403);
    if (player) {
      player.seenAt = now;
      if (action.action === "ready" && state.phase === "waiting")
        player.ready = !!action.ready;
      if (action.action === "leave") {
        player.left = true;
        advanceRace(state, now);
      }
      if (action.action === "sync" && action.round === state.round)
        applyEdits(state, player, action.edits ?? [], now);
      if (state.startAt && now >= state.startAt && state.phase !== "waiting") {
        player.samples ??= [];
        const duration = Math.max(
            0.1,
            ((player.finishedAt ?? Math.min(now, state.deadline ?? now)) -
              state.startAt) /
              1000,
          ),
          second = Math.max(1, Math.floor(duration));
        if (
          player.samples.at(-1)?.second !== second &&
          player.samples.length < 181
        ) {
          player.samples.push({
            second,
            wpm: correctPrefix(player.typed, state.quote) / 5 / (duration / 60),
            raw: player.attempts / 5 / (duration / 60),
            errors:
              player.errors -
              player.samples.reduce((sum, s) => sum + s.errors, 0),
          });
        }
      }
      if (action.action === "start") {
        if (state.host !== player.id)
          throw new RaceError("Only the host can start the race.", 403);
        if (
          state.phase !== "waiting" ||
          state.players.length < 2 ||
          state.players.some((p) => !p.ready)
        )
          throw new RaceError("At least two racers must be ready.", 409);
        startRace(state, now);
      }
      if (action.action === "rematch") {
        if (state.host !== player.id)
          throw new RaceError("Only the host can start a rematch.", 403);
        if (state.phase !== "finished")
          throw new RaceError("Wait for this race to finish first.", 409);
        if (action.round !== state.round) return raceView(state, session, now);
        const next = quote(state.quote);
        state.players = state.players
          .filter((p) => !p.left && now - p.seenAt < 30000)
          .map((p) => ({ ...makePlayer(p.session, p.name, now), id: p.id }));
        state.phase = "waiting";
        state.round++;
        state.quote = next.text;
        state.source = next.source;
        state.startAt = null;
        state.deadline = null;
      }
    }
    if (
      state.kind === "public" &&
      state.phase === "waiting" &&
      state.players.length >= 2
    )
      startRace(state, now);
    advanceRace(state, now);
    // A closed public lobby never reopens into another active matchmaking slot.
    const open =
      rows[0].open &&
      state.kind === "public" &&
      state.players.length < 5 &&
      (state.phase === "waiting" ||
        (state.phase === "countdown" && state.startAt! - now > 2000));
    const updated =
      await sql`UPDATE race_rooms SET state=${JSON.stringify(state)},version=version+1,open=${open} WHERE id=${id} AND version=${rows[0].version} RETURNING id`;
    if (updated.length) return raceView(state, session, now);
  }
  throw new RaceError("Race update is busy. Reconnecting…", 409);
}
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host"))
      return json({ error: "Invalid request origin." }, 403);
    const raw = await request.text();
    if (raw.length > 40000) return json({ error: "Request too large." }, 413);
    const data = input.parse(JSON.parse(raw));
    const jar = await cookies();
    let token = jar.get("mtr_racer")?.value;
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      token = randomBytes(32).toString("hex");
      jar.set("mtr_racer", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    const session = digest(token),
      sql = db();
    if (data.action === "create" || data.action === "queue") {
      const ip =
        request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ??
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        "local";
      const key = digest(`race-create:${ip}`);
      const hits =
        await sql`INSERT INTO rate_limits(key,hits,expires_at) VALUES(${key},1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.hits+1 END,expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING hits`;
      if (hits[0].hits > 100)
        throw new RaceError("Too many race requests. Try again later.", 429);
      await sql`UPDATE race_rooms SET open=false WHERE open AND created_at<now()-interval '24 hours'`;
      if (!data.name) data.name = racerName(undefined, session);
      for (let retry = 0; retry < 8; retry++) {
        if (data.action === "queue") {
          const rooms =
            await sql`SELECT id FROM race_rooms WHERE open AND kind='public' LIMIT 1`;
          if (rooms.length) {
            // Advance expired countdowns before trying to join them.
            await changeRoom(rooms[0].id, session, { action: "view" });
            try {
              return json(await changeRoom(rooms[0].id, session, data));
            } catch (e) {
              if (!(e instanceof RaceError) || e.status !== 409) throw e;
              continue;
            }
          }
        }
        const state = makeRoom(
          data.action === "queue" ? "public" : "private",
          session,
          data.name,
        );
        const inserted =
          await sql`INSERT INTO race_rooms(id,kind,open,state) VALUES(${state.id},${state.kind},${state.kind === "public"},${JSON.stringify(state)}) ON CONFLICT DO NOTHING RETURNING id`;
        if (inserted.length) return json(raceView(state, session, Date.now()));
      }
      throw new RaceError("Matchmaking is busy. Please try again.", 409);
    }
    if (!data.room) throw new RaceError("Room is required.");
    return json(await changeRoom(data.room, session, data));
  } catch (error) {
    if (error instanceof RaceError)
      return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
      return json({ error: error.issues[0]?.message ?? "Invalid input." }, 400);
    if (error instanceof SyntaxError)
      return json({ error: "Invalid request." }, 400);
    // Input validation errors should be actionable, without exposing database details.
    if (
      error instanceof Error &&
      [
        "Input is out of sequence. Reconnect to resume.",
        "Type one character at a time.",
        "Typing arrived too quickly. Please type the quote yourself.",
      ].includes(error.message)
    )
      return json({ error: error.message }, 422);
    console.error(
      "Race request failed",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Connection interrupted. Please try again." }, 503);
  }
}
