import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { configSchema } from "@/lib/config-schema";
export const runtime = "nodejs";
const SESSION = "mtr_session";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((x) => x.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{3,20}$/,
      "Username must be 3–20 letters, numbers, underscores or hyphens.",
    )
    .optional(),
});
const resultSchema = z.object({
  id: z.uuid(),
  mode: z.enum(["time", "words", "quote", "zen", "custom"]),
  mode2: z.number().int().min(1).max(10000),
  language: z.string().max(100),
  wpm: z.number().min(0).max(500),
  raw: z.number().min(0).max(1000),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  duration: z.number().min(0.1).max(86400),
  correct: z.number().int().min(0),
  incorrect: z.number().int().min(0),
  extra: z.number().int().min(0),
  missed: z.number().int().min(0),
  punctuation: z.boolean(),
  numbers: z.boolean(),
  failed: z.boolean(),
  difficulty: z.string().max(20),
  createdAt: z.iso.datetime(),
  samples: z
    .array(
      z.object({
        second: z.number(),
        wpm: z.number(),
        raw: z.number(),
        errors: z.number(),
      }),
    )
    .max(86400),
  words: z.array(z.string().max(500)).max(10000),
  typed: z.array(z.string().max(500)).max(10000),
  quoteSource: z.string().max(1000).optional(),
});
async function currentUser() {
  const token = (await cookies()).get(SESSION)?.value;
  if (!token) return null;
  const sql = db();
  const rows =
    await sql`SELECT u.id,u.name,u.email,u.created_at as "createdAt",u.settings FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=${digest(token)} AND s.expires_at > now()`;
  return rows[0] ?? null;
}
async function session(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db()`INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (${digest(token)},${userId},now()+interval '30 days')`;
  (await cookies()).set(SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
async function limited(request: NextRequest, action: string, max: number) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "local";
  const key = digest(`${ip}:${action}`);
  const rows =
    await db()`INSERT INTO rate_limits (key,hits,expires_at) VALUES (${key},1,now()+interval '15 minutes') ON CONFLICT (key) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at < now() THEN 1 ELSE rate_limits.hits+1 END, expires_at=CASE WHEN rate_limits.expires_at < now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING hits`;
  return rows[0].hits > max;
}
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await context.params).path.join("/");
    const method = request.method;
    if (!["GET", "HEAD"].includes(method)) {
      const origin = request.headers.get("origin");
      if (origin && new URL(origin).host !== request.headers.get("host"))
        return json({ error: "Invalid request origin." }, 403);
      if (Number(request.headers.get("content-length") ?? 0) > 1_000_000)
        return json({ error: "Request is too large." }, 413);
    }
    if (path === "health")
      return json({ database: !!process.env.DATABASE_URL });
    if (path === "auth/me" && method === "GET")
      return json({ user: await currentUser() });
    if (
      (path === "auth/register" || path === "auth/login") &&
      method === "POST"
    ) {
      if (await limited(request, path, 15))
        return json(
          { error: "Too many attempts. Please try again in 15 minutes." },
          429,
        );
      const data = credentials.parse(await request.json());
      const sql = db();
      if (path === "auth/register") {
        if (!data.name) return json({ error: "A username is required." }, 400);
        const id = randomUUID(),
          hash = await bcrypt.hash(data.password, 12);
        await sql`INSERT INTO users (id,name,email,password_hash) VALUES (${id},${data.name},${data.email},${hash})`;
        await session(id);
      } else {
        const rows =
          await sql`SELECT id,password_hash FROM users WHERE email=${data.email}`;
        const valid = await bcrypt.compare(
          data.password,
          rows[0]?.password_hash ??
            "$2b$12$C6UzMDM.H6dfI/f/IKcEe.3GG.3SrTPvOxC5BIlfQMvxIKpxljCTG",
        );
        if (!rows[0] || !valid)
          return json({ error: "Email or password is incorrect." }, 401);
        await session(rows[0].id);
      }
      return json({ user: await currentUser() });
    }
    if (path === "auth/logout" && method === "POST") {
      const jar = await cookies(),
        token = jar.get(SESSION)?.value;
      if (token)
        await db()`DELETE FROM sessions WHERE token_hash=${digest(token)}`;
      jar.delete(SESSION);
      return json({ ok: true });
    }
    if (path === "leaderboards" && method === "GET") {
      const duration =
        request.nextUrl.searchParams.get("duration") === "60" ? 60 : 15;
      const period =
        request.nextUrl.searchParams.get("period") === "daily" ? 1 : 36500;
      const rows =
        await db()`SELECT name,wpm,accuracy,created_at as "createdAt" FROM (SELECT DISTINCT ON (r.user_id) u.name,r.wpm,r.accuracy,r.created_at FROM results r JOIN users u ON r.user_id=u.id WHERE r.mode='time' AND r.mode2=${duration} AND r.language='english' AND r.data->>'failed'='false' AND r.data->>'punctuation'='false' AND r.data->>'numbers'='false' AND r.created_at > now()-make_interval(days=>${period}) ORDER BY r.user_id,r.wpm DESC) ranked ORDER BY wpm DESC LIMIT 100`;
      return json({ entries: rows });
    }
    const user = await currentUser();
    if (!user) return json({ error: "Sign in to save your progress." }, 401);
    if (path === "results" && method === "GET") {
      const rows =
        await db()`SELECT data FROM results WHERE user_id=${user.id} ORDER BY created_at DESC LIMIT 1000`;
      return json({ results: rows.map((r) => r.data) });
    }
    if (path === "results" && method === "POST") {
      if (await limited(request, "results", 100))
        return json({ error: "Too many saves. Try again shortly." }, 429);
      const result = resultSchema.parse(await request.json());
      await db()`INSERT INTO results (id,user_id,mode,mode2,language,wpm,accuracy,duration,data) VALUES (${result.id},${user.id},${result.mode},${result.mode2},${result.language},${result.wpm},${result.accuracy},${result.duration},${JSON.stringify(result)}) ON CONFLICT (id) DO NOTHING`;
      return json({ ok: true });
    }
    if (path === "settings" && method === "PUT") {
      const settings = configSchema.parse(await request.json());
      if (JSON.stringify(settings).length > 50000)
        return json({ error: "Settings too large." }, 400);
      await db()`UPDATE users SET settings=${JSON.stringify(settings)} WHERE id=${user.id}`;
      return json({ ok: true });
    }
    if (path === "account" && method === "DELETE") {
      const data = z
        .object({ password: z.string().max(128) })
        .parse(await request.json());
      const rows =
        await db()`SELECT password_hash FROM users WHERE id=${user.id}`;
      if (!(await bcrypt.compare(data.password, rows[0].password_hash)))
        return json({ error: "Password is incorrect." }, 401);
      await db()`DELETE FROM users WHERE id=${user.id}`;
      (await cookies()).delete(SESSION);
      return json({ ok: true });
    }
    return json({ error: "Not found." }, 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return json({ error: error.issues[0]?.message ?? "Invalid input." }, 400);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    )
      return json(
        { error: "That email or username is already registered." },
        409,
      );
    console.error(
      "API request failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json(
      {
        error: process.env.DATABASE_URL
          ? "Unable to complete the request. Please try again."
          : "Cloud storage is not configured yet. Your typing results are still saved on this device.",
      },
      503,
    );
  }
}
export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
